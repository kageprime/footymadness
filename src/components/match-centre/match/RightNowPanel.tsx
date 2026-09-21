import { zoneLabel } from "../../../lib/match-centre/format";
import type { TrackingPoint } from "../../../lib/match-centre/schema";
import type { MatchEvent } from "../../../lib/match-centre/schema";
import MiniMap from "./MiniMap";

interface Props {
  ball: TrackingPoint;
  homeColor: string;
  awayColor: string;
  homeCode: string;
  awayCode: string;
  carrier: string;
  kmh: number;
  next: MatchEvent | null;
  done: boolean;
  trail: TrackingPoint[];
}

/** Live snapshot: zone, carrier, ball speed, next event, radar. */
export default function RightNowPanel({
  ball,
  homeColor,
  awayColor,
  homeCode,
  awayCode,
  carrier,
  kmh,
  next,
  done,
  trail,
}: Props) {
  const side = ball.team === "home" ? { code: homeCode, color: homeColor } : { code: awayCode, color: awayColor };
  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Right now</p>
      <p className="mt-2 text-sm text-slate-200" data-testid="text-zone">
        {zoneLabel(ball.x, ball.y)}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: side.color }} aria-hidden />
        <p className="text-sm font-semibold" data-testid="text-carrier">
          {carrier} <span className="font-normal text-slate-400">· {side.code}</span>
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[11px] text-slate-400">Ball speed</p>
          <p className="tnum font-display text-xl font-bold" data-testid="text-speed">
            {kmh.toFixed(1)}
            <span className="text-xs font-normal text-slate-400"> km/h</span>
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[11px] text-slate-400">Next event</p>
          <p className="tnum font-display text-xl font-bold" data-testid="text-next">
            {next ? `${Math.floor(next.time / 60)}'` : done ? "FT" : "—"}
          </p>
        </div>
      </div>
      <MiniMap trail={trail} ball={ball} homeColor={homeColor} awayColor={awayColor} />
    </div>
  );
}
