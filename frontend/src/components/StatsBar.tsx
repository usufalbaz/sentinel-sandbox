import { Activity, ShieldX, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ScanResult } from "@/lib/types";

interface StatsBarProps {
  history: ScanResult[];
}

export default function StatsBar({ history }: StatsBarProps) {
  const total     = history.length;
  const dangerous = history.filter((s) => s.verdict === "dangerous").length;
  const suspicious= history.filter((s) => s.verdict === "suspicious").length;
  const safe      = history.filter((s) => s.verdict === "safe").length;

  const tiles = [
    { icon: <Activity   size={16} className="text-sky-400"    />, iconBg: "#0ea5e920", count: total,     label: "Total"     },
    { icon: <ShieldX    size={16} className="text-red-400"    />, iconBg: "#ef444420", count: dangerous,  label: "Dangerous" },
    { icon: <ShieldAlert size={16} className="text-amber-400" />, iconBg: "#f59e0b20", count: suspicious, label: "Suspicious"},
    { icon: <ShieldCheck size={16} className="text-green-400" />, iconBg: "#22c55e20", count: safe,       label: "Safe"      },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-faint)" }}>
        Session Stats
      </p>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <div className="rounded-full p-1.5" style={{ background: tile.iconBg }}>
              {tile.icon}
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{tile.count}</p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>{tile.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
