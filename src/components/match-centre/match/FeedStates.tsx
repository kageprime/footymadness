/** Loading skeleton while a real feed downloads. */
export function FeedLoading() {
  return (
    <div className="aspect-[16/11] w-full sm:aspect-[16/9]" data-testid="feed-loading">
      <div
        role="status"
        className="flex h-full w-full flex-col items-center justify-center gap-3"
      >
        <div className="skeleton h-8 w-48" />
        <p className="text-sm text-slate-400">Pulling real event data from StatsBomb open data…</p>
        <div className="skeleton-image w-3/4 rounded-lg" />
      </div>
    </div>
  );
}

interface ErrorProps {
  message: string;
  onRetry: () => void;
  onSimulate: () => void;
}

/** Error card when the real feed cannot be fetched. */
export function FeedError({ message, onRetry, onSimulate }: ErrorProps) {
  return (
    <div
      role="alert"
      className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 p-6 text-center"
      data-testid="feed-error"
    >
      <p className="font-semibold text-slate-100">Real feed unavailable</p>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onRetry}
          data-testid="button-retry"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black"
        >
          Retry
        </button>
        <button onClick={onSimulate} className="rounded-md border border-white/20 px-4 py-2 text-sm text-slate-200">
          Back to simulated
        </button>
      </div>
    </div>
  );
}
