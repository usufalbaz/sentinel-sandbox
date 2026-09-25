"""
sandbox/runner.py
Responsible for spinning up and tearing down a disposable Docker container
for each scan job.
"""


def run_in_sandbox(repo_url: str, scan_id: str) -> dict:
    """
    Clone repo_url inside an isolated container and run `npm install`.
    Returns a dict with raw activity (files, network, processes).
    """
    raise NotImplementedError("Sandbox runner not yet implemented")
