import { CardShell, MeterRow } from "./meters";
import type { Pressure } from "../../../lib/match-centre/match";

interface Side {
  code: string;
  color: string;
  stats: Pressure;
}

interface Props {
  home: Side;
  away: Side;
}

/** Final-third entries and the shots they produced, per side. */
export default function PressureCard({ home, away }: Props) {
  return (
    <CardShell title="Final-third pressure">
      <div className="tnum mt-2 space-y-2 text-sm">
        {(
          [
            ["home", home],
            ["away", away],
          ] as Array<["home" | "away", Side]>
        ).map(([side, s]) => (
          <MeterRow
            key={side}
            label={s.code}
            color={s.color}
            pct={s.stats.attacks * 6}
            meta={`${s.stats.attacks} att · ${s.stats.shots} sh`}
            testId={`text-pressure-${side}`}
          />
        ))}
      </div>
    </CardShell>
  );
}
