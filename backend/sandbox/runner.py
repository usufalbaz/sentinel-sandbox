"""
Sandbox runner — clones repo, executes npm install in an isolated Docker
container, runs parallel monitors (fs / network / process), returns findings.
TODO: implement.
"""
from typing import List
from core.models import Finding


class SandboxRunner:
    def __init__(self, scan_id: str, repo_url: str, branch: str = "main"):
        self.scan_id  = scan_id
        self.repo_url = repo_url
        self.branch   = branch

    async def clone(self) -> str:
        # TODO: git clone into temp dir, return path
        raise NotImplementedError

    async def execute_and_monitor(self) -> List[Finding]:
        # TODO: spin up Docker container + parallel monitors
        raise NotImplementedError

    async def cleanup(self):
        # TODO: remove container + temp dir
        pass
