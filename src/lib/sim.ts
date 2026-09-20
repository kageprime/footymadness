import {
  RealTimeEngine,
  RealTimeReporter,
  Team,
  Player,
  Position,
  type PlayerAttributes,
} from "@bleckert/football-simulator";

// Adapter boundary: pages never import the engine directly.
// Mock ratings now; live form/attributes plug in here later.

export type ClubCode = "LIV" | "CRY" | "MCI" | "EVE" | "BRE" | "TOT";

type ClubProfile = { attack: number; defense: number; style: string };

const CLUBS: Record<ClubCode, ClubProfile> = {
  LIV: { attack: 3, defense: 2, style: "high_press" },
  MCI: { attack: 3, defense: 2, style: "possession" },
  TOT: { attack: 2, defense: 0, style: "high_press" },
  BRE: { attack: 1, defense: 0, style: "direct" },
  CRY: { attack: 0, defense: 1, style: "low_block" },
  EVE: { attack: -1, defense: 1, style: "low_block" },
};

export function codeOf(name: string): ClubCode {
  const n = name.toLowerCase();
  if (n.includes("liverpool")) return "LIV";
  if (n.includes("palace")) return "CRY";
  if (n.includes("city")) return "MCI";
  if (n.includes("everton")) return "EVE";
  if (n.includes("brentford")) return "BRE";
  return "TOT";
}

export function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const ATTR_KEYS: (keyof PlayerAttributes)[] = [
  "aggression", "anticipation", "bravery", "composure", "concentration",
  "decisions", "determination", "flair", "leadership", "offTheBall",
  "positioning", "teamwork", "vision", "workRate", "acceleration", "agility",
  "balance", "jumpingReach", "naturalFitness", "pace", "stamina", "strength",
  "corners", "crossing", "dribbling", "finishing", "firstTouch",
  "freeKickTaking", "heading", "longShots", "longThrows", "marking",
  "passing", "penaltyTaking", "tackling", "technique", "aerialReach",
  "commandOfArea", "communication", "eccentricity", "handling", "oneOnOnes",
  "reflexes", "rushingOut", "tendencyToPunch", "throwing",
];

const FW_BOOST: (keyof PlayerAttributes)[] = ["finishing", "composure", "pace", "offTheBall", "dribbling"];
const MF_BOOST: (keyof PlayerAttributes)[] = ["passing", "vision", "decisions", "technique", "workRate"];
const DF_BOOST: (keyof PlayerAttributes)[] = ["tackling", "marking", "positioning", "strength", "heading"];
const GK_BOOST: (keyof PlayerAttributes)[] = ["handling", "reflexes", "commandOfArea", "oneOnOnes", "aerialReach"];

const XI: Position[] = [
  Position.GK, Position.LB, Position.LCB, Position.RCB, Position.RB,
  Position.LCM, Position.CM, Position.RCM, Position.LW, Position.ST, Position.RW,
];

function unitOf(pos: Position): "gk" | "df" | "mf" | "fw" {
  if (pos === Position.GK) return "gk";
  if (pos <= Position.RB) return "df";
  if (pos <= Position.RM) return "mf";
  return "fw";
}

function buildPlayers(code: ClubCode, profile: ClubProfile): Player[] {
  const players: Player[] = [];
  for (let i = 0; i < 16; i++) {
    const pos = XI[i % 11];
    const unit = unitOf(pos);
    const delta = unit === "fw" ? profile.attack : unit === "mf" ? Math.round(profile.attack / 2) : unit === "df" ? profile.defense : profile.defense;
    const boosted = unit === "fw" ? FW_BOOST : unit === "mf" ? MF_BOOST : unit === "df" ? DF_BOOST : GK_BOOST;
    const attrs = {} as PlayerAttributes;
    for (const k of ATTR_KEYS) attrs[k] = 12;
    for (const k of boosted) attrs[k] = Math.min(20, Math.max(5, 12 + delta));
    players.push(
      new Player({ name: `${code} No.${i + 1}`, number: i + 1 }, { height: 182, weight: 76 }, attrs, pos)
    );
  }
  return players;
}

export type SimFeedLine = { minute: number; text: string; big: boolean };

export type SimFrame = { t: number; b: [number, number]; p: number[] };
// p is flat [x, y, side(home=1/away=0)] × 22, pitch meters (105×68).

export type SimGoal = { t: number; side: "home" | "away"; start: number; end: number };

export type SimResult = {
  seed: number;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  headline: string;
  summary: string;
  feed: SimFeedLine[];
  frames: SimFrame[];
  goals: SimGoal[];
  stats: { shots: number; saves: number; corners: number; fouls: number; yellows: number; reds: number };
  ms: number;
};

const FEED_TYPES = new Set([
  "goal", "penalty", "red_card", "yellow_card", "injury",
  "substitution", "save", "miss", "half_time", "full_time", "match_start",
]);

function minuteOf(time: number): number {
  return Math.max(1, Math.ceil(time / 60));
}

