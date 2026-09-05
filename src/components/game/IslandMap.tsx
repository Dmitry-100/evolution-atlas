import { Bug, Mountain, Navigation } from "lucide-react";
import type { CSSProperties } from "react";
import { OptimizedImage } from "../ui/optimized-image";
import { EDGES, REGIONS } from "../../game/content";
import { connected, count } from "../../game/engine";
import type { GameState } from "../../game/types";

export function IslandMap({
  state,
  selected,
  onSelect,
  highlighted = [],
  playing = false,
}: {
  state: GameState;
  selected: number;
  onSelect: (region: number) => void;
  highlighted?: number[];
  playing?: boolean;
}) {
  return (
    <div className={`islands-map${playing ? " is-evolving" : ""}`}>
      <OptimizedImage
        className="islands-map-art"
        src="/assets/images/game/archipelago.jpg"
        width="1200"
        height="800"
        alt="Архипелаг: лесная низина, равнина и горный хребет на севере; тёплая бухта, заросли и вулканический берег на юге."
        fetchPriority="high"
      />
      <svg
        className="islands-routes"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {EDGES.map(({ a, b }) => (
          <line
            key={`${a}-${b}`}
            x1={REGIONS[a].x}
            y1={REGIONS[a].y}
            x2={REGIONS[b].x}
            y2={REGIONS[b].y}
            className={connected(state, a, b) ? "is-open" : "is-closed"}
          />
        ))}
      </svg>
      <span className="islands-compass" aria-hidden="true">
        <Navigation size={15} /> С
      </span>
      {REGIONS.map((region, i) => {
        const population = count(state.regions[i]);
        return (
          <button
            key={region.name}
            type="button"
            className={`islands-map-node${selected === i ? " is-selected" : ""}${highlighted.includes(i) ? " is-target" : ""}${population ? " is-inhabited" : ""}`}
            style={
              {
                left: `${region.x}%`,
                top: `${region.y}%`,
                "--island-color": region.color,
              } as CSSProperties
            }
            onClick={() => onSelect(i)}
            aria-pressed={selected === i}
            aria-label={`${region.name}: ${population} существ`}
          >
            <span className="islands-map-marker">
              {population ? (
                <Bug size={17} aria-hidden="true" />
              ) : (
                <Mountain size={16} aria-hidden="true" />
              )}
              <b>{population || "—"}</b>
            </span>
            <span className="islands-map-name">
              <span className="islands-region-number">{i + 1}</span>
              {region.name}
            </span>
            {population > 0 && (
              <span className="islands-life-dots" aria-hidden="true">
                {Array.from(
                  { length: Math.min(5, Math.ceil(population / 30)) },
                  (_, n) => (
                    <i key={n} style={{ "--dot": n } as CSSProperties} />
                  ),
                )}
              </span>
            )}
          </button>
        );
      })}
      <div className="islands-map-key">
        <span>
          <i />
          Открытый путь
        </span>
        <span>
          <i className="is-closed" />
          Нужен мост
        </span>
      </div>
    </div>
  );
}
