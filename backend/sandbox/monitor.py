"""
sandbox/monitor.py
Hooks into the running container to capture filesystem events,
outbound network calls, process spawns, and dynamic code execution.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import re

DYNAMIC_EXEC_PATTERN = re.compile(r"Function\s*\(|eval\s*\(|vm\.(Script|createContext)")
NETWORK_PATTERN = re.compile(r"curl|wget|fetch\(|http[s]?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")
LEAK_PATTERN = re.compile(r"simulated_leak|pwned|env\[|process\.env")


def build_runtime_findings(raw_events: list[dict[str, Any]], stdout: str = "", stderr: str = "") -> list[dict[str, Any]]:
    timestamp = datetime.now(timezone.utc).isoformat()
    findings: list[dict[str, Any]] = []
    combined_output = f"{stdout}\n{stderr}"

    for index, event in enumerate(raw_events, start=1):
        event_type = event.get("type", "process")

        if event_type == "network":
            findings.append({
                "id": f"runtime-{index}",
                "category": "network",
                "severity": "critical",
                "description": f"Outbound network call detected during install: {event.get('destination', 'unknown host')}",
                "timestamp": timestamp,
                "file": None,
                "line": None,
                "evidence": event.get("destination"),
            })
        elif event_type == "environment":
            findings.append({
                "id": f"runtime-{index}",
                "category": "environment",
                "severity": "info",
                "description": event.get(
                    "detail",
                    "Dynamic sandbox was unavailable in this environment; "
                    "verdict is based on static analysis only.",
                ),
                "timestamp": timestamp,
                "file": None,
                "line": None,
                "evidence": None,
            })
        elif event_type == "filesystem":
            findings.append({
                "id": f"runtime-{index}",
                "category": "filesystem",
                "severity": "critical",
                "description": f"Unexpected file write during install: {event.get('path', 'unknown path')}",
                "timestamp": timestamp,
                "file": event.get("path"),
                "line": None,
                "evidence": event.get("path"),
            })
        else:
            findings.append({
                "id": f"runtime-{index}",
                "category": "process",
                "severity": "warning",
                "description": f"Sandbox process event: {event.get('command', 'unspecified')}",
                "timestamp": timestamp,
                "file": None,
                "line": None,
                "evidence": event.get("command"),
            })

    if DYNAMIC_EXEC_PATTERN.search(combined_output):
        findings.append({
            "id": f"runtime-dynexec-{len(findings) + 1}",
            "category": "process",
            "severity": "critical",
            "description": "Dynamic code execution (eval/Function constructor) observed with remotely-fetched content",
            "timestamp": timestamp,
            "file": None,
            "line": None,
            "evidence": "Function.constructor / eval pattern matched in sandbox output",
        })

    if NETWORK_PATTERN.search(combined_output) and not any(f["category"] == "network" for f in findings):
        findings.append({
            "id": f"runtime-net-{len(findings) + 1}",
            "category": "network",
            "severity": "warning",
            "description": "Outbound network activity detected during install (curl/wget/fetch pattern)",
            "timestamp": timestamp,
            "file": None,
            "line": None,
            "evidence": "network pattern matched in sandbox output",
        })

    return findings