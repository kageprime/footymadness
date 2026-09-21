import { PITCH_H, PITCH_W, pointAt } from "./match";
import type { FeedData, FeedDot } from "./feed";

/**
 * Player dots for the FM view.
 *
 * Real feeds ship sparse 360 dots: dots glide between bracketing frames via
 * nearest-neighbour matching. Simulated feeds fall back to a 4-3-3 shape
 * model that shifts with the ball like FM dots do.
 */

export interface SideDots {
  home: FeedDot[];
  away: FeedDot[];
}

// 4-3-3 anchors, home attacking +x (metres)
const SHAPE: Array<[number, number, boolean]> = [
  [5, 34, true],
  [22, 11, false],
  [20, 26, false],
  [20, 42, false],
  [22, 57, false],
  [42, 20, false],
  [38, 34, false],
  [42, 48, false],
  [62, 15, false],
  [58, 34, false],
  [62, 53, false],
];

function jitter(t: number, i: number, side: number) {
  return {
    x: Math.sin(t * 0.45 + i * 1.7 + side * 3.1) * 1.4,
    y: Math.cos(t * 0.38 + i * 2.3 + side * 1.2) * 1.6,
  };
}

function shapeDots(ballX: number, ballY: number, myBall: boolean, t: number, side: number, flip: boolean): FeedDot[] {
  const dir = flip ? -1 : 1;
  return SHAPE.map(([ax, ay, keeper], i) => {
    const x0 = flip ? PITCH_W - ax : ax;
    const pull = keeper ? 0.04 : 0.24;
    const push = keeper ? 0 : (myBall ? 5 : -4) * dir;
    const j = jitter(t, i, side);
    return {
      x: Math.max(2, Math.min(PITCH_W - 2, x0 + (ballX - x0) * pull + push + j.x)),
      y: Math.max(2, Math.min(PITCH_H - 2, ay + (ballY - ay) * pull + j.y)),
      keeper,
    };
  });
}

function lerpDots(a: FeedDot[], b: FeedDot[], f: number): FeedDot[] {
  const used = new Array(b.length).fill(false);
  return a.map((p) => {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < b.length; i++) {
      if (used[i] || b[i].keeper !== p.keeper) continue;
      const d = (b[i].x - p.x) ** 2 + (b[i].y - p.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best === -1) return { ...p };
    used[best] = true;
    const q = b[best];
    return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, keeper: p.keeper };
  });
}

export function getDots(feed: FeedData, t: number): SideDots {
  if (feed.frames && feed.frames.length > 0) {
    const fr = feed.frames;
    let i = 0;
    while (i < fr.length - 2 && fr[i + 1].t <= t) i++;
    const a = fr[i];
    const b = fr[Math.min(i + 1, fr.length - 1)];
    const span = Math.max(0.001, b.t - a.t);
    const f = Math.max(0, Math.min(1, (t - a.t) / span));
    return { home: lerpDots(a.home, b.home, f), away: lerpDots(a.away, b.away, f) };
  }
  const ball = pointAt(feed.points, t);
  const myHome = ball.team === "home";
  return {
    home: shapeDots(ball.x, ball.y, myHome, t, 0, false),
    away: shapeDots(ball.x, ball.y, !myHome, t, 1, true),
  };
}
