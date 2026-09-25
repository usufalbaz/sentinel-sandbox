"""
Deterministic verdict engine — NO LLM involved.

Scoring rules (additive, capped at 100):
  FETCH_THEN_EVAL (static)      +55  — near-certain RCE chain
  INLINE_DYNAMIC_EXEC (static)  +30  — eval/Function() inline in npm hook
  DYNAMIC_EXEC (runtime)        +40  — observed at execution time
  DYNAMIC_EXEC (static)         +20  — present in source
  LIFECYCLE_SCRIPT              +12  — auto-run hook exists
  LIFECYCLE_SHELL_OUT           +15  — hook forks process
  REMOTE_FETCH (runtime)        +18  — outbound call during install
  REMOTE_FETCH (static)         + 8  — outbound call in source
  NET_EGRESS_EXTERNAL (runtime) +22  — connected to external host
  OBFUSCATION (static)          +12  — base64/hex obfuscation
  HIDDEN_SCRIPT_REFERENCE       +10  — dotfile referenced from hook
  FS_SENSITIVE_READ (runtime)   +30  — credential path accessed
  PROCESS_SPAWN (runtime)       +15  — unexpected child process
  SENSITIVE_MODULE (static)     + 3  — fs/net/child_process imported

Thresholds:
  score >= 55 → DANGEROUS
  score >= 20 → SUSPICIOUS
  else        → SAFE
"""
from __future__ import annotations

from typing import List

from core.models import Finding, Severity, Verdict, VerdictLevel

# ---------------------------------------------------------------------------
# Rule table: (category, is_runtime, points, human_rule_name)
# ---------------------------------------------------------------------------
_RULES: List[tuple[str, bool | None, int, str]] = [
    # category                  runtime?  pts   label
    ("FETCH_THEN_EVAL",         False,    55,   "RULE_FETCH_THEN_EVAL: source fetches remote payload and eval()s it"),
    ("INLINE_DYNAMIC_EXEC",     False,    30,   "RULE_INLINE_DYNAMIC_EXEC: lifecycle hook contains eval/Function()"),
    ("DYNAMIC_EXEC",            True,     40,   "RULE_RUNTIME_DYNAMIC_EXEC: eval/Function() observed at runtime"),
    ("DYNAMIC_EXEC",            False,    20,   "RULE_STATIC_DYNAMIC_EXEC: eval/Function() found in source"),
    ("LIFECYCLE_SCRIPT",        False,    12,   "RULE_LIFECYCLE_SCRIPT: auto-run npm hook (postinstall/preinstall)"),
    ("LIFECYCLE_SHELL_OUT",     False,    15,   "RULE_LIFECYCLE_SHELL_OUT: lifecycle hook forks a subprocess"),
    ("REMOTE_FETCH",            True,     18,   "RULE_RUNTIME_REMOTE_FETCH: outbound HTTP during npm install"),
    ("REMOTE_FETCH",            False,     8,   "RULE_STATIC_REMOTE_FETCH: outbound HTTP call in source"),
    ("NET_EGRESS_EXTERNAL",     True,     22,   "RULE_NET_EGRESS: connected to external host during install"),
    ("OBFUSCATION",             False,    12,   "RULE_OBFUSCATION: base64/hex obfuscation detected in source"),
    ("HIDDEN_SCRIPT_REFERENCE", False,    10,   "RULE_HIDDEN_SCRIPT: lifecycle hook references dotfile/hidden path"),
    ("FS_SENSITIVE_READ",       True,     30,   "RULE_FS_SENSITIVE_READ: credential file accessed during install"),
    ("PROCESS_SPAWN",           True,     15,   "RULE_PROCESS_SPAWN: unexpected child process spawned during install"),
    ("SENSITIVE_MODULE",        False,     3,   "RULE_SENSITIVE_MODULE: sensitive built-in imported (fs/net/child_process)"),
]

DANGEROUS_THRESHOLD  = 55
SUSPICIOUS_THRESHOLD = 20


class RuleEngine:
    def evaluate(
        self,
        static_findings: List[Finding],
        runtime_findings: List[Finding],
    ) -> Verdict:
        score = 0
        triggered: List[str] = []

        static_cats  = {f.category for f in static_findings}
        runtime_cats = {f.category for f in runtime_findings}

        for category, is_runtime, points, label in _RULES:
            if is_runtime is True:
                hit = category in runtime_cats
            elif is_runtime is False:
                hit = category in static_cats
            else:
                hit = (category in static_cats) or (category in runtime_cats)

            if hit:
                score += points
                triggered.append(label)

        # Any single CRITICAL finding from runtime is automatically DANGEROUS
        if any(f.severity == Severity.CRITICAL for f in runtime_findings):
            score = max(score, DANGEROUS_THRESHOLD)
            if "RULE_CRITICAL_RUNTIME" not in triggered:
                triggered.append("RULE_CRITICAL_RUNTIME: at least one CRITICAL severity runtime finding")

        score = min(score, 100)

        if score >= DANGEROUS_THRESHOLD:
            level   = VerdictLevel.DANGEROUS
            summary = f"Risk score {score}/100 — active RCE attack-chain behaviour detected"
        elif score >= SUSPICIOUS_THRESHOLD:
            level   = VerdictLevel.SUSPICIOUS
            summary = f"Risk score {score}/100 — suspicious patterns present; manual review required"
        else:
            level   = VerdictLevel.SAFE
            summary = f"Risk score {score}/100 — no significant threat indicators found"

        return Verdict(
            level=level,
            score=score,
            triggered_rules=triggered,
            summary=summary,
        )
