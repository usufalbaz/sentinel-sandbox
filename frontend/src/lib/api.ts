import type { ScanResult } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function startScan(repoUrl: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });
  if (!res.ok) throw new Error(`startScan failed: ${res.status}`);
  return res.json();
}

export async function getScan(id: string): Promise<ScanResult> {
  const res = await fetch(`${BASE_URL}/scan/${id}`);
  if (!res.ok) throw new Error(`getScan failed: ${res.status}`);
  return res.json();
}

export async function sendChat(
  id: string,
  message: string
): Promise<{ reply: string }> {
  const res = await fetch(`${BASE_URL}/scan/${id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`sendChat failed: ${res.status}`);
  return res.json();
}
