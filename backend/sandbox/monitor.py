"""
sandbox/monitor.py
Hooks into the running container to capture filesystem events,
outbound network calls, process spawns, and dynamic code execution.
"""


def monitor(container_id: str) -> list[dict]:
    """
    Attach to a running container and collect activity events.
    Returns a list of raw event dicts for the rule engine to classify.
    """
    raise NotImplementedError("Monitor not yet implemented")
