import { memo } from "react";
import type { FeedData } from "../../../lib/match-centre/feed";

interface Props {
  feed: FeedData | null;
}

/** Provenance footer: what the viewer is actually watching. */
const MatchFooter = memo(function MatchFooter({ feed }: Props) {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-[11px] text-slate-500">
        {feed?.source === "statsbomb" ? (
          <span>Real ball + player positions: StatsBomb open data (events + 360), interpolated between observations</span>
        ) : (
          <span>Touchline demo · simulated tracking, not observations of real matches</span>
        )}
        <span aria-hidden>·</span>
        <span>Terrain language inspired by Data Portraits' Arsenal–Chelsea visual</span>
        <span aria-hidden>·</span>
        <span>A live product pairs this with a licensed 25 Hz positional feed</span>
      </div>
    </footer>
  );
});

export default MatchFooter;
