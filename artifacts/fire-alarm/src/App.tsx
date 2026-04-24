function App() {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-2xl p-10 text-center">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 mb-8">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Fire Alarm System
        </div>

        <div className="relative mx-auto mb-8 w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="absolute inset-2 rounded-full border border-emerald-400/30" />
          <div className="absolute inset-6 rounded-full border border-emerald-400/40" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.5)]">
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
          </div>
        </div>

        <div className="text-sm uppercase tracking-widest text-slate-400 mb-2">
          Current Status
        </div>
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-emerald-400 mb-4">
          SAFE
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto mb-8">
          All sensors are reporting normal conditions. No smoke, heat, or fault
          signals detected.
        </p>

        <div className="grid grid-cols-3 gap-3 text-left">
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Smoke
            </div>
            <div className="text-emerald-400 font-semibold mt-1">Clear</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Heat
            </div>
            <div className="text-emerald-400 font-semibold mt-1">Normal</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Power
            </div>
            <div className="text-emerald-400 font-semibold mt-1">Online</div>
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
