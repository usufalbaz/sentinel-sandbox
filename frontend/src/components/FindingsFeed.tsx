"use client";

import { useRef, useEffect } from "react";
import { Info, AlertTriangle, AlertOctagon, Activity } from "lucide-react";
import clsx from "clsx";
import type { Finding, ScanStatus } from "@/lib/types";

interface FindingsFeedProps {
  findings: Finding[];
  status: ScanStatus;
}

function SeverityIcon({ severity }: { severity: Finding["severity"] }) {
  const cls = "flex-shrink-0 mt-0.5";
  if (severity === "critical") return <AlertOctagon size={16} className={clsx(cls, "text-red-400")} />;
  if (severity === "warn")     return <AlertTriangle size={16} className={clsx(cls, "text-amber-400")} />;
  return <Info size={16} className={clsx(cls, "text-sky-400")} />;
}

const severityLeft: Record<Finding["severity"], string> = {
  info:     "border-l-sky-500",
  warn:     "border-l-amber-400",
  critical: "border-l-red-500",
};

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <div
      className={clsx("flex items-start gap-3 px-4 py-3 border-l-4", severityLeft[finding.severity])}
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <SeverityIcon severity={finding.severity} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded font-mono"
            style={{ background: "var(--bg-raised)", color: "var(--text-muted)" }}
          >
            {finding.type}
          </span>
          {finding.process && (
            <span className="text-xs font-mono truncate" style={{ color: "var(--text-faint)" }}>
              {finding.process}
            </span>
          )}
        </div>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>{finding.message}</p>
      </div>
      <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: "var(--text-faint)" }}>
        {new Date(finding.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

export default function FindingsFeed({ findings, status }: FindingsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [findings]);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Live Findings</span>
          <span style={{ color: "var(--text-faint)" }}>({findings.length})</span>
        </div>
        {status === "running" && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-sm">Live</span>
          </div>
        )}
      </div>

      {/* Scroll container */}
      <div ref={scrollRef} className="max-h-80 overflow-y-auto">
        {findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10" style={{ color: "var(--text-faint)" }}>
            {status === "running" || status === "pending" ? (
              <>
                <Activity size={20} className="animate-pulse" />
                <span className="text-sm">Waiting for findings…</span>
              </>
            ) : (
              <>
                <Info size={20} />
                <span className="text-sm">No findings recorded</span>
              </>
            )}
          </div>
        ) : (
          findings.map((finding) => <FindingRow key={finding.id} finding={finding} />)
        )}
      </div>
    </div>
  );
}
