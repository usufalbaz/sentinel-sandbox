"""
Static pre-execution scanner.

Walks the cloned repository WITHOUT executing any code. Inspects:
  - package.json lifecycle scripts (postinstall, preinstall, install, prepare)
  - JavaScript/TypeScript source files for dynamic-exec and remote-fetch patterns
  - Obfuscation markers (base64 blobs, hex strings, atob)
  - The specific fetch-then-eval chain that characterises the fake-recruiter RCE
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import List

from core.models import Finding, Severity

# ---------------------------------------------------------------------------
# Dangerous npm lifecycle hooks — run automatically on `npm install`
# ---------------------------------------------------------------------------
LIFECYCLE_HOOKS = {"preinstall", "install", "postinstall", "prepare", "prepack"}

# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------

# Dynamic code execution
_DYNAMIC_EXEC = re.compile(
    r"\b(?:eval\s*\(|new\s+Function\s*\(|Function\s*\(\s*['\"]return|"
    r"vm\.runIn(?:ThisContext|NewContext|Context)\s*\()",
    re.MULTILINE,
)

# Remote network calls
_REMOTE_FETCH = re.compile(
    r"\b(?:fetch\s*\(|axios(?:\s*\.\s*(?:get|post|request))?\s*\(|"
    r"https?\.(?:get|request)\s*\(|require\s*\(\s*['\"]https?['\"]|"
    r"node-fetch|got\s*\(|superagent)",
    re.MULTILINE,
)

# Obfuscation markers
_OBFUSCATION = re.compile(
    r"(?:atob\s*\(|"
    r"Buffer\.from\s*\([^)]*,\s*['\"]base64['\"]|"
    r"(?:\\x[0-9a-fA-F]{2}){8,}|"            # long hex escape runs
    r"[A-Za-z0-9+/]{100,}={0,2})",            # suspiciously long base64
    re.MULTILINE,
)

# Sensitive built-in modules
_SENSITIVE_REQUIRE = re.compile(
    r"require\s*\(\s*['\"]"
    r"(?:child_process|fs|net|dgram|os|cluster)['\"]",
    re.MULTILINE,
)

# Hidden/dotfile reference in a string literal
_HIDDEN_FILE = re.compile(r"""['"/]\.[\w./]+['"]""")


