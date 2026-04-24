import { useEffect, useRef, useState } from "react";

type Status = "SAFE" | "WARNING" | "FIRE ALERT";

type Zone = {
  id: number;
  name: string;
  smoke: number;
  temperature: number;
};

type LogEvent = {
  id: number;
  time: Date;
  message: string;
  level: Status | "INFO" | "CALL";
};

type CallState = "idle" | "ringing" | "connected";

type PowerState = "online" | "shutting-down" | "offline";

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

const MAX_EVENTS = 10;

const DEFAULT_LOCATION = {
  facility: "Building A — Riverside Industrial Park",
  address: "1420 Harbor Way, Oakland, CA 94607",
  coords: "37.7955° N, 122.2705° W",
};

const FIRE_DEPT = {
  name: "Oakland Fire Safety Dept.",
  number: "911",
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

function logLevelStyle(level: LogEvent["level"]) {
  if (level === "FIRE ALERT")
    return { dot: "bg-red-500", text: "text-red-300" };
  if (level === "WARNING")
    return { dot: "bg-amber-400", text: "text-amber-300" };
  if (level === "SAFE")
    return { dot: "bg-emerald-400", text: "text-emerald-300" };
  if (level === "CALL")
    return { dot: "bg-sky-400", text: "text-sky-300" };
  return { dot: "bg-slate-400", text: "text-slate-300" };
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function App() {
  const [zones, setZones] = useState<Zone[]>([
    { id: 1, name: "Zone 1", smoke: 0, temperature: 0 },
    { id: 2, name: "Zone 2", smoke: 0, temperature: 0 },
  ]);

  const [events, setEvents] = useState<LogEvent[]>([]);
  const eventIdRef = useRef(0);
  const prevZoneStatusRef = useRef<Record<number, Status>>({});
  const initializedRef = useRef(false);

  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [editingLocation, setEditingLocation] = useState(false);
  const [callState, setCallState] = useState<CallState>("idle");
  const [callElapsed, setCallElapsed] = useState(0);
  const callTimersRef = useRef<{ connect?: number; tick?: number }>({});
  const [power, setPower] = useState<PowerState>("online");
  const powerTimerRef = useRef<number | undefined>(undefined);
  const [sprinklers, setSprinklers] = useState<Record<number, boolean>>({});

  const addEvent = (message: string, level: LogEvent["level"]) => {
    setEvents((prev) => {
      const next: LogEvent = {
        id: ++eventIdRef.current,
        time: new Date(),
        message,
        level,
      };
      return [next, ...prev].slice(0, MAX_EVENTS);
    });
  };

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

  const clearCallTimers = () => {
    if (callTimersRef.current.connect) {
      window.clearTimeout(callTimersRef.current.connect);
    }
    if (callTimersRef.current.tick) {
      window.clearInterval(callTimersRef.current.tick);
    }
    callTimersRef.current = {};
  };

  const triggerPowerShutoff = () => {
    if (powerTimerRef.current) {
      window.clearTimeout(powerTimerRef.current);
    }
    setPower("shutting-down");
    addEvent("Initiating electrical power shutoff", "INFO");
    powerTimerRef.current = window.setTimeout(() => {
      setPower("offline");
      addEvent("Electrical power shut off — building is safe", "INFO");
    }, 2500);
  };

  const placeCall = (reason: string) => {
    clearCallTimers();
    setCallState("ringing");
    setCallElapsed(0);
    addEvent(
      `Calling ${FIRE_DEPT.name} (${FIRE_DEPT.number}) — ${reason}`,
      "CALL",
    );
    callTimersRef.current.connect = window.setTimeout(() => {
      setCallState("connected");
      addEvent(`Dispatcher connected — location relayed`, "CALL");
      callTimersRef.current.tick = window.setInterval(() => {
        setCallElapsed((s) => s + 1);
      }, 1000);
      triggerPowerShutoff();
    }, 3000);
  };

  const endCall = () => {
    clearCallTimers();
    if (callState !== "idle") {
      addEvent("Call ended", "CALL");
    }
    setCallState("idle");
    setCallElapsed(0);
  };

  useEffect(() => {
    return () => {
      clearCallTimers();
      if (powerTimerRef.current) {
        window.clearTimeout(powerTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      addEvent("System started", "INFO");
      zones.forEach((z) => {
        prevZoneStatusRef.current[z.id] = "SAFE";
      });
      return;
    }

    let triggeredAlert: string | null = null;
    zoneStatuses.forEach(({ zone, status }) => {
      const prev = prevZoneStatusRef.current[zone.id] ?? "SAFE";
      if (prev === status) return;
      prevZoneStatusRef.current[zone.id] = status;
      if (status === "FIRE ALERT") {
        addEvent(`${zone.name} FIRE ALERT`, "FIRE ALERT");
        if (!triggeredAlert) triggeredAlert = zone.name;
        setSprinklers((s) => {
          if (s[zone.id]) return s;
          addEvent(`${zone.name} sprinklers activated`, "INFO");
          return { ...s, [zone.id]: true };
        });
      } else if (status === "WARNING") {
        addEvent(`${zone.name} WARNING`, "WARNING");
      } else {
        addEvent(`${zone.name} cleared`, "SAFE");
      }
      if (prev === "FIRE ALERT" && status !== "FIRE ALERT") {
        setSprinklers((s) => {
          if (!s[zone.id]) return s;
          addEvent(`${zone.name} sprinklers off`, "INFO");
          return { ...s, [zone.id]: false };
        });
      }
    });

    if (triggeredAlert && callState === "idle") {
      placeCall(`Fire detected in ${triggeredAlert}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones]);

  const handleReset = () => {
    setZones((prev) => prev.map((z) => ({ ...z, smoke: 0, temperature: 0 })));
    addEvent("System reset", "INFO");
    if (callState !== "idle") {
      endCall();
    }
    if (powerTimerRef.current) {
      window.clearTimeout(powerTimerRef.current);
      powerTimerRef.current = undefined;
    }
    if (power !== "online") {
      setPower("online");
      addEvent("Electrical power restored", "INFO");
    }
    setSprinklers((s) => {
      if (Object.values(s).some(Boolean)) {
        addEvent("All sprinklers shut off", "INFO");
      }
      return {};
    });
  };

  const toggleSprinkler = (zone: Zone) => {
    setSprinklers((s) => {
      const next = !s[zone.id];
      addEvent(
        `${zone.name} sprinklers ${next ? "manually activated" : "manually turned off"}`,
        "INFO",
      );
      return { ...s, [zone.id]: next };
    });
  };

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
  const dateString = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formatElapsed = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

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
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .ring-pulse {
          animation: ringPulse 1.4s ease-out infinite;
        }
        @keyframes sprinkleDrop {
          0% { transform: translateY(-2px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        .sprinkle-drop {
          animation: sprinkleDrop 0.9s ease-in infinite;
        }
        @keyframes phoneShake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg); }
          30% { transform: rotate(12deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(10deg); }
          75% { transform: rotate(-6deg); }
          90% { transform: rotate(6deg); }
        }
        .phone-shake {
          animation: phoneShake 0.9s ease-in-out infinite;
          transform-origin: 50% 60%;
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

        <div
          className={`mb-6 rounded-2xl border p-5 transition-colors ${
            power === "offline"
              ? "border-slate-500/40 bg-slate-900/70"
              : power === "shutting-down"
                ? "border-amber-500/40 bg-amber-950/30"
                : "border-emerald-500/30 bg-slate-800/40"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  power === "offline"
                    ? "bg-slate-700 text-slate-300"
                    : power === "shutting-down"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 ${
                    power === "shutting-down" ? "fire-blink" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Electrical Power
                </div>
                <div
                  className={`text-base font-semibold ${
                    power === "offline"
                      ? "text-slate-200"
                      : power === "shutting-down"
                        ? "text-amber-300"
                        : "text-emerald-300"
                  }`}
                >
                  {power === "offline"
                    ? "Power Shut Off"
                    : power === "shutting-down"
                      ? "Shutting down…"
                      : "Online"}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 max-w-[55%]">
              {power === "offline"
                ? "Mains disconnected after emergency call to prevent electrical hazards."
                : power === "shutting-down"
                  ? "Cutting mains power now that dispatch has been notified."
                  : "Mains live. Will shut off automatically once a fire call is connected."}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-800/40 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-slate-300"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h2 className="text-base font-semibold text-slate-100">
                Facility Location
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditingLocation((e) => !e)}
              className="text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors"
            >
              {editingLocation ? "Done" : "Edit"}
            </button>
          </div>

          {editingLocation ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Facility
                </label>
                <input
                  type="text"
                  value={location.facility}
                  onChange={(e) =>
                    setLocation((l) => ({ ...l, facility: e.target.value }))
                  }
                  className="w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) =>
                    setLocation((l) => ({ ...l, address: e.target.value }))
                  }
                  className="w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/50"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                  Coordinates
                </label>
                <input
                  type="text"
                  value={location.coords}
                  onChange={(e) =>
                    setLocation((l) => ({ ...l, coords: e.target.value }))
                  }
                  className="w-full rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/50"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <div className="text-slate-100 font-medium">{location.facility}</div>
              <div className="text-slate-400">{location.address}</div>
              <div className="text-slate-500 font-mono text-xs">
                {location.coords}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zoneStatuses.map(({ zone, status }) => {
            const t = statusTheme(status);
            const isZoneAlert = status === "FIRE ALERT";
            const sprinklerOn = !!sprinklers[zone.id];
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

                  <div
                    className={`mt-1 rounded-xl border px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      sprinklerOn
                        ? "border-sky-400/40 bg-sky-500/10"
                        : "border-white/10 bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`w-4 h-4 ${
                            sprinklerOn ? "text-sky-300" : "text-slate-500"
                          }`}
                          aria-hidden="true"
                        >
                          <path d="M12 2v4" />
                          <path d="M5 9h14" />
                          <path d="M7 9c0 3 2 5 5 5s5-2 5-5" />
                          <path d="M12 14v8" />
                        </svg>
                        {sprinklerOn && (
                          <>
                            <span
                              className="sprinkle-drop absolute left-[2px] top-3 w-[2px] h-[5px] rounded-full bg-sky-300"
                              style={{ animationDelay: "0s" }}
                            />
                            <span
                              className="sprinkle-drop absolute left-1/2 -translate-x-1/2 top-3 w-[2px] h-[5px] rounded-full bg-sky-300"
                              style={{ animationDelay: "0.3s" }}
                            />
                            <span
                              className="sprinkle-drop absolute right-[2px] top-3 w-[2px] h-[5px] rounded-full bg-sky-300"
                              style={{ animationDelay: "0.6s" }}
                            />
                          </>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-400">
                          Sprinklers
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            sprinklerOn ? "text-sky-300" : "text-slate-300"
                          }`}
                        >
                          {sprinklerOn ? "Active" : "Standby"}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSprinkler(zone)}
                      className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        sprinklerOn
                          ? "bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
                          : "bg-slate-700/60 text-slate-200 hover:bg-slate-600/60"
                      }`}
                    >
                      {sprinklerOn ? "Stop" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => placeCall("Manual call")}
            disabled={callState !== "idle"}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call Fire Department
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-800/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
              <h2 className="text-base font-semibold text-slate-100">
                Event Log
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                Latest {events.length}/{MAX_EVENTS}
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors"
            >
              Reset System
            </button>
          </div>

          <div className="h-56 overflow-y-auto rounded-lg border border-white/5 bg-slate-950/50 divide-y divide-white/5">
            {events.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 text-center">
                No events yet.
              </div>
            ) : (
              events.map((ev) => {
                const s = logLevelStyle(ev.level);
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full shrink-0 ${s.dot}`}
                    />
                    <span className="font-mono text-xs text-slate-500 shrink-0 tabular-nums">
                      {formatTime(ev.time)}
                    </span>
                    <span className={`flex-1 ${s.text}`}>{ev.message}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 text-xs text-slate-500 text-center">
          {dateString}
        </div>
      </div>

      {callState !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
            <div
              className={`px-6 py-5 text-center ${
                callState === "ringing"
                  ? "bg-gradient-to-br from-red-700 to-red-900"
                  : "bg-gradient-to-br from-emerald-700 to-emerald-900"
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-1">
                {callState === "ringing"
                  ? "Emergency Call — Ringing"
                  : "Emergency Call — Connected"}
              </div>
              <div className="text-xl font-semibold text-white">
                {FIRE_DEPT.name}
              </div>
              <div className="text-white/80 text-sm font-mono mt-1">
                {FIRE_DEPT.number}
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="relative mx-auto w-28 h-28 mb-5 flex items-center justify-center">
                {callState === "ringing" && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-red-400/60 ring-pulse" />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-red-400/60 ring-pulse"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </>
                )}
                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                    callState === "ringing"
                      ? "bg-red-600"
                      : "bg-emerald-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-9 h-9 text-white ${
                      callState === "ringing" ? "phone-shake" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
              </div>

              <div
                className={`text-sm font-semibold uppercase tracking-widest mb-4 ${
                  callState === "ringing"
                    ? "text-red-300"
                    : "text-emerald-300"
                }`}
              >
                {callState === "ringing"
                  ? "Ringing…"
                  : `In call · ${formatElapsed(callElapsed)}`}
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4 text-left mb-5">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                  Location relayed
                </div>
                <div className="text-sm text-slate-100 font-medium">
                  {location.facility}
                </div>
                <div className="text-sm text-slate-400 mt-0.5">
                  {location.address}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  {location.coords}
                </div>

                {alertingZones.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                      Affected zones
                    </div>
                    <div className="text-sm text-red-300 font-semibold">
                      {alertingZones.join(", ")}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={endCall}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-widest bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
