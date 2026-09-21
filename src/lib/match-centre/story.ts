import argFra from "./story/arg-fra-22";
import arsChe from "./story/ars-che";
import mciLiv from "./story/mci-liv";
import rmaBar from "./story/rma-bar";

export interface Chapter {
  startMin: number;
  endMin: number;
  label: string;
  confidence: number | null;
}

/** Fallback label the classifier gate assigns below 0.7 confidence. */
export const OPEN_PLAY = "Open play";

const BY_FEED: Record<string, Chapter[]> = {
  "arg-fra-22": argFra,
  "ars-che": arsChe,
  "mci-liv": mciLiv,
  "rma-bar": rmaBar,
};

export function chaptersFor(feedId: string): Chapter[] {
  return BY_FEED[feedId] ?? [];
}

/** Chapter containing the given minute (minutes, fractional). Null past the end. */
export function chapterAt(feedId: string, minute: number): Chapter | null {
  for (const c of chaptersFor(feedId)) {
    if (minute >= c.startMin && minute < c.endMin) return c;
  }
  return null;
}

/** Only confident chapters earn a tick on the timeline. */
export function isMarked(c: Chapter): boolean {
  return c.label !== OPEN_PLAY;
}
