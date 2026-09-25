from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from agent.rule_engine import SecurityRuleEngine


SKIP_DIRS = {
    ".git",
    "node_modules",
    ".venv",
    "venv",
    "__pycache__",
    ".next",
    "dist",
    "build",
}


def scan_repository(repo_url: str, branch: str = "main") -> dict:
    """
    Clone a repository without executing its project code, then run
    the existing SecurityRuleEngine against source files and package.json.
    """

    engine = SecurityRuleEngine()
    temp_dir = Path(tempfile.mkdtemp(prefix="sentinel-scan-"))

    try:
        clone_cmd = [
            "git",
            "clone",
            "--depth",
            "1",
            "--branch",
            branch,
            repo_url,
            str(temp_dir / "repo"),
        ]

        result = subprocess.run(
            clone_cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"Repository clone failed: {result.stderr.strip()}"
            )

        repo_dir = temp_dir / "repo"

        findings = []

        for path in repo_dir.rglob("*"):
            if not path.is_file():
                continue

            if any(part in SKIP_DIRS for part in path.parts):
                continue

            relative_path = path.relative_to(repo_dir).as_posix()

            try:
                if path.name == "package.json":
                    findings.extend(
                        engine.inspect_package_json(
                            path.read_text(
                                encoding="utf-8",
                                errors="ignore",
                            ),
                            relative_path,
                        )
                    )
                    continue

                # Keep the first version conservative: only scan
                # common source/config text files.
                if path.suffix.lower() not in {
                    ".py",
                    ".js",
                    ".jsx",
                    ".ts",
                    ".tsx",
                    ".java",
                    ".go",
                    ".php",
                    ".rb",
                    ".rs",
                    ".sql",
                    ".sh",
                }:
                    continue

                findings.extend(
                    engine.scan_code_lines(
                        path.read_text(
                            encoding="utf-8",
                            errors="ignore",
                        ),
                        relative_path,
                    )
                )

            except (OSError, UnicodeError):
                continue

        return {
            "findings": findings,
            "files_scanned": True,
        }

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
