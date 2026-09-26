from __future__ import annotations
from core.security_adapter import adapt_findings
from core.static_scanner import scan_repository
from sandbox.runner import run_in_sandbox
from sandbox.monitor import build_runtime_findings
from agent.bob_agent import analyze as bob_analyze


def run_security_scan(repo_url: str, branch: str = "main", scan_id: str = "") -> dict:
    # 1. Static analysis (source code, before anything runs)
    static_result = scan_repository(repo_url=repo_url, branch=branch)
    if isinstance(static_result, dict):
        raw_static_findings = static_result.get("findings", [])
    elif isinstance(static_result, list):
        raw_static_findings = static_result
    else:
        raw_static_findings = []

    static_findings = adapt_findings(raw_static_findings)

    # 2. Runtime analysis (actually run the repo inside the disposable sandbox)
    sandbox_result = run_in_sandbox(repo_url=repo_url, scan_id=scan_id or repo_url)
    raw_events = sandbox_result.get("events", [])
    runtime_findings = build_runtime_findings(raw_events)

    # 3. Bob agent-mode synthesis — turns raw events into a plain-language
    #    attack-chain narrative, using both static + runtime context
    bob_result = bob_analyze(
        activity_events=raw_events,
        repo_context={"repo_url": repo_url, "branch": branch, "static_findings": static_findings},
    )
    bob_findings = bob_result.get("findings", [])
    narrative = bob_result.get("chain", "")

    all_findings = static_findings + runtime_findings + bob_findings

    return {
        "findings": static_findings,
        "runtime_findings": runtime_findings,
        "narrative": narrative,
        "summary": _build_summary(raw_static_findings, runtime_findings),
    }


def _build_summary(raw_static_findings: list[dict], runtime_findings: list[dict]) -> dict:
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for finding in raw_static_findings:
        severity = str(finding.get("severity", "INFO")).upper()
        if severity in severity_counts:
            severity_counts[severity] += 1

    return {
        "total": len(raw_static_findings) + len(runtime_findings),
        "by_severity": severity_counts,
        "runtime_events": len(runtime_findings),
    }