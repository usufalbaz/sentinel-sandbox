"""
Static pre-execution scanner.
Walks the cloned repo without running any code.
TODO: implement AST walk, lifecycle script extraction, dynamic-exec detection.
"""
from typing import List
from core.models import Finding


class StaticScanner:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path

    def run(self) -> List[Finding]:
        # TODO: implement
        return []
