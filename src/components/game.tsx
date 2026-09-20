const hues: Record<string, string> = {
  LIV: "#C8102E", CRY: "#1B458F", MCI: "#6CABDD", EVE: "#003399",
  BRE: "#E30613", TOT: "#132257", ARS: "#EF0107", NEW: "#241F20",
  CHE: "#034694", MUN: "#DA291C",
};

export function Crest({ code, size = 40 }: { code: string; size?: number }) {
  const c = hues[code.slice(0, 3).toUpperCase()] ?? "#2c3a2c";
  const initials = code.slice(0, 3).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center font-display"
      style={{
        width: size, height: size + 6,
        background: c,
        color: "#fff",
        fontSize: size * 0.32,
        clipPath: "polygon(50% 0, 100% 12%, 100% 62%, 50% 100%, 0 62%, 0 12%)",
      }}
    >
      {initials}
    </span>
  );
}

export function Scorebug({ home, away, hs, as, min, live = true }: { home: string; away: string; hs: number; as: number; min: string; live?: boolean }) {
  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-md border border-edge bg-black font-bold text-[13px]">
      <span className="flex items-center gap-1.5 bg-gold px-2 py-1 text-black tabular-nums">
        {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-700" />}
        {min}
      </span>
      <span className="flex items-center gap-2 px-2.5 py-1 text-chalk tabular-nums">
        <Crest code={home} size={18} /> {home} {hs}-{as} {away} <Crest code={away} size={18} />
      </span>
    </div>
  );
}

export function Pitch({ clash = false, tall = false }: { clash?: boolean; tall?: boolean }) {
  return (
    <svg viewBox="0 0 200 130" className={`w-full border border-edge bg-[#0c150c] ${tall ? "rounded-lg" : "rounded-lg"}`} aria-hidden="true">
      <rect x="6" y="6" width="188" height="118" fill="none" stroke="#33402f" strokeWidth="1.5" />
      <line x1="100" y1="6" x2="100" y2="124" stroke="#33402f" strokeWidth="1.5" />
      <circle cx="100" cy="65" r="14" fill="none" stroke="#33402f" strokeWidth="1.5" />
      <circle cx="100" cy="65" r="2" fill="#33402f" />
      <rect x="6" y="40" width="30" height="50" fill="none" stroke="#33402f" strokeWidth="1.5" />
      <rect x="164" y="40" width="30" height="50" fill="none" stroke="#33402f" strokeWidth="1.5" />
      <g fill="#E8C547">
        <circle cx="58" cy="42" r="4" /><circle cx="58" cy="65" r="4" /><circle cx="58" cy="88" r="4" />
        <circle cx="82" cy="53" r="4" /><circle cx="82" cy="77" r="4" />
      </g>
      <g fill="#EDF2E6">
        <circle cx="142" cy="47" r="3.5" /><circle cx="142" cy="65" r="3.5" /><circle cx="142" cy="83" r="3.5" />
        <circle cx="162" cy="56" r="3.5" /><circle cx="162" cy="74" r="3.5" />
      </g>
      {clash && <ellipse cx="112" cy="65" rx="24" ry="28" fill="none" stroke="#E8C547" strokeWidth="1.5" strokeDasharray="4 3" />}
    </svg>
  );
}

export function Meter({ v, gold = false }: { v: number; gold?: boolean }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-edge">
      <div className={`h-full ${gold ? "bg-gold" : "bg-chalk"}`} style={{ width: `${v}%` }} />
    </div>
  );
}
