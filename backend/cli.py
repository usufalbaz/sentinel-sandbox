from __future__ import annotations

import argparse
import json
import os
import sys
from core.security_adapter import adapt_findings, calculate_verdict
from core.static_scanner import scan_repository


def format_terminal_report(report_data: dict) -> str:
  findings = report_data.get("findings", [])
  verdict = report_data.get("verdict", "UNKNOWN")
  repo_url = report_data.get("repo_url", "Unknown")

  divider = "=" * 65
  sub_divider = "-" * 65

  output_lines = [
      divider,
      f"  SENTINEL SANDBOX - REPOSITORY SECURITY AUDIT",
      divider,
      f"Target Repository : {repo_url}",
      f"Overall Verdict   : {verdict.upper()}",
      f"Findings Count    : {len(findings)}",
      sub_divider,
  ]

  if not findings:
    output_lines.append(
        "No anomalous sinks or vulnerable lifecycle scripts detected."
    )
    output_lines.append(divider)
    return "\n".join(output_lines)

  for idx, finding in enumerate(findings, start=1):
    severity = str(finding.get("severity", "INFO")).upper()
    category = finding.get("category", "General Security")
    detail = finding.get("detail", "No detailed description provided.")
    target_file = finding.get("file", "Unknown")
    line_no = finding.get("line")

    line_str = f"Line {line_no}" if line_no else "Global/Manifest"

    output_lines.append(f"[{idx}] {severity} - {category}")
    output_lines.append(f"    Location : {target_file} ({line_str})")
    output_lines.append(f"    Analysis : {detail}")
    output_lines.append(sub_divider)

  output_lines.append(divider)
  return "\n".join(output_lines)


def run_cli():
  parser = argparse.ArgumentParser(
      description="Sentinel Sandbox CLI: Local and Remote Repository Auditor"
  )
  parser.add_argument(
      "--repo",
      type=str,
      required=True,
      help="Target GitHub repository URL to clone and audit",
  )
  parser.add_argument(
      "--branch",
      type=str,
      default="main",
      help="Specific branch to inspect (defaults to main)",
  )
  parser.add_argument(
      "--format",
      type=str,
      choices=["text", "json"],
      default="text",
      help="Output presentation format",
  )
  parser.add_argument(
      "--output",
      type=str,
      default="",
      help="Optional file path to persist the security report",
  )
  parser.add_argument(
      "--exit-code",
      action="store_true",
      help="Return exit status 1 if critical security issues are detected",
  )

  args = parser.parse_args()

  try:
    raw_results = scan_repository(repo_url=args.repo, branch=args.branch)
    raw_findings = (
        raw_results
        if isinstance(raw_results, list)
        else raw_results.get("findings", [])
    )
    normalized_findings = adapt_findings(raw_findings)
    verdict = calculate_verdict(raw_findings)

    audit_payload = {
        "repo_url": args.repo,
        "branch": args.branch,
        "verdict": verdict,
        "findings": normalized_findings,
    }

    if args.format == "json":
      report_output = json.dumps(audit_payload, indent=2)
    else:
      report_output = format_terminal_report(audit_payload)

    if args.output:
      with open(args.output, "w", encoding="utf-8") as f:
        f.write(report_output)

    print(report_output)

    if args.exit_code and verdict in ("dangerous", "CRITICAL"):
      sys.exit(1)

    sys.exit(0)

  except Exception as exc:
    sys.stderr.write(f"Audit failure encountered: {str(exc)}\n")
    sys.exit(2)


if __name__ == "__main__":
  run_cli()
