"use client";

import { ShieldCheck, ShieldAlert, ShieldX, Shield, Loader2 } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import type { ScanResult, Verdict } from "@/lib/types";

interface VerdictPanelProps {
  scanResult: ScanResult | null;
}

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  const cls = "w-8 h-8";
  if (verdict === "safe") return <ShieldCheck className={cls} />;
  if (verdict === "suspicious") return <ShieldAlert className={cls} />;
  return <ShieldX className={cls} />;
}

function verdictColors(verdict: Verdict) {
  return clsx("inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-2xl font-bold", {
    "bg-green-100 text-green-800 border-green-200": verdict === "safe",
    "bg-amber-100 text-amber-800 border-amber-200": verdict === "suspicious",
    "bg-red-100 text-red-800 border-red-200": verdict === "dangerous",
    "bg-slate-100 text-slate-800 border-slate-200": verdict === "unknown",
  });
}

export default function VerdictPanel({ scanResult }: VerdictPanelProps) {
  // State 1 — no scan started
  if (scanResult === null) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center gap-3 text-center">
        <Shield className="text-slate-300" size={48} />
        <p className="text-slate-500 font-medium">No scan running</p>
        <p className="text-slate-400 text-sm">Submit a repository URL to start a scan</p>
      </div>
    );
  }

  const { status, verdict, summary, chain } = scanResult;

  // State 2 — loading / running
  if (status === "pending" || status === "running") {
    return (
      <div className="relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        {/* Status pill */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Running…
        </div>

        {/* Verdict badge skeleton */}
        <div className="mb-4 animate-pulse bg-slate-200 rounded-lg h-12 w-48" />

        {/* Summary skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-[90%]" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-[70%]" />
        </div>

        {/* Chain skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-slate-200 rounded animate-pulse w-[85%]" />
          <div className="h-3 bg-slate-200 rounded animate-pulse w-[60%]" />
        </div>
      </div>
    );
  }

  // State 3 — complete or error
  const isError = status === "error";

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {/* Status pill */}
      <div
        className={clsx("absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium", {
          "text-green-600": !isError,
          "text-red-600": isError,
        })}
      >
        <span
          className={clsx("w-2 h-2 rounded-full", {
            "bg-green-500": !isError,
            "bg-red-500": isError,
          })}
        />
        {isError ? "Error" : "Complete"}
      </div>

      {/* Verdict badge */}
      <div className="mb-5">
        <span className={verdictColors(verdict)}>
          <VerdictIcon verdict={verdict} />
          {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
        </span>
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-slate-700 leading-relaxed mb-5">{summary}</p>
      )}

      {/* Attack Chain */}
      {chain && (
        <>
          <div className="border-t border-slate-100 mb-4" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Attack Chain
          </p>
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown>{chain}</ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
}
