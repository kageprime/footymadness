# FootyMadness — Tracking + Space Analysis
_Version 0.1 · 2026-09-04 · Status: research doc, no code yet. Covers BOTH: (A) video segmentation/tracking of players + ball, (B) space analysis showing why space opens and who moves into it. A feeds B._

## 1. What we're after
- **A — see everything:** from a fan cam or broadcast clip, detect every player + the ball, frame by frame, on a calibrated pitch.
- **B — explain everything:** from those positions, show control surfaces, vacated space, and off-ball runs — "No.8 dragged two markers, half-space opened, winger arrived 67'."
- Together they turn uploads into breakdowns automatically and Style Clash from words into pictures.

## 2. Stack A — segmentation & tracking (evaluated)
| Candidate | What it is | Fit |
|---|---|---|
| `roboflow/sports` (open lib, Python) | Player/ball detection + ByteTrack tracking + pitch keypoint calibration; open datasets on Roboflow Universe | Best starting point. Modular, documented, active |
| `Gyokuken/Football-Game-Analyzer-YOLO` (solo dev) | YOLO seg + ByteTrack + team clustering (SigLIP+UMAP), pass maps, radar, heatmaps, individual speed/distance, GUI | Closest to "some guy built somethin". Great reference implementation |
| `aviasoletechnologies/football-event-detection` | Adds auto pitch-boundary calibration + structured events (PASS/CROSS/SHOT/GOAL/BALL_OUT with confidence), Dockerized | Best end-to-end pipeline shape |
| `jac99/FootAndBall` (paper + model) | Player + ball detector for long-shot footage | Classic detector many builds stand on |
| Datasets | Roboflow Universe football sets, Voxel51 player-seg (513 imgs, CC0), Soccer Panoptic Segmentation (844 frames, 9.4k labels: players/balls/lines/refs) | Training/eval, never ship footage we don't own |

Pipeline: detect (YOLO) → track (ByteTrack + Re-ID) → calibrate pitch (keypoints/green-mask hull) → team ID (clustering) → events (possession changes, shots, box entries) → tracking JSON.

## 3. Stack B — space analysis (evaluated)
| Candidate | What it is | Fit |
|---|---|---|
| Pitch control (Spearman-style) | Every grass patch colored by which team gets there first, from positions + velocities | The core visual. `soccermatics` lesson code + `databallpy` space-occupation module implement it openly |
| "Wide Open Spaces" (Barça Innovation Hub paper) | Space *occupation* (for self) vs space *generation* (dragging markers for teammates); shows Busquets pivots, Suárez drags, Messi arrivals | Our "vacated space" metric, with worked examples |
| OBPV paper (2025) | Pitch-wide off-ball value incl. transitions, beyond goal-centric OBSO | Upgrade path for midfield phases |
| Spiideo Pitch Control (product) | Auto control surfaces from their cameras, coach-validated | Reference UX, not a dependency |

Outputs: control surfaces per phase, space-gain events (who vacated, who arrived, value), pass maps, heatmaps — all renderable as SVG/canvas overlays on our existing `Pitch` (2.5D, zero new frontend deps).

## 4. Architecture (honest boundary)
- Tracking is a **Python/CV backend workload**, not browser JS. Next.js never runs YOLO.
- Shape: upload (fan cam, user-owned clips only) → worker (FastAPI batch job or serverless; GPU for anything near real-time) → tracking JSON stored beside the thread → frontend viz reads JSON.
- Engine contract mirrors the sim adapter: `src/lib/`-style JSON schemas versioned (`tracking.v1`), so swapping models never touches pages.
- Costs: GPU minutes per clip; cap clip length (e.g. 60s) and resolution (720p min for ball detection) in mock first.

## 5. Where it lands in the product
- **Breakdowns:** auto pass map + heatmap + control snapshot attached to fan-cam uploads; human still writes the argument.
- **Styles:** before/after control surfaces on each clash strip ("watch the half-space open 63'–67'").
- **Fan Hall:** auto chapters on videos ("space opens 67'"), searchable moments.
- **Creator:** overlay vacated-zone hints for an XI ("your 4-3-3 leaves this pocket").
- **Simulator:** tracking-derived style fingerprints feed team strength later (see sim plan).

## 6. Rights & guardrails
- Only user-uploaded clips or licensed footage. Never scrape broadcasts; no re-uploaded TV rips.
- Labels: "AUTO-TRACKED — verify before citing", confidence shown on events, human grades stay authoritative.
- No biometric ID of real people beyond team assignment; no private footage.

## 7. Phases
- **P0 spike:** run roboflow/Gyokuken pipeline on one sample clip locally → export tracking JSON → hand-render one control surface in Styles mock. Proves A→B with zero infra.
- **P1:** worker service + upload flow on one Breakdown thread type; auto pass map + chapters.
- **P2:** control surfaces across Styles strips; space-gain leaderboard ("top space generators, mock week").
- **P3:** live fingerprints into sim + creator hints.

## 8. Open questions
1. Which P0 clip (user-owned fan cam vs synthetic demo)?
2. GPU budget: local spike only, or hosted worker from day one?
3. Auto-analysis on every upload, or opt-in per thread?
4. Do we show raw tracks to users, or only derived visuals?
5. License check on Gyokuken/roboflow weights for commercial use before P1.

## 9. Changelog
- 0.1 (2026-09-04): created from research pass (both stacks evaluated, pipeline + product map, no code).
