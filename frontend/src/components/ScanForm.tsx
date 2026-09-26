"use client";

import { useState } from "react";
import { Search, Loader2, GitBranch, Globe } from "lucide-react";
import clsx from "clsx";
import { startScan } from "@/lib/api";

interface ScanFormProps {
  onScanStarted: (id: string) => void;
  isScanning: boolean;
}

export default function ScanForm({ onScanStarted, isScanning }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) { setError("Please enter a repository URL."); return; }
    setError(null);
    setLoading(true);
    try {
      const result = await startScan(repoUrl, branch || "main");
      onScanStarted(result.scan_id);
      setRepoUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || isScanning;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {/* Header gradient strip */}
      <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)" }}
          >
            <Globe size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Scan a Repository</h2>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>Enter a public GitHub repository URL</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
        {/* URL input */}
        <div className="relative">
          <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-faint)" }} />
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            disabled={disabled}
            className={clsx(
              "w-full rounded-xl pl-9 pr-4 py-2.5 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            )}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Branch input */}
        <div className="relative">
          <GitBranch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-faint)" }} />
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            disabled={disabled}
            className={clsx(
              "w-full rounded-xl pl-9 pr-4 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            )}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={disabled || !repoUrl.trim()}
          className={clsx(
            "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white btn-glow",
            "bg-sky-500 hover:bg-sky-600 transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          )}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={15} />Scanning…</>
          ) : (
            <><Search size={15} />Run Scan</>
          )}
        </button>

        {isScanning && !loading && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
            style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", color: "var(--accent)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
            Scan in progress — results updating live…
          </div>
        )}

        {error && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
