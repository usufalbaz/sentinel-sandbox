"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, LayoutDashboard, Cpu } from "lucide-react";

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  );
}

import { ThemeToggle } from "@/components/ThemeToggle";
import { getScan } from "@/lib/api";
import type { ScanResult } from "@/lib/types";
import StatsBar from "@/components/StatsBar";
import ScanHistory from "@/components/ScanHistory";
import ScanForm from "@/components/ScanForm";
import VerdictPanel from "@/components/VerdictPanel";
import FindingsFeed from "@/components/FindingsFeed";
import FollowUpChat from "@/components/FollowUpChat";

export default function DashboardPage() {
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling effect
  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const isTerminal =
      scanResult?.status === "COMPLETED" || scanResult?.status === "FAILED";

    if (!activeScanId || isTerminal) return;

    intervalRef.current = setInterval(async () => {
      try {
        const result = await getScan(activeScanId);
        setScanResult(result);

        if (result.status === "COMPLETED") {
          setScanHistory((prev) => {
            const exists = prev.some((s) => s.scan_id === result.scan_id);
            return exists
              ? prev.map((s) => (s.scan_id === result.scan_id ? result : s))
              : [result, ...prev];
          });
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else if (result.status === "FAILED") {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch {
        // Network error — keep polling
      }
    }, 2000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeScanId, scanResult?.status]);

  const handleScanStarted = useCallback((id: string) => {
    setActiveScanId(id);
    setScanResult(null);
  }, []);

  const loadScan = useCallback(
    (id: string) => {
      const found = scanHistory.find((s) => s.scan_id === id) ?? null;
      setScanResult(found);
      setActiveScanId(id);
    },
    [scanHistory]
  );

  const deleteScan = useCallback((id: string) => {
    setScanHistory((prev) => prev.filter((s) => s.scan_id !== id));
    if (activeScanId === id) {
      setActiveScanId(null);
      setScanResult(null);
    }
  }, [activeScanId]);

  const isScanning =
    activeScanId !== null &&
    scanResult?.status !== "COMPLETED" &&
    scanResult?.status !== "FAILED";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--text-primary)" }}
    >
      {/* ── Top navbar ─────────────────────────────────────────── */}
      <header
        className="px-6 sticky top-0 z-10 animate-slide-down"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 1px 24px rgba(0,0,0,0.18)",
        }}
      >
        <div className="h-[60px] flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%)",
                boxShadow: "0 0 16px rgba(14,165,233,0.4)",
              }}
            >
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--text-primary)" }}>
                Sentinel
              </span>
              <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--accent)" }}>
                {" "}Sandbox
              </span>
            </div>
          </div>

          {/* Centre breadcrumb */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-faint)" }}
          >
            <LayoutDashboard size={12} />
            <span>Dashboard</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <a
              href="https://github.com/usufalbaz/sentinel-sandbox"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="nav-icon-btn"
            >
              <GithubIcon size={16} />
            </a>
            <Link
              href="/"
              className="ml-1 inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all btn-glow"
              style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%)" }}
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ─────────────────────────────────────── */}
        <aside
          className="hidden md:flex flex-col w-72 border-r overflow-y-auto p-4 gap-5"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          {/* Sidebar header */}
          <div
            className="rounded-xl p-3 flex items-center gap-2.5"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)" }}
            >
              <Cpu size={14} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Analysis Engine</p>
              <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Static + Runtime scanning</p>
            </div>
          </div>

          <StatsBar history={scanHistory} />

          <ScanHistory
            history={scanHistory}
            activeScanId={activeScanId}
            onSelect={loadScan}
            onDelete={deleteScan}
          />
        </aside>

        {/* ── Main content ──────────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto p-5 md:p-6"
          style={{ background: "var(--bg)" }}
        >
          {/* Page title row */}
          <div className="mb-5">
            <h1
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Security Scanner
            </h1>
            <p className="text-sm" style={{ color: "var(--text-faint)" }}>
              Scan GitHub repositories for security vulnerabilities in real time
            </p>
          </div>

          {/* ── Scan form ─────────────────────────────────────── */}
          <ScanForm onScanStarted={handleScanStarted} isScanning={isScanning} />

          {/* ── Two-column grid for verdict + findings ─────────── */}
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <VerdictPanel scanResult={scanResult} />
            <FindingsFeed
              findings={[
                ...(scanResult?.static_findings ?? []),
                ...(scanResult?.runtime_findings ?? []),
              ]}
              status={scanResult?.status ?? "QUEUED"}
            />
          </div>

          {/* ── Chat ─────────────────────────────────────────────── */}
          <div className="mt-5">
            <FollowUpChat
              scanId={activeScanId}
              isReady={scanResult?.status === "COMPLETED"}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
