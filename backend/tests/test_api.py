from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

from main import app


client = TestClient(app)


class TestScanAPI:
    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_create_scan_success(self):
        with patch("services.scan_manager.scan_manager.start_scan_execution") as mock_start:
            response = client.post(
                "/api/scans",
                json={"repo_url": "https://github.com/user/repo", "branch": "main"},
            )

        assert response.status_code == 202
        data = response.json()
        assert "scan_id" in data
        assert data["status"] == "QUEUED"
        mock_start.assert_called_once()

    def test_create_scan_invalid_url(self):
        response = client.post(
            "/api/scans",
            json={"repo_url": "not-a-url"},
        )

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_create_scan_missing_url(self):
        response = client.post(
            "/api/scans",
            json={"branch": "main"},
        )

        assert response.status_code == 422

    def test_create_scan_non_github_url(self):
        response = client.post(
            "/api/scans",
            json={"repo_url": "https://gitlab.com/user/repo"},
        )

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_get_scan_success(self):
        with patch("services.scan_manager.scan_manager.start_scan_execution"):
            create_response = client.post(
                "/api/scans",
                json={"repo_url": "https://github.com/user/repo", "branch": "main"},
            )

        scan_id = create_response.json()["scan_id"]

        with patch("services.scan_manager.scan_manager.get_scan") as mock_get:
            mock_get.return_value = {
                "scan_id": scan_id,
                "repo_url": "https://github.com/user/repo",
                "branch": "main",
                "status": "COMPLETED",
                "started_at": "2026-01-01T00:00:00+00:00",
                "finished_at": "2026-01-01T00:00:10+00:00",
                "error": None,
                "static_findings": [],
                "runtime_findings": [],
                "verdict": {"level": "SAFE", "score": 0, "triggered_rules": [], "summary": "No issues"},
                "summary": {"total": 0, "by_severity": {}},
            }

            response = client.get(f"/api/scans/{scan_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["scan_id"] == scan_id
        assert data["status"] == "COMPLETED"

    def test_get_scan_not_found(self):
        response = client.get("/api/scans/non-existent-id")
        assert response.status_code == 404
        data = response.json()
        assert data["detail"]["code"] == "SCAN_NOT_FOUND"

    def test_get_scan_results_completed(self):
        scan_id = "test-scan-id"

        with patch("services.scan_manager.scan_manager.get_scan") as mock_get:
            mock_get.return_value = {
                "scan_id": scan_id,
                "repo_url": "https://github.com/user/repo",
                "branch": "main",
                "status": "COMPLETED",
                "started_at": "2026-01-01T00:00:00+00:00",
                "finished_at": "2026-01-01T00:00:10+00:00",
                "error": None,
                "static_findings": [],
                "runtime_findings": [],
                "verdict": {"level": "SAFE", "score": 0, "triggered_rules": [], "summary": "No issues"},
                "summary": {"total": 0, "by_severity": {}},
            }

            response = client.get(f"/api/scans/{scan_id}/results")

        assert response.status_code == 200
        data = response.json()
        assert data["scan_id"] == scan_id

    def test_get_scan_results_not_completed(self):
        scan_id = "test-scan-id"

        with patch("services.scan_manager.scan_manager.get_scan") as mock_get:
            mock_get.return_value = {
                "scan_id": scan_id,
                "repo_url": "https://github.com/user/repo",
                "branch": "main",
                "status": "RUNNING",
                "started_at": "2026-01-01T00:00:00+00:00",
                "finished_at": "",
                "error": None,
                "static_findings": [],
                "runtime_findings": [],
                "verdict": None,
                "summary": None,
            }

            response = client.get(f"/api/scans/{scan_id}/results")

        assert response.status_code == 409
        data = response.json()
        assert data["detail"]["code"] == "SCAN_NOT_COMPLETED"

    def test_get_scan_results_not_found(self):
        response = client.get("/api/scans/non-existent-id/results")
        assert response.status_code == 404
        data = response.json()
        assert data["detail"]["code"] == "SCAN_NOT_FOUND"