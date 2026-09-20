import Link from "next/link";
import { matchups, debates } from "@/lib/mock";
import { Scorebug, Pitch, Crest } from "@/components/game";

export default function Home() {
  const f = matchups[0];
  return (
    <main className="flex flex-col gap-10">
      {/* Lead story */}
      <section className="rise grid gap-6 border-b border-edge pb-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Two rooms open · mock data</p>
          <h1 className="font-display mt-2 text-5xl uppercase leading-[0.9] sm:text-7xl">
            Argue.<br />Then prove it<br />on the pitch.
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-zinc-300">
            Fan Hall for the cross-club shouting ({debates.length} threads live in mock), Creator for
            naming your eleven. {f.home} vs {f.away} is this week&apos;s Exhibit A: {f.mismatch.toLowerCase()}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
            <Link href="/debates" className="rounded-full bg-gold px-5 py-2.5 text-black">Enter the fan hall</Link>
            <Link href="/creator" className="rounded-full border border-edge px-5 py-2.5 hover:border-gold">Name your eleven</Link>
            <Link href="/games" className="rounded-full border border-edge px-5 py-2.5 hover:border-gold">Play for fun</Link>
          </div>
          <div className="mt-4">
            <Scorebug home="LIV" away="CRY" hs={2} as={1} min="67'" />
          </div>
        </div>
        <div>
          <Pitch clash />
          <div className="mt-2 flex items-center gap-2 text-xs text-fog">
            <Crest code="LIV" size={22} /><span className="font-bold text-chalk">High press</span>
            <span className="mx-1">×</span>
            <Crest code="CRY" size={22} /><span className="font-bold text-chalk">Low block</span>
            <span className="ml-auto tabular-nums text-gold">{f.confidence}% clash</span>
          </div>
        </div>
      </section>

      {/* Fan hall teaser */}
      <section className="rounded-2xl border border-gold/30 bg-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl uppercase">Hottest argument <span className="text-gold">· {debates[4].heat} heat</span></h2>
          <Link href="/debates" className="shrink-0 text-sm font-bold underline decoration-gold decoration-2 underline-offset-4">All {debates.length} threads</Link>
        </div>
        <Link href={`/debates/${debates[4].id}`} className="mt-2 block">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{debates[4].club} · {debates[4].author} · {debates[4].kind} {debates[4].duration}</p>
          <p className="mt-1 text-xl font-bold leading-snug">{debates[4].title}</p>
          <p className="mt-1 text-sm text-zinc-300">{debates[4].body}</p>
          <p className="mt-2 text-xs font-bold text-fog">{debates[4].likes.toLocaleString()} ratings · {debates[4].replies} replies — add your voice →</p>
        </Link>
      </section>

      {/* Creator + Games teasers */}
      <section className="grid gap-6 border-y border-edge py-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Creator · team sheet</p>
          <h2 className="font-display mt-1 text-3xl uppercase sm:text-4xl">Settle it with a lineup.</h2>
          <p className="mt-2 max-w-prose text-sm text-zinc-300">Shape, shirts, mentality, subs — one FM-style sheet. Copy your XI and drop it straight into the argument.</p>
          <Link href="/creator" className="mt-4 inline-block rounded-full border border-edge px-5 py-2.5 text-sm font-bold hover:border-gold">Open the creator →</Link>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Games room · no stakes</p>
          <h2 className="font-display mt-1 text-3xl uppercase sm:text-4xl">Settle it with penalties.</h2>
          <p className="mt-2 max-w-prose text-sm text-zinc-300">Best-of-5 shootout plus a 3-tie predictor. Points, badges, zero money involved.</p>
          <Link href="/games" className="mt-4 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-black text-black">Enter games room →</Link>
        </div>
      </section>

      {/* Paused labs — routes stay live, out of the spotlight */}
      <details className="text-sm text-fog">
        <summary className="cursor-pointer font-bold text-zinc-300">Paused labs (refs, breakdowns, sentiment, styles) — still live, not platformed</summary>
        <div className="mt-2 flex flex-wrap gap-2 font-bold">
          <Link href="/refs" className="rounded-full border border-edge px-4 py-2 hover:border-gold">Ref room</Link>
          <Link href="/breakdowns" className="rounded-full border border-edge px-4 py-2 hover:border-gold">Bounty SBCs</Link>
          <Link href="/sentiment" className="rounded-full border border-edge px-4 py-2 hover:border-gold">Noise table</Link>
          <Link href="/styles" className="rounded-full border border-edge px-4 py-2 hover:border-gold">Matchday strips</Link>
        </div>
      </details>

      <p className="border-t border-edge pt-3 text-xs text-zinc-500">Mock only. No images fetched, no external calls — crests and pitches are inline SVG/CSS. No betting, no escrow.</p>
    </main>
  );
}
