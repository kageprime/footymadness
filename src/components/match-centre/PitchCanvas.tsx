import { useEffect, useRef } from "react";
import { PITCH_H, PITCH_W, type HeatGrid } from "../../lib/match-centre/match";
import type { TrackingPoint } from "../../lib/match-centre/schema";

interface Props {
  grid: HeatGrid;
  ball: TrackingPoint;
  trail: TrackingPoint[];
  tilt: number;
  showHeat: boolean;
  showTrail: boolean;
  showLines: boolean;
  homeColor: string;
  awayColor: string;
  homeCode: string;
  awayCode: string;
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function css(c: [number, number, number], alpha = 1) {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;
}

const COS_A = 0.866;

export default function PitchCanvas({
  grid,
  ball,
  trail,
  tilt,
  showHeat,
  showTrail,
  showLines,
  homeColor,
  awayColor,
  homeCode,
  awayCode,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ grid, ball, trail, tilt, showHeat, showTrail, showLines });
  state.current = { grid, ball, trail, tilt, showHeat, showTrail, showLines };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let bob = 0;

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
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();

      const elev = s.tilt;
      const lift = 0.9;
      const S = Math.min((w * 0.94) / (2 * COS_A), (h * 0.82) / (2 * elev + lift));
      const cx = w / 2;
      const cy = h * 0.09;

      const project = (u: number, v: number, hn: number): [number, number] => [
        cx + (u - v) * COS_A * S,
        cy + (u + v) * elev * S - hn * lift * S,
      ];

      const home = hexRgb(homeColor);
      const away = hexRgb(awayColor);
      const { cols, rows } = s.grid;
      // Floor the normalizer so the opening seconds read as low water,
      // not a spike; sqrt softens late-match peaks like the reference.
      const effMax = Math.max(12, s.grid.max);
      const norm = (tot: number) => Math.sqrt(Math.max(0, tot) / effMax);

      // Bilinear sample so faces shade continuously — the old nearest-cell
      // read is what made the surface look faceted instead of fluid.
      const sample = (arr: Float32Array, u: number, v: number) => {
        const fx = Math.min(cols - 1.001, Math.max(0, u * cols - 0.5));
        const fy = Math.min(rows - 1.001, Math.max(0, v * rows - 0.5));
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const x1 = Math.min(cols - 1, x0 + 1);
        const y1 = Math.min(rows - 1, y0 + 1);
        const a = arr[y0 * cols + x0];
        const b = arr[y0 * cols + x1];
        const c = arr[y1 * cols + x0];
        const d = arr[y1 * cols + x1];
        return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
      };

