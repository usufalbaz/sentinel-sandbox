"""
Explain router — POST /api/explain/{scan_id} for LLM narrative.
POST /api/explain/{scan_id}/followup for grounded Q&A.
TODO: wire up watsonx.ai / IBM Granite.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.store import store
from core.models import ScanStatus

router = APIRouter()


class FollowUpRequest(BaseModel):
    question: str


@router.post("/{scan_id}")
def generate_narrative(scan_id: str):
    record = store.get(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    if record.status != ScanStatus.COMPLETE:
        raise HTTPException(status_code=409, detail="Scan not yet complete")
    # TODO: call LLM and store narrative on record
    return {"scan_id": scan_id, "narrative": "TODO"}


@router.post("/{scan_id}/followup")
def follow_up(scan_id: str, req: FollowUpRequest):
    record = store.get(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    if record.status != ScanStatus.COMPLETE:
        raise HTTPException(status_code=409, detail="Scan not yet complete")
    # TODO: call LLM grounded on record findings
    return {"scan_id": scan_id, "question": req.question, "answer": "TODO"}
