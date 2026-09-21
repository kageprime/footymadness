import { Zap } from "lucide-react";
import { clockLabel } from "../../../lib/match-centre/match";
import type { FeedData } from "../../../lib/match-centre/feed";

interface Props {
  feed: FeedData | null;
  score: { home: number; away: number };
  time: number;
  done: boolean;
  half: string;
  possession: "home" | "away";
}

/** Broadcast scorebug: teams, big numbers, clock, scorers to date. */
export default function Scoreboard({ feed, score, time, done, half, possession }: Props) {
  return (
    <div className="border-b border-edge px-4 pb-3 pt-3">
      <div className="flex items-center gap-2">
        {feed != null && !done && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#ffb43a]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffb43a]" aria-hidden />
            Live
          </span>
        )}
        <p className="text-xs text-fog">{feed?.kicker ?? "Loading match"}</p>
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-semibold">
            <span aria-hidden>{possession === "home" ? "● " : ""}</span>
            {feed?.home.name} <span className="font-normal text-slate-400">{feed?.home.code}</span>
          </p>
          <div className="mt-1 h-1 w-24 rounded-full" style={{ background: feed?.home.color }} aria-hidden />
          <p className="tnum font-display mt-1 text-6xl font-bold leading-none sm:text-7xl" data-testid="text-home-score" aria-live="polite">
            {score.home}
          </p>
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            {feed?.events
              .filter((e) => e.team === "home" && e.type === "goal" && e.time <= time)
              .map((e) => (
                <p key={e.time} className="flex items-center gap-1">
                  <Zap size={11} style={{ color: feed.home.color }} aria-hidden />
                  {e.player} {Math.floor(e.time / 60)}'
                </p>
              ))}
          </div>
        </div>
        <div className="pt-1 text-center">
          <p className="tnum font-display text-4xl font-bold sm:text-5xl" data-testid="text-clock">
            {feed == null ? "…" : done ? "FT" : clockLabel(time)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-fog">
            {feed == null ? "Loading" : done ? (feed.note ?? "Full time") : half}
          </p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm font-semibold">
            <span aria-hidden>{possession === "away" ? "● " : ""}</span>
            {feed?.away.name} <span className="font-normal text-slate-400">{feed?.away.code}</span>
          </p>
          <div className="mt-1 h-1 w-24 rounded-full" style={{ background: feed?.away.color }} aria-hidden />
          <p className="tnum font-display mt-1 text-6xl font-bold leading-none sm:text-7xl" data-testid="text-away-score" aria-live="polite">
            {score.away}
          </p>
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            {feed?.events
              .filter((e) => e.team === "away" && e.type === "goal" && e.time <= time)
              .map((e) => (
                <p key={e.time} className="flex items-center justify-end gap-1">
                  <Zap size={11} style={{ color: feed.away.color }} aria-hidden />
                  {e.player} {Math.floor(e.time / 60)}'
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
