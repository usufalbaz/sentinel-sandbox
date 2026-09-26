from __future__ import annotations

import pytest
from unittest.mock import patch, MagicMock

from app.scanner.runner import run_security_scan, _build_summary


class TestRunner:
    @patch("app.scanner.runner.scan_repository")
    def test_run_security_scan_success(self, mock_scan_repo):
        mock_scan_repo.return_value = {
            "findings": [
                {
                    "file": "test.py",
                    "line": 1,
                    "rule_name": "Test Rule",
                    "cwe": "CWE-123",
                    "severity": "HIGH",
                    "matched_line": "test code",
                }
            ],
            "files_scanned": True,
        }

        result = run_security_scan("https://github.com/user/repo", "main")

        assert "findings" in result
        assert "summary" in result
        assert len(result["findings"]) == 1
        assert result["summary"]["total"] == 1
        assert result["summary"]["by_severity"]["HIGH"] == 1

    @patch("app.scanner.runner.scan_repository")
    def test_run_security_scan_empty_findings(self, mock_scan_repo):
        mock_scan_repo.return_value = {
            "findings": [],
            "files_scanned": True,
        }

        result = run_security_scan("https://github.com/user/repo", "main")

        assert result["findings"] == []
        assert result["summary"]["total"] == 0

    @patch("app.scanner.runner.scan_repository")
    def test_run_security_scan_passes_branch(self, mock_scan_repo):
        mock_scan_repo.return_value = {"findings": [], "files_scanned": True}

        run_security_scan("https://github.com/user/repo", "develop")

        mock_scan_repo.assert_called_once_with(repo_url="https://github.com/user/repo", branch="develop")

    def test_build_summary(self):
        raw_findings = [
            {"severity": "CRITICAL"},
            {"severity": "HIGH"},
            {"severity": "MEDIUM"},
            {"severity": "LOW"},
            {"severity": "INFO"},
            {"severity": "UNKNOWN"},
        ]

        summary = _build_summary(raw_findings)

        assert summary["total"] == 6
        assert summary["by_severity"]["CRITICAL"] == 1
        assert summary["by_severity"]["HIGH"] == 1
        assert summary["by_severity"]["MEDIUM"] == 1
        assert summary["by_severity"]["LOW"] == 1
        assert summary["by_severity"]["INFO"] == 1  # UNKNOWN is not counted as INFO

    def test_build_summary_empty(self):
        summary = _build_summary([])

        assert summary["total"] == 0
        assert all(v == 0 for v in summary["by_severity"].values())