"""
Scan router — POST /api/scan to submit, GET /api/scan/{id} to retrieve.
TODO: wire up StaticScanner, SandboxRunner, and RuleEngine.
"""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.models import ScanRecord, ScanStatus
from core.store import store

router = APIRouter()


class ScanRequest(BaseModel):
    repo_url: str
    branch: str = "main"


@router.post("", status_code=202)
def start_scan(req: ScanRequest):
    scan_id = str(uuid.uuid4())
    record = ScanRecord(scan_id=scan_id, repo_url=req.repo_url, branch=req.branch)
    store.put(record)
    # TODO: kick off background pipeline
    return {"scan_id": scan_id, "status": ScanStatus.QUEUED}


@router.get("/{scan_id}")
def get_scan(scan_id: str):
    record = store.get(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return record
