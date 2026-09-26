import type { ScanResult } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_PREFIX = "/api";

export interface ScanStartResponse {
  scan_id: string;
  status: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
  scan_id: string;
}

/**
 * Start a new scan for a GitHub repository.
 * Returns immediately with a scan_id while the scan runs in the background.
 */
export async function startScan(
  repoUrl: string,
  branch = "main"
): Promise<ScanStartResponse> {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/scans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, branch }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    const detail = error?.detail;
    const message =
      typeof detail === "object" ? detail?.message : detail;
    throw new Error(`Failed to start scan: ${message ?? res.status}`);
  }

  return res.json();
}

/**
 * Poll scan status and results by scan ID.
 * Returns the full ScanResult which maps directly to the backend ScanStatusResponse.
 */
export async function getScan(scanId: string): Promise<ScanResult> {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/scans/${scanId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("Scan not found");
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    const detail = error?.detail;
    const message =
      typeof detail === "object" ? detail?.message : detail;
    throw new Error(`Failed to get scan: ${message ?? res.status}`);
  }

  return res.json();
}

/**
 * Send a follow-up chat message grounded in a completed scan's findings.
 */
export async function sendChat(
  scanId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}${API_PREFIX}/scans/${scanId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("Scan not found");
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    const detail = error?.detail;
    const message =
      typeof detail === "object" ? detail?.message : detail;
    throw new Error(`Failed to send chat: ${message ?? res.status}`);
  }

  return res.json();
}
