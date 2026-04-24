import { useState } from "react";

type Status = "SAFE" | "WARNING" | "FIRE ALERT";

type Zone = {
  id: number;
  name: string;
  smoke: number;
  temperature: number;
};

function getStatus(smoke: number, temperature: number): Status {
  if (smoke > 70 || temperature > 60) return "FIRE ALERT";
  if (smoke > 40) return "WARNING";
  return "SAFE";
}

const STATUS_RANK: Record<Status, number> = {
  SAFE: 0,
  WARNING: 1,
  "FIRE ALERT": 2,
};

function statusTheme(status: Status) {
  if (status === "FIRE ALERT") {
    return {
      text: "text-red-500",
      dot: "bg-red-500",
      sensor: "text-red-400",
      slider: "accent-red-500",
      border: "border-red-500/40",
      badgeBg: "bg-red-500/15",
      badgeText: "text-red-300",
    };
  }
  if (status === "WARNING") {
    return {
      text: "text-amber-400",
      dot: "bg-amber-400",
      sensor: "text-amber-400",
      slider: "accent-amber-400",
      border: "border-amber-500/40",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-300",
    };
  }
  return {
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    sensor: "text-emerald-400",
    slider: "accent-emerald-400",
    border: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
  };
}

function App() {
  const [zones, setZones] = useState<Zone[]>([
    { id: 1, name: "Zone 1", smoke: 0, temperature: 0 },
    { id: 2, name: "Zone 2", smoke: 0, temperature: 0 },
  ]);

  const zoneStatuses = zones.map((z) => ({
    zone: z,
    status: getStatus(z.smoke, z.temperature),
  }));

  const overall = zoneStatuses.reduce<Status>(
    (acc, z) => (STATUS_RANK[z.status] > STATUS_RANK[acc] ? z.status : acc),
    "SAFE",
  );

  const alertingZones = zoneStatuses
    .filter((z) => z.status === "FIRE ALERT")
    .map((z) => z.zone.name);
  const warningZones = zoneStatuses
    .filter((z) => z.status === "WARNING")
    .map((z) => z.zone.name);

  const isAlert = overall === "FIRE ALERT";
  const isWarning = overall === "WARNING";

  const headline =
    overall === "FIRE ALERT"
      ? alertingZones.length === 1
        ? `Fire in ${alertingZones[0]}`
        : `Fire in ${alertingZones.join(" & ")}`
      : overall === "WARNING"
        ? warningZones.length === 1
          ? `Warning in ${warningZones[0]}`
          : `Warning in ${warningZones.join(" & ")}`
        : "All zones clear";

  const description =
    overall === "FIRE ALERT"
      ? "Smoke or heat thresholds exceeded. Evacuate the affected zone and call emergency services."
      : overall === "WARNING"
        ? "Elevated smoke detected. Investigate the affected zone and prepare to evacuate if conditions worsen."
        : "All sensors are reporting normal conditions. No smoke, heat, or fault signals detected.";

  const containerBg = isAlert
    ? "bg-gradient-to-br from-slate-950 via-red-950 to-red-900 fire-alarm-flash"
    : isWarning
      ? "bg-gradient-to-br from-slate-950 via-amber-950 to-amber-900"
      : "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950";

  const overallTheme = statusTheme(overall);
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

  const updateZone = (id: number, field: "smoke" | "temperature", v: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: v } : z)),
    );
  };

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
        className={`w-full max-w-3xl rounded-3xl border bg-slate-900/60 backdrop-blur-md shadow-2xl p-8 sm:p-10 transition-colors duration-300 ${
          isAlert
            ? "border-red-500/40"
            : isWarning
              ? "border-amber-500/40"
              : "border-white/10"
        }`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 mb-8">
            <span
              className={`inline-block w-2 h-2 rounded-full ${overallTheme.dot} ${
                isAlert ? "fire-blink" : "animate-pulse"
              }`}
            />
            Fire Alarm System
          </div>

          <div className="relative mx-auto mb-8 w-32 h-32 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full blur-2xl ${ringHalo}`} />
            <div className={`absolute inset-2 rounded-full border ${ringBorder}`} />
            <div className={`absolute inset-5 rounded-full border ${ringBorder}`} />
            <div
              className={`relative w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center ${ringGlow} ${
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
                  className="w-10 h-10 text-white"
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
                  className="w-10 h-10 text-white"
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
                  className="w-10 h-10 text-white"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
          </div>

          <div className="text-sm uppercase tracking-widest text-slate-400 mb-2">
            System Status
          </div>
          <h1
            className={`text-5xl sm:text-6xl font-extrabold tracking-tight mb-3 ${overallTheme.text} ${
              isAlert ? "fire-blink" : ""
            }`}
          >
            {overall}
          </h1>
          <p
            className={`text-lg sm:text-xl font-semibold mb-3 ${overallTheme.text}`}
          >
            {headline}
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto mb-8">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zoneStatuses.map(({ zone, status }) => {
            const t = statusTheme(status);
            const isZoneAlert = status === "FIRE ALERT";
            return (
              <div
                key={zone.id}
                className={`rounded-2xl border bg-slate-800/40 p-5 transition-colors ${t.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${t.dot} ${
                        isZoneAlert ? "fire-blink" : ""
                      }`}
                    />
                    <h2 className="text-base font-semibold text-slate-100">
                      {zone.name}
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full ${t.badgeBg} ${t.badgeText}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={`smoke-${zone.id}`}
                        className="text-[11px] uppercase tracking-widest text-slate-400"
                      >
                        Smoke Level
                      </label>
                      <span className={`text-sm font-semibold ${t.sensor}`}>
                        {zone.smoke}
                      </span>
                    </div>
                    <input
                      id={`smoke-${zone.id}`}
                      type="range"
                      min={0}
                      max={100}
                      value={zone.smoke}
                      onChange={(e) =>
                        updateZone(zone.id, "smoke", Number(e.target.value))
                      }
                      className={`w-full ${t.slider}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={`temp-${zone.id}`}
                        className="text-[11px] uppercase tracking-widest text-slate-400"
                      >
                        Temperature
                      </label>
                      <span className={`text-sm font-semibold ${t.sensor}`}>
                        {zone.temperature}
                      </span>
                    </div>
                    <input
                      id={`temp-${zone.id}`}
                      type="range"
                      min={0}
                      max={100}
                      value={zone.temperature}
                      onChange={(e) =>
                        updateZone(
                          zone.id,
                          "temperature",
                          Number(e.target.value),
                        )
                      }
                      className={`w-full ${t.slider}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
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
