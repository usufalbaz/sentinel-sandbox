from __future__ import annotations

import io
import re
import shutil
import tarfile
import tempfile
from pathlib import Path

import httpx

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

_GITHUB_URL_RE = re.compile(
    r"github\.com[:/]+(?P<owner>[^/\s]+)/(?P<repo>[^/\s#]+?)(?:\.git)?/?$"
)


def _parse_github_repo(repo_url: str) -> tuple[str, str]:
    match = _GITHUB_URL_RE.search(repo_url.strip())
    if not match:
        raise ValueError(f"Unsupported repository URL: {repo_url}")
    return match.group("owner"), match.group("repo")


def _download_repo(repo_url: str, branch: str, dest_dir: Path) -> Path:
    """
    Download a public GitHub repository's source as a tarball and extract
    it into dest_dir. This avoids depending on a local `git` binary, which
    isn't guaranteed to be present in every deployment environment.
    """
    owner, repo = _parse_github_repo(repo_url)
    tarball_url = (
        f"https://codeload.github.com/{owner}/{repo}/tar.gz/refs/heads/{branch}"
    )

    with httpx.Client(timeout=60, follow_redirects=True) as client:
        response = client.get(tarball_url)

    if response.status_code != 200:
        raise RuntimeError(
            f"Repository download failed ({response.status_code}) for "
            f"{repo_url}@{branch}. Check that the repo is public and the "
            f"branch exists."
        )

    with tarfile.open(fileobj=io.BytesIO(response.content), mode="r:gz") as tar:
        # filter="data" rejects unsafe members (e.g. path traversal, device
        # files) - important since we're extracting a remote, user-supplied
        # archive.
        tar.extractall(dest_dir, filter="data")

    # GitHub tarballs wrap everything in one top-level dir, e.g. "repo-branch/"
    extracted = [p for p in dest_dir.iterdir() if p.is_dir()]
    if not extracted:
        raise RuntimeError("Downloaded archive was empty")
    return extracted[0]


def scan_repository(repo_url: str, branch: str = "main") -> dict:
    """
    Download a repository's source without executing its project code, then
    run the existing SecurityRuleEngine against source files and
    package.json.
    """

    engine = SecurityRuleEngine()
    temp_dir = Path(tempfile.mkdtemp(prefix="sentinel-scan-"))

    try:
        repo_dir = _download_repo(repo_url, branch, temp_dir)

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