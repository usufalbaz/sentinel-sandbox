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
        self.assertEqual(findings[0]["rule_name"], "SQL Injection Risk")
        self.assertEqual(findings[0]["cwe"], "CWE-89")
        self.assertEqual(findings[0]["severity"], "CRITICAL")
        self.assertEqual(findings[0]["line"], 1)

    def test_formatted_sql_query_detection(self):
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

    def test_weak_hash_detection(self):
        code = "hashed = hashlib.md5(password.encode()).hexdigest()"

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

    def test_hardcoded_credential_detection(self):
        code = 'API_KEY = "abc12345_secret"'

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

    def test_command_injection_detection(self):
        code = "os.system(user_command)"

        findings = self.engine.scan_code_lines(
            code,
            "command_execution.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Unsanitized System Command Execution"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-78")
        self.assertEqual(findings[0]["severity"], "CRITICAL")

    def test_file_path_traversal_detection(self):
        code = "path = os.path.join(base_dir, request.path)"

        findings = self.engine.scan_code_lines(
            code,
            "file_path.py"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Arbitrary File Path Traversal"
        )
        self.assertEqual(findings[0]["cwe"], "CWE-22")
        self.assertEqual(findings[0]["severity"], "HIGH")

    def test_postinstall_hook_detection(self):
        manifest = """
        {
            "name": "test-package",
            "scripts": {
                "postinstall": "node setup.js"
            }
        }
        """

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
        self.assertEqual(findings[0]["command"], "node setup.js")

    def test_preinstall_hook_detection(self):
        manifest = """
        {
            "name": "test-package",
            "scripts": {
                "preinstall": "python setup.py"
            }
        }
        """

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Suspicious Lifecycle Hook: preinstall"
        )

    def test_prepare_hook_detection(self):
        manifest = """
        {
            "name": "test-package",
            "scripts": {
                "prepare": "node prepare.js"
            }
        }
        """

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(len(findings), 1)
        self.assertEqual(
            findings[0]["rule_name"],
            "Suspicious Lifecycle Hook: prepare"
        )

    def test_safe_code_produces_no_findings(self):
        code = """
        username = input("Username: ")
        print(f"Hello, {username}")
        total = price * quantity
        """

        findings = self.engine.scan_code_lines(
            code,
            "safe_code.py"
        )

        self.assertEqual(findings, [])

    def test_normal_package_has_no_lifecycle_findings(self):
        manifest = """
        {
            "name": "safe-package",
            "version": "1.0.0",
            "scripts": {
                "test": "pytest"
            }
        }
        """

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(findings, [])

    def test_sha256_is_not_flagged_as_weak_hash(self):
        code = "hashed = hashlib.sha256(password.encode()).hexdigest()"

        findings = self.engine.scan_code_lines(
            code,
            "secure_hash.py"
        )

        self.assertEqual(findings, [])

    def test_safe_subprocess_without_popen_is_not_flagged(self):
        code = "result = subprocess.run(['python', 'script.py'], check=True)"

        findings = self.engine.scan_code_lines(
            code,
            "safe_process.py"
        )

        self.assertEqual(findings, [])

    def test_package_with_non_lifecycle_scripts_is_safe(self):
        manifest = """
        {
            "name": "safe-package",
            "version": "1.0.0",
            "scripts": {
                "test": "pytest",
                "build": "npm run compile",
                "lint": "eslint ."
            }
        }
        """

        findings = self.engine.inspect_package_json(
            manifest,
            "package.json"
        )

        self.assertEqual(findings, [])
if __name__ == "__main__":
    unittest.main()