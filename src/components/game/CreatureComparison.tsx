import {
  comparisonProfiles,
  largestTraitChange,
} from "../../game/observations";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { createCreaturePortraitScene } from "./creaturePortraitScene";

function Portrait({ traits }: { traits: number[][] }) {
  const means = traits.map(
    (v) =>
      (v[1] + v[2] * 2) /
      Math.max(
        1,
        v.reduce((a, b) => a + b, 0),
      ),
  );
  const [size, coat, diet, mobility] = means;
  return (
    <svg
      viewBox="0 0 240 128"
      className="game-creature-portrait"
      aria-hidden="true"
    >
      <ellipse cx="119" cy="112" rx="76" ry="6" fill="#0003" />
      <g
        transform={`translate(${20 - size * 6} ${24 - size * 6}) scale(${0.72 + size * 0.15})`}
        fill={["#cbb889", "#bba06b", "#8b7754"][Math.round(coat)]}
        stroke="#e3cf9c"
        strokeWidth="1.2"
      >
        <path d={`M59 58 Q12 ${20 + coat * 8} 16 83 Q41 73 69 82`} />
        <ellipse cx="115" cy="64" rx="62" ry={26 + coat * 5} />
        {[76, 101, 139, 159].map((x, i) => (
          <path
            key={x}
            d={`M${x} 74 l${i % 2 ? 5 : -5} ${23 + mobility * 5} l15 1 l-5 -28`}
          />
        ))}
        <ellipse cx="174" cy="51" rx={23 + diet * 3} ry={19 - diet * 2} />
        <ellipse cx="160" cy="29" rx={7 + coat} ry={11 + coat * 2} />
        <circle cx="183" cy="44" r="3" fill="#17251f" />
        {coat > 0.8 &&
          [65, 82, 99, 116, 133].map((x) => (
            <path key={x} d={`M${x} 37 l5 -7 l7 6`} fill="none" />
          ))}
      </g>
    </svg>
  );
}
export function CreatureComparison({
  before,
  after,
  beforeLabel = "В начале",
  afterLabel = "Сейчас",
  paused = false,
  beforeCounts,
  afterCounts,
  focusTrait,
}: {
  before: number[][];
  after: number[][];
  beforeLabel?: string;
  afterLabel?: string;
  paused?: boolean;
  beforeCounts?: number[];
  afterCounts?: number[];
  focusTrait?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ReturnType<typeof createCreaturePortraitScene> | null>(
    null,
  );
  const [ready, setReady] = useState(false),
    [stopped, setStopped] = useState(false);
  const profiles = [before, after].map((traits, i) => {
    const counts = i ? afterCounts : beforeCounts;
    return counts
      ? comparisonProfiles(
          counts,
          focusTrait ?? largestTraitChange(before, after).trait,
        )
      : [
          traits.map(
            (v) =>
              (v[1] + 2 * v[2]) /
              Math.max(
                1,
                v.reduce((a, b) => a + b, 0),
              ),
          ),
        ];
  });
  const signature = JSON.stringify(profiles);
  useEffect(() => {
    let cancelled = false;
    import("./creaturePortraitScene")
      .then(({ createCreaturePortraitScene }) => {
        if (cancelled || !canvas.current) return;
        try {
          scene.current = createCreaturePortraitScene(
            canvas.current,
            JSON.parse(signature),
            false,
            () => setReady(false),
          );
          setReady(true);
        } catch {
          setReady(false);
        }
      })
      .catch(() => setReady(false));
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, [signature]);
  useEffect(() => {
    scene.current?.setPaused(paused || stopped);
  }, [paused, stopped, ready]);
  return (
    <figure
      className="game-creature-comparison"
      aria-label={`Изменение облика: ${beforeLabel} и ${afterLabel}. Представители популяций в разные моменты.`}
    >
      <div
        className="game-creature-stage"
        data-renderer={ready ? "webgl" : "illustration"}
      >
        <canvas
          ref={canvas}
          aria-hidden="true"
          style={{ visibility: ready ? "visible" : "hidden" }}
        />
        {!ready && (
          <div className="game-creature-fallback">
            {profiles.map((group, i) => (
              <div key={i}>
                {group.map((profile, j) => (
                  <Portrait
                    key={j}
                    traits={
                      (i ? afterCounts : beforeCounts)
                        ? profile.map((value) =>
                            [0, 1, 2].map((level) => (level === value ? 1 : 0)),
                          )
                        : i
                          ? after
                          : before
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        )}
        <span className="game-creature-arrow" aria-hidden="true">
          →
        </span>
        {ready && (
          <button
            className="game-portrait-pause"
            onClick={() => setStopped((v) => !v)}
            aria-label={
              stopped
                ? "Включить вращение фигурок"
                : "Остановить вращение фигурок"
            }
            aria-pressed={stopped}
          >
            {stopped ? <Play size={12} /> : <Pause size={12} />}
          </button>
        )}
      </div>
      <figcaption>
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </figcaption>
    </figure>
  );
}
