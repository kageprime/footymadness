import { useCallback, useEffect, useRef, useState } from "react";

export const REPLAY_SPEEDS = [1, 4, 12, 30, 60];

interface Replay {
  time: number;
  setTime: (t: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  speed: number;
  setSpeed: (s: number) => void;
  restart: () => void;
  done: boolean;
}

/**
 * Match replay clock. Advances `time` by `speed` match-seconds per real
 * second while playing, stops at `durationSec`, and resets whenever the
 * feed (duration) changes. Rendering and data stay in the caller.
 */
export function useReplay(durationSec: number, active: boolean): Replay {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(12);

  // Mirror of `time` so the rAF tick can read the latest value without a
  // stale closure — or, worse, calling setPlaying() inside a setTime updater.
  const timeRef = useRef(0);
  timeRef.current = time;

  useEffect(() => {
    setTime(0);
    setPlaying(active);
  }, [durationSec, active]);

  const raf = useRef(0);
  const last = useRef(0);
  useEffect(() => {
    if (!playing || !active) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      const next = timeRef.current + dt * speed;
      if (next >= durationSec) {
        // Stop cleanly at full time: no setState-in-updater, no orphan frame.
        setTime(durationSec);
        setPlaying(false);
        return;
      }
      setTime(next);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, speed, active, durationSec]);

  const done = active && time >= durationSec;
  const restart = useCallback(() => {
    setTime(0);
    setPlaying(true);
  }, []);

  return { time, setTime, playing, setPlaying, speed, setSpeed, restart, done };
}
