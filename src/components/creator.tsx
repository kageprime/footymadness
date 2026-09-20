"use client";

import { useMemo, useState } from "react";
import { mockXI, type MockPlayer } from "@/lib/football";

type FormationKey = "4-3-3" | "4-2-3-1" | "3-5-2";

const SHAPES: Record<FormationKey, { label: string; slots: [number, number][] }> = {
  "4-3-3": { label: "4-3-3 Attack", slots: [[50, 92], [15, 72], [38, 74], [62, 74], [85, 72], [30, 52], [50, 55], [70, 52], [18, 28], [50, 24], [82, 28]] },
  "4-2-3-1": { label: "4-2-3-1 Control", slots: [[50, 92], [15, 72], [38, 74], [62, 74], [85, 72], [38, 60], [62, 60], [22, 42], [50, 40], [78, 42], [50, 24]] },
  "3-5-2": { label: "3-5-2 Overload", slots: [[50, 92], [28, 72], [50, 74], [72, 72], [12, 52], [35, 50], [50, 54], [65, 50], [88, 52], [38, 26], [62, 26]] },
};

const KITS: Record<string, { bg: string; fg: string; label: string }> = {
  LIV: { bg: "#C8102E", fg: "#FFFFFF", label: "Anfield red" },
  MCI: { bg: "#6CABDD", fg: "#0A120B", label: "Sky" },
  ARS: { bg: "#EF0107", fg: "#FFFFFF", label: "Cannon red" },
  MUN: { bg: "#DA291C", fg: "#FFFFFF", label: "Devil red" },
  NEW: { bg: "#241F20", fg: "#FFFFFF", label: "Magpie" },
};

const RATINGS: Record<number, number> = { 1: 89, 2: 84, 3: 90, 4: 81, 5: 84, 6: 84, 7: 86, 8: 83, 9: 91, 10: 84, 11: 82, 12: 79, 13: 82, 14: 83 };

