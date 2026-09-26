"use client";

import { Trash2 } from "lucide-react";
import type { ScanResult } from "@/lib/types";

interface ScanHistoryProps {
  history: ScanResult[];
  activeScanId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function relativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString();
}

const VERDICT_PILL: Record<string, { bg: string; color: string; dot: string }> = {
  SAFE:       { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", dot: "#22c55e" },
  SUSPICIOUS: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", dot: "#f59e0b" },
  DANGEROUS:  { bg: "rgba(239,68,68,0.12)",  color: "#f87171", dot: "#ef4444" },
  UNKNOWN:    { bg: "var(--bg-raised)",       color: "var(--text-faint)", dot: "var(--text-faint)" },
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "#4ade80",
  RUNNING:   "#38bdf8",
  QUEUED:    "#94a3b8",
  FAILED:    "#f87171",
};

function ownerRepo(repoUrl: string): string {
  const parts = repoUrl.replace(/\/$/, "").split("/");
  return parts.slice(-2).join("/");
}

export default function ScanHistory({ history, activeScanId, onSelect, onDelete }: ScanHistoryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
          Scan History
        </p>
        {history.length > 0 && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full font-mono"
            style={{ background: "var(--bg-raised)", color: "var(--text-faint)", border: "1px solid var(--border)" }}
          >
            {history.length}
          </span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8" style={{ color: "var(--text-faint)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-raised)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xs text-center">No scans yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {[...history].reverse().map((scan) => {
            const isActive = scan.scan_id === activeScanId;
            const verdictLevel = scan.verdict?.level ?? "UNKNOWN";
            const pill = VERDICT_PILL[verdictLevel] ?? VERDICT_PILL.UNKNOWN;
            const statusColor = STATUS_COLOR[scan.status] ?? "#94a3b8";
            return (
              <div
                key={scan.scan_id}
                className="group relative rounded-xl transition-all duration-150"
                style={{
                  background: isActive ? "var(--accent-dim)" : "var(--bg-raised)",
                  border: `1px solid ${isActive ? "rgba(14,165,233,0.4)" : "var(--border)"}`,
                }}
              >
                <button
                  onClick={() => onSelect(scan.scan_id)}
                  className="w-full text-left p-3 pr-10"
                >
                  {/* Repo name */}
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {ownerRepo(scan.repo_url)}
                  </p>

                  <div className="flex items-center justify-between mt-1.5 gap-2">
                    {/* Verdict pill */}
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                      style={{ background: pill.bg, color: pill.color }}
                    >
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: pill.dot }} />
                      {verdictLevel}
                    </span>

                    <div className="flex items-center gap-2 min-w-0">
                      {/* Status dot */}
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                      {/* Time */}
                      <span className="text-[11px] truncate" style={{ color: "var(--text-faint)" }}>
                        {scan.started_at ? relativeTime(scan.started_at) : "—"}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Delete button — appears on group hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(scan.scan_id); }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-red-500/20"
                  title="Remove from history"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
