"""
sandbox/monitor.py
Hooks into the running container to capture:
  - filesystem events (inotify / fanotify)
  - outbound network calls (strace / tcpdump)
  - process spawns (ptrace / /proc)
  - dynamic code execution (eval, Function(), vm.runInNewContext)

TODO: implement each capture strategy and emit structured Finding objects.
"""


def monitor(container_id: str) -> list[dict]:
    """
    Attach to a running container and collect activity events.
    Returns a list of raw event dicts for the rule engine to classify.
    Placeholder — implement with docker stats / exec hooks.
    """
    raise NotImplementedError("Monitor not yet implemented")
