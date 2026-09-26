"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import clsx from "clsx";
import { startScan } from "@/lib/api";

interface ScanFormProps {
  onScanStarted: (id: string) => void;
  isScanning: boolean;
}

export default function ScanForm({ onScanStarted, isScanning }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) { setError("Please enter a repository URL."); return; }
    setError(null);
    setLoading(true);
    try {
      const result = await startScan(repoUrl);
      onScanStarted(result.id);
      setRepoUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        Scan a Repository
      </h2>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        Enter a public GitHub repository or npm package URL
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          disabled={loading || isScanning}
          className={clsx(
            "w-full rounded-xl px-4 py-2.5 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors"
          )}
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-primary)",
          }}
        />

        <button
          type="submit"
          disabled={loading || isScanning || !repoUrl.trim()}
          className={clsx(
            "w-full flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white",
            "bg-sky-500 hover:bg-sky-600 transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {loading ? (
            <><Loader2 className="animate-spin mr-2" size={16} />Scanning…</>
          ) : (
            <><Search size={16} className="mr-2" />Run Scan</>
          )}
        </button>

        {isScanning && !loading && (
          <div
            className="border-l-4 border-sky-500 px-4 py-2.5 text-sm rounded-r-xl"
            style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
          >
            Scan in progress — results updating…
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </form>
    </div>
  );
}
