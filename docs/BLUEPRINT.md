# FootyMadness — Living Blueprint
_Version 0.6 · 2026-09-04 · Status: mock-first prototype · Platformed now: Fan Hall + Creator + Games (fun-only, no stakes). Refs/breakdowns/sentiment/styles stay live as paused labs._

## 1. What this is
Analytics-only football companion for FM / FIFA / PES brains. Four probes, no betting, no escrow, no private scraping:
- **02 Ref Room** — ref tendencies vs league average.
- **03 Bounty SBCs** — fan tactical breakdowns, graded and voted.
- **06 Noise Table** — public fan mood as dB, not a trade signal.
- **11 Matchday Strips** — style clashes with corners/cards volume reads.

Non-goals (v0): real-money pools, odds-setting, live scores, player images, private-group scraping, profit promises.

## 2. Who it serves
- Primary: data-literate fans 16–40, desktop for tables + phone on matchday.
- Secondary: casuals checking one tie before kickoff.
- Jobs: who is strict? whose tactic explains the game? how loud is our stand? where do styles collide?

## 3. Product map (mock now, adapters later)
- `/` Dashboard: lead story + fan-hall teaser + dugout sheet rows + bounty lead + loudest stand. `src/app/page.tsx`
- `/debates` Fan Hall: cross-club argument feed (text/audio/video mock), club + kind filters, heat ranking, composer mock. `src/app/debates/page.tsx` + `Debate` in `src/lib/mock.ts`
- `/refs`: FM table sorted by strictness + H/A split bars. `src/app/refs/page.tsx`
- `/breakdowns`: lead SBC + rows with ORI/INS/CLA + pouch. `src/app/breakdowns/page.tsx`
- `/sentiment`: ranked dB table, public posts only. `src/app/sentiment/page.tsx`
- `/styles`: broadcast strips with scorebug + pitch + clash/corners/cards. `src/app/styles/page.tsx`
- Shared: `src/components/game.tsx` (Crest, Scorebug, Pitch, Meter), `src/lib/mock.ts` (Referee, Breakdown, SentimentTeam, StyleMatchup).
- Proposed: `/creator` fan XI (see §6).

## 4. Data strategy (mock-first)
- Now: `src/lib/mock.ts` — 4 refs, 4 breakdowns, 5 teams, 3 ties. Shape new mocks to match future API shapes.
- Next (free): `football-data.org` (fixtures/tables, 12 comps), `TheSportsDB` (badges), `StatsBomb Open Data` (event-level history + xG).
- Later (paid): `API-Football` $19/mo for live/lineups, `Sportmonks` €29/mo+ for xG. No scraping (FBref precedent Jan 2026).
- Rule: create `src/lib/football.ts` adapter layer when we go live so pages never call APIs directly. Cache, show sample size + window, never imply certainty.

## 5. UI system — FM-dugout × FUT (not a Vaun copy)
- Tokens: pitch `#0A120B`, card `#121A12`, edge `#263026`, chalk `#EDF2E6`, gold `#E8C547` (ratings/pouches/clash only), fog for meta. `@theme` in `src/app/globals.css`.
- Type: Anton display uppercase + Space Grotesk body, tabular numerals, left-aligned headlines.
- Patterns: tables over cards, dividers over boxes, lead story + rows, broadcast scorebug + tactics pitch, inline SVG/CSS crests (no external images, always renders offline).
- Motion: `rise` 60–70ms stagger, transform/opacity only, `prefers-reduced-motion` guard. 44px targets, gold focus ring.
- Anti-slop: no identical card grids, no gradients-everywhere, no emoji-as-UI, no profit language.

## 6. Libraries (vetted, not yet installed)
- Creator pitch libs: installed `react-soccer-lineup` then removed (duplicate view); custom `DugoutBuilder` won. See §12 changelog.
- Tracking + space: full evaluation in `docs/TRACKING-SPACE.md` (segmentation/tracking stack + pitch-control/space stack, pipeline, product map). No code yet.

## 7. Lessons from FUTBIN / FotMob / FBref
Steal loops, not skin: DB depth + graphs, builder habit, cheapest-solver trust via votes/completion %, alerts, community squads/reviews, fast search, free core. Avoid ad/lag bloat and market-moving claims.

