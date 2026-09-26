export type ScanStatus = "pending" | "running" | "complete" | "error";

export type Verdict = "safe" | "suspicious" | "dangerous" | "unknown";

export interface Finding {
  id: string;
  type: string;
  severity: "info" | "warn" | "critical";
  message: string;
  timestamp: string;
  process?: string;
}

export interface ScanResult {
  id: string;
  repoUrl: string;
  status: ScanStatus;
  verdict: Verdict;
  findings: Finding[];
  summary: string;
  chain: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
