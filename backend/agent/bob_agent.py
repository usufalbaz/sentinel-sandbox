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

        cmd = [BOB_BINARY, "--accept-license", "run", prompt]
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


def chat(message: str, narrative: str, verdict: dict) -> str:
    """
    Answer a developer's follow-up question about a completed scan by
    invoking Bob Shell as a subprocess, grounded in this scan's narrative
    and verdict. Falls back to a deterministic templated reply if Bob
    isn't installed/configured/reachable in this environment.
    """
    if not BOB_API_KEY:
        return _fallback_chat(message, narrative, verdict)

    level = verdict.get("level", "UNKNOWN")
    confidence = verdict.get("confidence", 0)

    prompt = (
        "You are a security analyst assistant answering a developer's "
        "follow-up question about a completed security scan of a "
        "sandboxed npm install.\n\n"
        f"Scan verdict: {level} (confidence: {confidence * 100:.0f}%)\n"
        f"Scan narrative: {narrative}\n\n"
        f'Developer\'s question: "{message}"\n\n'
        "Answer concisely (2-4 sentences), grounded ONLY in the narrative "
        "and verdict above. Do not invent findings that weren't mentioned. "
        "Respond with plain text only, no markdown fences, no JSON."
    )

    cmd = [BOB_BINARY, "--accept-license", "run", prompt]
    if BOB_PROJECT_ID:
        cmd.extend(["--team-id", BOB_PROJECT_ID])

    env = {**os.environ, "BOB_API_KEY": BOB_API_KEY}

    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=30, env=env
        )
        if proc.returncode != 0 or not proc.stdout.strip():
            return _fallback_chat(message, narrative, verdict)
        return proc.stdout.strip()
    except Exception:
        return _fallback_chat(message, narrative, verdict)


def _fallback_chat(message: str, narrative: str, verdict: dict) -> str:
    """Deterministic templated reply used when Bob isn't available."""
    level = verdict.get("level", "UNKNOWN")
    confidence = verdict.get("confidence", 0)
    return (
        f"Based on this scan's verdict ({level}, {confidence * 100:.0f}% "
        f"confidence): {narrative} "
        f'Your question was: "{message}" — I can only answer using what '
        "the scan actually found; ask about a specific finding above for "
        "more detail."
    )


def _fallback_analysis(activity_events: list[dict], repo_context: dict) -> dict:
    """Deterministic narrative used when Bob isn't installed/configured/reachable."""
    env_events = [e for e in activity_events if e.get("type") == "environment"]
    real_events = [e for e in activity_events if e.get("type") != "environment"]

    if not real_events:
        if env_events:
            return {
                "findings": [],
                "chain": (
                    "Dynamic sandbox analysis was unavailable in this "
                    "environment, so this verdict is based on static "
                    "source-code analysis only."
                ),
            }
        return {
            "findings": [],
            "chain": "No suspicious runtime activity was observed during the sandboxed install.",
        }

    steps = []
    for event in real_events:
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
    if env_events:
        chain += " (Note: dynamic sandbox analysis was partially unavailable in this environment.)"
    return {"findings": [], "chain": chain}