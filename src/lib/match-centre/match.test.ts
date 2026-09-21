import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_MATCHES,
  MATCH_SECONDS,
  getTracking,
  heatUpTo,
  momentumSeries,
  possessionUpTo,
  pressureUpTo,
  scoreAt,
  thirdsUpTo,
} from "./match";

test("tracking covers the full 90 minutes", () => {
  const { points } = getTracking(DEMO_MATCHES[0]);
  assert.equal(points[0].time, 0);
  assert.equal(points[points.length - 1].time, MATCH_SECONDS);
});

test("score follows the scripted goals", () => {
  const match = DEMO_MATCHES[0];
  assert.deepEqual(scoreAt(match, 60), { home: 0, away: 0 });
  assert.deepEqual(scoreAt(match, 3 * 60), { home: 0, away: 1 });
  assert.deepEqual(scoreAt(match, 30 * 60), { home: 1, away: 1 });
});

test("possession and thirds split to 100", () => {
  const { points } = getTracking(DEMO_MATCHES[1]);
  const p = possessionUpTo(points, 45 * 60);
  assert.ok(Math.abs(p.home + p.away - 100) < 1e-9);
  const th = thirdsUpTo(points, 45 * 60);
  assert.ok(Math.abs(th.defensive + th.middle + th.attacking - 100) < 1e-6);
});

test("heatmap grid has the expected shape", () => {
  const { points } = getTracking(DEMO_MATCHES[0]);
  const grid = heatUpTo(points, 12 * 60, 56, 36);
  assert.equal(grid.home.length, 56 * 36);
  assert.ok(grid.max > 0);
});

test("momentum covers every minute", () => {
  const { points } = getTracking(DEMO_MATCHES[2]);
  const series = momentumSeries(points);
  assert.equal(series.length, 90);
});

test("pressure counters only grow", () => {
  const match = DEMO_MATCHES[0];
  const { points } = getTracking(match);
  const early = pressureUpTo(match.seed, points, 10 * 60);
  const late = pressureUpTo(match.seed, points, 80 * 60);
  assert.ok(late.home.attacks >= early.home.attacks);
  assert.ok(late.away.shots >= early.away.shots);
});
