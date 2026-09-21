import { trailSegments, type Xy } from "../../../lib/match-centre/format";

interface Props {
  trail: Xy[];
  ball: Xy & { team: "home" | "away" };
  homeColor: string;
  awayColor: string;
}

/** Pocket top-down radar: trail segments plus live ball. */
export default function MiniMap({ trail, ball, homeColor, awayColor }: Props) {
  return (
    <svg viewBox="0 0 105 68" className="mt-3 w-full rounded-lg border border-edge bg-pitch" aria-label="Top-down ball position" role="img">
      <rect x="1" y="1" width="103" height="66" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="52.5" y1="1" x2="52.5" y2="67" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <circle cx="52.5" cy="34" r="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      {trailSegments(trail).map((seg, i) => (
        <polyline
          key={i}
          points={seg.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
        />
      ))}
      <circle cx={ball.x} cy={ball.y} r="3.4" fill="#fff" />
      <circle
        cx={ball.x}
        cy={ball.y}
        r="5.4"
        fill="none"
        stroke={ball.team === "home" ? homeColor : awayColor}
        strokeWidth="1.6"
      />
    </svg>
  );
}
