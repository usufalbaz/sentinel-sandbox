import type { ScanRecord } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function startScan(
  repoUrl: string,
  branch = "main"
): Promise<{ scan_id: string }> {
  const res = await fetch(`${API}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl, branch }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getScan(scanId: string): Promise<ScanRecord> {
  const res = await fetch(`${API}/api/scan/${scanId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getNarrative(
  scanId: string
): Promise<{ narrative: string }> {
  const res = await fetch(`${API}/api/explain/${scanId}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function askFollowUp(
  scanId: string,
  question: string
): Promise<{ answer: string }> {
  const res = await fetch(`${API}/api/explain/${scanId}/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
