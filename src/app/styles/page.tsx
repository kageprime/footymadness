import Link from "next/link";
import { matchups } from "@/lib/mock";
import { Scorebug, Pitch } from "@/components/game";
import SimPanel from "@/components/sim-panel";

const meta: Record<string, { hs: number; as: number; min: string; seed: number }> = {
  m1: { hs: 2, as: 1, min: "67'", seed: 1101 },
  m2: { hs: 1, as: 0, min: "HT", seed: 2202 },
  m3: { hs: 0, as: 0, min: "SAT", seed: 3303 },
};

export default function StylesPage() {
  return (
    <main className="flex flex-col gap-8">
      <div className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">11 · Matchday strips · mock</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Three ties, three traps.</h1>
        <p className="mt-2 max-w-prose text-[15px] text-zinc-300">Clash % is model agreement, not a win chance. Corners/cards are volume reads.</p>
      </div>
      <div className="flex flex-col gap-6">
        {matchups.map((m, i) => {
          const s = meta[m.id] ?? { hs: 0, as: 0, min: "VS" };
          const flip = i % 2 === 1;
          return (
            <article key={m.id} className="rise grid gap-4 border-y border-edge py-5 lg:grid-cols-[220px_1fr_220px] lg:items-center">
              <div className={flip ? "lg:order-3" : ""}>
                <Pitch clash />
              </div>
              <div className={flip ? "lg:order-1" : ""}>
                <Scorebug home={m.home.slice(0, 3).toUpperCase()} away={m.away.slice(0, 3).toUpperCase()} hs={s.hs} as={s.as} min={s.min} live={s.min.includes("'")} />
                <h2 className="mt-2 text-2xl font-bold">{m.home} <span className="text-fog font-normal">vs</span> {m.away}</h2>
                <p className="text-sm text-fog">{m.homeStyle} × {m.awayStyle}</p>
                <p className="mt-2 max-w-prose text-[15px] text-zinc-200">{m.mismatch}.</p>
                <SimPanel home={m.home} away={m.away} seedBase={s.seed} />
              </div>
              <div className={`flex lg:flex-col gap-2 ${flip ? "lg:order-2" : ""}`}>
                <div className="flex-1 border border-edge px-3 py-2"><p className="text-[10px] uppercase tracking-widest text-fog">Clash</p><p className="font-display text-3xl text-gold tabular-nums">{m.confidence}%</p></div>
                <div className="flex-1 border border-edge px-3 py-2 text-xs"><p className="text-[10px] uppercase tracking-widest text-fog">Corners</p><p className="font-bold">{m.cornerLean}</p></div>
                <div className="flex-1 border border-edge px-3 py-2 text-xs"><p className="text-[10px] uppercase tracking-widest text-fog">Cards</p><p className="font-bold">{m.cardsLean}</p></div>
              </div>
            </article>
          );
        })}
      </div>
      <Link href="/refs" className="text-sm font-bold underline decoration-gold decoration-2 underline-offset-4">Cross-check the ref sheet →</Link>
    </main>
  );
}
