"use client";

import { ShieldCheck, ShieldAlert, ShieldX, Shield, Zap } from "lucide-react";
import clsx from "clsx";
import type { ScanResult, VerdictLevel } from "@/lib/types";

interface VerdictPanelProps {
  scanResult: ScanResult | null;
}

const VERDICT_CONFIG: Record<VerdictLevel, {
  icon: React.ReactNode;
  label: string;
  accent: string;
  glow: string;
  badge: string;
  badgeText: string;
  borderColor: string;
}> = {
  SAFE: {
    icon: <ShieldCheck className="w-7 h-7" />,
    label: "Safe",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    badgeText: "text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  SUSPICIOUS: {
    icon: <ShieldAlert className="w-7 h-7" />,
    label: "Suspicious",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    badgeText: "text-amber-400",
    borderColor: "border-amber-500/20",
  },
  DANGEROUS: {
    icon: <ShieldX className="w-7 h-7" />,
    label: "Dangerous",
    accent: "#ef4444",
    glow: "rgba(239,68,68,0.15)",
    badge: "bg-red-500/15 text-red-400 border border-red-500/30",
    badgeText: "text-red-400",
    borderColor: "border-red-500/20",
  },
  UNKNOWN: {
    icon: <Shield className="w-7 h-7" />,
    label: "Unknown",
    accent: "#64748b",
    glow: "rgba(100,116,139,0.10)",
    badge: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
    badgeText: "text-slate-400",
    borderColor: "border-slate-500/20",
  },
};

export default function VerdictPanel({ scanResult }: VerdictPanelProps) {
  // State 1 — no scan started
  if (scanResult === null) {
    return (
      <div
        className="rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center gap-4 text-center"
        style={{ borderColor: "var(--border-mid)", background: "var(--bg-surface)" }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-raised)" }}>
          <Shield size={32} style={{ color: "var(--text-faint)" }} />
        </div>
        <div>
          <p className="font-semibold text-base" style={{ color: "var(--text-muted)" }}>No scan running</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-faint)" }}>Submit a GitHub URL above to start a scan</p>
        </div>
      </div>
    );
  }

  const { status, verdict } = scanResult;

  // State 2 — loading / running
  if (status === "QUEUED" || status === "RUNNING") {
    return (
      <div className="rounded-2xl p-6 overflow-hidden relative" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        {/* Animated top bar */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sky-500 via-blue-400 to-sky-500 animate-shimmer-bar" />

        <div className="flex items-center justify-between mb-5">
          <div className="h-5 w-32 rounded-lg animate-pulse" style={{ background: "var(--bg-raised)" }} />
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            {status === "QUEUED" ? "Queued" : "Scanning…"}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl animate-pulse" style={{ background: "var(--bg-raised)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-36 rounded-xl animate-pulse" style={{ background: "var(--bg-raised)" }} />
            <div className="h-4 w-24 rounded animate-pulse" style={{ background: "var(--bg-raised)" }} />
          </div>
        </div>

        <div className="space-y-2">
          {[100, 90, 75].map((w) => (
            <div key={w} className="h-3 rounded animate-pulse" style={{ width: `${w}%`, background: "var(--bg-raised)" }} />
          ))}
        </div>
      </div>
    );
  }

  // State 3 — complete or failed
  const isFailed = status === "FAILED";
  const level = verdict?.level ?? "UNKNOWN";
  const cfg = VERDICT_CONFIG[level];

  return (
    <div
      className="rounded-2xl p-6 overflow-hidden relative"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid var(--border)`,
        boxShadow: `0 0 40px ${cfg.glow}`,
      }}
    >
      {/* Color accent top bar */}
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: cfg.accent }} />

      {/* Status pill */}
      <div className="absolute top-4 right-4">
        <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5", isFailed
          ? "bg-red-500/15 text-red-400 border border-red-500/30"
          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
        )}>
          <span className={clsx("w-1.5 h-1.5 rounded-full", isFailed ? "bg-red-400" : "bg-emerald-400 animate-pulse")} />
          {isFailed ? "Failed" : "Complete"}
        </span>
      </div>

      {/* Verdict badge row */}
      <div className="flex items-center gap-4 mb-5 mt-1">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.glow, color: cfg.accent, border: `1px solid ${cfg.accent}30` }}
        >
          {cfg.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{cfg.label}</span>
            {verdict?.score !== undefined && (
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-mono font-medium", cfg.badge)}>
                Score {verdict.score}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
            Security verdict
          </p>
        </div>
      </div>

      {/* Summary */}
      {verdict?.summary && (
        <p className="text-sm leading-relaxed mb-5 p-3 rounded-xl" style={{ background: "var(--bg-raised)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          {verdict.summary}
        </p>
      )}

      {/* Error message */}
      {isFailed && scanResult.error && (
        <p className="text-sm text-red-400 p-3 rounded-xl bg-red-500/10 border border-red-500/20">{scanResult.error}</p>
      )}

      {/* Triggered rules */}
      {verdict?.triggered_rules && verdict.triggered_rules.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} style={{ color: "var(--text-faint)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
              Triggered Rules
            </p>
          </div>
          <ul className="space-y-1.5">
            {verdict.triggered_rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm p-2.5 rounded-lg" style={{ background: "var(--bg-raised)", color: "var(--text-muted)" }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.accent }} />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
