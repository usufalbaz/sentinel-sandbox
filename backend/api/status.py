"""
Status router — GET /api/status/{scan_id} lightweight polling.
"""
from fastapi import APIRouter, HTTPException
from core.store import store

router = APIRouter()


@router.get("/{scan_id}")
def get_status(scan_id: str):
    record = store.get(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"scan_id": scan_id, "status": record.status, "verdict": record.verdict}
