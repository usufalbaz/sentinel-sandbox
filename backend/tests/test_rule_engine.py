import json
import unittest

from backend.agent.rule_engine import SecurityRuleEngine


class TestSecurityRuleEngine(unittest.TestCase):

    def setUp(self):
        self.engine = SecurityRuleEngine()

    def test_sql_injection_detection(self):
        code = 'query = "SELECT * FROM users WHERE id = \'" + user_id'

        findings = self.engine.scan_code_lines(
            code,
            "sql_injection.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "SQL Injection Risk"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-89")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_formatted_sql_detection(self):
        code = 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")'

        findings = self.engine.scan_code_lines(
            code,
            "formatted_sql.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Formatted SQL Query Concatenation"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-89")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_md5_detection(self):
        code = "digest = hashlib.md5(password.encode()).hexdigest()"

        findings = self.engine.scan_code_lines(
            code,
            "weak_hash.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Weak Cryptographic Hash Function"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-328")
        self.assertEqual(findings[0]["severity"], "HIGH")

    def test_sha1_detection(self):
        code = "digest = hashlib.sha1(data).hexdigest()"

        findings = self.engine.scan_code_lines(
            code,
            "weak_hash_sha1.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Weak Cryptographic Hash Function"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-328")
        self.assertEqual(findings[0]["severity"], "HIGH")

    def test_hardcoded_api_key_detection(self):
        code = 'API_KEY = "abc12345secret"'

        findings = self.engine.scan_code_lines(
            code,
            "credentials.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Hardcoded Plaintext Credential"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-798")
        self.assertEqual(findings[0]["severity"], "HIGH")

    def test_hardcoded_password_detection(self):
        code = 'PASSWORD = "SuperSecret123"'

        findings = self.engine.scan_code_lines(
            code,
            "password.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Hardcoded Plaintext Credential"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-798")
        self.assertEqual(findings[0]["severity"], "HIGH")

    def test_os_system_detection(self):
        code = "os.system(user_command)"

        findings = self.engine.scan_code_lines(
            code,
            "command.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Unsanitized System Command Execution"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-78")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_subprocess_detection(self):
        code = "subprocess.Popen(user_command, shell=True)"

        findings = self.engine.scan_code_lines(
            code,
            "subprocess.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Unsanitized System Command Execution"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-78")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_path_traversal_detection(self):
        code = "path = os.path.join(base_dir, request.path)"

        findings = self.engine.scan_code_lines(
            code,
            "path_traversal.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Arbitrary File Path Traversal"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-22")
        self.assertEqual(findings[0]["severity"], "HIGH")

    def test_javascript_eval_detection(self):
        code = "const result = eval(userInput);"

        findings = self.engine.scan_code_lines(
            code,
            "dynamic_execution.js"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Dynamic Code Execution"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-95")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_javascript_command_execution_detection(self):
        code = "child_process.exec(userCommand);"

        findings = self.engine.scan_code_lines(
            code,
            "command_execution.js"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Unsanitized System Command Execution"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-78")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_javascript_exec_sync_detection(self):
        code = "child_process.execSync(userCommand);"

        findings = self.engine.scan_code_lines(
            code,
            "command_execution_sync.js"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Unsanitized System Command Execution"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-78")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_postinstall_detection(self):
        manifest = json.dumps(
            {
                "name": "test-package",
                "scripts": {
                    "postinstall": "node scripts/install.js"
                }
            }
        )

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Suspicious Lifecycle Hook: postinstall"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-829")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_prepare_hook_detection(self):
        manifest = json.dumps(
            {
                "name": "test-package",
                "scripts": {
                    "prepare": "node prepare.js"
                }
            }
        )

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Suspicious Lifecycle Hook: prepare"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-829")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_multiple_findings(self):
        code = """
API_KEY = "abc12345secret"
os.system(user_command)
hashlib.md5(data)
"""

        findings = self.engine.scan_code_lines(
            code,
            "multiple_vulnerabilities.py"
        )

        self.assertEqual(len(findings), 3)

        rule_names = {
            finding["rule_name"]
            for finding in findings
        }

        self.assertIn("Hardcoded Plaintext Credential", rule_names)
        self.assertIn(
            "Unsanitized System Command Execution",
            rule_names
        )
        self.assertIn(
            "Weak Cryptographic Hash Function",
            rule_names
        )

    def test_safe_code_no_findings(self):
        code = """
def add_numbers(a, b):
    return a + b

result = add_numbers(10, 20)
"""

        findings = self.engine.scan_code_lines(
            code,
            "safe_code.py"
        )

        self.assertEqual(findings, [])

    def test_empty_package_manifest(self):
        manifest = json.dumps(
            {
                "name": "safe-package",
                "version": "1.0.0"
            }
        )

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(findings, [])


if __name__ == "__main__":
    unittest.main()