## 8. Legal / trust guardrails
Analytics-only. No odds, no escrow, no P2P pools. Public sources only with citation + sample/window. Disclaimers on every module + footer (18+, check local laws, bet responsibly). Player/team names in mock are editorial placeholders — replace with licensed data before public launch. No WhatsApp/private scraping.

## 9. Roadmap (flexible phases)
- **P0 now:** de-slopped mock UI (done, build passes), this blueprint, 93 skills in `.agents/skills` (56 UI + 37 Pocock).
- **P1 next:** `/creator` mock, `.better-web-ui.md` design context file, crest set expansion, empty/loading states.
- **P2 later:** adapter layer + free APIs (tables/fixtures/badges), price/alert equivalents (form alerts, not betting), community votes.
- **P3 much later:** paid live data, moderation queue, accounts, premium (ad-free/faster) only if needed.

## 10. Skills in use
`.agents/skills` (93) + `skills-lock.json`. UI: `frontend-design`, `bolder`, `data-viz`, `critique`, `polish`. Engineering (Pocock): `prototype`, `tdd`, `diagnosing-bugs`, `to-spec`. Run `/setup` equivalent by updating §5 here instead of hallucinating style.

## 11. Open questions (decide as we grow)
1. 02: ref data source — stay mock until tables feel right?
2. 03: rubric weights + who moderates + what earns the pouch?
3. 06: which public sources + window (24h / 7d)?
4. 11: confidence = model agreement — show formula?
5. `/creator`: save-as-image only, or shareable links?
6. Monetization: stay free, or FUTBIN-style premium later?

## 12. Changelog
- 0.10 (2026-09-04): Replay opens as video — result shows pitch thumbnail with play button; opens full overlay player (canvas replay, scrub, goal chips), Escape/backdrop close, scroll lock.
- 0.9 (2026-09-04): Animated replay — engine snapshots captured (2s cadence) in `sim.ts`, canvas replay in `SimPanel` (play/pause, 1x/2x/8x, scrubber, goal-jump chips, live score-at-time). 2.5D dots broadcast.
- 0.8 (2026-09-04): Sim P0 spike — `@bleckert/football-simulator` agent engine behind `src/lib/sim.ts` (mock club ratings, seeded, chunked runner), `SimPanel` on each Styles strip (score, reporter headline/summary, stat grid, minute feed, re-sim). Smoke-tested in Node (3-0/2-0/0-0, ~7s/match). Mock only, labeled simulation.
- 0.7 (2026-09-04): `docs/TRACKING-SPACE.md` — both stacks documented (video segmentation/tracking + pitch-control/space analysis), pipeline, product map, phases. No code.
- 0.6 (2026-09-04): Games room `/games` — playable best-of-5 penalty shootout + 3-tie weekend predictor, mock boards, explicit no-stakes house rules (`src/lib/games.ts`). Nav + dashboard wired. Fun only: points/badges, no entry fees, no prizes.
- 0.5 (2026-09-04): Scoped platform to Fan Hall + Creator. Creator is one FM team sheet (shape, shirts, mentality/tempo/pressing, subs, copy XI) — duplicate broadcast preview + `react-soccer-lineup` removed. Nav + dashboard lead with the two rooms; other probes live under paused labs.
- 0.4 (2026-09-04): Thread flow — `/debates/[id]` expanded view (breadcrumb, expanded audio/video, up/down votes, hot/top/new sort, collapsible nested replies, reply composer mock, related threads), list links wired, 16 static routes.
- 0.3 (2026-09-04): Fan Hall `/debates` — 6 mock cross-club threads (text/audio/video), club+kind filters, heat rank, composer mock, dashboard teaser, nav wired.
- 0.2 (2026-09-04): P1 — `.better-web-ui.md` context, `react-soccer-lineup` + `react-squad-builder` installed, `/creator` mock XI with `src/lib/football.ts` adapter + type shim, nav wired, build green (9 routes).
- 0.1 (2026-09-04): created from mock prototype (dashboard + 4 modules, pitch/chalk/gold, build green). Next: `/creator` decision + design context file.
