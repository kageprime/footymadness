import { memo } from "react";
import { Flame, Footprints, Mountain, Ruler } from "lucide-react";
import type { PitchView } from "./ViewTabs";

interface Props {
  view: PitchView;
  showHeat: boolean;
  showTrail: boolean;
  showLines: boolean;
  tilt: number;
  dotCount: number;
  onToggleHeat: () => void;
  onToggleTrail: () => void;
  onToggleLines: () => void;
  onTilt: (v: number) => void;
}

const TOGGLE = "flex min-h-9 items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors";

/** Layer switches for the pitch. Lines + tilt are terrain-only; FM shows dot count. */
const LayerToggles = memo(function LayerToggles({
  view,
  showHeat,
  showTrail,
  showLines,
  tilt,
  dotCount,
  onToggleHeat,
  onToggleTrail,
  onToggleLines,
  onTilt,
}: Props) {
  const cls = (on: boolean) => `${TOGGLE} ${on ? "border-white/60 bg-white/10 text-white" : "border-white/15"}`;
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-edge px-3 py-2.5 text-slate-300">
      <button onClick={onToggleHeat} aria-pressed={showHeat} data-testid="toggle-heat" className={cls(showHeat)}>
        <Flame size={13} /> Heat
      </button>
      <button onClick={onToggleTrail} aria-pressed={showTrail} data-testid="toggle-trail" className={cls(showTrail)}>
        <Footprints size={13} /> Trail
      </button>
      {view === "terrain" ? (
        <button onClick={onToggleLines} aria-pressed={showLines} data-testid="toggle-lines" className={cls(showLines)}>
          <Ruler size={13} /> Lines
        </button>
      ) : (
        <span className="text-[11px] text-slate-500">Dots: {dotCount} tracked · carrier tagged</span>
      )}
      {view === "terrain" && (
        <label className="ml-auto flex items-center gap-2 text-xs">
          <Mountain size={13} aria-hidden /> Tilt
          <input
            type="range"
            min={0.3}
            max={0.58}
            step={0.01}
            value={tilt}
            onChange={(e) => onTilt(Number(e.target.value))}
            aria-label="Camera tilt"
            data-testid="input-tilt"
            className="tl-range w-24"
          />
        </label>
      )}
    </div>
  );
});

export default LayerToggles;
