import { useEffect, useRef } from "react";
import { PITCH_H, PITCH_W } from "../../lib/match-centre/match";
import type { TrackingPoint } from "../../lib/match-centre/schema";
import type { SideDots } from "../../lib/match-centre/players";

interface Props {
  points: TrackingPoint[];
  time: number;
  ball: TrackingPoint;
  dots: SideDots;
  showHeat: boolean;
  showTrail: boolean;
  homeColor: string;
  awayColor: string;
  homeCode: string;
  awayCode: string;
  carrier: string;
  carrierTeam: "home" | "away";
}

type RGB = [number, number, number];

function hexRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB, alpha = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;
const lighten = (c: RGB, t: number): RGB => mix(c, [255, 255, 255], t);
const darken = (c: RGB, t: number): RGB => mix(c, [0, 0, 0], t);

const CHALK = "rgba(245,241,228,0.93)";
const AMBER = "#ffb43a";
const INK_W = 210;
const INK_H = 136;
// Dye memory: the heat layer is the last minute of ball path, not the whole
// match — it reads as flow, while the terrain view keeps the full portrait.
const HEAT_SECS = 60;
const MAX_SPLATS = 56;

// Large soft tonal patches so the grass breathes instead of reading flat.
const PATCHES = [
  { x: 30, y: 18, r: 26, c: "rgba(255,255,235,0.05)" },
  { x: 78, y: 50, r: 30, c: "rgba(0,0,0,0.10)" },
  { x: 52, y: 34, r: 42, c: "rgba(255,255,235,0.035)" },
  { x: 12, y: 56, r: 20, c: "rgba(0,18,8,0.12)" },
  { x: 95, y: 12, r: 18, c: "rgba(0,18,8,0.10)" },
];

