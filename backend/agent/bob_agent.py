from __future__ import annotations

import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

BOB_API_KEY = os.getenv("BOB_API_KEY", "")
BOB_PROJECT_ID = os.getenv("BOB_PROJECT_ID", "")  # used as --team-id for a General-scope key
BOB_BINARY = os.getenv("BOB_BINARY", "bob")  # some installs expose it as "bob-shell" instead


def analyze(activity_events: list[dict], repo_context: dict) -> dict:
    """
    Run Bob agent-mode analysis over sandbox activity by invoking Bob Shell
    as a subprocess (non-interactive mode), NOT via an HTTP API — Bob does
    not expose a REST inference endpoint; it is a CLI tool.

    Returns:
        {"findings": [...], "chain": str}
    """
    if not BOB_API_KEY:
        return _fallback_analysis(activity_events, repo_context)

    payload = {
        "activity_events": activity_events,
        "repo_context": repo_context,
    }

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, dir=tempfile.gettempdir()
        ) as tmp:
            json.dump(payload, tmp, indent=2)
            tmp_path = tmp.name

        prompt = (
            "You are analyzing sandboxed npm install activity for a "
            "developer hiring-assessment security scanner. The data is in "
            f"@{tmp_path}. Identify any postinstall -> network fetch -> "
            "dynamic execution (eval/Function constructor) chain. "
            "Respond with ONLY valid JSON, no markdown fences, no other "
            "text, matching exactly this shape: "
            '{"findings": [{"category": "network|filesystem|process", '
            '"severity": "info|warning|critical", "description": "string"}], '
            '"chain": "a plain-language narrative of the attack chain for a '
            'non-technical hiring manager"}'
        )

        cmd = [BOB_BINARY, "--accept-license", "-p", prompt]
        if BOB_PROJECT_ID:
            cmd.extend(["--team-id", BOB_PROJECT_ID])

        env = {**os.environ, "BOB_API_KEY": BOB_API_KEY}

        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=60, env=env
        )

        if proc.returncode != 0:
            return _fallback_analysis(activity_events, repo_context)

        return _parse_bob_output(proc.stdout, activity_events, repo_context)

    except Exception:
        return _fallback_analysis(activity_events, repo_context)
    finally:
        if tmp_path and Path(tmp_path).exists():
            Path(tmp_path).unlink(missing_ok=True)


def _parse_bob_output(raw_output: str, activity_events: list[dict], repo_context: dict) -> dict:
    """Bob's output may include stray text around the JSON — extract the JSON block."""
    try:
        start = raw_output.index("{")
        end = raw_output.rindex("}") + 1
        parsed = json.loads(raw_output[start:end])
        return {
            "findings": parsed.get("findings", []),
            "chain": parsed.get("chain", ""),
        }
    except (ValueError, json.JSONDecodeError):
        # Bob answered in plain prose instead of JSON — use it as the
        # narrative directly rather than failing the whole scan.
        return {"findings": [], "chain": raw_output.strip() or _fallback_analysis(activity_events, repo_context)["chain"]}


def _fallback_analysis(activity_events: list[dict], repo_context: dict) -> dict:
    """Deterministic narrative used when Bob isn't installed/configured/reachable."""
    if not activity_events:
        return {
            "findings": [],
            "chain": "No suspicious runtime activity was observed during the sandboxed install.",
        }

    steps = []
    for event in activity_events:
        if event.get("type") == "network":
            steps.append(f"a network call was made to {event.get('destination', 'an external host')}")
        elif event.get("type") == "filesystem":
            steps.append(f"a file was written to {event.get('path', 'an unexpected location')}")
        else:
            steps.append(f"a process event occurred ({event.get('command', 'unspecified')})")

    chain = (
        "During the sandboxed install, " + "; then ".join(steps) + ". "
        "This matches the pattern of a postinstall script fetching and executing remote code."
    )
    return {"findings": [], "chain": chain}