import { useState } from "react";

type Status = "SAFE" | "WARNING" | "FIRE ALERT";

function getStatus(smoke: number, temperature: number): Status {
  if (smoke > 70 || temperature > 60) return "FIRE ALERT";
  if (smoke > 40) return "WARNING";
  return "SAFE";
}

function App() {
  const [smoke, setSmoke] = useState(0);
  const [temperature, setTemperature] = useState(0);

  const status = getStatus(smoke, temperature);
  const isAlert = status === "FIRE ALERT";
  const isWarning = status === "WARNING";

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

  const containerBg = isAlert
    ? "bg-gradient-to-br from-slate-950 via-red-950 to-red-900 fire-alarm-flash"
    : isWarning
      ? "bg-gradient-to-br from-slate-950 via-amber-950 to-amber-900"
      : "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950";

  const accent = isAlert
    ? "text-red-500"
    : isWarning
      ? "text-amber-400"
      : "text-emerald-400";
  const dot = isAlert
    ? "bg-red-500"
    : isWarning
      ? "bg-amber-400"
      : "bg-emerald-400";
  const sensorColor = isAlert
    ? "text-red-400"
    : isWarning
      ? "text-amber-400"
      : "text-emerald-400";
  const ringGlow = isAlert
    ? "from-red-400 to-red-600 shadow-[0_0_60px_rgba(239,68,68,0.7)]"
    : isWarning
      ? "from-amber-400 to-amber-600 shadow-[0_0_60px_rgba(245,158,11,0.55)]"
      : "from-emerald-400 to-emerald-600 shadow-[0_0_60px_rgba(16,185,129,0.5)]";
  const ringHalo = isAlert
    ? "bg-red-500/30"
    : isWarning
      ? "bg-amber-500/25"
      : "bg-emerald-500/20";
  const ringBorder = isAlert
    ? "border-red-400/40"
    : isWarning
      ? "border-amber-400/40"
      : "border-emerald-400/30";

  const sliderAccent = isAlert
    ? "accent-red-500"
    : isWarning
      ? "accent-amber-400"
      : "accent-emerald-400";

  const description = isAlert
    ? "Smoke and heat detected. Evacuate the building immediately and call emergency services."
    : isWarning
      ? "Elevated smoke levels detected. Investigate the area and prepare to evacuate if conditions worsen."
      : "All sensors are reporting normal conditions. No smoke, heat, or fault signals detected.";

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
          isAlert
            ? "border-red-500/40"
            : isWarning
              ? "border-amber-500/40"
              : "border-white/10"
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 mb-8">
          <span
            className={`inline-block w-2 h-2 rounded-full ${dot} ${
              isAlert ? "fire-blink" : "animate-pulse"
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
              isAlert ? "fire-blink" : ""
            }`}
          >
            {isAlert ? (
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
            ) : isWarning ? (
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
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
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
            isAlert ? "fire-blink" : ""
          }`}
        >
          {status}
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto mb-8">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Smoke
            </div>
            <div className={`font-semibold mt-1 ${sensorColor}`}>{smoke}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Temperature
            </div>
            <div className={`font-semibold mt-1 ${sensorColor}`}>
              {temperature}
            </div>
          </div>
        </div>

        <div className="space-y-5 text-left">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="smoke-slider"
                className="text-xs uppercase tracking-widest text-slate-400"
              >
                Smoke Level
              </label>
              <span className={`text-sm font-semibold ${sensorColor}`}>
                {smoke}
              </span>
            </div>
            <input
              id="smoke-slider"
              type="range"
              min={0}
              max={100}
              value={smoke}
              onChange={(e) => setSmoke(Number(e.target.value))}
              className={`w-full ${sliderAccent}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="temp-slider"
                className="text-xs uppercase tracking-widest text-slate-400"
              >
                Temperature
              </label>
              <span className={`text-sm font-semibold ${sensorColor}`}>
                {temperature}
              </span>
            </div>
            <input
              id="temp-slider"
              type="range"
              min={0}
              max={100}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className={`w-full ${sliderAccent}`}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>{dateString}</span>
          <span>Last check {timeString}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