export default function DugoutBuilder() {
  const [formation, setFormation] = useState<FormationKey>("4-3-3");
  const [kit, setKit] = useState<keyof typeof KITS>("LIV");
  const [ids, setIds] = useState<number[]>(mockXI.slice(0, 11).map((p) => p.id));
  const [selected, setSelected] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [mentality, setMentality] = useState<"Cautious" | "Balanced" | "Attacking">("Balanced");
  const [tempo, setTempo] = useState(2);
  const [pressing, setPressing] = useState(3);

  const byId = useMemo(() => new Map(mockXI.map((p) => [p.id, p])), []);
  const xi: MockPlayer[] = ids.map((id) => byId.get(id)!);
  const bench = mockXI.filter((p) => !ids.includes(p.id));
  const avg = Math.round(xi.reduce((s, p) => s + (RATINGS[p.id] ?? 80), 0) / 11);
  const slots = SHAPES[formation].slots;

  function tapSlot(i: number) {
    const id = ids[i];
    if (selected === null) return setSelected(id);
    if (selected === id) return setSelected(null);
    const next = [...ids];
    const a = next.indexOf(selected);
    if (a === -1) {
      // selected is a bench player — sub in
      next[i] = selected;
    } else {
      [next[a], next[i]] = [next[i], next[a]];
    }
    setIds(next);
    setSelected(null);
  }

  function tapBench(id: number) {
    setSelected((s) => (s === id ? null : id));
  }

  async function copyXI() {
    const lines = [`FootyMadness XI · ${formation} · ${mentality} · ${kit}`, `Tempo ${tempo}/4 · Press ${pressing}/4`, ...xi.map((p, i) => `${i + 1}. ${p.name} #${p.shirtNumber} (${RATINGS[p.id] ?? 80})`)];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const k = KITS[kit];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      {/* Pitch */}
      <div className="rounded-2xl border border-edge bg-card p-3">
        <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
          {(Object.keys(SHAPES) as FormationKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              aria-pressed={formation === f}
              className={`min-h-[40px] rounded-full px-4 text-xs font-bold transition ${formation === f ? "bg-gold text-black" : "border border-edge text-zinc-300 hover:border-gold"}`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-fog">Tap a shirt, tap a slot to swap · <b className="text-gold">AVG {avg}</b></span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-edge" style={{ aspectRatio: "4/5", background: "repeating-linear-gradient(0deg,#0d170d 0 32px,#0f1a0f 32px 64px)" }}>
          <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <rect x="4" y="4" width="92" height="117" fill="none" stroke="#33402f" strokeWidth="0.8" />
            <line x1="4" y1="62.5" x2="96" y2="62.5" stroke="#33402f" strokeWidth="0.8" />
            <circle cx="50" cy="62.5" r="9" fill="none" stroke="#33402f" strokeWidth="0.8" />
            <rect x="30" y="4" width="40" height="14" fill="none" stroke="#33402f" strokeWidth="0.8" />
            <rect x="30" y="107" width="40" height="14" fill="none" stroke="#33402f" strokeWidth="0.8" />
          </svg>
          {slots.map(([x, y], i) => {
            const p = xi[i];
            const active = selected === p.id;
            return (
              <button
                key={`${formation}-${p.id}`}
                onClick={() => tapSlot(i)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={`${p.name} slot ${i + 1}`}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-black tabular-nums"
                  style={{ background: k.bg, color: k.fg, outline: active ? "3px solid #E8C547" : "2px solid rgba(0,0,0,.55)", outlineOffset: 1 }}
                >
                  {p.shirtNumber}
                </span>
                <span className={`max-w-[86px] truncate rounded px-1 text-[10px] font-bold ${active ? "bg-gold text-black" : "bg-black/70 text-chalk"}`}>
                  {p.name} · {RATINGS[p.id] ?? 80}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 px-1 pt-3">
          {Object.entries(KITS).map(([code, v]) => (
            <button
              key={code}
              onClick={() => setKit(code as keyof typeof KITS)}
              aria-pressed={kit === code}
              title={v.label}
              className="flex min-h-[40px] items-center gap-2 rounded-full border border-edge px-3 text-xs font-bold hover:border-gold"
            >
              <span className="h-4 w-4 rounded-full" style={{ background: v.bg }} />
              {code}
            </button>
          ))}
          <span className="ml-auto flex gap-2">
            <button onClick={() => { setIds(mockXI.slice(0, 11).map((p) => p.id)); setSelected(null); }} className="min-h-[40px] rounded-full border border-edge px-4 text-xs font-bold hover:border-gold">Reset</button>
            <button onClick={copyXI} className="min-h-[40px] rounded-full bg-gold px-4 text-xs font-black text-black">{copied ? "Copied" : "Copy XI"}</button>
          </span>
        </div>
        {/* Team instructions — FM style, mock */}
        <div className="mx-1 mt-3 grid gap-2 rounded-xl border border-edge bg-pitch p-3 text-xs sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-fog">Mentality</p>
            <div className="mt-1.5 flex gap-1">
              {(["Cautious", "Balanced", "Attacking"] as const).map((m) => (
                <button key={m} onClick={() => setMentality(m)} aria-pressed={mentality === m} className={`min-h-[36px] flex-1 rounded-full px-2 font-bold ${mentality === m ? "bg-gold text-black" : "border border-edge text-zinc-300 hover:border-gold"}`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-fog">Tempo · {tempo}/4</p>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4].map((t) => (
                <button key={t} onClick={() => setTempo(t)} aria-pressed={tempo === t} aria-label={`tempo ${t}`} className={`h-9 flex-1 rounded ${tempo >= t ? "bg-gold" : "bg-edge"}`} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-fog">Pressing · {pressing}/4</p>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4].map((t) => (
                <button key={t} onClick={() => setPressing(t)} aria-pressed={pressing === t} aria-label={`pressing ${t}`} className={`h-9 flex-1 rounded ${pressing >= t ? "bg-chalk" : "bg-edge"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Squad list */}
      <div className="rounded-2xl border border-edge bg-card">
        <p className="border-b border-edge px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-fog">
          {SHAPES[formation].label} · {kit} kit · {mentality} · tap to sub
        </p>
        <div className="divide-y divide-edge/70">
          {xi.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="w-6 font-display text-base tabular-nums text-zinc-500">{i + 1}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black" style={{ background: k.bg, color: k.fg }}>{p.shirtNumber}</span>
              <button onClick={() => tapSlot(i)} className={`font-bold hover:text-gold ${selected === p.id ? "text-gold" : ""}`}>{p.name}</button>
              <span className="text-xs capitalize text-fog">{p.positionType}</span>
              <span className="ml-auto font-bold tabular-nums text-gold">{RATINGS[p.id] ?? 80}</span>
            </div>
          ))}
        </div>
        <p className="border-t border-edge px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-fog">Subs · tap then tap a slot</p>
        <div className="divide-y divide-edge/70">
          {bench.map((p) => (
            <button key={p.id} onClick={() => tapBench(p.id)} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-moss/50 ${selected === p.id ? "bg-gold/10" : ""}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black" style={{ background: k.bg, color: k.fg }}>{p.shirtNumber}</span>
              <span className="font-bold text-sm">{p.name}</span>
              <span className="text-xs capitalize text-fog">{p.positionType}</span>
              <span className="ml-auto font-display text-lg tabular-nums text-gold">{RATINGS[p.id] ?? 80}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
