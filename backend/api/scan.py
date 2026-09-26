from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, field_validator

from services.scan_manager import scan_manager


router = APIRouter()

GITHUB_REPO_PATTERN = re.compile(
    r"^https://github\.com/[\w\-]+/[\w\-\.]+(?:\.git)?/?$"
)


class ScanCreateRequest(BaseModel):
    repo_url: str
    branch: str = "main"

    @field_validator("repo_url")
    @classmethod
    def validate_repo_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Repository URL is required")

        if len(v) > 500:
            raise ValueError("Repository URL is too long")

        if not GITHUB_REPO_PATTERN.match(v):
            raise ValueError(
                "Invalid GitHub repository URL. Expected format: "
                "https://github.com/owner/repository"
            )

        return v

    @field_validator("branch")
    @classmethod
    def validate_branch(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Branch name is required")
        if len(v) > 200:
            raise ValueError("Branch name is too long")
        return v


class ScanCreateResponse(BaseModel):
    scan_id: str
    status: str


class ScanStatusResponse(BaseModel):
    scan_id: str
    repo_url: str
    branch: str
    status: str
    started_at: str = ""
    finished_at: str = ""
    error: str | None = None
    static_findings: list[dict[str, Any]] = []
    runtime_findings: list[dict[str, Any]] = []
    verdict: dict[str, Any] | None = None
    summary: dict[str, Any] | None = None


class ErrorResponse(BaseModel):
    error: dict[str, str]


@router.post(
    "/scans",
    response_model=ScanCreateResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def create_scan(body: ScanCreateRequest) -> ScanCreateResponse:
    """
    Create a new security scan for a GitHub repository.
    Returns immediately with a scan_id while the scan runs in the background.
    """
    try:
        result = scan_manager.create_scan(body.repo_url, body.branch)
        scan_manager.start_scan_execution(result["scan_id"])
        return ScanCreateResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_INPUT", "message": str(exc)},
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_ERROR", "message": "Failed to create scan"},
        ) from exc


@router.get(
    "/scans/{scan_id}",
    response_model=ScanStatusResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Scan not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def get_scan(scan_id: str) -> ScanStatusResponse:
    """Retrieve scan status and results by scan ID."""
    try:
        scan = scan_manager.get_scan(scan_id)

        if scan is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "SCAN_NOT_FOUND", "message": "Scan not found"},
            )

        return ScanStatusResponse(**scan)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_ERROR", "message": "Failed to retrieve scan"},
        ) from exc


@router.get(
    "/scans/{scan_id}/results",
    response_model=ScanStatusResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Scan not found"},
        409: {"model": ErrorResponse, "description": "Scan not completed"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def get_scan_results(scan_id: str) -> ScanStatusResponse:
    """Retrieve scan results (only available when scan is completed)."""
    try:
        scan = scan_manager.get_scan(scan_id)

        if scan is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "SCAN_NOT_FOUND", "message": "Scan not found"},
            )

        if scan["status"] != "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": "SCAN_NOT_COMPLETED",
                    "message": f"Scan is not completed. Current status: {scan['status']}",
                },
            )

        return ScanStatusResponse(**scan)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_ERROR", "message": "Failed to retrieve scan results"},
        ) from exc


