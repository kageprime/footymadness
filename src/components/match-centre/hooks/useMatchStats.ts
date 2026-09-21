import { useMemo } from "react";
import type { FeedData } from "../../../lib/match-centre/feed";
import { carrierName, halfLabelFor } from "../../../lib/match-centre/feed";
import { getDots, type SideDots } from "../../../lib/match-centre/players";
import {
  heatUpTo,
  momentumSeries,
  pointAt,
  possessionUpTo,
  pressureUpTo,
  scoreAt,
  thirdsUpTo,
  trailBehind,
  upcomingEvent,
  type HeatGrid,
  type Possession,
  type Pressure,
} from "../../../lib/match-centre/match";
import type { MatchEvent, TrackingPoint } from "../../../lib/match-centre/schema";

export interface MatchStats {
  second: number;
  minuteFloat: number;
  totalMin: number;
  points: TrackingPoint[];
  ball: TrackingPoint;
  trail: TrackingPoint[];
  grid: HeatGrid | null;
  dots: SideDots;
  score: { home: number; away: number };
  poss: Possession;
  thirds: { defensive: number; middle: number; attacking: number };
  pressure: { home: Pressure; away: Pressure };
  series: number[];
  next: MatchEvent | null;
  carrier: string;
  kmh: number;
  half: string;
}

/** Every value the panels render, derived from feed + clock. Null feed => safe defaults. */
export function useMatchStats(feed: FeedData | null, time: number): MatchStats {
  const points = feed?.points ?? [];
  const totalMin = Math.max(1, Math.ceil((feed?.durationSec ?? 5400) / 60));

  // The clock moves continuously but derived data only changes per second.
  const second = Math.floor(time);
  const minuteFloat = time / 60;

  const ball = useMemo(
    () => (points.length ? pointAt(points, time) : { time: 0, x: 52.5, y: 34, team: "home" as const, player: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, second],
  );
  const trail = useMemo(
    () => (points.length ? trailBehind(points, time) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, second],
  );
  const grid = useMemo(
    () => (points.length ? heatUpTo(points, time) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, second],
  );
  const dots = useMemo(
    () => (feed ? getDots(feed, time) : { home: [], away: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, second],
  );
  const score = useMemo(
    () => (feed ? scoreAt(feed, time) : { home: 0, away: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, second],
  );
  const poss = useMemo(
    () => (points.length ? possessionUpTo(points, time) : { home: 50, away: 50 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, second],
  );
  const thirds = useMemo(
    () => (points.length ? thirdsUpTo(points, time) : { defensive: 0, middle: 100, attacking: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, second],
  );
  const pressure = useMemo(
    () =>
      feed && points.length
        ? pressureUpTo(feed.seed, points, time)
        : { home: { attacks: 0, shots: 0 }, away: { attacks: 0, shots: 0 } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, points, second],
  );
  const series = useMemo(() => (points.length ? momentumSeries(points, 240, totalMin) : []), [points, totalMin]);
  const next = useMemo(
    () => (feed ? upcomingEvent(feed, time) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feed, second],
  );

  const prev = points[Math.max(0, Math.round(time) - 1)] ?? ball;
  const kmh = points.length ? Math.max(0, Math.hypot(ball.x - prev.x, ball.y - prev.y) * 3.6) : 0;
  const carrier = feed ? carrierName(feed, ball) : "";
  const half = feed ? halfLabelFor(feed, time) : "1ST HALF";

  return { second, minuteFloat, totalMin, points, ball, trail, grid, dots, score, poss, thirds, pressure, series, next, carrier, kmh, half };
}
