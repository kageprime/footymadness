import { clockLabel } from "./match";

/** Small formatting helpers shared by match panels. */

export function formatClockRange(time: number, totalMin: number) {
  return `${clockLabel(time)} / ${totalMin}'`;
}

export function zoneLabel(x: number, y: number) {
  const third = x < 35 ? "Defensive third" : x < 70 ? "Middle third" : "Attacking third";
  const channel = y < 22.7 ? "right channel" : y < 45.3 ? "central channel" : "left channel";
  return `${third} · ${channel}`;
}

export interface Xy {
  x: number;
  y: number;
}

/** Split a trail into drawable segments, breaking across feed jumps. */
export function trailSegments(trail: Xy[]): Xy[][] {
  const segs: Xy[][] = [];
  let cur: Xy[] = [];
  for (const p of trail) {
    const last = cur[cur.length - 1];
    if (last && Math.hypot(p.x - last.x, p.y - last.y) > 12) {
      if (cur.length > 1) segs.push(cur);
      cur = [];
    }
    cur.push(p);
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}
