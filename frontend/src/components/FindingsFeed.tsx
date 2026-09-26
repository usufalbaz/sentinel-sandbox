"use client";

import { useRef, useEffect } from "react";
import { Info, AlertTriangle, AlertOctagon, Activity, ShieldOff } from "lucide-react";
import clsx from "clsx";
import type { Finding, ScanStatus } from "@/lib/types";

interface FindingsFeedProps {
  findings: Finding[];
  status: ScanStatus;
}

const SEVERITY_CONFIG: Record<Finding["severity"], {
  icon: React.ReactNode;
  bar: string;
  badge: string;
  badgeText: string;
}> = {
  CRITICAL: {
    icon: <AlertOctagon size={13} />,
    bar: "bg-red-500",
    badge: "bg-red-500/15 border-red-500/30",
    badgeText: "text-red-400",
  },
  HIGH: {
    icon: <AlertTriangle size={13} />,
    bar: "bg-orange-500",
    badge: "bg-orange-500/15 border-orange-500/30",
    badgeText: "text-orange-400",
  },
  MEDIUM: {
    icon: <AlertTriangle size={13} />,
    bar: "bg-amber-400",
    badge: "bg-amber-500/15 border-amber-500/30",
    badgeText: "text-amber-400",
  },
  LOW: {
    icon: <Info size={13} />,
    bar: "bg-blue-400",
    badge: "bg-blue-500/15 border-blue-500/30",
    badgeText: "text-blue-400",
  },
  INFO: {
    icon: <Info size={13} />,
    bar: "bg-sky-500",
    badge: "bg-sky-500/15 border-sky-500/30",
    badgeText: "text-sky-400",
  },
};

function FindingRow({ finding }: { finding: Finding }) {
  const cfg = SEVERITY_CONFIG[finding.severity] ?? SEVERITY_CONFIG.INFO;
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 relative group transition-colors"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Left severity bar */}
      <div className={clsx("absolute left-0 top-0 bottom-0 w-0.5", cfg.bar)} />

      {/* Severity badge */}
      <span
        className={clsx("mt-0.5 flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border font-mono", cfg.badge, cfg.badgeText)}
      >
        {cfg.icon}
        {finding.severity}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {finding.type && (
          <span
            className="text-[11px] font-mono px-1.5 py-0.5 rounded mb-1 inline-block"
            style={{ background: "var(--bg-raised)", color: "var(--text-faint)", border: "1px solid var(--border)" }}
          >
            {finding.type}
          </span>
        )}
        <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
          {finding.description}
        </p>
      </div>

      {finding.timestamp && (
        <span className="text-[11px] whitespace-nowrap flex-shrink-0 mt-1" style={{ color: "var(--text-faint)" }}>
          {new Date(finding.timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default function FindingsFeed({ findings, status }: FindingsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [findings]);

  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Live Findings
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: "var(--bg-raised)", color: "var(--text-faint)", border: "1px solid var(--border)" }}
          >
            {findings.length}
          </span>
          {criticalCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
              {highCount} high
            </span>
          )}
        </div>

        {status === "RUNNING" && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Scroll container */}
      <div ref={scrollRef} className="max-h-72 overflow-y-auto">
        {findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10" style={{ color: "var(--text-faint)" }}>
            {status === "RUNNING" || status === "QUEUED" ? (
              <>
                <Activity size={20} className="animate-pulse" style={{ color: "var(--accent)" }} />
                <span className="text-sm">Waiting for findings…</span>
              </>
            ) : (
              <>
                <ShieldOff size={20} />
                <span className="text-sm">No findings recorded</span>
              </>
            )}
          </div>
        ) : (
          findings.map((finding, i) => <FindingRow key={finding.id ?? i} finding={finding} />)
        )}
      </div>
    </div>
  );
}
