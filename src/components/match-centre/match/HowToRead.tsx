import { memo } from "react";
import { Info } from "lucide-react";
import type { FeedData } from "../../../lib/match-centre/feed";

interface Props {
  feed: FeedData | null;
}

/** Legend for both pitch views plus provenance note. */
const HowToRead = memo(function HowToRead({ feed }: Props) {
  return (
    <details className="rounded-2xl border border-edge bg-card p-5 text-sm text-slate-300">
      <summary className="flex cursor-pointer items-center gap-2 font-semibold text-slate-100">
        <Info size={15} aria-hidden /> How to read this
      </summary>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed">
        <li>FM view tracks every player dot; Terrain view grows the ball-possession landscape.</li>
        <li>Peak height marks where the ball has spent the most time so far.</li>
        <li>
          Home possession terrain glows {feed?.home.code}, away glows {feed?.away.code}.
        </li>
        <li>The white dot is the ball; drag the timeline or momentum bars to replay.</li>
        {feed?.source === "statsbomb" ? (
          <li>
            Ball path and dots come from real StatsBomb event + 360 data, interpolated between observations. Simulated
            feeds are synthetic.
          </li>
        ) : (
          <li>All tracking here is simulated. Switch to ARG v FRA · REAL for real event data.</li>
        )}
      </ul>
    </details>
  );
});

export default HowToRead;
