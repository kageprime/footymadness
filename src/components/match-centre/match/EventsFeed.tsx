import { Square, Zap } from "lucide-react";
import { CardShell } from "./meters";
import type { FeedData } from "../../../lib/match-centre/feed";

interface Props {
  feed: FeedData;
  time: number;
  done: boolean;
  totalMin: number;
}

/** Goals and cards to date, dimmed until they happen. */
export default function EventsFeed({ feed, time, done, totalMin }: Props) {
  return (
    <CardShell title="Events">
      <ol className="mt-2 space-y-2">
        <li className="flex items-center gap-2 text-xs text-slate-500">
          <span className="tnum w-8">0'</span> Kick-off · {feed.venue.split("·")[0]}
        </li>
        {feed.events.map((e) => {
          const seen = e.time <= time;
          const color = e.team === "home" ? feed.home.color : feed.away.color;
          const side = e.team === "home" ? feed.home.code : feed.away.code;
          return (
            <li
              key={`${e.time}-${e.player}`}
              className={`flex items-start gap-2 text-xs ${seen ? "text-slate-100" : "text-slate-500"}`}
              data-testid={`event-${Math.floor(e.time / 60)}`}
            >
              <span className="tnum w-8 shrink-0">{Math.floor(e.time / 60)}'</span>
              {e.type === "goal" ? (
                <Zap size={12} className="mt-0.5 shrink-0" style={{ color }} aria-hidden />
              ) : (
                <Square
                  size={11}
                  className="mt-0.5 shrink-0"
                  fill={/red/i.test(e.detail) ? "#ef4444" : "#eab308"}
                  color={/red/i.test(e.detail) ? "#ef4444" : "#eab308"}
                  aria-hidden
                />
              )}
              <span>
                {e.type === "goal" ? (
                  <>
                    <strong>{e.player}</strong> scores for {side}
                    <br />
                    <span className="text-slate-400">{e.detail}</span>
                  </>
                ) : (
                  <>
                    <strong>{e.player}</strong> · {e.detail}
                    <br />
                    <span className="text-slate-400">{side}</span>
                  </>
                )}
              </span>
            </li>
          );
        })}
        <li className="flex items-center gap-2 text-xs text-slate-500">
          <span className="tnum w-8">{totalMin}'</span> {done ? (feed.note ?? "Full-time") : "Full-time"}
        </li>
      </ol>
    </CardShell>
  );
}
