import { CardShell, SplitBar } from "./meters";

interface Props {
  defensive: number;
  middle: number;
  attacking: number;
}

/** Where the ball has lived, split across thirds. */
export default function TerritoryCard({ defensive, middle, attacking }: Props) {
  return (
    <CardShell title="Ball territory">
      <SplitBar
        label={`Ball territory: defensive ${defensive.toFixed(0)}, middle ${middle.toFixed(0)}, attacking ${attacking.toFixed(0)} percent`}
        segments={[
          { width: defensive, color: "#94a3b8" },
          { width: middle, color: "#e2e8f0" },
          { width: attacking, color: "#ffffff" },
        ]}
      />
      <dl className="tnum mt-2 space-y-1 text-xs text-slate-300">
        <div className="flex justify-between">
          <dt>Defensive third</dt>
          <dd>{defensive.toFixed(0)}%</dd>
        </div>
        <div className="flex justify-between">
          <dt>Middle third</dt>
          <dd>{middle.toFixed(0)}%</dd>
        </div>
        <div className="flex justify-between">
          <dt>Attacking third</dt>
          <dd>{attacking.toFixed(0)}%</dd>
        </div>
      </dl>
    </CardShell>
  );
}
