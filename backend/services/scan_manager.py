from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from core.store import ScanStore, scan_store
from app.scanner.runner import run_security_scan


class ScanManager:
    """
    Manages the scan lifecycle: create, execute, track, and retrieve scans.
    Separates scan management logic from HTTP route handlers.
    """

    def __init__(self, store: ScanStore | None = None):
        self._store = store or scan_store
        self._background_tasks: dict[str, Any] = {}

    def create_scan(self, repo_url: str, branch: str = "main") -> dict[str, Any]:
        """Create a new scan record and return the scan ID."""
        scan_id = str(uuid.uuid4())
        started_at = self._utc_now()

        scan = self._store.create(
            scan_id=scan_id,
            repo_url=repo_url,
            branch=branch,
        )

        self._store.update(
            scan_id,
            status="QUEUED",
            started_at=started_at,
        )

        return {"scan_id": scan_id, "status": "QUEUED"}

    def get_scan(self, scan_id: str) -> dict[str, Any] | None:
        """Retrieve a scan by ID."""
        return self._store.get(scan_id)

    def start_scan_execution(self, scan_id: str) -> None:
        """
        Start the scan execution in the background.
        This should be called after create_scan() to begin processing.
        """
        scan = self._store.get(scan_id)
        if scan is None:
            raise ValueError(f"Scan {scan_id} not found")

        if scan["status"] not in ("QUEUED", "ERROR"):
            raise ValueError(f"Scan {scan_id} cannot be started from status {scan['status']}")

        self._store.update(scan_id, status="RUNNING")

        import asyncio

        asyncio.create_task(self._run_scan_async(scan_id))

    async def _run_scan_async(self, scan_id: str) -> None:
        """Run the security scan asynchronously."""
        scan = self._store.get(scan_id)
        if scan is None:
            return

        repo_url = scan["repo_url"]
        branch = scan.get("branch", "main")

        try:
            result = run_security_scan(repo_url, branch, scan_id=scan_id)
            findings = result.get("findings", [])
            runtime_findings = result.get("runtime_findings", [])
            summary = result.get("summary", {})
            sandbox_ran = result.get("sandbox_ran", False)

            self._store.update(
                scan_id,
                status="COMPLETED",
                static_findings=findings,
                runtime_findings=runtime_findings,
                narrative=result.get("narrative", ""),
                verdict=self._build_verdict(findings + runtime_findings, sandbox_ran=sandbox_ran),
                summary=summary,
                finished_at=self._utc_now(),
            )

        except Exception as exc:
            self._store.update(
                scan_id,
                status="FAILED",
                error=str(exc),
                finished_at=self._utc_now(),
            )

    def _build_verdict(self, findings: list[dict], sandbox_ran: bool = False) -> dict:
        """Build verdict from findings."""
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
                severity_weights.get(str(f.get("severity", "INFO")).upper(), 0)
                for f in findings
            ),
        )

        triggered_rules = [str(f.get("description", "Unknown rule")) for f in findings]

        severities = {str(f.get("severity", "INFO")).upper() for f in findings}

        if "CRITICAL" in severities:
            level = "DANGEROUS"
            summary = f"Static analysis found {len(findings)} security finding(s), including at least one critical issue."
        elif "HIGH" in severities:
            level = "SUSPICIOUS"
            summary = f"Static analysis found {len(findings)} security finding(s) requiring review."
        else:
            level = "SAFE"
            summary = "Static analysis found no high or critical security issues."

        # Confidence reflects how much signal backs this verdict: static
        # analysis alone is informative but partial; static + a dynamic
        # sandbox run that actually executed gives a fuller picture.
        base_confidence = 0.55 if not sandbox_ran else 0.85
        if not findings:
            # No findings + no dynamic run = genuinely low signal either way
            confidence = 0.5 if not sandbox_ran else base_confidence
        else:
            confidence = min(1.0, base_confidence + 0.05 * min(len(findings), 3))

        return {
            "level": level,
            "score": score,
            "confidence": round(confidence, 2),
            "triggered_rules": triggered_rules,
            "summary": summary,
            "dynamic_analysis_ran": sandbox_ran,
        }

    @staticmethod
    def _utc_now() -> str:
        return datetime.now(timezone.utc).isoformat()


scan_manager = ScanManager()