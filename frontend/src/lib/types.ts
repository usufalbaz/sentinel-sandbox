export type VerdictLevel = "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "UNKNOWN";

export type ScanStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

/** A single finding as returned by the backend (static or runtime). */
export interface Finding {
  id?: string;
  type?: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}

export interface Verdict {
  level: VerdictLevel;
  score?: number;
  confidence?: number;
  summary?: string;
  triggered_rules?: string[];
}

export interface ScanResult {
  scan_id: string;
  status: ScanStatus;
  repo_url: string;
  branch?: string;
  started_at?: string;
  finished_at?: string;
  verdict?: Verdict;
  static_findings: Finding[];
  runtime_findings: Finding[];
  narrative?: string;
  summary?: Record<string, unknown>;
  error?: string | null;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AppState {
  currentScan: ScanResult | null;
  isLoading: boolean;
  error: string | null;
  chatMessages: ChatMessage[];
}
