"""
agent/rule_engine.py
Deterministic verdict engine — NOT the LLM.

Rules (in priority order):
  1. DANGEROUS  — dynamic_exec finding with remote fetch origin
  2. DANGEROUS  — outbound network call from a lifecycle script
  3. SUSPICIOUS — unexpected file write outside project dir
  4. SUSPICIOUS — process spawn of a shell from postinstall
  5. SAFE       — none of the above triggered

The LLM (Bob) is used only for explanation, never for the verdict decision.
"""
from __future__ import annotations
from typing import Literal

Verdict = Literal["safe", "suspicious", "dangerous"]


def decide(findings: list[dict]) -> Verdict:
    """
    Apply deterministic rules to classified findings and return a verdict.
    Placeholder — implement rule checks against finding categories/severity.
    """
    raise NotImplementedError("Rule engine not yet implemented")
