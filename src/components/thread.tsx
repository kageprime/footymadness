"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { debates, repliesFor, type Debate, type Reply } from "@/lib/mock";
import { Crest } from "@/components/game";

type Sort = "hot" | "top" | "new";

function Wave({ seed, hot }: { seed: number; hot?: boolean }) {
  const bars = useMemo(
    () => Array.from({ length: 48 }, (_, i) => 20 + Math.abs(Math.sin(i * 1.7 + seed) * 70 + Math.cos(i * 0.6 + seed) * 20)),
    [seed]
  );
  return (
    <span className="flex h-12 flex-1 items-center gap-[3px]" aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} className={`w-1 rounded-full ${hot && i < 14 ? "bg-gold" : "bg-chalk/70"}`} style={{ height: `${Math.min(100, h)}%` }} />
      ))}
    </span>
  );
}

function Votes({ base, id }: { base: number; id: string }) {
  const [v, setV] = useState<0 | 1 | -1>(0);
  return (
    <span className="flex shrink-0 flex-col items-center gap-0.5" aria-label={`votes for ${id}`}>
      <button onClick={() => setV((x) => (x === 1 ? 0 : 1))} aria-pressed={v === 1} aria-label="upvote" className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${v === 1 ? "bg-gold text-black" : "text-fog hover:bg-moss hover:text-gold"}`}>▲</button>
      <b className={`text-sm tabular-nums ${v === 1 ? "text-gold" : v === -1 ? "text-red-400" : "text-chalk"}`}>{(base + v).toLocaleString()}</b>
      <button onClick={() => setV((x) => (x === -1 ? 0 : -1))} aria-pressed={v === -1} aria-label="downvote" className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${v === -1 ? "bg-red-500 text-black" : "text-fog hover:bg-moss hover:text-red-400"}`}>▼</button>
    </span>
  );
}

