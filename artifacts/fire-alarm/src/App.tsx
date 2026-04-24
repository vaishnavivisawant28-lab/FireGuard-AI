import { useState } from "react";

function App() {
  const [alarm, setAlarm] = useState(false);

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const containerBg = alarm
    ? "bg-gradient-to-br from-slate-950 via-red-950 to-red-900 fire-alarm-flash"
    : "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950";

  const accent = alarm ? "text-red-500" : "text-emerald-400";
  const dot = alarm ? "bg-red-500" : "bg-emerald-400";
  const sensorColor = alarm ? "text-red-400" : "text-emerald-400";
  const ringGlow = alarm
    ? "from-red-400 to-red-600 shadow-[0_0_60px_rgba(239,68,68,0.7)]"
    : "from-emerald-400 to-emerald-600 shadow-[0_0_60px_rgba(16,185,129,0.5)]";
  const ringHalo = alarm ? "bg-red-500/30" : "bg-emerald-500/20";
  const ringBorder = alarm ? "border-red-400/40" : "border-emerald-400/30";

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-300 ${containerBg}`}
    >
      <style>{`
        @keyframes fireFlash {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.35); }
        }
        .fire-alarm-flash {
          animation: fireFlash 0.7s ease-in-out infinite;
        }
        @keyframes fireBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.35; }
        }
        .fire-blink {
          animation: fireBlink 0.6s steps(1, end) infinite;
        }
      `}</style>

      <div
        className={`w-full max-w-xl rounded-3xl border bg-slate-900/60 backdrop-blur-md shadow-2xl p-10 text-center transition-colors duration-300 ${
          alarm ? "border-red-500/40" : "border-white/10"
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 mb-8">
          <span
            className={`inline-block w-2 h-2 rounded-full ${dot} ${
              alarm ? "fire-blink" : "animate-pulse"
            }`}
          />
          Fire Alarm System
        </div>

        <div className="relative mx-auto mb-8 w-40 h-40 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full blur-2xl ${ringHalo}`} />
          <div className={`absolute inset-2 rounded-full border ${ringBorder}`} />
          <div className={`absolute inset-6 rounded-full border ${ringBorder}`} />
          <div
            className={`relative w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center ${ringGlow} ${
              alarm ? "fire-blink" : ""
            }`}
          >
            {alarm ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12 text-white"
                aria-hidden="true"
              >
                <path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5C8 9 7 11 7 13a5 5 0 0 0 10 0c0-4-5-11-5-11z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12 text-white"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>
        </div>

        <div className="text-sm uppercase tracking-widest text-slate-400 mb-2">
          Current Status
        </div>
        <h1
          className={`text-6xl sm:text-7xl font-extrabold tracking-tight mb-4 ${accent} ${
            alarm ? "fire-blink" : ""
          }`}
        >
          {alarm ? "FIRE ALERT" : "SAFE"}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto mb-8">
          {alarm
            ? "Smoke and heat detected. Evacuate the building immediately and call emergency services."
            : "All sensors are reporting normal conditions. No smoke, heat, or fault signals detected."}
        </p>

        <div className="grid grid-cols-3 gap-3 text-left">
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Smoke
            </div>
            <div className={`font-semibold mt-1 ${sensorColor}`}>
              {alarm ? "Detected" : "Clear"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Heat
            </div>
            <div className={`font-semibold mt-1 ${sensorColor}`}>
              {alarm ? "Critical" : "Normal"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Power
            </div>
            <div className={`font-semibold mt-1 ${sensorColor}`}>
              {alarm ? "Alarm" : "Online"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAlarm((a) => !a)}
          className={`mt-8 w-full rounded-xl px-6 py-3 font-semibold uppercase tracking-widest text-sm transition-colors ${
            alarm
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-red-600 hover:bg-red-500 text-white"
          }`}
        >
          {alarm ? "Reset System" : "Trigger Alarm"}
        </button>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>{dateString}</span>
          <span>Last check {timeString}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
