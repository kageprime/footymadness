"use client";

import { useEffect, useRef, useState } from "react";
import { simulateTie, type SimResult } from "@/lib/sim";
import { Pitch } from "@/components/game";

const SPEEDS = [1, 2, 8] as const;

function Replay({ result }: { result: SimResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const accRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(2);
  const frames = result.frames ?? [];
  const idxRef = useRef(0);
  idxRef.current = idx;

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      accRef.current += dt * 30 * speed; // 30 frames/sec at 1x
      const advance = Math.floor(accRef.current);
      if (advance > 0) {
        accRef.current -= advance;
        const next = Math.min(frames.length - 1, idxRef.current + advance);
        idxRef.current = next;
        setIdx(next);
        if (next >= frames.length - 1) {
          setPlaying(false);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed, frames]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 840, H = 544;
    const sx = W / 105, sy = H / 68;
    const f = frames[Math.min(idx, frames.length - 1)];
    ctx.fillStyle = "#0c150c";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#0e1a0e";
    for (let i = 0; i < 8; i++) ctx.fillRect(0, (H / 8) * i, W, H / 16);
    ctx.strokeStyle = "#33402f";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.beginPath();
    ctx.moveTo(W / 2, 8); ctx.lineTo(W / 2, H - 8);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(8, H / 2 - 110, 110, 220);
    ctx.strokeRect(W - 118, H / 2 - 110, 110, 220);
    for (let i = 0; i < f.p.length; i += 3) {
      const home = f.p[i + 2] === 1;
      ctx.beginPath();
      ctx.arc(f.p[i] * sx, f.p[i + 1] * sy, home ? 11 : 10, 0, Math.PI * 2);
      ctx.fillStyle = home ? "#E8C547" : "#EDF2E6";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0a120b";
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(f.b[0] * sx, f.b[1] * sy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0a120b";
    ctx.stroke();
  }, [idx, frames]);

  if (frames.length === 0) return null;
  const f = frames[Math.min(idx, frames.length - 1)];
  const minute = Math.min(90, Math.floor(f.t / 60));
  const hg = result.goals.filter((g) => g.side === "home" && g.t <= f.t).length;
  const ag = result.goals.filter((g) => g.side === "away" && g.t <= f.t).length;

  function jumpTo(t: number) {
    let lo = 0, hi = frames.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (frames[mid].t < t) lo = mid + 1;
      else hi = mid;
    }
    idxRef.current = lo;
    setIdx(lo);
  }

  return (
    <div className="border-t border-edge">
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <button
          onClick={() => { if (idx >= frames.length - 1) { idxRef.current = 0; setIdx(0); } setPlaying((p) => !p); }}
          aria-pressed={playing}
          aria-label={playing ? "pause replay" : "play replay"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm ${playing ? "bg-gold text-black" : "bg-chalk text-black hover:bg-gold"}`}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <span className="font-display text-xl tabular-nums">{hg}<span className="text-fog">–</span>{ag}</span>
        <span className="text-xs font-bold tabular-nums">{minute}&prime;</span>
        <span className="ml-auto flex gap-1">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s} className={`min-h-[32px] rounded-full px-2.5 text-xs font-black ${speed === s ? "bg-gold text-black" : "text-fog hover:text-gold"}`}>
              {s}x
            </button>
          ))}
        </span>
      </div>
      <div className="px-3 pt-1">
        <canvas ref={canvasRef} width={840} height={544} className="w-full rounded-lg border border-edge" aria-label="animated match replay" />
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <input
          type="range" min={0} max={frames.length - 1} value={idx}
          onChange={(e) => { const v = +e.target.value; idxRef.current = v; setIdx(v); setPlaying(false); }}
          aria-label="scrub replay" className="w-full accent-[#E8C547]"
        />
      </div>
      {result.goals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {result.goals.map((g, i) => (
            <button key={i} onClick={() => { jumpTo(g.start); setPlaying(true); }} className="rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-gold hover:bg-gold hover:text-black">
              {Math.floor(g.t / 60)}&prime; {g.side === "home" ? result.home.slice(0, 3).toUpperCase() : result.away.slice(0, 3).toUpperCase()} goal
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SimPanel({ home, away, seedBase }: { home: string; away: string; seedBase: number }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [minute, setMinute] = useState(0);
  const [result, setResult] = useState<SimResult | null>(null);
  const [openFeed, setOpenFeed] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [videoOpen]);

  async function run(seed: number) {
    setState("running");
    setMinute(0);
    setOpenFeed(false);
    // Let the progress UI paint before the engine takes the thread.
    await new Promise((r) => setTimeout(r, 60));
    try {
      const res = await simulateTie(home, away, seed, setMinute);
      setResult(res);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => run(seedBase)}
        className="mt-3 w-full min-h-[44px] rounded-xl bg-gold text-sm font-black text-black transition hover:brightness-110 active:scale-[0.99]"
      >
        Simulate this tie · FM engine (mock)
      </button>
    );
  }

  if (state === "running") {
    return (
      <div className="mt-3 rounded-xl border border-gold/40 bg-pitch p-3" role="status" aria-label="simulation running">
        <div className="flex justify-between text-xs font-bold">
          <span>Simulating… <b className="tabular-nums">{minute}&prime;</b></span>
          <span className="text-fog">agent engine · mock ratings</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge">
          <div className="h-full bg-gold transition-all" style={{ width: `${Math.min(100, (minute / 90) * 100)}%` }} />
        </div>
      </div>
    );
  }

  if (!result) return null;
  const s = result.stats;
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gold/40 bg-pitch">
      <div className="flex items-center gap-3 bg-black/40 px-3 py-2.5">
        <span className="font-display text-2xl tabular-nums">{result.homeGoals}<span className="text-fog">–</span>{result.awayGoals}</span>
        <span className="text-xs">
          <b>{result.headline}</b>
          <span className="block text-fog">SIM · seed {result.seed} · {(result.ms / 1000).toFixed(1)}s · mock, not a prediction</span>
        </span>
        <button onClick={() => run(Math.floor(Math.random() * 2000000000))} className="ml-auto min-h-[36px] shrink-0 rounded-full border border-edge px-3 text-xs font-bold hover:border-gold">
          Re-sim
        </button>
      </div>
      <p className="px-3 pt-2 text-xs leading-relaxed text-zinc-300">{result.summary}</p>
      {/* Video thumbnail — play opens the full replay view */}
      <div className="px-3 pt-2">
        <button
          onClick={() => setVideoOpen(true)}
          className="group relative block w-full overflow-hidden rounded-xl border border-edge text-left hover:border-gold"
          aria-haspopup="dialog"
        >
          <span className="pointer-events-none block opacity-80"><Pitch clash /></span>
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-lg text-black transition group-hover:scale-105">▶</span>
            <span className="rounded bg-black/80 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-gold">
              Watch replay · {result.homeGoals}–{result.awayGoals}
            </span>
          </span>
        </button>
      </div>
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`replay ${result.home} versus ${result.away}`}>
          <button onClick={() => setVideoOpen(false)} aria-label="close replay" className="absolute inset-0 cursor-default bg-black/85" />
          <div className="relative max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-gold/40 bg-pitch">
            <div className="sticky top-0 flex items-center gap-3 border-b border-edge bg-pitch/95 px-4 py-3 backdrop-blur">
              <span className="font-display text-2xl tabular-nums">{result.homeGoals}<span className="text-fog">–</span>{result.awayGoals}</span>
              <span className="text-xs"><b>{result.headline}</b><span className="block text-fog">SIM replay · seed {result.seed} · mock</span></span>
              <button onClick={() => setVideoOpen(false)} className="ml-auto min-h-[40px] min-w-[40px] rounded-full border border-edge text-base font-bold hover:border-gold" aria-label="close">✕</button>
            </div>
            <div className="p-3 sm:p-4">
              <Replay result={result} />
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-1.5 px-3 py-2 text-center text-[11px] sm:grid-cols-6">
        {[["Shots", s.shots], ["Saves", s.saves], ["Corners", s.corners], ["Fouls", s.fouls], ["Yellows", s.yellows], ["Reds", s.reds]].map(([l, v]) => (
          <div key={l as string} className="rounded-lg bg-edge/50 px-1 py-1.5">
            <div className="font-display text-lg tabular-nums text-gold">{v}</div>
            <div className="uppercase tracking-wider text-fog">{l}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setOpenFeed((o) => !o)} aria-expanded={openFeed} className="w-full border-t border-edge px-3 py-2 text-left text-xs font-bold text-gold">
        {openFeed ? "Hide minute feed" : `Show minute feed (${result.feed.length} lines)`}
      </button>
      {openFeed && (
        <ol className="max-h-64 space-y-1 overflow-y-auto border-t border-edge px-3 py-2 text-xs">
          {result.feed.map((l, i) => (
            <li key={i} className={l.big ? "font-bold text-chalk" : "text-zinc-400"}>{l.text}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
