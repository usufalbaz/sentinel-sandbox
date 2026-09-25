from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.security_adapter import adapt_findings, calculate_verdict
from core.static_scanner import scan_repository
from core.store import scan_store

router = APIRouter()


class ScanRequest(BaseModel):
    repo_url: str
    branch: str = "main"


class ScanStarted(BaseModel):
    scan_id: str


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_verdict(raw_findings: list[dict]) -> dict:
    level = calculate_verdict(raw_findings)

    severity_weights = {
        "CRITICAL": 30,
        "HIGH": 20,
        "MEDIUM": 10,
        "LOW": 5,
        "INFO": 0,
    }

    score = min(
        100,
        sum(
            severity_weights.get(
                str(finding.get("severity", "INFO")).upper(),
                0,
            )
            for finding in raw_findings
        ),
    )

    triggered_rules = [
        str(finding.get("rule_name", "Unknown rule"))
        for finding in raw_findings
    ]

    if level == "dangerous":
        summary = (
            f"Static analysis found {len(raw_findings)} security finding(s), "
            "including at least one critical issue."
        )
    elif level == "suspicious":
        summary = (
            f"Static analysis found {len(raw_findings)} security finding(s) "
            "requiring review."
        )
    else:
        summary = "Static analysis found no high or critical security issues."

    return {
        "level": level.upper(),
        "score": score,
        "triggered_rules": triggered_rules,
        "summary": summary,
    }


@router.post("/scan", response_model=ScanStarted, status_code=202)
async def start_scan(body: ScanRequest):
    scan_id = str(uuid.uuid4())
    started_at = utc_now()

    scan_store.create(
        scan_id=scan_id,
        repo_url=body.repo_url,
        branch=body.branch,
    )

    scan_store.update(
        scan_id,
        status="CLONING",
        started_at=started_at,
    )

    try:
        scan_store.update(
            scan_id,
            status="SCANNING_STATIC",
        )

        result = scan_repository(
            repo_url=body.repo_url,
            branch=body.branch,
        )

        raw_findings = result["findings"]
        findings = adapt_findings(raw_findings)
        verdict = build_verdict(raw_findings)

        scan_store.update(
            scan_id,
            status="COMPLETE",
            static_findings=findings,
            verdict=verdict,
            finished_at=utc_now(),
        )

    except Exception as exc:
        scan_store.update(
            scan_id,
            status="ERROR",
            error=str(exc),
            finished_at=utc_now(),
        )

    return ScanStarted(scan_id=scan_id)


@router.get("/scan/{scan_id}")
async def get_scan(scan_id: str):
    scan = scan_store.get(scan_id)

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return scan
