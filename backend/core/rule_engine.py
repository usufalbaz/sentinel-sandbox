"""
Deterministic verdict engine.
Produces Safe / Suspicious / Dangerous from fixed rule weights.
TODO: implement rule evaluation logic.
"""
from typing import List
from core.models import Finding, Verdict, VerdictLevel


class RuleEngine:
    def evaluate(
        self,
        static_findings: List[Finding],
        runtime_findings: List[Finding],
    ) -> Verdict:
        # TODO: implement
        return Verdict(
            level=VerdictLevel.SAFE,
            score=0,
            triggered_rules=[],
            summary="Rule engine not yet implemented.",
        )
