import type { DemoMatch, MatchEvent, Team, TrackingPoint } from "./schema";

export const PITCH_W = 105;
export const PITCH_H = 68;
export const MATCH_SECONDS = 90 * 60;
export const DT = 1; // one tracking sample per second

export interface Phase {
  from: number;
  to: number;
  homeShare: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const DEMO_MATCHES: DemoMatch[] = [
  {
    id: "ars-che",
    home: "Arsenal",
    away: "Chelsea",
    homeCode: "ARS",
    awayCode: "CHE",
    venue: "Emirates Stadium · Matchday 3",
    homePlayers: ["Saka", "Gyokeres", "Martinelli", "Odegaard", "Rice", "Saliba"],
    awayPlayers: ["Palmer", "Jackson", "Madueke", "Caicedo", "Fernandez", "Colwill"],
    events: [
      { time: 2 * 60, type: "goal", team: "away", player: "Palmer", detail: "Low finish inside the box" },
      { time: 25 * 60, type: "goal", team: "home", player: "Saka", detail: "Cut inside, curled into the corner" },
    ],
    seed: 210023,
  },
  {
    id: "mci-liv",
    home: "Man City",
    away: "Liverpool",
    homeCode: "MCI",
    awayCode: "LIV",
    venue: "Etihad Stadium · Matchday 3",
    homePlayers: ["Haaland", "Foden", "Doku", "Rodri", "De Bruyne", "Dias"],
    awayPlayers: ["Salah", "Nunez", "Diaz", "Szoboszlai", "Mac Allister", "Van Dijk"],
    events: [
      { time: 12 * 60, type: "goal", team: "home", player: "Haaland", detail: "Near-post header" },
      { time: 67 * 60, type: "goal", team: "away", player: "Salah", detail: "Counter, slotted home" },
      { time: 78 * 60, type: "goal", team: "home", player: "Foden", detail: "Edge of the box, top corner" },
    ],
    seed: 90210,
  },
  {
    id: "rma-bar",
    home: "Real Madrid",
    away: "Barcelona",
    homeCode: "RMA",
    awayCode: "BAR",
    venue: "Bernabeu · Matchday 3",
    homePlayers: ["Mbappe", "Vinicius", "Bellingham", "Valverde", "Tchouameni", "Rudiger"],
    awayPlayers: ["Yamal", "Lewandowski", "Raphinha", "Pedri", "Gavi", "Cubarsi"],
    events: [
      { time: 9 * 60, type: "goal", team: "away", player: "Yamal", detail: "Left-foot curler" },
      { time: 55 * 60, type: "goal", team: "home", player: "Mbappe", detail: "Penalty, sent the keeper the wrong way" },
    ],
    seed: 55117,
  },
];

function buildPhases(seed: number): Phase[] {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const cuts = [0, 12, 27, 41, 50, 63, 76, 90];
  const phases: Phase[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const swing = (rand() - 0.5) * 0.5;
    const base = 0.5 + (i % 2 === 0 ? 0.08 : -0.08) + swing;
    phases.push({
      from: cuts[i] * 60,
      to: cuts[i + 1] * 60,
      homeShare: Math.min(0.78, Math.max(0.22, base)),
    });
  }
  return phases;
}

function shareAt(phases: Phase[], t: number) {
  for (const p of phases) if (t >= p.from && t < p.to) return p.homeShare;
  return phases[phases.length - 1].homeShare;
}

export interface TrackingData {
  points: TrackingPoint[];
  phases: Phase[];
}

const cache = new Map<string, TrackingData>();

export function getTracking(match: DemoMatch): TrackingData {
  const hit = cache.get(match.id);
  if (hit) return hit;
  const rand = mulberry32(match.seed);
  const phases = buildPhases(match.seed);
  const n = Math.floor(MATCH_SECONDS / DT);
  const points: TrackingPoint[] = new Array(n + 1);
  let x = PITCH_W / 2;
  let y = PITCH_H / 2;
  let fy = PITCH_H / 2;
  let team: Team = rand() < 0.5 ? "home" : "away";
  let carrier = 0;

  for (let i = 0; i <= n; i++) {
    const t = i * DT;
    const share = shareAt(phases, t);
    if (rand() < 0.045) {
      team = rand() < share ? "home" : "away";
      const pool = team === "home" ? match.homePlayers : match.awayPlayers;
      carrier = Math.floor(rand() * pool.length);
    }
    // focus drifts: possession pushes the ball toward the opponent's goal,
    // with slow lateral swings so the heatmap breathes like the reference.
    const attackX = team === "home" ? PITCH_W * 0.78 : PITCH_W * 0.22;
    const swing = Math.sin(t / 340 + match.seed % 7) * 20 + Math.sin(t / 97 + match.seed % 3) * 8;
    const fx = attackX + swing * (team === "home" ? 1 : -1) * 0.4 + gaussian(rand) * 1.2;
    fy += gaussian(rand) * 1.6;
    if (fy < 10 || fy > PITCH_H - 10) fy = PITCH_H / 2 + gaussian(rand) * 8;
    fy = Math.max(6, Math.min(PITCH_H - 6, fy));

    x += (fx - x) * 0.055 + gaussian(rand) * 2.1;
    y += (fy - y) * 0.06 + gaussian(rand) * 2.0;
    x = Math.max(2, Math.min(PITCH_W - 2, x));
    y = Math.max(2, Math.min(PITCH_H - 2, y));

    points[i] = { time: t, x, y, team, player: carrier };
  }
  const data = { points, phases };
  cache.set(match.id, data);
  return data;
}

export function scoreAt(match: { events: MatchEvent[] }, t: number) {
  let home = 0;
  let away = 0;
  for (const e of match.events) {
    if (e.time <= t && e.type === "goal") {
      if (e.team === "home") home++;
      else away++;
    }
  }
  return { home, away };
}

export function halfLabel(t: number) {
  const m = t / 60;
  if (m < 45) return "1ST HALF";
  if (m < 60) return "2ND HALF";
  return "2ND HALF";
}

export function clockLabel(t: number) {
  return `${Math.floor(t / 60)}'`;
}

export interface Possession {
  home: number;
  away: number;
}

export function possessionUpTo(points: TrackingPoint[], t: number): Possession {
  const idx = Math.max(1, Math.min(points.length, Math.floor(t / DT) + 1));
  let home = 0;
  for (let i = 0; i < idx; i++) if (points[i].team === "home") home++;
  const h = (home / idx) * 100;
  return { home: h, away: 100 - h };
}

/** Ball location split across defensive / middle / attacking thirds, home perspective. */
export function thirdsUpTo(points: TrackingPoint[], t: number) {
  const idx = Math.max(1, Math.min(points.length, Math.floor(t / DT) + 1));
  let d = 0;
  let m = 0;
  let a = 0;
  for (let i = 0; i < idx; i++) {
    const x = points[i].x;
    if (x < PITCH_W / 3) d++;
    else if (x < (PITCH_W * 2) / 3) m++;
    else a++;
  }
  return {
    defensive: (d / idx) * 100,
    middle: (m / idx) * 100,
    attacking: (a / idx) * 100,
  };
}

export interface Pressure {
  attacks: number;
  shots: number;
}

/** Deterministic attack/shots derived from final-third entries. */
export function pressureUpTo(seed: number, points: TrackingPoint[], t: number): { home: Pressure; away: Pressure } {
  const idx = Math.max(1, Math.min(points.length, Math.floor(t / DT) + 1));
  const rand = mulberry32(seed ^ 0x51ab);
  const home: Pressure = { attacks: 0, shots: 0 };
  const away: Pressure = { attacks: 0, shots: 0 };
  let inZone: Team | null = null;
  for (let i = 0; i < idx; i++) {
    const p = points[i];
    const homeZone = p.x > PITCH_W * 0.68;
    const awayZone = p.x < PITCH_W * 0.32;
    const zone: Team | null = p.team === "home" && homeZone ? "home" : p.team === "away" && awayZone ? "away" : null;
    if (zone && zone !== inZone) {
      const s = zone === "home" ? home : away;
      s.attacks++;
      if (rand() < 0.31) s.shots++;
    }
    inZone = zone ?? (p.team === inZone ? inZone : null);
  }
  void rand;
  return { home, away };
}

/** Per-minute momentum: home possession share in a trailing window, minus 50. */
export function momentumSeries(points: TrackingPoint[], windowSec = 240, totalMin?: number): number[] {
  const minutes = totalMin ?? 90;
  const out: number[] = [];
  for (let m = 1; m <= minutes; m++) {
    const end = Math.min(points.length, m * 60);
    const start = Math.max(0, end - windowSec);
    let home = 0;
    let n = 0;
    for (let i = start; i < end; i++) {
      if (points[i].team === "home") home++;
      n++;
    }
    out.push(n === 0 ? 0 : (home / n) * 100 - 50);
  }
  return out;
}

export interface HeatGrid {
  cols: number;
  rows: number;
  home: Float32Array;
  away: Float32Array;
  max: number;
}

export function heatUpTo(points: TrackingPoint[], t: number, cols = 56, rows = 36): HeatGrid {
  const home = new Float32Array(cols * rows);
  const away = new Float32Array(cols * rows);
  const idx = Math.max(0, Math.min(points.length - 1, Math.floor(t / DT)));
  for (let i = 0; i <= idx; i++) {
    const p = points[i];
    const cx = Math.max(0, Math.min(cols - 1, Math.floor((p.x / PITCH_W) * cols)));
    const cy = Math.max(0, Math.min(rows - 1, Math.floor((p.y / PITCH_H) * rows)));
    const k = cy * cols + cx;
    if (p.team === "home") home[k]++;
    else away[k]++;
  }
  // light blur so the surface reads as continuous terrain
  const blurred = (src: Float32Array) => {
    const dst = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let s = 0;
        let w = 0;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const nx = x + ox;
            const ny = y + oy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const weight = ox === 0 && oy === 0 ? 4 : ox !== 0 && oy !== 0 ? 1 : 2;
            s += src[ny * cols + nx] * weight;
            w += weight;
          }
        }
        dst[y * cols + x] = s / w;
      }
    }
    return dst;
  };
  const hb = blurred(home);
  const ab = blurred(away);
  let max = 0;
  for (let i = 0; i < hb.length; i++) {
    const tot = hb[i] + ab[i];
    if (tot > max) max = tot;
  }
  return { cols, rows, home: hb, away: ab, max: Math.max(1, max) };
}

export function pointAt(points: TrackingPoint[], t: number): TrackingPoint {
  const idx = Math.max(0, Math.min(points.length - 1, Math.round(t / DT)));
  return points[idx];
}

export function trailBehind(points: TrackingPoint[], t: number, seconds = 14): TrackingPoint[] {
  const end = Math.max(0, Math.min(points.length - 1, Math.round(t / DT)));
  const start = Math.max(0, end - seconds);
  return points.slice(start, end + 1);
}

export function upcomingEvent(match: { events: MatchEvent[] }, t: number): MatchEvent | null {
  for (const e of match.events) if (e.time > t) return e;
  return null;
}
