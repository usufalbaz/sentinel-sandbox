"""
sandbox/runner.py
Responsible for spinning up and tearing down a disposable Docker container
for each scan job.

TODO:
  - docker pull / build the sandbox image
  - docker run with:
      --network none (or a restricted bridge)
      --read-only host mounts
      --rm (auto-remove on exit)
  - stream stdout/stderr to the activity monitor
  - return captured activity log on completion
"""


def run_in_sandbox(repo_url: str, scan_id: str) -> dict:
    """
    Clone repo_url inside an isolated container and run `npm install`.
    Returns a dict with raw activity (files, network, processes).
    Placeholder — implement with docker-py or subprocess.
    """
    raise NotImplementedError("Sandbox runner not yet implemented")