export default function FMPitch({
  points,
  time,
  ball,
  dots,
  showHeat,
  showTrail,
  homeColor,
  awayColor,
  homeCode,
  awayCode,
  carrier,
  carrierTeam,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ points, time, ball, dots, showHeat, showTrail });
  state.current = { points, time, ball, dots, showHeat, showTrail };
  // Ink + grain canvases live outside the tick: no re-allocation per frame.
  const ink = useRef<HTMLCanvasElement | null>(null);
  const grain = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!ink.current) {
      ink.current = document.createElement("canvas");
      ink.current.width = INK_W;
      ink.current.height = INK_H;
    }
    if (!grain.current) {
      const g = document.createElement("canvas");
      g.width = 128;
      g.height = 128;
      const gtx = g.getContext("2d");
      if (gtx) {
        const img = gtx.createImageData(128, 128);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = 190 + Math.random() * 65;
          img.data[i] = v;
          img.data[i + 1] = v;
          img.data[i + 2] = v;
          img.data[i + 3] = 13;
        }
        gtx.putImageData(img, 0, 0);
      }
      grain.current = g;
    }

    const draw = () => {
      const s = state.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const home = hexRgb(homeColor);
      const away = hexRgb(awayColor);

      // apron
      ctx.fillStyle = "#0b100c";
      ctx.fillRect(0, 0, w, h);
      const margin = Math.min(w, h) * 0.045;
      const pw = w - margin * 2;
      const ph = h - margin * 2;
      const sc = Math.min(pw / PITCH_W, ph / PITCH_H);
      const ox = (w - PITCH_W * sc) / 2;
      const oy = (h - PITCH_H * sc) / 2;
      const X = (xm: number) => ox + xm * sc;
      const Y = (ym: number) => oy + ym * sc;

      // mow stripes along x
      const bands = 12;
      for (let i = 0; i < bands; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#2e7a3e" : "#287135";
        ctx.fillRect(ox + (i * PITCH_W * sc) / bands, oy, (PITCH_W * sc) / bands + 1, PITCH_H * sc);
      }

      // tonal patches
      for (const p of PATCHES) {
        const g = ctx.createRadialGradient(X(p.x), Y(p.y), 0, X(p.x), Y(p.y), p.r * sc);
        g.addColorStop(0, p.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(ox, oy, pw, ph);
      }

      // grass grain
      const pat = grain.current ? ctx.createPattern(grain.current, "repeat") : null;
      if (pat) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(ox, oy, pw, ph);
        ctx.clip();
        ctx.fillStyle = pat;
        ctx.fillRect(ox, oy, pw, ph);
        ctx.restore();
      }

      // water-dye heat: soft team-tinted splats along the last minute of ball
      // path, each drifting a little downstream with the ball's velocity and
      // fading with age. Rendered on a low-res ink canvas so the upscale
      // reads continuous — no grid cells. Derived from absolute points+time,
      // so scrubbing and feed switches stay correct with no feedback residue.
      if (s.showHeat && s.points.length > 1) {
        const ictx = ink.current!.getContext("2d");
        if (ictx) {
          const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          ictx.setTransform(1, 0, 0, 1, 0, 0);
          ictx.globalCompositeOperation = "source-over";
          ictx.clearRect(0, 0, INK_W, INK_H);
          // NOTE: source-over, oldest first — dye layers like watercolor.
          // Additive ('lighter') blows out to white fire wherever the ball
          // lingers; layered translucency keeps it fluid.
          const kx = INK_W / PITCH_W;
          const ky = INK_H / PITCH_H;
          const idx = Math.max(0, Math.min(s.points.length - 1, Math.floor(s.time)));
          const start = Math.max(0, idx - HEAT_SECS);
          const stride = Math.max(1, Math.floor((idx - start + 1) / MAX_SPLATS));
          for (let i = start; i <= idx; i += stride) {
            const p = s.points[i];
            const age = Math.min(1, Math.max(0, (s.time - p.time) / HEAT_SECS));
            const fade = Math.pow(1 - age, 1.4);
            if (fade <= 0.02) continue;
            const q = s.points[Math.min(idx, i + 1)];
            const r = s.points[Math.max(start, i - 1)];
            const span = Math.max(1, q.time - r.time);
            let dx = ((q.x - r.x) / span) * age * 0.9;
            let dy = ((q.y - r.y) / span) * age * 0.9;
            if (still) {
              dx = 0;
              dy = 0;
            }
            const dl = Math.hypot(dx, dy);
            if (dl > 3) {
              dx = (dx / dl) * 3;
              dy = (dy / dl) * 3;
            }
            const team = p.team === "home" ? home : away;
            const px = (p.x + dx) * kx;
            const py = (p.y + dy) * ky;
            const rad = 3.8 * kx;
            const g = ictx.createRadialGradient(px, py, 0, px, py, rad);
            g.addColorStop(0, css(lighten(team, 0.7), 0.42 * fade));
            g.addColorStop(0.45, css(team, 0.24 * fade));
            g.addColorStop(0.8, css(team, 0.1 * fade));
            g.addColorStop(1, css(team, 0));
            ictx.fillStyle = g;
            ictx.beginPath();
            ictx.arc(px, py, rad, 0, Math.PI * 2);
            ictx.fill();
          }
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.globalAlpha = 0.9;
          ctx.drawImage(ink.current!, ox, oy, pw, ph);
          ctx.restore();
        }
      }

      // floodlight vignette + top glow
      const vg = ctx.createRadialGradient(
        X(PITCH_W / 2),
        Y(PITCH_H * 0.42),
        Math.min(pw, ph) * 0.2,
        X(PITCH_W / 2),
        Y(PITCH_H * 0.42),
        Math.max(pw, ph) * 0.72,
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(0.62, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(2,7,4,0.42)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      // markings
      ctx.strokeStyle = CHALK;
      ctx.lineWidth = Math.max(1.5, sc * 0.14);
      const rect = (x: number, y: number, rw: number, rh: number) => ctx.strokeRect(X(x), Y(y), rw * sc, rh * sc);
      rect(0, 0, PITCH_W, PITCH_H);
      ctx.beginPath();
      ctx.moveTo(X(PITCH_W / 2), Y(0));
      ctx.lineTo(X(PITCH_W / 2), Y(PITCH_H));
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(X(PITCH_W / 2), Y(PITCH_H / 2), 9.15 * sc, 0, Math.PI * 2);
      ctx.stroke();
      const dotSpot = (x: number, y: number) => {
        ctx.fillStyle = CHALK;
        ctx.beginPath();
        ctx.arc(X(x), Y(y), Math.max(1.5, sc * 0.22), 0, Math.PI * 2);
        ctx.fill();
      };
      dotSpot(PITCH_W / 2, PITCH_H / 2);
      dotSpot(11, PITCH_H / 2);
      dotSpot(PITCH_W - 11, PITCH_H / 2);
      const box = (x: number, wd: number, ht: number) => {
        const y0 = PITCH_H / 2 - ht / 2;
        ctx.beginPath();
        if (x === 0) {
          ctx.moveTo(X(x), Y(y0));
          ctx.lineTo(X(x + wd), Y(y0));
          ctx.lineTo(X(x + wd), Y(y0 + ht));
          ctx.lineTo(X(x), Y(y0 + ht));
        } else {
          ctx.moveTo(X(x + wd), Y(y0));
          ctx.lineTo(X(x), Y(y0));
          ctx.lineTo(X(x), Y(y0 + ht));
          ctx.lineTo(X(x + wd), Y(y0 + ht));
        }
        ctx.stroke();
      };
      box(0, 16.5, 40.32);
      box(PITCH_W - 16.5, 16.5, 40.32);
      box(0, 5.5, 18.32);
      box(PITCH_W - 5.5, 5.5, 18.32);
      // arcs
      for (const gx of [11, PITCH_W - 11]) {
        const dir = gx < PITCH_W / 2 ? 1 : -1;
        ctx.beginPath();
        const r = 9.15 * sc;
        const a0 = dir === 1 ? -0.93 : Math.PI - 0.93;
        const a1 = dir === 1 ? 0.93 : Math.PI + 0.93;
        ctx.arc(X(gx), Y(PITCH_H / 2), r, a0, a1, dir !== 1);
        ctx.stroke();
      }
      // corner arcs
      const corners: Array<[number, number, number]> = [
        [0, 0, 0],
        [PITCH_W, 0, Math.PI / 2],
        [PITCH_W, PITCH_H, Math.PI],
        [0, PITCH_H, -Math.PI / 2],
      ];
      for (const [cx, cy, a0] of corners) {
        ctx.beginPath();
        ctx.arc(X(cx), Y(cy), 1 * sc, a0, a0 + Math.PI / 2);
        ctx.stroke();
      }
      // goals with nets
      const goal = (side: 0 | 1) => {
        const depth = 2.2;
        const half = 3.66;
        const cy = PITCH_H / 2;
        const xOut = side === 0 ? -depth : PITCH_W + depth;
        const xLine = side === 0 ? 0 : PITCH_W;
        const nx0 = Math.min(X(xOut), X(xLine));
        const nw = Math.abs(X(xLine) - X(xOut));
        const ny = Y(cy - half);
        const nh = half * 2 * sc;
        ctx.save();
        ctx.beginPath();
        ctx.rect(nx0, ny, nw, nh);
        ctx.clip();
        ctx.strokeStyle = "rgba(245,241,228,0.28)";
        ctx.lineWidth = 1;
        for (let gx = nx0; gx <= nx0 + nw + 1; gx += Math.max(2, 0.55 * sc)) {
          ctx.beginPath();
          ctx.moveTo(gx, ny);
          ctx.lineTo(gx, ny + nh);
          ctx.stroke();
        }
        for (let gy = ny; gy <= ny + nh + 1; gy += Math.max(2, 0.61 * sc)) {
          ctx.beginPath();
          ctx.moveTo(nx0, gy);
          ctx.lineTo(nx0 + nw, gy);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = CHALK;
        ctx.lineWidth = Math.max(2, sc * 0.18);
        ctx.strokeRect(nx0, ny, nw, nh);
      };
      goal(0);
      goal(1);

      // players with shadows + lit bodies
      const r = Math.max(4.5, sc * 0.9);
      const drawSide = (list: typeof s.dots.home, color: RGB, keeperRing: string) => {
        for (const p of list) {
          const px = X(p.x);
          const py = Y(p.y);
          const pr = p.keeper ? r * 1.18 : r;
          ctx.beginPath();
          ctx.ellipse(px, py + pr * 0.55, pr * 0.95, pr * 0.42, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.38)";
          ctx.fill();
          const g = ctx.createLinearGradient(0, py - pr, 0, py + pr);
          g.addColorStop(0, css(lighten(color, 0.3)));
          g.addColorStop(0.55, css(color));
          g.addColorStop(1, css(darken(color, 0.2)));
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.lineWidth = p.keeper ? 2.5 : 1.5;
          ctx.strokeStyle = p.keeper ? keeperRing : "rgba(245,241,228,0.92)";
          ctx.stroke();
        }
      };
      drawSide(s.dots.away, away, AMBER);
      drawSide(s.dots.home, home, AMBER);

      // ball comet + ball
      const bx = X(s.ball.x);
      const by = Y(s.ball.y);
      if (s.showTrail && s.points.length > 2) {
        const idx = Math.max(0, Math.min(s.points.length - 1, Math.floor(s.time)));
        const c0 = s.points[idx];
        const c1 = s.points[Math.max(0, idx - 1)];
        const c2 = s.points[Math.max(0, idx - 2)];
        ctx.lineCap = "round";
        const seg = (a: TrackingPoint, b: TrackingPoint, wdt: number, alpha: number) => {
          if (Math.hypot(b.x - a.x, b.y - a.y) > 12) return;
          ctx.beginPath();
          ctx.moveTo(X(a.x), Y(a.y));
          ctx.lineTo(X(b.x), Y(b.y));
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = wdt;
          ctx.stroke();
        };
        seg(c2, c1, 1.2, 0.12);
        seg(c1, c0, 2.4, 0.3);
      }
      ctx.beginPath();
      ctx.ellipse(bx, by + r * 0.9, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, r * 2.1);
      glow.addColorStop(0, "rgba(255,255,255,0.42)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, r * 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, r * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.stroke();

      // carrier ring + tag
      const teamColor = carrierTeam === "home" ? homeColor : awayColor;
      ctx.beginPath();
      ctx.arc(bx, by, r * 1.6, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = AMBER;
      ctx.globalAlpha = 0.95;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.font = "600 12px 'Space Grotesk', system-ui, sans-serif";
      const label = `${carrier} · ${carrierTeam === "home" ? homeCode : awayCode}`;
      const tw = ctx.measureText(label).width;
      const lx = Math.max(ox + 4, Math.min(ox + PITCH_W * sc - tw - 12, bx - tw / 2));
      const ly = Math.max(oy + 16, by - r - 26);
      ctx.fillStyle = "rgba(4,7,5,0.86)";
      const pad = 5;
      ctx.beginPath();
      ctx.roundRect(lx - pad, ly - 13, tw + pad * 2 + 8, 19, 5);
      ctx.fill();
      ctx.fillStyle = AMBER;
      ctx.beginPath();
      ctx.arc(lx, ly - 3.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(label, lx + 8, ly + 1);

      // end codes
      ctx.font = "700 11px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "rgba(245,241,228,0.78)";
      ctx.fillText(homeCode, X(3), Y(6));
      ctx.fillText(awayCode, X(PITCH_W - 3) - ctx.measureText(awayCode).width, Y(6));
    };

    draw();
    const id = window.setInterval(draw, 120);
    return () => window.clearInterval(id);
  }, [homeColor, awayColor, homeCode, awayCode, carrier, carrierTeam]);

  return (
    <canvas
      ref={ref}
      className="block h-full w-full"
      role="img"
      aria-label={`Night pitch view, ${homeCode} versus ${awayCode}, carrier ${carrier}`}
      data-testid="fm-canvas"
    />
  );
}
