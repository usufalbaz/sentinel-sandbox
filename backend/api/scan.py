from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


# ── Request / Response models ──────────────────────────────────────────────────

class ScanRequest(BaseModel):
    repo_url: str


class ScanStarted(BaseModel):
    scan_id: str


class Finding(BaseModel):
    id: str
    category: Literal["filesystem", "network", "process", "dynamic_exec"]
    severity: Literal["info", "warning", "critical"]
    description: str
    timestamp: str


class ScanResult(BaseModel):
    scan_id: str
    repo_url: str
    verdict: Literal["safe", "suspicious", "dangerous"]
    findings: list[Finding]
    chain: str
    started_at: str
    finished_at: str


class ChatRequest(BaseModel):
    messages: list[dict]  # [{role, content}, ...]


class ChatResponse(BaseModel):
    reply: str


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/scan", response_model=ScanStarted, status_code=202)
async def start_scan(body: ScanRequest):
    """
    Kick off a sandboxed scan for the given repo URL.
    TODO: enqueue Docker sandbox job and return its ID.
    """
    scan_id = str(uuid.uuid4())
    return ScanStarted(scan_id=scan_id)


@router.get("/scan/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str):
    """
    Return the current state / final result of a scan.
    TODO: fetch from job store / Bob agent output.
    """
    # Placeholder — replace with real persistence layer
    return ScanResult(
        scan_id=scan_id,
        repo_url="https://github.com/placeholder/repo",
        verdict="safe",
        findings=[],
        chain="No analysis yet.",
        started_at="",
        finished_at="",
    )


@router.post("/scan/{scan_id}/chat", response_model=ChatResponse)
async def chat(scan_id: str, body: ChatRequest):
    """
    Ask Bob a follow-up question grounded in this scan's findings.
    TODO: pass findings context + messages to Bob agent.
    """
    return ChatResponse(reply="(Bob response placeholder)")
