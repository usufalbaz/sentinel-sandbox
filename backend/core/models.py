from pydantic import BaseModel
from enum import Enum
from typing import List, Optional


class ScanStatus(str, Enum):
    QUEUED          = "QUEUED"
    CLONING         = "CLONING"
    SCANNING_STATIC = "SCANNING_STATIC"
    RUNNING_SANDBOX = "RUNNING_SANDBOX"
    COMPLETE        = "COMPLETE"
    ERROR           = "ERROR"


class Severity(str, Enum):
    INFO     = "INFO"
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"


class VerdictLevel(str, Enum):
    SAFE       = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    DANGEROUS  = "DANGEROUS"


class Finding(BaseModel):
    category: str
    severity: Severity
    detail: str
    file: Optional[str] = None
    line: Optional[int] = None
    evidence: Optional[str] = None


class Verdict(BaseModel):
    level: VerdictLevel
    score: int
    triggered_rules: List[str]
    summary: str


class ScanRecord(BaseModel):
    scan_id: str
    repo_url: str
    branch: str = "main"
    status: ScanStatus = ScanStatus.QUEUED
    static_findings: List[Finding] = []
    runtime_findings: List[Finding] = []
    verdict: Optional[Verdict] = None
    narrative: Optional[str] = None
    error: Optional[str] = None
