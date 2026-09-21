import type { DemoMatch, MatchEvent, Team, TrackingPoint } from "./schema";
import { apiRequest } from "./api";
import { DEMO_MATCHES, MATCH_SECONDS, getTracking } from "./match";

export interface FeedSide {
  name: string;
  code: string;
  color: string;
}

export interface FeedHalf {
  from: number;
  to: number;
  label: string;
}

export interface FeedDot {
  x: number;
  y: number;
  keeper: boolean;
}

export interface FeedFrame {
  t: number;
  home: FeedDot[];
  away: FeedDot[];
}

/** One match source the UI can play: simulated tracking or real event data. */
export interface FeedData {
  id: string;
  kicker: string;
  venue: string;
  note?: string;
  source: "sim" | "statsbomb";
  durationSec: number;
  halves: FeedHalf[];
  home: FeedSide;
  away: FeedSide;
  points: TrackingPoint[];
  /** Carrier name per sample for real feeds (sim feeds use squad pools). */
  carriers: string[];
  /** Real 360 dots, sparse. Null => formation model fallback. */
  frames: FeedFrame[] | null;
  events: MatchEvent[];
  homeSquad: string[];
  awaySquad: string[];
  seed: number;
}

export interface FeedEntry {
  id: string;
  label: string;
  kind: "sim" | "real";
  match?: DemoMatch;
}

export const FEED_LIST: FeedEntry[] = [
  ...DEMO_MATCHES.map((m) => ({ id: m.id, label: `${m.homeCode} v ${m.awayCode}`, kind: "sim" as const, match: m })),
  { id: "arg-fra-22", label: "ARG v FRA · REAL", kind: "real" as const },
];

const SIM_HOME = "#ff4438";
const SIM_AWAY = "#3f8cff";

export function simFeed(match: DemoMatch): FeedData {
  const { points } = getTracking(match);
  return {
    id: match.id,
    kicker: "Premier League · Matchday 3",
    venue: match.venue,
    source: "sim",
    durationSec: MATCH_SECONDS,
    halves: [
      { from: 0, to: 45 * 60, label: "1ST HALF" },
      { from: 45 * 60, to: MATCH_SECONDS, label: "2ND HALF" },
    ],
    home: { name: match.home, code: match.homeCode, color: SIM_HOME },
    away: { name: match.away, code: match.awayCode, color: SIM_AWAY },
    points,
    carriers: [],
    frames: null,
    events: match.events,
    homeSquad: match.homePlayers,
    awaySquad: match.awayPlayers,
    seed: match.seed,
  };
}

interface RemoteFeed {
  key: string;
  home: FeedSide;
  away: FeedSide;
  venue: string;
  note: string;
  durationSec: number;
  halves: FeedHalf[];
  points: Array<{ time: number; x: number; y: number; team: Team; by: string }>;
  frames: FeedFrame[];
  events: MatchEvent[];
}

const remoteCache = new Map<string, FeedData>();

export async function realFeed(id: string): Promise<FeedData> {
  const hit = remoteCache.get(id);
  if (hit) return hit;
  const res = await apiRequest("GET", `/api/feed/${id}`);
  const raw = (await res.json()) as RemoteFeed;
  const feed: FeedData = {
    id,
    kicker: "FIFA World Cup · Final 2022",
    venue: raw.venue,
    note: raw.note,
    source: "statsbomb",
    durationSec: Math.floor(raw.durationSec),
    halves: raw.halves,
    home: raw.home,
    away: raw.away,
    points: raw.points.map((p) => ({ time: p.time, x: p.x, y: p.y, team: p.team, player: -1 })),
    carriers: raw.points.map((p) => p.by),
    frames: raw.frames,
    events: raw.events,
    homeSquad: [],
    awaySquad: [],
    seed: 3869685,
  };
  remoteCache.set(id, feed);
  return feed;
}

export function halfLabelFor(feed: FeedData, t: number) {
  for (const h of feed.halves) if (t >= h.from && t < h.to) return h.label;
  return feed.halves[feed.halves.length - 1]?.label ?? "2ND HALF";
}

export function carrierName(feed: FeedData, point: TrackingPoint): string {
  if (feed.source === "statsbomb") {
    return feed.carriers[Math.max(0, Math.min(feed.carriers.length - 1, Math.round(point.time)))] ?? feed.home.code;
  }
  const pool = point.team === "home" ? feed.homeSquad : feed.awaySquad;
  return pool[point.player % pool.length] ?? feed.home.code;
}
