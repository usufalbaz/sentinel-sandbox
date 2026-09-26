from __future__ import annotations
from core.security_adapter import adapt_findings
from core.static_scanner import scan_repository


def run_security_scan(repo_url: str, branch: str = "main") -> dict:
  result = scan_repository(repo_url=repo_url, branch=branch)
  if isinstance(result, dict):
    raw_findings = result.get("findings", [])
  elif isinstance(result, list):
    raw_findings = result
  else:
    raw_findings = []

  findings = adapt_findings(raw_findings)
  return {
      "findings": findings,
      "summary": _build_summary(raw_findings),
  }


def _build_summary(raw_findings: list[dict]) -> dict:
  severity_counts = {
      "CRITICAL": 0,
      "HIGH": 0,
      "MEDIUM": 0,
      "LOW": 0,
      "INFO": 0,
  }
  for finding in raw_findings:
    severity = str(finding.get("severity", "INFO")).upper()
    if severity in severity_counts:
      severity_counts[severity] += 1
  return {
      "total": len(raw_findings),
      "by_severity": severity_counts,
  }
