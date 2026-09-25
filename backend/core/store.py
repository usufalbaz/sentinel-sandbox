from __future__ import annotations

from threading import Lock
from typing import Any


class ScanStore:
    """Thread-safe in-memory store for scan jobs."""

    def __init__(self) -> None:
        self._scans: dict[str, dict[str, Any]] = {}
        self._lock = Lock()

    def create(
        self,
        scan_id: str,
        repo_url: str,
        branch: str = "main",
    ) -> dict[str, Any]:
        scan = {
            "scan_id": scan_id,
            "repo_url": repo_url,
            "branch": branch,
            "status": "QUEUED",
            "static_findings": [],
            "runtime_findings": [],
            "verdict": None,
            "narrative": None,
            "started_at": "",
            "finished_at": "",
            "error": None,
        }

        with self._lock:
            self._scans[scan_id] = scan

        return scan.copy()

    def get(self, scan_id: str) -> dict[str, Any] | None:
        with self._lock:
            scan = self._scans.get(scan_id)

            if scan is None:
                return None

            return scan.copy()

    def update(
        self,
        scan_id: str,
        **updates: Any,
    ) -> dict[str, Any] | None:
        with self._lock:
            scan = self._scans.get(scan_id)

            if scan is None:
                return None

            scan.update(updates)

            return scan.copy()


scan_store = ScanStore()
