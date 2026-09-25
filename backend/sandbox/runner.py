"""
SandboxRunner — isolates npm install inside a Docker container and monitors
filesystem, network, and process activity for malicious behaviour.

Pipeline:
  clone()               → shallow-clone repo into a tmp dir via GitPython
  execute_and_monitor() → run `npm install` in a hardened container while three
                          asyncio tasks watch /proc, network state, and stdout
  cleanup()             → force-remove container + temp dir
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import List

import docker
import docker.errors
from git import Repo, GitCommandError

from core.models import Finding, Severity

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CLONE_TIMEOUT   = 60    # seconds
INSTALL_TIMEOUT = 120   # seconds
PROC_POLL_SECS  = 1.0

SANDBOX_IMAGE = "node:20-alpine"

# Paths whose access signals credential exfiltration
_SENSITIVE_PATH_RE = re.compile(
    r"/(?:root|home/[^/]+)/\."
    r"(?:ssh|aws|gnupg|netrc|docker|kube|config|bash_history)",
    re.IGNORECASE,
)

# Non-RFC-1918 / non-loopback — genuine external egress attempt
_PRIVATE_IP_RE = re.compile(
    r"^(?:127\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)"
)

# Patterns that, if seen in npm-install stdout, confirm runtime RCE activity
_RUNTIME_EXEC_RE  = re.compile(r"\beval\s*\(|new\s+Function\s*\(|Function\s*\(")
_RUNTIME_URL_RE   = re.compile(r"https?://\S+")
_RUNTIME_CRED_RE  = re.compile(
    r"(?:\.ssh|\.aws|\.gnupg|authorized_keys|id_rsa|id_ed25519)", re.IGNORECASE
)


class SandboxRunner:
    def __init__(self, scan_id: str, repo_url: str, branch: str = "main") -> None:
        self.scan_id  = scan_id
        self.repo_url = repo_url
        self.branch   = branch

        self._tmpdir: str | None = None
        self._container = None          # docker.models.containers.Container
        self._client: docker.DockerClient | None = None
        self._findings: List[Finding] = []

    # ------------------------------------------------------------------
    # 1. Clone
    # ------------------------------------------------------------------

    async def clone(self) -> str:
        """Shallow-clone the repo into a temp directory. Returns the clone path."""
        self._tmpdir = tempfile.mkdtemp(prefix=f"sentinel_{self.scan_id}_")
        clone_dir = os.path.join(self._tmpdir, "repo")

        loop = asyncio.get_event_loop()
        try:
            await asyncio.wait_for(
                loop.run_in_executor(None, self._do_clone, clone_dir),
                timeout=CLONE_TIMEOUT,
            )
        except asyncio.TimeoutError:
            raise RuntimeError(f"git clone timed out after {CLONE_TIMEOUT}s")

        return clone_dir

    def _do_clone(self, clone_dir: str) -> None:
        try:
            Repo.clone_from(
                self.repo_url,
                clone_dir,
                depth=1,
                branch=self.branch,
                single_branch=True,
            )
        except GitCommandError as exc:
            raise RuntimeError(f"git clone failed: {exc}") from exc

    # ------------------------------------------------------------------
    # 2. Execute + monitor
    # ------------------------------------------------------------------

    async def execute_and_monitor(self) -> List[Finding]:
        if not self._tmpdir:
            raise RuntimeError("call clone() before execute_and_monitor()")

        clone_dir = os.path.join(self._tmpdir, "repo")

        # Check Docker availability
        try:
            self._client = docker.from_env(timeout=10)
            self._client.ping()
        except Exception as exc:
            self._findings.append(Finding(
                category="SANDBOX_INFO",
                severity=Severity.INFO,
                detail=f"Docker unavailable — runtime monitoring skipped ({exc})",
            ))
            return self._findings

        await self._pull_image()
        await self._start_container(clone_dir)

        try:
            # Run npm install + three parallel monitors concurrently
            await asyncio.wait_for(
                asyncio.gather(
                    self._run_npm_install(),
                    self._monitor_proc(),
                    self._monitor_network(),
                ),
                timeout=INSTALL_TIMEOUT + 10,
            )
        except asyncio.TimeoutError:
            self._findings.append(Finding(
                category="SANDBOX_TIMEOUT",
                severity=Severity.MEDIUM,
                detail="Sandbox timed out — package may deliberately hang to evade analysis",
            ))

        return self._findings

    # ------------------------------------------------------------------
    # Docker helpers
    # ------------------------------------------------------------------

    async def _pull_image(self) -> None:
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None, lambda: self._client.images.pull(SANDBOX_IMAGE)  # type: ignore[union-attr]
            )
        except docker.errors.APIError as exc:
            logger.warning("Could not pull %s: %s — using cached image if available", SANDBOX_IMAGE, exc)

    async def _start_container(self, clone_dir: str) -> None:
        loop = asyncio.get_event_loop()
        container = await loop.run_in_executor(
            None,
            lambda: self._client.containers.run(  # type: ignore[union-attr]
                SANDBOX_IMAGE,
                command="sleep 300",
                detach=True,
                name=f"sentinel_{self.scan_id}",
                network_mode="bridge",          # allow egress so we can observe DNS/connect attempts
                mem_limit="256m",
                nano_cpus=500_000_000,          # 0.5 CPU
                cap_drop=["ALL"],
                security_opt=["no-new-privileges"],
                read_only=False,
                volumes={
                    clone_dir: {"bind": "/sandbox", "mode": "ro"},
                },
                working_dir="/sandbox",
                tmpfs={"/tmp": "size=64m"},
                remove=False,                   # we remove manually in cleanup()
            ),
        )
        self._container = container

        # Copy repo to a writable location because the source bind is read-only
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: self._container.exec_run("cp -r /sandbox /work", user="root"),  # type: ignore[union-attr]
        )

    # ------------------------------------------------------------------
    # npm install
    # ------------------------------------------------------------------

    async def _run_npm_install(self) -> None:
        if not self._container:
            return
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self._container.exec_run(  # type: ignore[union-attr]
                "sh -c 'cd /work && npm install --ignore-scripts=false 2>&1'",
                user="root",
            ),
        )
        output = result.output.decode("utf-8", errors="replace") if result.output else ""
        self._parse_install_output(output)

    def _parse_install_output(self, output: str) -> None:
        """Scan npm install stdout/stderr for runtime execution evidence."""
        if _RUNTIME_EXEC_RE.search(output):
            self._findings.append(Finding(
                category="DYNAMIC_EXEC",
                severity=Severity.CRITICAL,
                detail="eval() or new Function() observed in npm install output",
                evidence=output[:600],
            ))

        for url in _RUNTIME_URL_RE.findall(output)[:10]:
            self._findings.append(Finding(
                category="REMOTE_FETCH",
                severity=Severity.HIGH,
                detail=f"Outbound URL observed during install: {url}",
                evidence=url,
            ))

        if _RUNTIME_CRED_RE.search(output):
            self._findings.append(Finding(
                category="FS_SENSITIVE_READ",
                severity=Severity.CRITICAL,
                detail="Credential file path appeared in npm install output",
                evidence=output[:400],
            ))

    # ------------------------------------------------------------------
    # Monitor: process tree
    # ------------------------------------------------------------------

    async def _monitor_proc(self) -> None:
        """Poll /proc inside the container for unexpected child processes."""
        if not self._container:
            return
        seen: set[str] = set()
        deadline = asyncio.get_event_loop().time() + INSTALL_TIMEOUT
        loop = asyncio.get_event_loop()

        while asyncio.get_event_loop().time() < deadline:
            await asyncio.sleep(PROC_POLL_SECS)
            try:
                result = await loop.run_in_executor(
                    None,
                    lambda: self._container.exec_run(  # type: ignore[union-attr]
                        "sh -c \"ls /proc | grep -E '^[0-9]+$'\"",
                    ),
                )
                pids = set(result.output.decode().split()) if result.output else set()
            except Exception:
                break

            for pid in pids - seen:
                try:
                    cmd_result = await loop.run_in_executor(
                        None,
                        lambda p=pid: self._container.exec_run(  # type: ignore[union-attr]
                            f"cat /proc/{p}/cmdline"
                        ),
                    )
                    if cmd_result.output:
                        cmdline = cmd_result.output.replace(b"\x00", b" ").decode(errors="replace").strip()
                        # Flag anything that isn't npm/node/sh/cp boilerplate
                        if cmdline and not re.match(r"^(node|npm|sh|cp|sleep|cat)\b", cmdline):
                            self._findings.append(Finding(
                                category="PROCESS_SPAWN",
                                severity=Severity.HIGH,
                                detail=f"Unexpected process spawned during install: {cmdline[:120]}",
                                evidence=cmdline,
                            ))
                except Exception:
                    pass
            seen = pids

    # ------------------------------------------------------------------
    # Monitor: network connections
    # ------------------------------------------------------------------

    async def _monitor_network(self) -> None:
        """
        Read /proc/net/tcp inside the container every 2 s to detect outbound
        connections (even those that fail due to no external route).
        """
        if not self._container:
            return
        seen: set[str] = set()
        deadline = asyncio.get_event_loop().time() + INSTALL_TIMEOUT
        loop = asyncio.get_event_loop()

        while asyncio.get_event_loop().time() < deadline:
            await asyncio.sleep(2)
            for proto in ("tcp", "tcp6"):
                try:
                    result = await loop.run_in_executor(
                        None,
                        lambda p=proto: self._container.exec_run(  # type: ignore[union-attr]
                            f"cat /proc/net/{p}"
                        ),
                    )
                    if not result.output:
                        continue
                    for line in result.output.decode(errors="replace").splitlines()[1:]:
                        parts = line.split()
                        if len(parts) < 4 or parts[3] not in ("01", "02"):
                            continue
                        try:
                            ip = _hex_to_ip(parts[2])
                        except Exception:
                            continue
                        if ip not in seen:
                            seen.add(ip)
                            if not _PRIVATE_IP_RE.match(ip):
                                self._findings.append(Finding(
                                    category="NET_EGRESS_EXTERNAL",
                                    severity=Severity.HIGH,
                                    detail=f"Outbound connection to external host during install: {ip}",
                                    evidence=ip,
                                ))
                except Exception:
                    pass

    # ------------------------------------------------------------------
    # 3. Cleanup
    # ------------------------------------------------------------------

    async def cleanup(self) -> None:
        loop = asyncio.get_event_loop()
        if self._container:
            try:
                await loop.run_in_executor(
                    None,
                    lambda: self._container.remove(force=True),  # type: ignore[union-attr]
                )
            except Exception as exc:
                logger.warning("Container removal failed: %s", exc)
            self._container = None

        if self._tmpdir and Path(self._tmpdir).exists():
            shutil.rmtree(self._tmpdir, ignore_errors=True)
            self._tmpdir = None


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _hex_to_ip(hex_addr: str) -> str:
    """Decode a Linux /proc/net/tcp little-endian hex IP:port to dotted-decimal."""
    host_hex, port_hex = hex_addr.split(":")
    ip_int = int(host_hex, 16)
    ip = ".".join(str((ip_int >> (8 * i)) & 0xFF) for i in range(4))
    port = int(port_hex, 16)
    return f"{ip}:{port}"
