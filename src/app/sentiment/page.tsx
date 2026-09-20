import { sentiment } from "@/lib/mock";
import { Crest, Meter } from "@/components/game";

export default function SentimentPage() {
  const rows = [...sentiment].sort((a, b) => b.tension - a.tension);
  return (
    <main className="flex flex-col gap-8">
      <div className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">06 · Noise table · public posts only · mock</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Loudest stands first.</h1>
        <p className="mt-2 max-w-prose text-[15px] text-zinc-300">{rows[0].team} lead at {rows[0].tension} dB — {rows[0].trend.toLowerCase()}. Tension is volume, not a prediction.</p>
      </div>
      <div className="border-y border-edge divide-y divide-edge/70">
        {rows.map((s, i) => (
          <div key={s.team} className="grid gap-2 py-3 sm:grid-cols-[48px_200px_1fr_auto] sm:items-center">
            <span className="font-display text-2xl text-zinc-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex items-center font-bold"><Crest code={s.team} size={20} /><span className="ml-2">{s.team}</span></span>
            <span className="flex items-center gap-3">
              <Meter v={s.tension} gold={s.tension >= 75} />
              <span className="hidden md:inline text-xs text-fog w-64 truncate">{s.trend} · {s.mentions.toLocaleString()} posts · {s.positivity}% buzz / {s.pessimism}% fume</span>
            </span>
            <span className="font-display text-2xl tabular-nums text-gold">{s.tension}<span className="text-sm text-fog"> dB</span></span>
          </div>
        ))}
      </div>
    </main>
  );
}
