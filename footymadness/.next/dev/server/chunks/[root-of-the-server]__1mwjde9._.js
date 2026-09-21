module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/feed/[key]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$statsbomb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/statsbomb.ts [app-route] (ecmascript)");
;
async function GET(_req, { params }) {
    try {
        const { key } = await params;
        const feed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$statsbomb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRealFeed"])(key);
        return Response.json(feed, {
            headers: {
                "Cache-Control": "public, max-age=86400"
            }
        });
    } catch (err) {
        console.error("feed error:", err);
        return Response.json({
            message: "Real feed unavailable right now"
        }, {
            status: 502
        });
    }
}
}),
"[project]/src/server/statsbomb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRealFeed",
    ()=>getRealFeed,
    "realFeedKeys",
    ()=>realFeedKeys
]);
/**
 * StatsBomb open-data adapter.
 *
 * Turns real event data (+ 360 freeze frames) from StatsBomb's free
 * open-data set into the 1 Hz ball samples and sparse player dots the
 * Touchline client renders. Upstream payloads are fetched once and cached
 * in memory; the client receives a compact, pitch-normalized feed.
 *
 * Coordinates: StatsBomb 120x80 -> Touchline 105x68.
 * Only open-play periods (1-4) drive the ball; shootouts are noted, not drawn.
 */ const UPSTREAM = "https://raw.githubusercontent.com/statsbomb/open-data/master/data";
