import { referees } from "@/lib/mock";
import { Meter } from "@/components/game";

export default function RefsPage() {
  return (
    <main className="flex flex-col gap-8">
      <div className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">02 · Ref room · mock</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Strict or lets it flow?</h1>
        <p className="mt-2 max-w-prose text-[15px] text-zinc-300">One table, sorted by strictness. Pens vs league average is the signal; home/away split is the context.</p>
      </div>

      <div className="rise overflow-x-auto border-y border-edge">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-fog">
              <th className="py-2.5 pr-3 font-semibold">Ref · flag</th>
              <th className="px-3 py-2.5 text-right font-semibold">M</th>
              <th className="px-3 py-2.5 text-right font-semibold">Pens/m</th>
              <th className="px-3 py-2.5 text-right font-semibold">Δ avg</th>
              <th className="px-3 py-2.5 text-right font-semibold">Cards</th>
              <th className="px-3 py-2.5 text-right font-semibold">H/A split</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge/70">
            {[...referees].sort((a, b) => b.cardsPerMatch - a.cardsPerMatch).map((r) => {
              const d = r.penaltiesPerMatch - r.leagueAvgPenalties;
              return (
                <tr key={r.id} className="hover:bg-moss/40">
                  <td className="py-3 pr-3"><span className="font-display text-xl mr-2 text-gold">{r.cardsPerMatch.toFixed(1)}</span><b>{r.name}</b><span className="block text-xs font-normal text-fog">{r.biasFlag}</span></td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.matches}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.penaltiesPerMatch.toFixed(2)}</td>
                  <td className={`px-3 py-3 text-right font-bold tabular-nums ${d >= 0 ? "text-gold" : "text-chalk"}`}>{d >= 0 ? `+${d.toFixed(2)}` : d.toFixed(2)}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-gold">{r.cardsPerMatch.toFixed(1)}</td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2 min-w-[160px]"><Meter v={r.homeFoulPct} gold /><span className="text-xs tabular-nums w-20 text-right">{r.homeFoulPct}/{r.awayFoulPct}</span></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">How to read: Taylor tops strictness at 4.5 cards/m; Oliver gives most pens (+0.08 vs avg). Split bar is % of fouls called each way.</p>
    </main>
  );
}
