import { Activity, ShieldX, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ScanResult } from "@/lib/types";

interface StatsBarProps {
  history: ScanResult[];
}

const TILES = [
  {
    key: "total",
    icon: <Activity size={15} />,
    label: "Total",
    iconColor: "#38bdf8",
    glow: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.2)",
  },
  {
    key: "dangerous",
    icon: <ShieldX size={15} />,
    label: "Dangerous",
    iconColor: "#f87171",
    glow: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.2)",
  },
  {
    key: "suspicious",
    icon: <ShieldAlert size={15} />,
    label: "Suspicious",
    iconColor: "#fbbf24",
    glow: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.2)",
  },
  {
    key: "safe",
    icon: <ShieldCheck size={15} />,
    label: "Safe",
    iconColor: "#4ade80",
    glow: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.2)",
  },
];

export default function StatsBar({ history }: StatsBarProps) {
  const counts = {
    total:      history.length,
    dangerous:  history.filter((s) => s.verdict?.level === "DANGEROUS").length,
    suspicious: history.filter((s) => s.verdict?.level === "SUSPICIOUS").length,
    safe:       history.filter((s) => s.verdict?.level === "SAFE").length,
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
        Session Stats
      </p>
      <div className="grid grid-cols-2 gap-2">
        {TILES.map((tile) => {
          const count = counts[tile.key as keyof typeof counts];
          return (
            <div
              key={tile.label}
              className="rounded-xl p-3 flex items-center gap-3 transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, var(--bg-raised) 0%, ${tile.glow} 100%)`,
                border: `1px solid ${tile.border}`,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: tile.glow, color: tile.iconColor }}
              >
                {tile.icon}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-none" style={{ color: "var(--text-primary)" }}>{count}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-faint)" }}>{tile.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