// Chunked runner keeps the UI alive with progress; ~7s wall time for 90'.
export async function simulateTie(
  homeName: string,
  awayName: string,
  seed: number,
  onProgress?: (minute: number) => void
): Promise<SimResult> {
  const t0 = Date.now();
  const homeCode = codeOf(homeName);
  const awayCode = codeOf(awayName);
  const home = new Team(true, homeName, buildPlayers(homeCode, CLUBS[homeCode]));
  const away = new Team(false, awayName, buildPlayers(awayCode, CLUBS[awayCode]));
  const engine = new RealTimeEngine(home, away, {
    random: seededRandom(seed),
    homeTactics: { formation: "4-3-3", style: CLUBS[homeCode].style } as never,
    awayTactics: { formation: "4-3-3", style: CLUBS[awayCode].style } as never,
  });
  engine.start();
  let guard = 0;
  let lastMinute = 0;
  while (engine.state.period !== "ended" && guard++ < 200000) {
    engine.tick();
    if (guard % 1500 === 0) {
      const m = Math.min(90, Math.floor(engine.state.time / 60));
      if (m !== lastMinute) {
        lastMinute = m;
        onProgress?.(m);
      }
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  const score = engine.state.score;
  const report = new RealTimeReporter(engine).getReport();
  // Compact replay frames sampled from the engine's own snapshot log
  // (always populated) — ~2s cadence keeps memory small.
  const frames: SimFrame[] = [];
  const goals: SimGoal[] = [];
  const snaps = engine.snapshots ?? [];
  for (let i = 0; i < snaps.length; i += 8) {
    const s = snaps[i];
    if (!s || !s.ball || !s.players) continue;
    const p: number[] = [];
    for (const pl of s.players) p.push(+pl.x.toFixed(1), +pl.y.toFixed(1), pl.teamSide === "home" ? 1 : 0);
    frames.push({ t: s.time, b: [+s.ball.x.toFixed(1), +s.ball.y.toFixed(1)], p });
  }
  const feed: SimFeedLine[] = [];
  const stats = { shots: 0, saves: 0, corners: 0, fouls: 0, yellows: 0, reds: 0 };
  let minorSeen = 0;
  for (const e of engine.events) {
    const t = e.type as string;
    if (t === "goal" && (e.teamSide === "home" || e.teamSide === "away")) {
      goals.push({ t: e.time, side: e.teamSide, start: e.replayWindow?.startTime ?? Math.max(0, e.time - 12), end: e.replayWindow?.endTime ?? e.time + 4 });
    }
    if (t === "shot") stats.shots++;
    if (t === "save") stats.saves++;
    if (t === "corner") stats.corners++;
    if (t === "foul" || t === "free_kick") stats.fouls++;
    if (t === "yellow_card") stats.yellows++;
    if (t === "red_card") stats.reds++;
    if (!FEED_TYPES.has(t)) continue;
    if (t === "save" || t === "miss") {
      minorSeen++;
      if (minorSeen % 3 !== 0) continue;
    }
    const minute = minuteOf(e.time);
    const team = e.team?.name ?? e.teamSide ?? "";
    const player = e.player?.info.name ?? "";
    let text: string | null = null;
    let big = false;
    switch (t) {
      case "match_start": text = "Underway. Simulation from mock ratings — not a prediction."; break;
      case "goal": text = `${minute}' GOAL ${team} — ${player} scores. ${scoreText(engine, e.time)}`; big = true; break;
      case "penalty": text = `${minute}' Penalty to ${team}.`; big = true; break;
      case "save": text = `${minute}' Saved — ${player || "the keeper"} denies ${team}.`; break;
      case "miss": text = `${minute}' ${player} (${team}) drags it wide.`; break;
      case "yellow_card": text = `${minute}' Booked: ${player} (${team}).`; break;
      case "red_card": text = `${minute}' SENT OFF: ${player} (${team}).`; big = true; break;
      case "injury": text = `${minute}' ${player} down — treatment on.`; break;
      case "substitution": text = `${minute}' Change for ${team}.`; break;
      case "half_time": text = `Half time: ${e.score.home}-${e.score.away}.`; big = true; break;
      case "full_time": text = `Full time: ${e.score.home}-${e.score.away}.`; big = true; break;
    }
    if (text) feed.push({ minute, text, big });
  }
  return {
    seed, home: homeName, away: awayName,
    homeGoals: score.home, awayGoals: score.away,
    headline: report.headline, summary: report.summary,
    feed: feed.slice(0, 60), frames, goals, stats, ms: Date.now() - t0,
  };
}

function scoreText(engine: RealTimeEngine, time: number): string {
  let h = 0, a = 0;
  for (const e of engine.events) {
    if (e.time > time) break;
    if ((e.type as string) === "goal") {
      if (e.teamSide === "home") h++;
      else if (e.teamSide === "away") a++;
    }
  }
  return `${h}-${a}`;
}
