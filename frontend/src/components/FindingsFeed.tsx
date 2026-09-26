import type { Finding } from "@/lib/types";

interface FindingsFeedProps {
  staticFindings?: Finding[];
  runtimeFindings?: Finding[];
}

export default function FindingsFeed({ staticFindings = [], runtimeFindings = [] }: FindingsFeedProps) {
  const allFindings = [...staticFindings, ...runtimeFindings];

  if (allFindings.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-slate-400 text-sm">
        Zero vulnerabilities or anomalies detected. Repository is verified clean.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl space-y-4">
      <h3 className="text-lg font-bold text-white">Detected Security Findings ({allFindings.length})</h3>
      <div className="space-y-3">
        {allFindings.map((finding, idx) => {
          const isCritical = finding.severity === "CRITICAL";
          const isHigh = finding.severity === "HIGH";
          const tagColor = isCritical
            ? "text-red-400 bg-red-950/40 border-red-800"
            : isHigh
            ? "text-amber-400 bg-amber-950/40 border-amber-800"
            : "text-slate-400 bg-slate-800 border-slate-700";

          return (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-4 text-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-slate-200">{finding.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded border font-mono font-bold ${tagColor}`}>
                  {finding.severity}
                </span>
              </div>
              <p className="text-slate-400 mb-2">{finding.detail}</p>
              {finding.file && (
                <div className="text-xs font-mono text-slate-500">
                  Target: {finding.file} {finding.line ? `(Line ${finding.line})` : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
