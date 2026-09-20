import { breakdowns } from "@/lib/mock";
import { Meter } from "@/components/game";

export default function BreakdownsPage() {
  const [lead, ...rest] = [...breakdowns].sort((a, b) => (b.originality + b.insight + b.clarity) - (a.originality + a.insight + a.clarity));
  const ovr = Math.round((lead.originality + lead.insight + lead.clarity) / 3);
  return (
    <main className="flex flex-col gap-8">
      <div className="rise">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">03 · SBC board · mock</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Solve the tactic.</h1>
      </div>
      <article className="rise border-l-2 border-gold pl-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{lead.match} · {lead.author} · OVR {ovr} · pouch £{lead.earnings.toFixed(0)}</p>
        <h2 className="mt-1 max-w-2xl text-2xl font-bold leading-tight sm:text-3xl">{lead.title}</h2>
        <div className="mt-4 max-w-xl space-y-2 text-xs">
          {[["Originality", lead.originality], ["Insight", lead.insight], ["Clarity", lead.clarity]].map(([l, v]) => (
            <div key={l as string} className="flex items-center gap-3">
              <span className="w-24 text-fog uppercase tracking-wider">{l}</span>
              <Meter v={v as number} gold={(v as number) >= 85} />
              <span className="w-8 text-right font-bold tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </article>
      <div className="divide-y divide-edge border-y border-edge">
        {rest.map((b) => (
          <div key={b.id} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-fog">{b.match} · {b.author} · {b.status}</span>
              <p className="font-bold leading-snug">{b.title}</p>
            </div>
            <div className="text-sm tabular-nums text-fog">ORI {b.originality} · INS {b.insight} · CLA {b.clarity} · <b className="text-gold">£{b.earnings.toFixed(0)}</b></div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">Submit disabled in mock. Open question: weight insight over originality?</p>
    </main>
  );
}
