from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


SEVERITY_MAP = {
    "INFO": "info",
    "LOW": "warning",
    "MEDIUM": "warning",
    "HIGH": "warning",
    "CRITICAL": "critical",
}


def adapt_findings(raw_findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert SecurityRuleEngine findings to the API finding contract."""

    timestamp = datetime.now(timezone.utc).isoformat()

    findings = []

    for index, finding in enumerate(raw_findings, start=1):
        severity = str(finding.get("severity", "INFO")).upper()

        findings.append(
            {
                "id": f"static-{index}",
                "category": "filesystem",
                "severity": SEVERITY_MAP.get(severity, "warning"),
                "description": (
                    f"{finding.get('rule_name', 'Security finding')} "
                    f"({finding.get('cwe', 'CWE-unknown')})"
                ),
                "timestamp": timestamp,
                "file": finding.get("file"),
                "line": finding.get("line"),
                "evidence": finding.get("matched_line")
                or finding.get("command"),
            }
        )

    return findings


def calculate_verdict(raw_findings: list[dict[str, Any]]) -> str:
    """Calculate a deterministic verdict from security findings."""

    severities = {
        str(finding.get("severity", "")).upper()
        for finding in raw_findings
    }

    if "CRITICAL" in severities:
        return "dangerous"

    if "HIGH" in severities:
        return "suspicious"

    return "safe"