function Comment({ r, depth = 0 }: { r: Reply; depth?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={depth > 0 ? "ml-3 border-l-2 border-edge pl-3 sm:ml-5" : ""}>
      <div className="flex gap-2.5 py-3">
        <Votes base={r.votes} id={r.id} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-xs">
            <Crest code={r.club} size={16} />
            <b>{r.club}</b><span className="text-fog">· {r.author} · {r.time}</span>
            {r.kind && r.kind !== "text" && <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-gold">{r.kind} {r.duration}</span>}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-200">{r.body}</p>
          <div className="mt-1.5 flex gap-3 text-xs font-bold text-fog">
            <button className="hover:text-gold">Reply (mock)</button>
            <button className="hover:text-gold">Share</button>
            {r.children && (
              <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="hover:text-gold">
                {open ? `Hide ${r.children.length} ${r.children.length === 1 ? "reply" : "replies"}` : `Show ${r.children.length} ${r.children.length === 1 ? "reply" : "replies"}`}
              </button>
            )}
          </div>
          {open && r.children && <div className="mt-1">{r.children.map((c) => <Comment key={c.id} r={c} depth={depth + 1} />)}</div>}
        </div>
      </div>
    </div>
  );
}

export default function ThreadView({ debate }: { debate: Debate }) {
  const [sort, setSort] = useState<Sort>("hot");
  const [playing, setPlaying] = useState(false);
  const replies = useMemo(() => {
    const base = repliesFor(debate.id);
    const flat = (rs: Reply[]): Reply[] => rs.flatMap((r) => [r, ...(r.children ? flat(r.children) : [])]);
    if (sort === "top") return [...base].sort((a, b) => b.votes - a.votes);
    if (sort === "new") return [...base].reverse();
    return base;
    void flat;
  }, [debate.id, sort]);

  const related = debates.filter((d) => d.id !== debate.id && (d.club === debate.club || d.rivalClub === debate.club || d.club === debate.rivalClub)).slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <nav className="text-xs text-fog" aria-label="breadcrumb">
        <Link href="/debates" className="font-bold text-gold hover:underline">Fan hall</Link>
        <span> / </span><span>{debate.club}</span>
        {debate.rivalClub && <span> vs {debate.rivalClub}</span>}
        <span> / </span><span>{debate.tag}</span>
      </nav>

      <article>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Crest code={debate.club} size={22} />
          <b>{debate.club}</b>
          {debate.rivalClub && <span className="text-fog">vs <b className="text-chalk">{debate.rivalClub}</b></span>}
          <span className="text-fog">· {debate.author} · {debate.time}</span>
          <span className="ml-auto font-display text-2xl tabular-nums text-gold">{debate.heat}<span className="text-xs text-fog"> heat</span></span>
        </div>
        <h1 className="font-display mt-2 text-3xl uppercase leading-[0.95] sm:text-5xl">{debate.title}</h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-zinc-200">{debate.body}</p>

        {debate.kind === "audio" && (
          <button onClick={() => setPlaying((p) => !p)} className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-gold/40 bg-pitch px-4 py-3 text-left hover:border-gold" aria-pressed={playing}>
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base ${playing ? "bg-gold text-black" : "bg-chalk text-black"}`}>{playing ? "❚❚" : "▶"}</span>
            <Wave seed={debate.seconds ?? 40} hot={playing} />
            <span className="shrink-0 text-sm font-bold tabular-nums">{playing ? "playing… (mock)" : debate.duration}</span>
          </button>
        )}

        {debate.kind === "video" && (
          <div className="group mt-4 overflow-hidden rounded-2xl border border-gold/40 bg-pitch">
            <button onClick={() => setPlaying((p) => !p)} className="block w-full text-left hover:border-gold" aria-pressed={playing} aria-label={playing ? "pause fan cam preview" : "play fan cam preview"}>
              <span className="relative block aspect-video w-full" style={{ background: "repeating-linear-gradient(90deg,#0d170d 0 18px,#122112 18px 36px)" }}>
                <svg viewBox="0 0 200 112" className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
                  <rect x="8" y="8" width="184" height="96" fill="none" stroke="#33402f" strokeWidth="2" />
                  <line x1="100" y1="8" x2="100" y2="104" stroke="#33402f" strokeWidth="2" />
                  <circle cx="100" cy="56" r="14" fill="none" stroke="#33402f" strokeWidth="2" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-full text-xl ${playing ? "bg-gold text-black" : "bg-chalk text-black group-hover:bg-gold"}`}>{playing ? "❚❚" : "▶"}</span>
                </span>
                <span className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="rounded bg-black/80 px-2 py-0.5 text-xs font-bold tabular-nums">{playing ? "playing… (mock)" : debate.duration}</span>
                  <span className="rounded bg-gold px-2 py-0.5 text-xs font-black text-black">FAN CAM</span>
                </span>
              </span>
            </button>
            <span className="flex items-center gap-3 px-4 py-3">
              <Votes base={debate.likes} id={debate.id} />
              <span className="text-xs text-fog">{debate.replies} replies · {debate.likes.toLocaleString()} ratings · filmed {debate.time} ago (mock player)</span>
            </span>
          </div>
        )}

        {debate.kind === "text" && (
          <div className="mt-4 flex items-center gap-3 border-y border-edge py-3">
            <Votes base={debate.likes} id={debate.id} />
            <span className="text-xs text-fog">{debate.replies} replies · {debate.likes.toLocaleString()} ratings</span>
          </div>
        )}
      </article>

      {/* Reply composer mock */}
      <div className="rounded-2xl border border-edge bg-card p-4">
        <div className="flex items-center gap-3">
          <Crest code="YOU" size={28} />
          <p className="flex-1 rounded-full border border-edge bg-pitch px-4 py-2.5 text-sm text-fog">Add your voice: text, voice note, or fan cam… (mock composer)</p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold">
          <span className="rounded-full border border-edge px-3 py-1.5 uppercase tracking-widest text-fog">Write</span>
          <span className="rounded-full border border-edge px-3 py-1.5 uppercase tracking-widest text-fog">Voice</span>
          <span className="rounded-full border border-edge px-3 py-1.5 uppercase tracking-widest text-fog">Video</span>
          <span className="ml-auto rounded-full bg-gold px-4 py-1.5 font-black uppercase tracking-widest text-black opacity-50">Reply · mock</span>
        </div>
      </div>

      {/* Sort + comments */}
      <section aria-label="replies">
        <div className="flex items-center gap-2 border-b border-edge pb-2">
          <h2 className="font-display text-xl uppercase">{replies.reduce((n, r) => n + 1 + (r.children?.length ?? 0), 0)} replies</h2>
          <span className="ml-auto flex gap-1 text-xs font-bold">
            {(["hot", "top", "new"] as Sort[]).map((s) => (
              <button key={s} onClick={() => setSort(s)} aria-pressed={sort === s} className={`rounded-full px-3 py-1.5 uppercase tracking-widest ${sort === s ? "bg-gold text-black" : "border border-edge text-fog hover:border-gold"}`}>{s}</button>
            ))}
          </span>
        </div>
        <div className="divide-y divide-edge/60">
          {replies.map((r) => <Comment key={r.id} r={r} />)}
        </div>
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="font-display text-xl uppercase">Keep arguing</h2>
          <div className="mt-2 divide-y divide-edge border-y border-edge">
            {related.map((d) => (
              <Link key={d.id} href={`/debates/${d.id}`} className="flex items-center gap-3 py-2.5 hover:bg-moss/30">
                <Crest code={d.club} size={20} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{d.title}</span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-gold">{d.heat} heat</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
