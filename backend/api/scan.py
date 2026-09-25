"""
POST /api/scan   — submit a repo URL, returns scan_id immediately (202)
GET  /api/scan/{scan_id} — full ScanRecord (poll until status == COMPLETE)

The background task drives:
  QUEUED → CLONING → SCANNING_STATIC → RUNNING_SANDBOX → COMPLETE
"""
from __future__ import annotations

import asyncio
import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from core.models import ScanRecord, ScanStatus
from core.rule_engine import RuleEngine
from core.scanner import StaticScanner
from core.store import store
from sandbox.runner import SandboxRunner

logger = logging.getLogger(__name__)
router = APIRouter()


class ScanRequest(BaseModel):
    repo_url: str
    branch: str = "main"


@router.post("", status_code=202)
def start_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    scan_id = str(uuid.uuid4())
    record = ScanRecord(
        scan_id=scan_id,
        repo_url=req.repo_url,
        branch=req.branch,
        status=ScanStatus.QUEUED,
    )
    store.put(record)
    background_tasks.add_task(_run_pipeline, scan_id, req.repo_url, req.branch)
    return {"scan_id": scan_id, "status": ScanStatus.QUEUED}


@router.get("/{scan_id}")
def get_scan(scan_id: str):
    record = store.get(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return record


# ---------------------------------------------------------------------------
# Background pipeline
# ---------------------------------------------------------------------------

def _run_pipeline(scan_id: str, repo_url: str, branch: str) -> None:
    """Synchronous wrapper so FastAPI BackgroundTasks can schedule it."""
    asyncio.run(_async_pipeline(scan_id, repo_url, branch))


async def _async_pipeline(scan_id: str, repo_url: str, branch: str) -> None:
    runner = SandboxRunner(scan_id=scan_id, repo_url=repo_url, branch=branch)

    def _update(status: ScanStatus, **kwargs) -> None:
        record = store.get(scan_id)
        if record:
            record.status = status
            for k, v in kwargs.items():
                setattr(record, k, v)
            store.put(record)

    try:
        # 1. Clone
        _update(ScanStatus.CLONING)
        clone_path = await runner.clone()

        # 2. Static analysis
        _update(ScanStatus.SCANNING_STATIC)
        scanner = StaticScanner(clone_path)
        static_findings = scanner.run()
        _update(ScanStatus.SCANNING_STATIC, static_findings=static_findings)

        # 3. Sandbox execution + runtime monitors
        _update(ScanStatus.RUNNING_SANDBOX)
        runtime_findings = await runner.execute_and_monitor()

        # 4. Deterministic verdict
        verdict = RuleEngine().evaluate(static_findings, runtime_findings)

        _update(
            ScanStatus.COMPLETE,
            runtime_findings=runtime_findings,
            verdict=verdict,
        )
        logger.info("scan %s complete — verdict %s (score %d)", scan_id, verdict.level, verdict.score)

    except Exception as exc:
        logger.exception("scan %s failed: %s", scan_id, exc)
        _update(ScanStatus.ERROR, error=str(exc))
    finally:
        await runner.cleanup()
