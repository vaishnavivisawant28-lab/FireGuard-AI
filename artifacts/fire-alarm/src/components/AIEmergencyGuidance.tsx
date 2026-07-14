/** Shown automatically during FIRE ALERT — smart, static-first emergency guidance */

interface Props {
  alertingZones: string[];
  smoke: number;
  temperature: number;
  power: string;
  occupants: { humans: number; pets: number };
}

export default function AIEmergencyGuidance({ alertingZones, smoke, temperature, power, occupants }: Props) {
  const needsElectrical = temperature > 60 || power === "shutting-down" || power === "offline";
  const hasOccupants = occupants.humans + occupants.pets > 0;

  const extinguisherType =
    temperature > 70 ? "CO₂ or Dry Powder (Class B/C)"
    : smoke > 70 ? "Water or Foam (Class A)"
    : "ABC Dry Powder (all-purpose)";

  return (
    <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-5 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold text-red-300 uppercase tracking-wider">Smart Emergency Guidance</div>
          <div className="text-[10px] text-slate-500">FireGuard AI · Zones: {alertingZones.join(", ")}</div>
        </div>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 fire-blink">
          ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {/* Evacuation */}
        <GuidanceCard
          icon="🚪"
          title="Evacuation Instructions"
          color="red"
          items={[
            `Evacuate ${alertingZones.join(" and ")} immediately`,
            "Use nearest stairwell — do NOT use elevators",
            "Stay low (below 1m) if smoke is present in corridors",
            "Close doors behind you to contain fire spread",
            hasOccupants
              ? `Assist ${occupants.humans} person(s) and ${occupants.pets} animal(s) detected in affected zones`
              : "Confirm all zones are clear before exiting building",
            "Assemble at designated muster point — do NOT re-enter",
          ]}
        />

        {/* Fire Extinguisher */}
        <GuidanceCard
          icon="🧯"
          title="Fire Extinguisher Guidance"
          color="orange"
          items={[
            `Recommended type: ${extinguisherType}`,
            "Only attempt if fire is small and contained",
            "PASS: Pull pin → Aim at base → Squeeze handle → Sweep side to side",
            `Current readings: Smoke ${smoke}% · Temp ${temperature}°C — ${smoke > 70 || temperature > 60 ? "DO NOT attempt — evacuate now" : "extinguisher use may be viable"}`,
          ]}
        />

        {/* Emergency contacts */}
        <GuidanceCard
          icon="📞"
          title="Emergency Contact Guidance"
          color="amber"
          items={[
            "911 call is being placed automatically",
            "Relay: zone locations, occupant count, smoke/heat levels",
            "Designate one person to meet fire services at entrance",
            "Do not disconnect the emergency call until instructed",
          ]}
        />

        {/* Electrical */}
        {needsElectrical && (
          <GuidanceCard
            icon="⚡"
            title="Electrical Shutdown Recommendations"
            color="yellow"
            items={[
              power === "offline" ? "✓ Building mains power has been automatically cut" :
              power === "shutting-down" ? "⏳ Automatic power shutoff is in progress…" :
              "Manually shut off mains power at the electrical panel",
              "Do not touch electrical panels if flooded or near flames",
              "Avoid areas with sparking wires or burning electrical smell",
              "Notify fire services of any known electrical hazards",
            ]}
          />
        )}
      </div>
    </div>
  );
}

function GuidanceCard({ icon, title, color, items }: { icon: string; title: string; color: string; items: string[] }) {
  const colors: Record<string, string> = {
    red: "border-red-500/20 text-red-400",
    orange: "border-orange-500/20 text-orange-400",
    amber: "border-amber-500/20 text-amber-400",
    yellow: "border-yellow-500/20 text-yellow-400",
  };
  return (
    <div className={`rounded-xl border ${colors[color]?.split(" ")[0] ?? "border-white/10"} bg-slate-900/50 px-4 py-3`}>
      <div className={`text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5 font-semibold ${colors[color]?.split(" ")[1] ?? "text-slate-400"}`}>
        <span>{icon}</span> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
            <span className="text-slate-500 shrink-0 mt-0.5">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
