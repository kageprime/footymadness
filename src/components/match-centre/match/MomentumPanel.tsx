import MomentumChart from "../MomentumChart";
import type { MatchEvent } from "../../../lib/match-centre/schema";

interface Props {
  series: number[];
  events: MatchEvent[];
  minute: number;
  totalMin: number;
  homeColor: string;
  awayColor: string;
  onSeek: (minute: number) => void;
}

/** Momentum panel: title, tap-to-seek chart, minute axis. */
export default function MomentumPanel({ series, events, minute, totalMin, homeColor, awayColor, onSeek }: Props) {
  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          Momentum <span className="font-normal text-slate-500">· trailing 4-min possession</span>
        </p>
        <p className="text-[11px] text-slate-500">Tap bars to jump</p>
      </div>
      <MomentumChart
        series={series}
        events={events}
        minute={minute}
        totalMinutes={totalMin}
        homeColor={homeColor}
        awayColor={awayColor}
        onSeek={onSeek}
      />
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>0'</span>
        <span>{Math.floor(totalMin / 2)}'</span>
        <span>{totalMin}'</span>
      </div>
    </div>
  );
}