class StaticScanner:
    def __init__(self, repo_path: str) -> None:
        self.root = Path(repo_path)

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    def run(self) -> List[Finding]:
        findings: List[Finding] = []
        findings.extend(self._scan_package_jsons())
        findings.extend(self._scan_js_files())
        return findings

    # ------------------------------------------------------------------
    # package.json analysis
    # ------------------------------------------------------------------

    def _scan_package_jsons(self) -> List[Finding]:
        findings: List[Finding] = []
        for pkg_path in self.root.rglob("package.json"):
            if "node_modules" in pkg_path.parts:
                continue
            try:
                data = json.loads(pkg_path.read_text(encoding="utf-8", errors="replace"))
            except json.JSONDecodeError:
                findings.append(Finding(
                    category="MALFORMED_PACKAGE_JSON",
                    severity=Severity.MEDIUM,
                    detail="package.json failed to parse as JSON",
                    file=str(pkg_path.relative_to(self.root)),
                ))
                continue

            scripts: dict = data.get("scripts", {})
            for hook, command in scripts.items():
                if hook.lower() not in LIFECYCLE_HOOKS:
                    continue

                sev = Severity.HIGH if hook.lower() == "postinstall" else Severity.MEDIUM
                findings.append(Finding(
                    category="LIFECYCLE_SCRIPT",
                    severity=sev,
                    detail=f"npm lifecycle hook '{hook}' will auto-run: {command!r}",
                    file=str(pkg_path.relative_to(self.root)),
                    evidence=command,
                ))

                # Inline shell-out patterns inside the npm script string
                if re.search(r"\b(?:node\s+-e|sh\s+-c|bash\s+-c|exec|spawn|fork)\b", command):
                    findings.append(Finding(
                        category="LIFECYCLE_SHELL_OUT",
                        severity=Severity.HIGH,
                        detail=f"Lifecycle hook '{hook}' shells out or forks a process",
                        file=str(pkg_path.relative_to(self.root)),
                        evidence=command,
                    ))

                # Reference to a hidden/dotfile
                if _HIDDEN_FILE.search(command):
                    findings.append(Finding(
                        category="HIDDEN_SCRIPT_REFERENCE",
                        severity=Severity.HIGH,
                        detail=f"Lifecycle hook '{hook}' references a hidden file or dotfile path",
                        file=str(pkg_path.relative_to(self.root)),
                        evidence=command,
                    ))

                # Inline dynamic exec in the npm script string itself
                if _DYNAMIC_EXEC.search(command):
                    findings.append(Finding(
                        category="INLINE_DYNAMIC_EXEC",
                        severity=Severity.CRITICAL,
                        detail=f"Lifecycle hook '{hook}' contains inline eval/Function()",
                        file=str(pkg_path.relative_to(self.root)),
                        evidence=command,
                    ))

        return findings

    # ------------------------------------------------------------------
    # JavaScript / TypeScript source file analysis
    # ------------------------------------------------------------------

    def _scan_js_files(self) -> List[Finding]:
        findings: List[Finding] = []
        globs = ["*.js", "*.mjs", "*.cjs", "*.ts", "*.tsx"]
        for pattern in globs:
            for path in self.root.rglob(pattern):
                if "node_modules" in path.parts:
                    continue
                findings.extend(self._analyse_source_file(path))
        return findings

    def _analyse_source_file(self, path: Path) -> List[Finding]:
        findings: List[Finding] = []
        rel = str(path.relative_to(self.root))
        try:
            src = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            return findings

        lines = src.splitlines()

        def line_of(m: re.Match) -> int:
            return src[: m.start()].count("\n") + 1

        def ctx(m: re.Match) -> str:
            ln = line_of(m)
            return lines[ln - 1].strip() if lines else ""

        has_fetch = bool(_REMOTE_FETCH.search(src))
        has_exec  = bool(_DYNAMIC_EXEC.search(src))

        # The canonical fake-recruiter RCE pattern: fetch remote JS then eval it
        if has_fetch and has_exec:
            findings.append(Finding(
                category="FETCH_THEN_EVAL",
                severity=Severity.CRITICAL,
                detail=(
                    "File fetches from a remote URL AND uses eval()/new Function() — "
                    "classic remote-payload RCE chain"
                ),
                file=rel,
            ))

        for m in _DYNAMIC_EXEC.finditer(src):
            findings.append(Finding(
                category="DYNAMIC_EXEC",
                severity=Severity.HIGH,
                detail=f"Dynamic code execution: {m.group(0).strip()!r}",
                file=rel,
                line=line_of(m),
                evidence=ctx(m),
            ))

        for m in _REMOTE_FETCH.finditer(src):
            findings.append(Finding(
                category="REMOTE_FETCH",
                severity=Severity.MEDIUM,
                detail=f"Remote network call: {m.group(0).strip()!r}",
                file=rel,
                line=line_of(m),
                evidence=ctx(m),
            ))

        for m in _OBFUSCATION.finditer(src):
            snippet = m.group(0)[:60]
            findings.append(Finding(
                category="OBFUSCATION",
                severity=Severity.HIGH,
                detail=f"Obfuscated payload detected: {snippet!r}…",
                file=rel,
                line=line_of(m),
                evidence=ctx(m),
            ))

        for m in _SENSITIVE_REQUIRE.finditer(src):
            findings.append(Finding(
                category="SENSITIVE_MODULE",
                severity=Severity.LOW,
                detail=f"Sensitive built-in module imported: {m.group(0).strip()!r}",
                file=rel,
                line=line_of(m),
                evidence=ctx(m),
            ))

        return findings
