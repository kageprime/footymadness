import { useCallback, useRef } from "react";
import type { MatchEvent } from "../../lib/match-centre/schema";

interface Props {
  series: number[];
  events: MatchEvent[];
  minute: number;
  totalMinutes: number;
  homeColor: string;
  awayColor: string;
  onSeek: (minute: number) => void;
}

export default function MomentumChart({ series, events, minute, totalMinutes, homeColor, awayColor, onSeek }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const W = 600;
  const H = 120;
  const mid = H / 2;
  const total = Math.max(1, totalMinutes);
  const bw = W / total;

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const frac = Math.min(0.999, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(Math.floor(frac * total) + 1);
    },
    [onSeek, total],
  );

  return (
    <div
      ref={ref}
      className="w-full cursor-crosshair touch-none select-none"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        seekFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) seekFromClientX(e.clientX);
      }}
      role="slider"
      aria-label="Seek by momentum minute"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(total, Math.max(1, Math.floor(minute) + 1))}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onSeek(Math.max(1, Math.floor(minute)));
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onSeek(Math.min(total, Math.floor(minute) + 2));
        if (e.key === "Home") onSeek(1);
        if (e.key === "End") onSeek(total);
      }}
      data-testid="momentum-chart"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-24 w-full sm:h-28" aria-hidden="true">
        <line x1={0} y1={mid} x2={W} y2={mid} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
        {series.map((v, i) => {
          const hgt = Math.max(2, (Math.abs(v) / 50) * (mid - 8));
          const x = i * bw + 0.5;
          return (
            <rect
              key={i}
              x={x}
              y={v >= 0 ? mid - hgt : mid}
              width={Math.max(1, bw - 1)}
              height={hgt}
              rx={1}
              fill={v >= 0 ? homeColor : awayColor}
              opacity={i < minute ? 0.95 : 0.28}
            />
          );
        })}
        {events
          .filter((e) => e.type === "goal")
          .map((e, i) => {
            const m = Math.floor(e.time / 60);
            const x = m * bw + bw / 2;
            const y = e.team === "home" ? 8 : H - 8;
            return <circle key={i} cx={x} cy={y} r={3.5} fill={e.team === "home" ? homeColor : awayColor} stroke="#fff" strokeWidth={1} />;
          })}
        {minute < total && (
          <g>
            <line
              x1={minute * bw}
              y1={4}
              x2={minute * bw}
              y2={H - 4}
              stroke="#fff"
              strokeWidth={1.5}
              opacity={0.9}
            />
            <circle cx={minute * bw} cy={mid} r={4} fill="#fff" />
          </g>
        )}
      </svg>
    </div>
  );
}