      // backdrop glow
      const bg = ctx.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h * 0.45, Math.max(w, h) * 0.7);
      bg.addColorStop(0, "rgba(18,110,120,0.18)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // base pitch plane
      const c00 = project(0, 0, 0);
      const c10 = project(1, 0, 0);
      const c11 = project(1, 1, 0);
      const c01 = project(0, 1, 0);
      ctx.beginPath();
      ctx.moveTo(...c00);
      ctx.lineTo(...c10);
      ctx.lineTo(...c11);
      ctx.lineTo(...c01);
      ctx.closePath();
      ctx.fillStyle = "#0a0f0d";
      ctx.fill();
      ctx.strokeStyle = "rgba(245,241,228,0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (s.showHeat) {
        for (let sum = 0; sum <= cols + rows - 2; sum++) {
          for (let ix = 0; ix < cols; ix++) {
            const iy = sum - ix;
            if (iy < 0 || iy >= rows) continue;
            const uc = (ix + 0.5) / cols;
            const vc = (iy + 0.5) / rows;
            const ht = sample(s.grid.home, uc, vc);
            const at = sample(s.grid.away, uc, vc);
            const tot = ht + at;
            if (tot <= 0.02) continue;
            // Gentle travelling ripple so the surface breathes like water;
            // amplitude scales with height so low water stays calm.
            const ripple = 1 + 0.05 * Math.sin((uc + vc) * 12 - now * 0.004);
            const hn = Math.min(1.25, norm(tot) * ripple);
            const alpha = 0.35 + 0.6 * Math.min(1, hn);
            const share = ht / tot; // 1 = fully home
            // Snap leaners toward the dominant side (smoothstep) so the two
            // kits separate instead of mushing into one middle blue; true
            // 50/50 cells stay neutral. Bilinear sampling keeps it organic.
            const shareC = share * share * (3 - 2 * share);
            const base = mix(away, home, shareC);
            // Thermal-water ramp: neutral dark water at the edges (kept
            // neutral so light kits like Argentina stay legible), team color
            // mid-slope, warm cream on the peaks, plus a slow specular shimmer.
            const sea = mix(base, [10, 15, 13], 0.5);
            const ramp = mix(sea, base, Math.min(1, hn * 2.6));
            const hc = Math.min(1, hn);
            const shimmer = 0.45 + 0.25 * Math.sin(now * 0.003 + uc * 6 + vc * 4);
            const lit = mix(ramp, [255, 233, 196], Math.min(1, Math.pow(hc, 2.2) * 0.6 + Math.pow(hc, 4) * shimmer * 0.4));
            const u0 = ix / cols;
            const u1 = (ix + 1) / cols;
            const v0 = iy / rows;
            const v1 = (iy + 1) / rows;
            const p00 = project(u0, v0, hn);
            const p10 = project(u1, v0, hn);
            const p11 = project(u1, v1, hn);
            const p01 = project(u0, v1, hn);
            // south + east skirts give the extruded-terrain read
            const dark = mix(base, [4, 8, 7], 0.5);
            ctx.beginPath();
            ctx.moveTo(...p01);
            ctx.lineTo(...p11);
            ctx.lineTo(...project(u1, v1, 0));
            ctx.lineTo(...project(u0, v1, 0));
            ctx.closePath();
            ctx.fillStyle = css(dark, alpha);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(...p10);
            ctx.lineTo(...p11);
            ctx.lineTo(...project(u1, v1, 0));
            ctx.lineTo(...project(u1, v0, 0));
            ctx.closePath();
            ctx.fillStyle = css(mix(dark, [0, 0, 0], 0.25), alpha);
            ctx.fill();
            // top face
            ctx.beginPath();
            ctx.moveTo(...p00);
            ctx.lineTo(...p10);
            ctx.lineTo(...p11);
            ctx.lineTo(...p01);
            ctx.closePath();
            ctx.fillStyle = css(lit, Math.min(0.95, alpha + 0.1));
            ctx.fill();
          }
        }
      }

      if (s.showLines) {
        ctx.strokeStyle = "rgba(245,241,228,0.8)";
        ctx.lineWidth = Math.max(1, S * 0.004);
        const line = (pts: Array<[number, number]>) => {
          ctx.beginPath();
          pts.forEach(([xm, ym], i) => {
            const [sx, sy] = project(xm / PITCH_W, ym / PITCH_H, 0.004);
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          });
          ctx.stroke();
        };
        line([
          [0, 0],
          [PITCH_W, 0],
          [PITCH_W, PITCH_H],
          [0, PITCH_H],
          [0, 0],
        ]);
        line([
          [PITCH_W / 2, 0],
          [PITCH_W / 2, PITCH_H],
        ]);
        const circle: Array<[number, number]> = [];
        for (let a = 0; a <= 48; a++) {
          const t = (a / 48) * Math.PI * 2;
          circle.push([PITCH_W / 2 + Math.cos(t) * 9.15, PITCH_H / 2 + Math.sin(t) * 9.15]);
        }
        line(circle);
        const box = (x0: number, wdt: number, hgt: number) => {
          const y0 = PITCH_H / 2 - hgt / 2;
          line([
            [x0, y0],
            [x0 + wdt, y0],
            [x0 + wdt, y0 + hgt],
            [x0, y0 + hgt],
          ]);
        };
        box(0, 16.5, 40.3);
        box(PITCH_W - 16.5, 16.5, 40.3);
        box(0, 5.5, 18.32);
        box(PITCH_W - 5.5, 5.5, 18.32);
      }

      // trail (gaps where the feed jumps between distant observations)
      if (s.showTrail && s.trail.length > 1) {
        for (let i = 1; i < s.trail.length; i++) {
          const a = s.trail[i - 1];
          const b = s.trail[i];
          if (Math.hypot(b.x - a.x, b.y - a.y) > 12) continue;
          const [ax, ay] = project(a.x / PITCH_W, a.y / PITCH_H, 0.03);
          const [bx, by] = project(b.x / PITCH_W, b.y / PITCH_H, 0.03);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(255,255,255,${(i / s.trail.length) * 0.55})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // ball with glow + possession ring
      bob += 0.06;
      const bcol = s.ball.team === "home" ? home : away;
      const [bx, by] = project(
        s.ball.x / PITCH_W,
        s.ball.y / PITCH_H,
        0.035 + Math.sin(bob) * 0.006,
      );
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 16);
      glow.addColorStop(0, css(bcol, 0.85));
      glow.addColorStop(0.4, css(bcol, 0.35));
      glow.addColorStop(1, css(bcol, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 8.5, 0, Math.PI * 2);
      ctx.strokeStyle = css(bcol, 0.95);
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // end labels
      ctx.font = "600 11px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "rgba(245,241,228,0.65)";
      const [hx, hy] = project(0.015, 0.5, 0.01);
      const [ax2, ay2] = project(0.985, 0.5, 0.01);
      ctx.fillText(homeCode, hx - 8, hy);
      ctx.fillText(awayCode, ax2 - 8, ay2);
    };

    draw();
    const id = window.setInterval(draw, 100);
    raf = id as unknown as number;
    return () => window.clearInterval(id);
  }, [homeColor, awayColor, homeCode, awayCode]);

  return (
    <canvas
      ref={ref}
      className="block h-full w-full"
      role="img"
      aria-label={`Ball tracking heatmap, ${homeCode} versus ${awayCode}`}
      data-testid="pitch-canvas"
    />
  );
}
