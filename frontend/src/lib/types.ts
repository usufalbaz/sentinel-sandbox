// Shared TypeScript types mirroring backend Pydantic models

export type ScanStatus =
  | "QUEUED"
  | "CLONING"
  | "SCANNING_STATIC"
  | "RUNNING_SANDBOX"
  | "COMPLETE"
  | "ERROR";

export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type VerdictLevel = "SAFE" | "SUSPICIOUS" | "DANGEROUS";

export interface Finding {
  category: string;
  severity: Severity;
  detail: string;
  file?: string;
  line?: number;
  evidence?: string;
}

export interface Verdict {
  level: VerdictLevel;
  score: number;
  triggered_rules: string[];
  summary: string;
}

export interface ScanRecord {
  scan_id: string;
  repo_url: string;
  branch: string;
  status: ScanStatus;
  static_findings: Finding[];
  runtime_findings: Finding[];
  verdict?: Verdict;
  narrative?: string;
  error?: string;
}
