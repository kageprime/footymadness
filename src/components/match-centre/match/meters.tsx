/** Shared meter primitives so every analytics card measures the same way. */

export function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{title}</p>
      {children}
    </div>
  );
}

export function SplitBar({ segments, label }: { segments: Array<{ width: number; color: string }>; label: string }) {
  return (
    <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={label}>
      {segments.map((s, i) => (
        <div key={i} className="h-full transition-[width] duration-300" style={{ width: `${s.width}%`, background: s.color }} />
      ))}
    </div>
  );
}

interface MeterRowProps {
  label: string;
  color: string;
  pct: number;
  meta: string;
  testId?: string;
}

export function MeterRow({ label, color, pct, meta, testId }: MeterRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-xs font-bold text-slate-300">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${Math.min(100, pct)}%`, background: color }}
        />
      </div>
      <span className="w-24 text-right text-xs text-slate-300" data-testid={testId}>
        {meta}
      </span>
    </div>
  );
}
