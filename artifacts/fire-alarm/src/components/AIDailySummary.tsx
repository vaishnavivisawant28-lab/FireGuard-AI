import { useState } from "react";
import { getDailySummary } from "../lib/gemini";
import type { DailySummary, ZonePayload, LocationPayload, EventPayload } from "../lib/gemini";

interface Props {
  zones: ZonePayload[];
  location: LocationPayload;
  events: EventPayload[];
}

const RATING_STYLE: Record<string, { badge: string; glow: string; icon: string }> = {
  SAFE: { badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", glow: "border-emerald-500/20", icon: "✅" },
  CAUTION: { badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", glow: "border-amber-500/20", icon: "⚠️" },
  CRITICAL: { badge: "bg-red-500/15 text-red-300 border-red-500/30", glow: "border-red-500/20", icon: "🚨" },
};

export default function AIDailySummary({ zones, location, events }: Props) {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alertCount = events.filter(e => e.level === "FIRE ALERT").length;
  const warningCount = events.filter(e => e.level === "WARNING").length;
  const highestSmoke = Math.max(...zones.map(z => z.smoke), 0);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDailySummary({ events, zones, location });
      setSummary(result.summary);
      setGeneratedAt(result.generatedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const style = summary ? (RATING_STYLE[summary.overallRating] ?? RATING_STYLE.SAFE) : null;

  return (
    <div className={`rounded-2xl border transition-colors duration-300 ${style?.glow ?? "border-white/10"} bg-slate-800/40 p-5`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">AI Daily Safety Summary</div>
            <div className="text-[10px] text-slate-500">
              {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {summary && style && (
          <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${style.badge}`}>
            {style.icon} {summary.statusBadge}
          </span>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Fire Alerts" value={alertCount} color={alertCount > 0 ? "text-red-400" : "text-slate-400"} />
        <Stat label="Warnings" value={warningCount} color={warningCount > 0 ? "text-amber-400" : "text-slate-400"} />
        <Stat label="Peak Smoke" value={`${highestSmoke}%`} color={highestSmoke > 70 ? "text-red-400" : highestSmoke > 40 ? "text-amber-400" : "text-emerald-400"} />
      </div>

      {/* AI content */}
      {summary ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{summary.summary}</p>

          <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3.5 py-3 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Highest Risk Area</div>
            <div className="text-sm text-amber-300 font-medium">{summary.highestRiskArea}</div>
          </div>

          {summary.commonCauses.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3.5 py-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Common Causes</div>
              <ul className="space-y-1">
                {summary.commonCauses.map((c, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-1.5">
                    <span className="text-slate-500 mt-0.5 shrink-0">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-3.5 py-3">
            <div className="text-[10px] uppercase tracking-widest text-violet-400 mb-2">🤖 AI Recommendations</div>
            <ul className="space-y-1.5">
              {summary.aiRecommendations.map((r, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-1.5">
                  <span className="text-violet-400 mt-0.5 shrink-0">✓</span>{r}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] text-slate-600 text-center">
            {generatedAt ? `Generated ${new Date(generatedAt).toLocaleTimeString()}` : ""} · Powered by Google Gemini
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl py-2 text-xs font-semibold uppercase tracking-widest bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh Summary"}
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
          <p className="text-sm text-slate-400 mb-4">
            Generate an AI-powered safety analysis for today's activity at {location.facility}.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 mx-auto rounded-xl px-5 py-2.5 text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                Generate AI Summary
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-center">
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
