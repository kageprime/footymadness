"use client";

import { useCallback, useState } from "react";
import FMPitch from "@/components/match-centre/FMPitch";
import PitchCanvas from "@/components/match-centre/PitchCanvas";
import { useFeed } from "@/components/match-centre/hooks/useFeed";
import { useMatchStats } from "@/components/match-centre/hooks/useMatchStats";
import { useReplay } from "@/components/match-centre/hooks/useReplay";
import { FEED_LIST } from "@/lib/match-centre/feed";
import { chapterAt, chaptersFor } from "@/lib/match-centre/story";
import {
  EventsFeed,
  FeedError,
  FeedLoading,
  HowToRead,
  LayerToggles,
  MatchFooter,
  MatchHeader,
  MomentumPanel,
  PossessionCard,
  PressureCard,
  RightNowPanel,
  Scoreboard,
  TerritoryCard,
  TransportBar,
  ViewTabs,
  type PitchView,
} from "@/components/match-centre/match";

/**
 * Match centre page. Owns only top-level UI state (selected feed, pitch
 * view, layer prefs); timing lives in useReplay, loading in useFeed, and
 * every derived value in useMatchStats. Panels are pure.
 */
export default function MatchPage() {
  const [feedId, setFeedId] = useState(FEED_LIST[0].id);
  const [view, setView] = useState<PitchView>("fm");
  const [showHeat, setShowHeat] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [tilt, setTilt] = useState(0.42);

  const { feed, error, retry } = useFeed(feedId);
  const duration = feed?.durationSec ?? 5400;
  const { time, setTime, playing, setPlaying, speed, setSpeed, restart, done } = useReplay(duration, feed != null);
  const stats = useMatchStats(feed, time);
  const { ball, points, trail, grid, dots, score, poss, thirds, pressure, series, next, carrier, kmh, half, totalMin, minuteFloat } = stats;
  const chapters = chaptersFor(feedId);
  const chapter = chapterAt(feedId, minuteFloat)?.label ?? null;

  const loading = feed == null && error == null;

  // Stable callbacks so memoized panels skip re-rendering on every clock tick.
  const onSpeed = useCallback((s: number) => {
    setSpeed(s);
    setPlaying(true);
  }, []);
  const onToggleHeat = useCallback(() => setShowHeat((v) => !v), []);
  const onToggleTrail = useCallback(() => setShowTrail((v) => !v), []);
  const onToggleLines = useCallback(() => setShowLines((v) => !v), []);
  const onSeekMomentum = useCallback((m: number) => setTime((m - 1) * 60), []);

  return (
    <div className="min-h-dvh bg-pitch text-slate-100">
      <a
        href="#pitch"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to pitch
      </a>
      <div aria-hidden className="tl-grain pointer-events-none fixed inset-0 z-[60]" />

      <MatchHeader feeds={FEED_LIST} activeId={feedId} onSelect={setFeedId} source={feed?.source ?? null} />

      <main className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 lg:grid-cols-[270px_minmax(0,1fr)_300px]">
        <section aria-label="Right now" className="order-2 flex flex-col gap-4 lg:order-1">
          <RightNowPanel
            ball={ball}
            homeColor={feed?.home.color ?? "#fff"}
            awayColor={feed?.away.color ?? "#fff"}
            homeCode={feed?.home.code ?? ""}
            awayCode={feed?.away.code ?? ""}
            carrier={carrier}
            kmh={kmh}
            next={next}
            done={done}
            trail={trail}
          />
          <HowToRead feed={feed} />
        </section>

        <section aria-label="Match broadcast" className="order-1 flex flex-col gap-4 lg:order-2">
          <Scoreboard feed={feed} score={score} time={time} done={done} half={half} possession={ball.team} />

          <div id="pitch" className="overflow-hidden rounded-2xl border border-edge bg-[#070907]">
            <ViewTabs view={view} onChange={setView} />

            {loading && <FeedLoading />}

            {feed != null && view === "fm" && (
              <div className="aspect-[16/11] w-full sm:aspect-[16/9]">
                <FMPitch
                  points={points}
                  time={time}
                  ball={ball}
                  dots={dots}
                  showHeat={showHeat}
                  showTrail={showTrail}
                  homeColor={feed.home.color}
                  awayColor={feed.away.color}
                  homeCode={feed.home.code}
                  awayCode={feed.away.code}
                  carrier={carrier}
                  carrierTeam={ball.team}
                />
              </div>
            )}

            {feed != null && view === "terrain" && grid != null && (
              <div className="aspect-[16/11] w-full sm:aspect-[16/9]">
                <PitchCanvas
                  grid={grid}
                  ball={ball}
                  trail={trail}
                  tilt={tilt}
                  showHeat={showHeat}
                  showTrail={showTrail}
                  showLines={showLines}
                  homeColor={feed.home.color}
                  awayColor={feed.away.color}
                  homeCode={feed.home.code}
                  awayCode={feed.away.code}
                />
              </div>
            )}

            {error != null && <FeedError message={error} onRetry={retry} onSimulate={() => setFeedId(FEED_LIST[0].id)} />}

            <TransportBar
              time={time}
              duration={duration}
              totalMin={totalMin}
              playing={playing}
              speed={speed}
              disabled={feed == null}
              chapters={chapters}
              chapter={chapter}
              onPlayToggle={() => (done ? restart() : setPlaying(!playing))}
              onRestart={restart}
              onSeek={setTime}
              onSpeed={onSpeed}
            />
            <LayerToggles
              view={view}
              showHeat={showHeat}
              showTrail={showTrail}
              showLines={showLines}
              tilt={tilt}
              dotCount={dots.home.length + dots.away.length}
              onToggleHeat={onToggleHeat}
              onToggleTrail={onToggleTrail}
              onToggleLines={onToggleLines}
              onTilt={setTilt}
            />
          </div>

          <MomentumPanel
            series={series}
            events={feed?.events ?? []}
            minute={minuteFloat}
            totalMin={totalMin}
            homeColor={feed?.home.color ?? "#fff"}
            awayColor={feed?.away.color ?? "#fff"}
            onSeek={onSeekMomentum}
          />
        </section>

        <section aria-label="Match analytics" className="order-3 flex flex-col gap-4">
          <PossessionCard
            homeCode={feed?.home.code ?? ""}
            awayCode={feed?.away.code ?? ""}
            homeColor={feed?.home.color ?? "#fff"}
            awayColor={feed?.away.color ?? "#fff"}
            home={poss.home}
            away={poss.away}
          />
          <TerritoryCard defensive={thirds.defensive} middle={thirds.middle} attacking={thirds.attacking} />
          {feed != null && (
            <PressureCard
              home={{ code: feed.home.code, color: feed.home.color, stats: pressure.home }}
              away={{ code: feed.away.code, color: feed.away.color, stats: pressure.away }}
            />
          )}
          {feed != null && <EventsFeed feed={feed} time={time} done={done} totalMin={totalMin} />}
        </section>
      </main>

      <MatchFooter feed={feed} />
    </div>
  );
}
