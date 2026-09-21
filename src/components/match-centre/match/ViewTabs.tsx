import { memo } from "react";

export type PitchView = "fm" | "terrain";

interface Props {
  view: PitchView;
  onChange: (view: PitchView) => void;
}

/** Segmented control switching the pitch rendering. */
const ViewTabs = memo(function ViewTabs({ view, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-edge px-3 py-2">
      <div className="flex gap-1 rounded-lg bg-white/5 p-1" role="group" aria-label="Pitch view">
        {(["fm", "terrain"] as PitchView[]).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={view === v}
            data-testid={`view-${v}`}
            className={`flex min-h-9 items-center rounded-md px-3 py-1.5 text-xs font-bold ${
              view === v ? "bg-gold text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            {v === "fm" ? "FM Pitch" : "Terrain"}
          </button>
        ))}
      </div>
      <p className="hidden text-[11px] text-slate-500 sm:block">
        {view === "fm" ? "2D tracking · every player" : "3D possession landscape"}
      </p>
    </div>
  );
});

export default ViewTabs;
