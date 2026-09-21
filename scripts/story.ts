/**
 * Match-story chapter labeling, offline.
 *
 * Splits each feed into 5-minute phases, describes each phase with computed
 * stats, and asks classifier.dev (Jev) for one narrative label per phase.
 * Results are committed as JSON so the site ships data — no runtime call.
 *
 * Usage: pnpm exec tsx scripts/story.ts   (footymadness dev server must be up for arg-fra-22)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { DEMO_MATCHES, getTracking, pressureUpTo, PITCH_W, type Phase } from "../src/lib/match-centre/match";
import type { DemoMatch, MatchEvent, TrackingPoint } from "../src/lib/match-centre/schema";

const API = "http://localhost:3000";
const OUT = new URL("../src/lib/match-centre/story/", import.meta.url);
const WINDOW = 5 * 60;
const GATE = 0.7;
const FALLBACK = "Open play";

const CHAPTER = {
  labels: ["Feeling out", "Control", "End to end", "Siege", "Lull", "Late drama"],
  instructions:
    "Feeling out: slow tempo, 0-2 attacks either side, typical of opening minutes. " +
    "Control: one side holds 60%+ possession with 3+ attacks. " +
    "End to end: both sides attack 3+ times, high ball speed. " +
    "Siege: one side attacks 5+ times while the other manages 0-1. " +
    "Lull: 0-2 attacks either side, low speed, no goals. " +
    "Late drama: a goal, or 4+ attacks, in the last 15 minutes of the match.",
};

interface FeedInput {
  id: string;
  label: string;
  points: TrackingPoint[];
  events: MatchEvent[];
  seed: number;
  homeCode: string;
  awayCode: string;
}

function phaseText(f: FeedInput, w0: number, w1: number): string {
  const m0 = Math.floor(w0 / 60);
  const m1 = Math.floor(w1 / 60);
  const seg = f.points.filter((p) => p.time >= w0 && p.time < w1);
  const homeShare = seg.length ? seg.filter((p) => p.team === "home").length / seg.length : 0.5;
  const before = pressureUpTo(f.seed, f.points, w0);
  const after = pressureUpTo(f.seed, f.points, w1);
  const homeAtt = after.home.attacks - before.home.attacks;
  const awayAtt = after.away.attacks - before.away.attacks;
  const goals = f.events.filter((e) => e.type === "goal" && e.time >= w0 && e.time < w1);
  const goalBit = goals.length ? `, goals ${goals.length} (${goals.map((g) => g.team).join(",")})` : ", no goals";
  let spd = 0;
  for (let i = 1; i < seg.length; i++) spd += Math.hypot(seg[i].x - seg[i - 1].x, seg[i].y - seg[i - 1].y) * 3.6;
  const avg = seg.length > 1 ? spd / (seg.length - 1) : 0;
  void PITCH_W;
  return (
    `Minutes ${m0}-${m1} of ${f.label}: ${f.homeCode} ${(homeShare * 100).toFixed(0)}% possession, ` +
    `attacks ${f.homeCode} ${homeAtt} ${f.awayCode} ${awayAtt}${goalBit}, avg ball speed ${avg.toFixed(0)} km/h.`
  );
}

async function classify(items: string[]) {
  const res = await fetch("https://classifier.dev/v1/classify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ items, dimensions: { chapter: CHAPTER } }),
  });
  if (!res.ok) throw new Error(`classifier.dev ${res.status}`);
  return (await res.json()) as {
    results: Array<{ dimensions: { chapter: { label: string; confidence: number | null; model: string } } }>;
  };
}

async function simFeed(m: DemoMatch): Promise<FeedInput> {
  const { points } = getTracking(m);
  return {
    id: m.id,
    label: `${m.homeCode} v ${m.awayCode}`,
    points,
    events: m.events,
    seed: m.seed,
    homeCode: m.homeCode,
    awayCode: m.awayCode,
  };
}

async function realFeed(key: string): Promise<FeedInput> {
  const res = await fetch(`${API}/api/feed/${key}`);
  if (!res.ok) throw new Error(`feed ${key}: ${res.status}`);
  const f = (await res.json()) as {
    points: TrackingPoint[];
    events: MatchEvent[];
    seed: number;
    home: { code: string };
    away: { code: string };
  };
  return {
    id: key,
    label: `${f.home.code} v ${f.away.code}`,
    points: f.points,
    events: f.events,
    seed: f.seed,
    homeCode: f.home.code,
    awayCode: f.away.code,
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const feeds: FeedInput[] = [];
  for (const m of DEMO_MATCHES) feeds.push(await simFeed(m));
  feeds.push(await realFeed("arg-fra-22"));

  for (const f of feeds) {
    const total = f.points.length;
    const items: string[] = [];
    const spans: Array<[number, number]> = [];
    for (let w0 = 0; w0 < total; w0 += WINDOW) {
      const w1 = Math.min(total, w0 + WINDOW);
      if (w1 - w0 < 60) continue; // skip degenerate tail spans with no data
      spans.push([Math.floor(w0 / 60), Math.floor(w1 / 60)]);
      items.push(phaseText(f, w0, w1));
    }
    const out = await classify(items);
    const chapters = out.results.map((r, i) => {
      const a = r.dimensions.chapter;
      const label = a.confidence != null && a.confidence >= GATE ? a.label : FALLBACK;
      console.log(`${f.id} ${spans[i][0]}-${spans[i][1]}' -> ${label} (${a.confidence ?? "null"})`);
      return { startMin: spans[i][0], endMin: spans[i][1], label, confidence: a.confidence };
    });
    writeFileSync(
      new URL(`${f.id}.ts`, OUT),
      `// Auto-generated by scripts/story.ts — do not edit by hand.\n` +
        `import type { Chapter } from "../story";\n\n` +
        `const chapters: Chapter[] = ${JSON.stringify(chapters)};\n\n` +
        `export default chapters;\n`,
    );
    console.log(`wrote ${f.id}.ts (${chapters.length} chapters)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
