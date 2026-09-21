import { useCallback, useEffect, useMemo, useState } from "react";
import { FEED_LIST, realFeed, simFeed, type FeedData, type FeedEntry } from "../../../lib/match-centre/feed";

interface FeedState {
  entry: FeedEntry;
  feed: FeedData | null;
  error: string | null;
  retry: () => void;
}

/** Loads the selected feed: sim feeds resolve synchronously, real feeds fetch. */
export function useFeed(feedId: string): FeedState {
  const entry = useMemo(() => FEED_LIST.find((f) => f.id === feedId) ?? FEED_LIST[0], [feedId]);
  const [feed, setFeed] = useState<FeedData | null>(() =>
    entry.kind === "sim" && entry.match ? simFeed(entry.match) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    if (entry.kind === "sim" && entry.match) {
      setFeed(simFeed(entry.match));
      setError(null);
      return;
    }
    setFeed(null);
    setError(null);
    let cancelled = false;
    realFeed(entry.id)
      .then((f) => {
        if (cancelled) return;
        setFeed(f);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Real feed unavailable right now. Check the connection and retry.");
      });
    return () => {
      cancelled = true;
    };
  }, [entry, attempt]);

  return { entry, feed, error, retry };
}
