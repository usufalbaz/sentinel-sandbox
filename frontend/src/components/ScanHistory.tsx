"use client";

import type { ScanResult } from "@/lib/types";

interface ScanHistoryProps {
  history: ScanResult[];
  activeScanId: string | null;
  onSelect: (id: string) => void;
}

function relativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString();
}

const VERDICT_PILL: Record<string, { bg: string; color: string }> = {
  safe:       { bg: "#14532d25", color: "#4ade80" },
  suspicious: { bg: "#78350f25", color: "#fbbf24" },
  dangerous:  { bg: "#7f1d1d25", color: "#f87171" },
  unknown:    { bg: "var(--bg-raised)", color: "var(--text-faint)" },
};

function ownerRepo(repoUrl: string): string {
  const parts = repoUrl.replace(/\/$/, "").split("/");
  return parts.slice(-2).join("/");
}

export default function ScanHistory({ history, activeScanId, onSelect }: ScanHistoryProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-faint)" }}>
        Scan History
      </p>

      {history.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: "var(--text-faint)" }}>No scans yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {[...history].reverse().map((scan) => {
            const isActive = scan.id === activeScanId;
            const pill = VERDICT_PILL[scan.verdict] ?? VERDICT_PILL.unknown;
            return (
              <button
                key={scan.id}
                onClick={() => onSelect(scan.id)}
                className="w-full text-left rounded-xl p-3 transition-colors"
                style={{
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${isActive ? "var(--accent)" : "transparent"}`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-raised)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {ownerRepo(scan.repoUrl)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: pill.bg, color: pill.color }}
                  >
                    {scan.verdict}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                    {relativeTime(scan.createdAt)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
