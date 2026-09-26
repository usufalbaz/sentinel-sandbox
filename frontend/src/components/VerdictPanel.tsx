import type { Verdict } from "@/lib/types";

interface VerdictPanelProps {
  verdict: Verdict;
}

export default function VerdictPanel({ verdict }: VerdictPanelProps) {
  const isDangerous = verdict.level === "DANGEROUS";
  const isSuspicious = verdict.level === "SUSPICIOUS";

  const badgeColor = isDangerous
    ? "bg-red-500/10 text-red-400 border-red-500/30"
    : isSuspicious
    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Security Assessment</span>
          <h2 className="text-xl font-bold text-white mt-1">Audit Evaluation</h2>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide uppercase ${badgeColor}`}>
          {verdict.level}
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">{verdict.summary}</p>
      {verdict.triggered_rules && verdict.triggered_rules.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Triggered Policies</span>
          <div className="flex flex-wrap gap-2">
            {verdict.triggered_rules.map((rule, idx) => (
              <span key={idx} className="bg-slate-950 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded font-mono">
                {rule}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
