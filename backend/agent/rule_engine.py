import json
import re


class SecurityRuleEngine:

    def __init__(self):
        self.patterns = [
            (
                r"SELECT\s+.*\s+FROM\s+.*['\"].*\+",
                "SQL Injection Risk",
                "CWE-89",
                "CRITICAL",
            ),
            (
                r"execute\s*\(\s*f['\"].*\{",
                "Formatted SQL Query Concatenation",
                "CWE-89",
                "CRITICAL",
            ),
            (
                r"hashlib\.(md5|sha1)\s*\(",
                "Weak Cryptographic Hash Function",
                "CWE-328",
                "HIGH",
            ),
            (
                r"(API_KEY|SECRET_KEY|JWT_SECRET|PASSWORD)\s*=\s*['\"][A-Za-z0-9_\-]{8,}['\"]",
                "Hardcoded Plaintext Credential",
                "CWE-798",
                "HIGH",
            ),
            (
                r"os\.system\s*\(|subprocess\.Popen\s*\(",
                "Unsanitized System Command Execution",
                "CWE-78",
                "CRITICAL",
            ),
            (
                r"\beval\s*\(",
                "Dynamic Code Execution",
                "CWE-95",
                "CRITICAL",
            ),
            (
                r"child_process\.(exec|execSync)\s*\(",
                "Unsanitized System Command Execution",
                "CWE-78",
                "CRITICAL",
            ),
            (
                r"os\.path\.join\s*\(.*,\s*request\.",
                "Arbitrary File Path Traversal",
                "CWE-22",
                "HIGH",
            ),
        ]

    def scan_code_lines(self, file_content, file_path):
        findings = []
        lines = file_content.splitlines()

        for idx, line in enumerate(lines):
            for pattern, name, cwe, severity in self.patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    findings.append(
                        {
                            "file": file_path,
                            "line": idx + 1,
                            "rule_name": name,
                            "cwe": cwe,
                            "severity": severity,
                            "matched_line": line.strip(),
                        }
                    )
                    break

        return findings

    def inspect_package_json(self, manifest_text, file_path):
        findings = []

        try:
            data = json.loads(manifest_text)
            scripts = data.get("scripts", {})
            risky_hooks = ["preinstall", "postinstall", "prepare"]

            for hook in risky_hooks:
                if hook in scripts:
                    cmd = str(scripts[hook])

                    findings.append(
                        {
                            "file": file_path,
                            "line": 1,
                            "rule_name": f"Suspicious Lifecycle Hook: {hook}",
                            "cwe": "CWE-829",
                            "severity": "CRITICAL",
                            "command": cmd,
                        }
                    )

        except Exception:
            pass

        return findings