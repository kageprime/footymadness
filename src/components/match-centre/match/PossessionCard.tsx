import { CardShell, SplitBar } from "./meters";

interface Props {
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  home: number;
  away: number;
}

/** Possession split with labelled two-segment bar. */
export default function PossessionCard({ homeCode, awayCode, homeColor, awayColor, home, away }: Props) {
  return (
    <CardShell title="Possession">
      <p className="tnum mt-1 text-sm font-semibold" data-testid="text-possession">
        {homeCode} {home.toFixed(0)}% · {away.toFixed(0)}% {awayCode}
      </p>
      <SplitBar
        label={`Possession ${home.toFixed(0)} percent ${homeCode}`}
        segments={[
          { width: home, color: homeColor },
          { width: away, color: awayColor },
        ]}
      />
    </CardShell>
  );
}
