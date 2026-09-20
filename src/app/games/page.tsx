"use client";

import { useState } from "react";
import { gameFixtures, predictorBoard, shootoutBoard, GAME_RULES } from "@/lib/games";
import { Crest } from "@/components/game";

const ZONES = ["TL", "TC", "TR", "BL", "BC", "BR"] as const;
type Zone = (typeof ZONES)[number];
const RESULTS: Record<string, "H" | "D" | "A"> = { g1: "H", g2: "H", g3: "A" };

function Shootout() {
  const [kicks, setKicks] = useState<{ aim: Zone; keeper: Zone; goal: boolean }[]>([]);
  const [keeper, setKeeper] = useState<Zone | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const done = kicks.length >= 5;
  const goals = kicks.filter((k) => k.goal).length;

  function shoot(aim: Zone) {
    if (done) return;
    const k = ZONES[Math.floor(Math.random() * ZONES.length)];
    setKeeper(k);
    const topBins = aim === "TL" || aim === "TR";
    const goal = k === aim ? Math.random() < (topBins ? 0.45 : 0.15) : true;
    setKicks((ks) => [...ks, { aim, keeper: k, goal }]);
    setFlash(goal ? "GOAL" : "SAVED");
    setTimeout(() => setFlash(null), 900);
  }

  function reset() {
    setKicks([]);
    setKeeper(null);
  }

  return (
    <section className="rounded-2xl border border-edge bg-card p-4 sm:p-5" aria-label="penalty shootout game">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl uppercase">Penalty shootout <span className="text-gold">· best of 5</span></h2>
        <p className="text-sm font-bold tabular-nums">{goals}/{kicks.length} <span className="text-fog">scored</span></p>
      </div>
      {/* Goal */}
      <div className="relative mx-auto mt-3 max-w-md overflow-hidden rounded-lg border-4 border-chalk/80" style={{ aspectRatio: "3/1.4", background: "repeating-linear-gradient(0deg,#0d170d 0 8px,#101d10 8px 16px),repeating-linear-gradient(90deg,transparent 0 12px,rgba(255,255,255,.06) 12px 13px)" }}>
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/90 text-center text-[10px] font-black leading-10 text-black" style={{ transform: `translate(calc(-50% + ${(keeper ? ZONES.indexOf(keeper) % 3 - 1 : 0) * 70}px), calc(-50% + ${(keeper && ZONES.indexOf(keeper) > 2 ? 18 : -10)}px))`, transition: "transform .3s" }}>GK</span>
        {flash && <span className={`absolute inset-0 flex items-center justify-center font-display text-5xl ${flash === "GOAL" ? "text-gold" : "text-chalk"}`}>{flash}</span>}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
          {ZONES.map((z) => (
            <button key={z} onClick={() => shoot(z)} disabled={done} aria-label={`shoot ${z}`} className="border border-white/10 text-[10px] font-bold text-white/0 hover:bg-gold/30 hover:text-black disabled:cursor-default">
              {z}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex gap-1.5" aria-label="kick history">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border border-edge text-sm ${kicks[i] ? (kicks[i].goal ? "bg-gold text-black" : "bg-red-500/80 text-black") : "text-fog"}`}>
              {kicks[i] ? (kicks[i].goal ? "⚽" : "🧤") : i + 1}
            </span>
          ))}
        </div>
        {done ? (
          <span className="ml-auto flex items-center gap-2 text-sm font-bold">
            {goals >= 3 ? "Clinical. The hall salutes you." : goals === 2 ? "Mid-table finishing." : "Sunday league. Run it back."}
            <button onClick={reset} className="min-h-[40px] rounded-full bg-gold px-4 text-xs font-black text-black">Shoot again</button>
          </span>
        ) : (
          <span className="ml-auto text-xs text-fog">Pick a corner — keeper reads you sometimes.</span>
        )}
      </div>
      <div className="mt-3 border-t border-edge pt-2 text-xs text-fog">
        <b className="text-chalk">Top bins (mock):</b> {shootoutBoard.map((r) => `${r.name} ${r.pts}/5`).join(" · ")}
        {done && goals >= 4 && <b className="text-gold"> · YOU {goals}/5 — badge: Penalty Merchant</b>}
      </div>
    </section>
  );
}

function Predictor() {
  const [picks, setPicks] = useState<Record<string, "H" | "D" | "A">>({});
  const [submitted, setSubmitted] = useState(false);
  const pts = submitted ? gameFixtures.filter((f) => picks[f.id] === RESULTS[f.id]).length * 3 : 0;
  const rank = submitted ? predictorBoard.filter((r) => r.pts > pts).length + 1 : null;

  return (
    <section className="rounded-2xl border border-edge bg-card p-4 sm:p-5" aria-label="weekend predictor game">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl uppercase">Weekend predictor <span className="text-gold">· 3 pts a tie</span></h2>
        {submitted && <p className="text-sm font-bold tabular-nums">{pts} pts · <span className="text-gold">P{rank}</span></p>}
      </div>
      <div className="mt-3 divide-y divide-edge/70 border-y border-edge">
        {gameFixtures.map((f) => (
          <div key={f.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Crest code={f.home} size={20} /> {f.home} <span className="font-normal text-fog">vs</span> {f.away} <Crest code={f.away} size={20} />
              <span className="text-xs font-normal text-fog">{f.kickoff}</span>
            </div>
            <div className="flex gap-1.5">
              {(["H", "D", "A"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => !submitted && setPicks((p) => ({ ...p, [f.id]: o }))}
                  aria-pressed={picks[f.id] === o}
                  disabled={submitted}
                  className={`min-h-[40px] min-w-[52px] rounded-full px-3 text-xs font-black transition ${picks[f.id] === o ? "bg-gold text-black" : "border border-edge text-zinc-300 hover:border-gold"} ${submitted && RESULTS[f.id] === o ? "outline outline-2 outline-gold" : ""}`}
                >
                  {o === "H" ? "Home" : o === "D" ? "Draw" : "Away"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {!submitted ? (
          <button onClick={() => setSubmitted(true)} disabled={Object.keys(picks).length < 3} className="min-h-[44px] rounded-full bg-gold px-6 text-sm font-black text-black disabled:opacity-40">
            Lock picks {Object.keys(picks).length}/3
          </button>
        ) : (
          <span className="flex items-center gap-2 text-sm">
            Locked: {pts}/9 — {pts === 9 ? "perfect week, hall of fame." : pts >= 6 ? "top-half banter secured." : "the group chat is laughing."}
            <button onClick={() => { setSubmitted(false); setPicks({}); }} className="min-h-[40px] rounded-full border border-edge px-4 text-xs font-bold hover:border-gold">Replay</button>
          </span>
        )}
        <span className="ml-auto hidden text-xs text-fog sm:block">Board: {predictorBoard.slice(0, 3).map((r) => `${r.name} ${r.pts}`).join(" · ")}</span>
      </div>
    </section>
  );
}

export default function GamesPage() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Games room · just for fun · no stakes</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Play for bragging rights.</h1>
        <p className="mt-2 max-w-prose text-[15px] text-zinc-300">Two mock games between fans. Points reset, badges don&apos;t pay rent.</p>
      </div>
      <Shootout />
      <Predictor />
      <section className="rounded-2xl border border-edge bg-card p-4 text-xs text-fog" aria-label="fair play rules">
        <p className="font-bold uppercase tracking-widest text-chalk">House rules — fun only</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {GAME_RULES.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>
    </main>
  );
}
