import { Pause, Play, RotateCcw } from "lucide-react";
import { REPLAY_SPEEDS } from "../hooks/useReplay";
import { formatClockRange } from "../../../lib/match-centre/format";
import { isMarked, type Chapter } from "../../../lib/match-centre/story";

interface Props {
  time: number;
  duration: number;
  totalMin: number;
  playing: boolean;
  speed: number;
  disabled: boolean;
  chapters: Chapter[];
  chapter: string | null;
  onPlayToggle: () => void;
  onRestart: () => void;
  onSeek: (t: number) => void;
  onSpeed: (s: number) => void;
}

/** Playback transport: play/pause, restart, scrubber, story ticks, speed. */
export default function TransportBar({
  time,
  duration,
  totalMin,
  playing,
  speed,
  disabled,
  chapters,
  chapter,
  onPlayToggle,
  onRestart,
  onSeek,
  onSpeed,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-edge px-3 py-2.5">
      <button
        onClick={onPlayToggle}
        aria-label={playing ? "Pause" : "Play"}
        data-testid="button-play"
        disabled={disabled}
        className="min-h-11 min-w-11 rounded-md bg-gold p-2 text-black hover:bg-foam disabled:opacity-40"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button
        onClick={onRestart}
        aria-label="Restart match"
        data-testid="button-restart"
        disabled={disabled}
        className="min-h-11 min-w-11 rounded-md border border-white/20 p-2 text-slate-200 hover:border-white/50 disabled:opacity-40"
      >
        <RotateCcw size={15} />
      </button>
      <label htmlFor="timeline" className="sr-only">
        Match timeline
      </label>
      <input
        id="timeline"
        type="range"
        min={0}
        max={duration}
        step={1}
        value={Math.floor(time)}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="tl-range min-w-0 flex-1 basis-full sm:basis-auto"
        data-testid="input-timeline"
        disabled={disabled}
      />
      <span className="tnum text-xs text-slate-300" data-testid="text-time">
        {formatClockRange(time, totalMin)}
        {chapter != null && <span className="text-slate-500"> · {chapter}</span>}
      </span>
      <div className="ml-auto flex gap-1 sm:ml-0" role="group" aria-label="Playback speed">
        {REPLAY_SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            aria-pressed={speed === s}
            data-testid={`button-speed-${s}`}
            className={`min-h-9 rounded px-2 text-[11px] font-bold ${speed === s ? "bg-gold text-black" : "text-slate-400 hover:text-white"}`}
          >
            {s}x
          </button>
        ))}
      </div>
      {chapters.some(isMarked) && (
        <div
          className="relative mt-1 h-1.5 w-full"
          role="img"
          aria-label="Match story chapters"
          data-testid="story-ticks"
        >
          {chapters.filter(isMarked).map((c) => (
            <span
              key={`${c.startMin}-${c.label}`}
              title={`${c.startMin}–${c.endMin}' · ${c.label}`}
              className={`absolute top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                c.label === "Late drama" ? "bg-[#ffb43a]" : "bg-white/50"
              }`}
              style={{ left: `${Math.min(100, (c.startMin / totalMin) * 100)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