const FEEDS = {
    "arg-fra-22": {
        matchId: 3869685,
        home: {
            name: "Argentina",
            code: "ARG",
            color: "#7cc0ff"
        },
        away: {
            name: "France",
            code: "FRA",
            color: "#3f6dff"
        },
        homeId: 779,
        awayId: 771,
        venue: "Lusail Stadium · World Cup Final 2022",
        note: "Argentina won 4–2 on penalties after 3–3"
    }
};
function realFeedKeys() {
    return Object.keys(FEEDS);
}
const cache = new Map();
const inflight = new Map();
const SX = 105 / 120;
const SY = 68 / 80;
function shortName(full) {
    const parts = full.trim().split(/\s+/);
    if (parts.length <= 2) return full;
    return `${parts[0]} ${parts[parts.length - 1]}`;
}
async function fetchJson(path) {
    const res = await fetch(`${UPSTREAM}/${path}`);
    if (!res.ok) throw new Error(`StatsBomb ${path} -> ${res.status}`);
    return await res.json();
}
function eventTime(e) {
    return e.minute * 60 + e.second;
}
async function getRealFeed(key) {
    const spec = FEEDS[key];
    if (!spec) throw new Error(`Unknown real feed: ${key}`);
    const hit = cache.get(key);
    if (hit) return hit;
    const running = inflight.get(key);
    if (running) return running;
    const job = buildFeed(spec, key).then((feed)=>{
        cache.set(key, feed);
        inflight.delete(key);
        return feed;
    });
    inflight.set(key, job);
    return job;
}
async function buildFeed(spec, key) {
    const [events, frames] = await Promise.all([
        fetchJson(`events/${spec.matchId}.json`),
        fetchJson(`three-sixty/${spec.matchId}.json`)
    ]);
    const teamOf = (id)=>id === spec.homeId ? "home" : "away";
    const open = events.filter((e)=>e.period <= 4);
    // --- halves from period boundaries (period first: stoppage minutes overlap) ---
    const byPeriodThenTime = (a, b)=>a.period - b.period || eventTime(a) - eventTime(b);
    const ordered = [
        ...open
    ].sort(byPeriodThenTime);
    const labels = [
        "1ST HALF",
        "2ND HALF",
        "ET · FIRST",
        "ET · SECOND"
    ];
    const halves = [];
    let currentPeriod = 0;
    let start = 0;
    for (const e of ordered){
        if (e.period !== currentPeriod) {
            if (currentPeriod > 0) {
                halves.push({
                    from: start,
                    to: eventTime(e),
                    label: labels[currentPeriod - 1] ?? "EXTRA TIME"
                });
            }
            currentPeriod = e.period;
            start = eventTime(e);
        }
    }
    const durationSec = eventTime(ordered[ordered.length - 1]);
    halves.push({
        from: start,
        to: durationSec,
        label: labels[currentPeriod - 1] ?? "EXTRA TIME"
    });
    const anchors = [];
    for (const e of ordered){
        if (!e.location) continue;
        const by = e.player ? shortName(e.player.name) : teamOf(e.team.id) === "home" ? spec.home.code : spec.away.code;
        anchors.push({
            t: eventTime(e),
            x: e.location[0] * SX,
            y: e.location[1] * SY,
            teamId: e.possession_team.id,
            by
        });
        if (e.type.name === "Carry" && e.end_location) {
            anchors.push({
                t: eventTime(e) + 0.5,
                x: Math.max(0, Math.min(120, e.end_location[0])) * SX,
                y: Math.max(0, Math.min(80, e.end_location[1])) * SY,
                teamId: e.possession_team.id,
                by
            });
        }
    }
    anchors.sort((a, b)=>a.t - b.t);
    const clampX = (x)=>Math.max(1, Math.min(104, x));
    const clampY = (y)=>Math.max(1, Math.min(67, y));
    const points = [];
    let ai = 0;
    for(let s = 0; s <= durationSec; s++){
        while(ai < anchors.length - 2 && anchors[ai + 1].t <= s)ai++;
        const a = anchors[Math.min(ai, anchors.length - 1)];
        const b = anchors[Math.min(ai + 1, anchors.length - 1)];
        const span = Math.max(0.001, b.t - a.t);
        const f = Math.max(0, Math.min(1, (s - a.t) / span));
        const use = f < 0.5 ? a : b;
        points.push({
            time: s,
            x: Math.round(clampX(a.x + (b.x - a.x) * f) * 10) / 10,
            y: Math.round(clampY(a.y + (b.y - a.y) * f) * 10) / 10,
            team: teamOf(use.teamId),
            by: use.by
        });
    }
    // --- player dots from 360 frames, sampled every 2 s ---
    const byUuid = new Map(events.map((e)=>[
            e.id,
            e
        ]));
    const raw = [];
    for (const f of frames){
        const e = byUuid.get(f.event_uuid);
        if (!e || e.period > 4) continue;
        const home = [];
        const away = [];
        for (const p of f.freeze_frame){
            const dot = {
                x: Math.round(clampX(p.location[0] * SX) * 10) / 10,
                y: Math.round(clampY(p.location[1] * SY) * 10) / 10,
                keeper: p.keeper
            };
            // teammate = same side as the event's team
            const side = teamOf(e.team.id);
            (p.teammate ? side === "home" ? home : away : side === "home" ? away : home).push(dot);
        }
        raw.push({
            t: eventTime(e),
            home,
            away
        });
    }
    raw.sort((a, b)=>a.t - b.t);
    const matchDots = (prev, next)=>{
        // nearest-neighbour pairing so dots glide instead of jumping
        const used = new Array(next.length).fill(false);
        return prev.map((p)=>{
            let best = -1;
            let bestD = Infinity;
            for(let i = 0; i < next.length; i++){
                if (used[i] || next[i].keeper !== p.keeper) continue;
                const d = (next[i].x - p.x) ** 2 + (next[i].y - p.y) ** 2;
                if (d < bestD) {
                    bestD = d;
                    best = i;
                }
            }
            if (best === -1) return {
                ...p
            };
            used[best] = true;
            return {
                ...next[best],
                _from: p
            };
        });
    };
    const outFrames = [];
    let ri = 0;
    for(let s = 0; s <= durationSec; s += 3){
        while(ri < raw.length - 2 && raw[ri + 1].t <= s)ri++;
        const a = raw[Math.max(0, Math.min(ri, raw.length - 1))];
        const b = raw[Math.max(0, Math.min(ri + 1, raw.length - 1))];
        if (!a) break;
        const span = Math.max(0.001, b.t - a.t);
        const f = Math.max(0, Math.min(1, (s - a.t) / span));
        const blend = (pa, pb)=>{
            const paired = matchDots(pa, pb);
            return paired.map((d)=>{
                const from = d._from;
                if (!from) return {
                    x: d.x,
                    y: d.y,
                    keeper: d.keeper
                };
                return {
                    x: Math.round((from.x + (d.x - from.x) * f) * 10) / 10,
                    y: Math.round((from.y + (d.y - from.y) * f) * 10) / 10,
                    keeper: d.keeper
                };
            });
        };
        outFrames.push({
            t: s,
            home: blend(a.home, b.home),
            away: blend(a.away, b.away)
        });
    }
    // --- goals + cards ---
    const outEvents = [];
    for (const e of ordered){
        if (e.type.name === "Shot" && e.shot?.outcome?.name === "Goal" && e.player) {
            outEvents.push({
                time: eventTime(e),
                type: "goal",
                team: teamOf(e.team.id),
                player: shortName(e.player.name),
                detail: e.shot.technique?.name ?? "Finish"
            });
        } else if (e.type.name === "Bad Behaviour" && e.player) {
            const card = e.bad_behaviour?.card?.name ?? "";
            if (/yellow|red/i.test(card)) {
                outEvents.push({
                    time: eventTime(e),
                    type: "card",
                    team: teamOf(e.team.id),
                    player: shortName(e.player.name),
                    detail: card
                });
            }
        }
    }
    outEvents.sort((a, b)=>a.time - b.time);
    return {
        key,
        source: "statsbomb",
        home: spec.home,
        away: spec.away,
        venue: spec.venue,
        note: spec.note,
        durationSec,
        halves,
        points,
        frames: outFrames,
        events: outEvents
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1mwjde9._.js.map