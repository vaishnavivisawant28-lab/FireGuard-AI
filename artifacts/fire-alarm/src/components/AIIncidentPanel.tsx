import { useState } from "react";
import type { IncidentAnalysis, ZonePayload, LocationPayload, EventPayload } from "../lib/gemini";
import { analyzeIncident } from "../lib/gemini";

interface Props {
  zones: ZonePayload[];
  location: LocationPayload;
  events: EventPayload[];
  overall: string;
  power: string;
}

const RISK_COLOR: Record<string, string> = {
  LOW: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  HIGH: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  CRITICAL: "text-red-400 bg-red-500/15 border-red-500/30",
};

export default function AIIncidentPanel({ zones, location, events, overall, power }: Props) {
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeIncident({ zones, location, events, overall, power });
      setAnalysis(result.analysis);
      setGeneratedAt(result.generatedAt);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!analysis) return;
    const now = generatedAt ? new Date(generatedAt) : new Date();
    const dateStr = now.toLocaleString();
    const content = `
FIREGUARD AI — INCIDENT REPORT
================================
Generated: ${dateStr}
Facility: ${location.facility}
Address: ${location.address}
Coordinates: ${location.coords}
Overall Status: ${overall}
Risk Level: ${analysis.riskLevel}

INCIDENT SUMMARY
----------------
${analysis.incidentSummary}

SEVERITY ANALYSIS
-----------------
${analysis.severityAnalysis}

POSSIBLE CAUSE
--------------
${analysis.possibleCause}

IMMEDIATE ACTIONS
-----------------
${analysis.immediateActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

EVACUATION GUIDANCE
-------------------
${analysis.evacuationGuidance.map((g, i) => `${i + 1}. ${g}`).join("\n")}

SAFETY RECOMMENDATIONS
----------------------
${analysis.safetyRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

AFFECTED ZONES
--------------
${zones.filter(z => z.smoke > 40 || z.temperature > 40).map(z =>
  `${z.name}: Smoke ${z.smoke}%, Temp ${z.temperature}°C, Occupants: ${z.humans} humans / ${z.pets} pets`
).join("\n") || "None"}

---
FireGuard AI — Powered by Google Gemini
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FireGuard-Incident-Report-${now.toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white transition-all duration-200 shadow-lg shadow-violet-900/40"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analyzing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            AI Incident Analysis
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

      {/* Modal */}
      {open && analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">FireGuard AI Incident Report</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {generatedAt ? new Date(generatedAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${RISK_COLOR[analysis.riskLevel] ?? RISK_COLOR.HIGH}`}>
                  {analysis.riskLevel} RISK
                </span>
                <button type="button" onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Location */}
              <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Facility</div>
                <div className="text-sm font-medium text-slate-100">{location.facility}</div>
                <div className="text-xs text-slate-400 mt-0.5">{location.address}</div>
              </div>

              {/* Summary */}
              <Section icon="📋" title="Incident Summary" color="violet">
                <p className="text-sm text-slate-300 leading-relaxed">{analysis.incidentSummary}</p>
              </Section>

              {/* Severity */}
              <Section icon="⚠️" title="Severity Analysis" color="amber">
                <p className="text-sm text-slate-300 leading-relaxed">{analysis.severityAnalysis}</p>
              </Section>

              {/* Cause */}
              <Section icon="🔍" title="Possible Cause" color="orange">
                <p className="text-sm text-slate-300 leading-relaxed">{analysis.possibleCause}</p>
              </Section>

              {/* Actions */}
              <Section icon="⚡" title="Immediate Actions" color="red">
                <ul className="space-y-2">
                  {analysis.immediateActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Evacuation */}
              <Section icon="🚨" title="Evacuation Guidance" color="amber">
                <ul className="space-y-2">
                  {analysis.evacuationGuidance.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Recommendations */}
              <Section icon="🛡️" title="Safety Recommendations" color="emerald">
                <ul className="space-y-2">
                  {analysis.safetyRecommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Actions footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export Report
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white transition-colors"
                >
                  Refresh Analysis
                </button>
              </div>

              <div className="text-center text-[10px] text-slate-600 pt-1">
                Powered by Google Gemini AI · FireGuard AI System
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) {
  const border: Record<string, string> = {
    violet: "border-violet-500/20",
    amber: "border-amber-500/20",
    orange: "border-orange-500/20",
    red: "border-red-500/20",
    emerald: "border-emerald-500/20",
  };
  return (
    <div className={`rounded-xl border ${border[color] ?? "border-white/10"} bg-slate-800/40 px-4 py-3`}>
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}
