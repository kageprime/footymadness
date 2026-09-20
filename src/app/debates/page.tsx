"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { debates } from "@/lib/mock";
import { Crest } from "@/components/game";

type Kind = "all" | "audio" | "video" | "text";

function Wave({ seed, hot }: { seed: number; hot?: boolean }) {
  const bars = useMemo(
    () => Array.from({ length: 36 }, (_, i) => 20 + Math.abs(Math.sin(i * 1.7 + seed) * 70 + Math.cos(i * 0.6 + seed) * 20)),
    [seed]
  );
  return (
    <span className="flex h-9 flex-1 items-center gap-[2px]" aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} className={`w-[3px] rounded-full ${hot && i < 10 ? "bg-gold" : "bg-chalk/70"}`} style={{ height: `${Math.min(100, h)}%` }} />
      ))}
    </span>
  );
}

export default function DebatesPage() {
  const [club, setClub] = useState("All clubs");
  const [kind, setKind] = useState<Kind>("all");
  const [playing, setPlaying] = useState<string | null>(null);

  const clubs = useMemo(() => ["All clubs", ...Array.from(new Set(debates.map((d) => d.club)))], []);
  const feed = debates
    .filter((d) => (club === "All clubs" ? true : d.club === club || d.rivalClub === club))
    .filter((d) => (kind === "all" ? true : d.kind === kind))
    .sort((a, b) => b.heat - a.heat);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Fan hall · every club welcome · mock</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Bring the argument here.</h1>
        <p className="mt-2 max-w-prose text-[15px] text-zinc-300">
          The Twitter/TikTok shouting, siphoned into one dugout. Text, voice notes, fan cams — filtered by club, ranked by heat.
        </p>
      </div>

      {/* Composer mock */}
      <div className="rounded-2xl border border-edge bg-card p-4">
        <div className="flex items-center gap-3">
          <Crest code="YOU" size={30} />
          <p className="flex-1 rounded-full border border-edge bg-pitch px-4 py-2.5 text-sm text-fog">Settle it: your club, your take… (posting unlocks after mock auth)</p>
        </div>
        <div className="mt-3 flex gap-2 text-xs font-bold">
          {(["text", "audio", "video"] as const).map((k) => (
            <span key={k} className="rounded-full border border-edge px-3 py-1.5 uppercase tracking-widest text-fog">{k === "text" ? "Write" : k === "audio" ? "Voice note" : "Fan cam"}</span>
          ))}
          <span className="ml-auto rounded-full bg-gold px-4 py-1.5 font-black uppercase tracking-widest text-black opacity-50">Post · mock</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {clubs.map((c) => (
          <button key={c} onClick={() => setClub(c)} aria-pressed={club === c} className={`min-h-[40px] rounded-full px-4 text-xs font-bold transition ${club === c ? "bg-gold text-black" : "border border-edge text-zinc-300 hover:border-gold"}`}>
            {c}
          </button>
        ))}
        <span className="mx-1 hidden h-6 w-px self-center bg-edge sm:block" />
        {(["all", "audio", "video", "text"] as Kind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`min-h-[40px] rounded-full px-4 text-xs font-bold uppercase tracking-widest transition ${kind === k ? "bg-chalk text-black" : "border border-edge text-zinc-400 hover:border-chalk"}`}>
            {k}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex flex-col">
        {feed.map((d, i) => (
          <article key={d.id} className="grid gap-3 border-t border-edge py-5 last:border-b sm:grid-cols-[56px_1fr] sm:gap-4">
            <div className="hidden sm:block">
              <p className="font-display text-3xl tabular-nums text-gold">{d.heat}</p>
              <p className="text-[10px] uppercase tracking-widest text-fog">heat</p>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Crest code={d.club} size={20} />
                <b>{d.club}</b>
                {d.rivalClub && <span className="text-fog">vs <b className="text-chalk">{d.rivalClub}</b></span>}
                <span className="text-fog">· {d.author} · {d.time}</span>
                <span className="ml-auto rounded-full border border-edge px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-fog">{d.tag}</span>
                <span className="rounded-full bg-gold/15 border border-gold/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-gold">{d.kind}</span>
              </div>
              <h2 className="mt-1.5 text-lg font-bold leading-snug sm:text-xl"><Link href={`/debates/${d.id}`} className="hover:text-gold">#{i + 1} {d.title}</Link></h2>
              <p className="mt-1 max-w-prose text-sm text-zinc-300">{d.body}</p>

              {d.kind === "audio" && (
                <button onClick={() => setPlaying((p) => (p === d.id ? null : d.id))} className="mt-3 flex w-full max-w-xl items-center gap-3 rounded-xl border border-edge bg-pitch px-3 py-2 text-left hover:border-gold">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${playing === d.id ? "bg-gold text-black" : "bg-chalk text-black"}`}>{playing === d.id ? "❚❚" : "▶"}</span>
                  <Wave seed={d.seconds ?? 40} hot={playing === d.id} />
                  <span className="shrink-0 text-xs font-bold tabular-nums">{playing === d.id ? "playing…" : d.duration}</span>
                </button>
              )}

              {d.kind === "video" && (
                <button onClick={() => setPlaying((p) => (p === d.id ? null : d.id))} className="group mt-3 flex w-full max-w-xl items-center gap-3 rounded-xl border border-edge bg-pitch p-2 text-left hover:border-gold">
                  <span className="relative block h-16 w-28 shrink-0 overflow-hidden rounded-lg" style={{ background: "repeating-linear-gradient(90deg,#0d170d 0 10px,#102010 10px 20px)" }}>
                    <span className="absolute inset-0 flex items-center justify-center"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${playing === d.id ? "bg-gold text-black" : "bg-chalk/90 text-black"}`}>{playing === d.id ? "❚❚" : "▶"}</span></span>
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-bold tabular-nums">{d.duration}</span>
                  </span>
                  <span className="text-xs text-zinc-300">Fan cam · {d.club} end · {playing === d.id ? "playing preview…" : "tap to preview (mock)"}</span>
                </button>
              )}

              <div className="mt-2.5 flex gap-4 text-xs font-bold text-fog">
                <span><b className="text-chalk tabular-nums">{d.likes.toLocaleString()}</b> ratings</span>
                <span><b className="text-chalk tabular-nums">{d.replies}</b> replies</span>
                <span className="ml-auto text-gold"><Link href={`/debates/${d.id}`}>Join the argument →</Link></span>
              </div>
            </div>
          </article>
        ))}
        {feed.length === 0 && <p className="border-y border-edge py-8 text-center text-sm text-fog">Quiet stand. Pick another club.</p>}
      </div>
    </main>
  );
}
