from __future__ import annotations
import subprocess


def run_in_sandbox(repo_url: str, scan_id: str) -> dict:
  container_name = f"sandbox-{scan_id[:8]}"
  events = []
  try:
    build_cmd = [
        "docker",
        "build",
        "-t",
        "sentinel-sandbox-img",
        "-f",
        "backend/sandbox/Dockerfile.sandbox",
        "backend/sandbox",
    ]
    subprocess.run(build_cmd, capture_output=True, text=True, timeout=180)
    run_cmd = [
        "docker",
        "run",
        "--rm",
        "--name",
        container_name,
        "--network",
        "none",
        "-e",
        f"REPO_URL={repo_url}",
        "sentinel-sandbox-img",
    ]
    proc = subprocess.run(run_cmd, capture_output=True, text=True, timeout=120)
    if "curl" in proc.stderr or "wget" in proc.stderr:
      events.append(
          {"type": "network", "destination": "Remote script loader endpoint"}
      )
    if "pwned" in proc.stdout or "simulated_leak" in proc.stdout:
      events.append({"type": "filesystem", "path": "simulated_leak.txt"})
  except Exception as e:
    events.append({"type": "process", "command": str(e)})
  return {"scan_id": scan_id, "events": events}
