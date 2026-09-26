from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ThreatSignature:
  signature_id: str
  name: str
  cwe_id: str
  base_severity: str
  cvss_score: float
  pattern: re.Pattern
  description: str
  remediation_advice: str


class ThreatIntelRegistry:

  def __init__(self):
    self._signatures: list[ThreatSignature] = [
        ThreatSignature(
            signature_id="SIG-SEC-001",
            name="Remote Script Pipe Execution",
            cwe_id="CWE-506",
            base_severity="CRITICAL",
            cvss_score=9.8,
            pattern=re.compile(
                r"(curl|wget)\s+.*\|\s*(node|bash|sh|python)", re.IGNORECASE
            ),
            description=(
                "Piping remote web resources directly into an execution shell"
                " bypasses local file review."
            ),
            remediation_advice=(
                "Download dependencies into version control and inspect"
                " integrity hashes before execution."
            ),
        ),
        ThreatSignature(
            signature_id="SIG-SEC-002",
            name="Dynamic Function Constructor Code Execution",
            cwe_id="CWE-95",
            base_severity="CRITICAL",
            cvss_score=9.3,
            pattern=re.compile(
                r"Function\s*\(\s*['\"].*['\"]\s*\)\s*\(", re.IGNORECASE
            ),
            description=(
                "Dynamic code evaluation using the Function constructor"
                " executes arbitrary strings outside module scope."
            ),
            remediation_advice=(
                "Avoid dynamic string evaluation. Implement static module"
                " imports."
            ),
        ),
        ThreatSignature(
            signature_id="SIG-SEC-003",
            name="Sensitive Memory and Vault Harvesting",
            cwe_id="CWE-200",
            base_severity="HIGH",
            cvss_score=7.5,
            pattern=re.compile(
                r"(IndexedDB|leveldb|Local\s+Storage|solana|metamask)",
                re.IGNORECASE,
            ),
            description=(
                "Targeting browser local storage or cryptocurrency wallet data"
                " directories."
            ),
            remediation_advice=(
                "Restrict file system access permissions using containerized"
                " boundaries."
            ),
        ),
        ThreatSignature(
            signature_id="SIG-SEC-004",
            name="Suspicious Lifecycle Script Declaration",
            cwe_id="CWE-506",
            base_severity="CRITICAL",
            cvss_score=8.8,
            pattern=re.compile(
                r"\"(preinstall|postinstall|prepare)\"\s*:\s*\"node\s+[^\"\']+\"",
                re.IGNORECASE,
            ),
            description=(
                "Automated lifecycle hook designated to run arbitrary local"
                " binaries upon installation."
            ),
            remediation_advice=(
                "Execute package installation with the --ignore-scripts flag."
            ),
        ),
    ]

  def match_signatures(self, content: str) -> list[dict[str, Any]]:
    matches = []
    for sig in self._signatures:
      if sig.pattern.search(content):
        matches.append({
            "signature_id": sig.signature_id,
            "name": sig.name,
            "cwe": sig.cwe_id,
            "severity": sig.base_severity,
            "cvss": sig.cvss_score,
            "description": sig.description,
            "remediation": sig.remediation_advice,
        })
    return matches

  def calculate_composite_cvss(self, matches: list[dict[str, Any]]) -> float:
    if not matches:
      return 0.0
    return max(match.get("cvss", 0.0) for match in matches)


threat_registry = ThreatIntelRegistry()
