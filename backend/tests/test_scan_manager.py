from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from services.scan_manager import ScanManager
from core.store import ScanStore


class TestScanManager:
    @pytest.fixture
    def store(self):
        return ScanStore()

    @pytest.fixture
    def scan_manager(self, store):
        return ScanManager(store=store)

    def test_create_scan(self, scan_manager):
        result = scan_manager.create_scan("https://github.com/user/repo", "main")

        assert "scan_id" in result
        assert result["status"] == "QUEUED"

        scan = scan_manager.get_scan(result["scan_id"])
        assert scan is not None
        assert scan["repo_url"] == "https://github.com/user/repo"
        assert scan["branch"] == "main"
        assert scan["status"] == "QUEUED"

    def test_get_scan_not_found(self, scan_manager):
        scan = scan_manager.get_scan("non-existent-id")
        assert scan is None

    def test_start_scan_execution_queued(self, scan_manager):
        result = scan_manager.create_scan("https://github.com/user/repo", "main")
        scan_id = result["scan_id"]

        import asyncio
        from unittest.mock import patch

        async def run_test():
            with patch("services.scan_manager.run_security_scan") as mock_run:
                mock_run.return_value = {
                    "findings": [],
                    "summary": {"total": 0, "by_severity": {}},
                }
                scan_manager.start_scan_execution(scan_id)
                await asyncio.sleep(0.01)  # Allow background task to complete
                scan = scan_manager.get_scan(scan_id)
                assert scan["status"] == "COMPLETED"

        asyncio.run(run_test())

    def test_start_scan_execution_not_found(self, scan_manager):
        with pytest.raises(ValueError, match="Scan non-existent-id not found"):
            scan_manager.start_scan_execution("non-existent-id")

    def test_start_scan_execution_wrong_status(self, scan_manager):
        result = scan_manager.create_scan("https://github.com/user/repo", "main")
        scan_id = result["scan_id"]

        scan_manager._store.update(scan_id, status="COMPLETED")

        with pytest.raises(ValueError, match="cannot be started from status COMPLETED"):
            scan_manager.start_scan_execution(scan_id)

    @pytest.mark.asyncio
    async def test_run_scan_async_success(self, scan_manager):
        result = scan_manager.create_scan("https://github.com/user/repo", "main")
        scan_id = result["scan_id"]

        with patch("services.scan_manager.run_security_scan") as mock_run:
            mock_run.return_value = {
                "findings": [
                    {
                        "id": "static-1",
                        "category": "filesystem",
                        "severity": "warning",
                        "description": "Test finding",
                        "timestamp": "2026-01-01T00:00:00+00:00",
                        "file": "test.py",
                        "line": 1,
                        "evidence": "test",
                    }
                ],
                "summary": {"total": 1, "by_severity": {"HIGH": 1}},
            }

            await scan_manager._run_scan_async(scan_id)

        scan = scan_manager.get_scan(scan_id)
        assert scan["status"] == "COMPLETED"
        assert len(scan["static_findings"]) == 1
        assert scan["verdict"] is not None
        assert scan["summary"] is not None

    @pytest.mark.asyncio
    async def test_run_scan_async_failure(self, scan_manager):
        result = scan_manager.create_scan("https://github.com/user/repo", "main")
        scan_id = result["scan_id"]

        with patch("services.scan_manager.run_security_scan") as mock_run:
            mock_run.side_effect = RuntimeError("Scanner failed")

            await scan_manager._run_scan_async(scan_id)

        scan = scan_manager.get_scan(scan_id)
        assert scan["status"] == "FAILED"
        assert "Scanner failed" in scan["error"]