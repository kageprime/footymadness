import { memo } from "react";
import { Radio, Trophy } from "lucide-react";
import type { FeedEntry } from "../../../lib/match-centre/feed";

interface Props {
  feeds: FeedEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  source: "sim" | "statsbomb" | null;
}

/** Top bar: brand, match picker, provenance badge. */
const MatchHeader = memo(function MatchHeader({ feeds, activeId, onSelect, source }: Props) {
  return (
    <header className="border-b border-edge bg-pitch/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div>
            <p className="font-display text-lg uppercase leading-none tracking-wide">Match Centre</p>
            <p className="text-xs text-slate-400">Ball tracking, not video</p>
          </div>
        </div>
        <nav aria-label="Matches" className="no-scrollbar order-3 flex w-full gap-2 overflow-x-auto sm:order-2 sm:w-auto">
          {feeds.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              aria-pressed={f.id === activeId}
              data-testid={`match-${f.id}`}
              className={`flex min-h-9 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                f.id === activeId
                  ? "border-gold bg-gold text-black"
                  : "border-white/20 text-slate-300 hover:border-white/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {source === "statsbomb" ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
              <Trophy size={12} aria-hidden /> Real · StatsBomb open data
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
              <Radio size={12} aria-hidden /> Simulated feed
            </span>
          )}
        </div>
      </div>
    </header>
  );
});

export default MatchHeader;
