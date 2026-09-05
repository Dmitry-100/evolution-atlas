import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bug, Mountain } from "lucide-react";
import { IslandMap } from "./IslandMap";
import { REGIONS } from "../../game/content";
import { count, previewState } from "../../game/engine";
import type { GameState } from "../../game/types";
import type { SceneController } from "./archipelagoScene";
import { populationChanges, sceneEffects } from "./sceneState";
import { CARDS, EVENTS } from "../../game/content";
import type { CardKind, EventKind } from "../../game/types";

type Props = {
  state: GameState;
  selected: number;
  onSelect: (index: number) => void;
  paused?: boolean;
  evolving?: boolean;
  resetView?: number;
  focusView?: number;
};
export function IslandScene({
  state,
  selected,
  onSelect,
  paused = false,
  evolving = false,
  resetView = 0,
  focusView = 0,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const scene = useRef<SceneController | null>(null);
  const latest = useRef({ state, selected, paused, evolving, onSelect });
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  useEffect(() => {
    latest.current = { state, selected, paused, evolving, onSelect };
    scene.current?.update(state, selected, paused, evolving);
  }, [state, selected, paused, evolving, onSelect]);
  useEffect(() => {
    let cancelled = false;
    void import("./archipelagoScene")
      .then(({ createArchipelago }) => {
        if (cancelled || !host.current) return;
        try {
          scene.current = createArchipelago({
            host: host.current,
            labels: labels.current,
            ...latest.current,
            onSelect: (index) => latest.current.onSelect(index),
            onFailure: () => {
              scene.current?.dispose();
              scene.current = null;
              setStatus("fallback");
            },
          });
          setStatus("ready");
        } catch {
          scene.current?.dispose();
          scene.current = null;
          setStatus("fallback");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);
  useEffect(() => {
    scene.current?.reset();
  }, [resetView]);
  useEffect(() => {
    if (focusView) scene.current?.focus();
  }, [focusView]);
  const changes = populationChanges(state);
  const effects = sceneEffects(state);
  return (
    <div className="island-scene" ref={host} data-renderer={status}>
      {status !== "ready" && (
        <IslandMap
          state={previewState(state)}
          selected={selected}
          onSelect={onSelect}
        />
      )}
      <div
        className="island-scene-labels"
        style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        aria-hidden={status !== "ready"}
      >
        {REGIONS.map((region, index) => {
          const population = count(state.regions[index]);
          const localEffects = effects.filter(
            (effect) => effect.region === index || effect.region === -1,
          );
          const effectDescription = localEffects
            .map((effect) => {
              const title =
                CARDS[effect.kind as CardKind]?.title ??
                EVENTS[effect.kind as EventKind]?.title;
              return title + (effect.planned ? " (в плане)" : "");
            })
            .join(", ");
          return (
            <button
              key={region.name}
              ref={(node) => {
                labels.current[index] = node;
              }}
              className={
                "islands-map-node" + (index === selected ? " is-selected" : "")
              }
              style={{ "--island-color": region.color } as CSSProperties}
              onClick={() => onSelect(index)}
              aria-label={region.name + ": " + population + " существ"}
              aria-pressed={index === selected}
              title={effectDescription}
              data-effects={localEffects
                .map(
                  (effect) =>
                    effect.kind + (effect.planned ? ":planned" : ":active"),
                )
                .join(" ")}
              tabIndex={status === "ready" ? 0 : -1}
            >
              <span className="islands-map-marker">
                {population ? <Bug size={14} /> : <Mountain size={14} />}
                <b>{population || "—"}</b>
                {changes[index] !== 0 && (
                  <span
                    className={
                      "islands-population-change " +
                      (changes[index] > 0 ? "is-growth" : "is-loss")
                    }
                    aria-label={"Изменение за ход: " + changes[index]}
                  >
                    {changes[index] > 0 ? "+" : ""}
                    {changes[index]}
                  </span>
                )}
              </span>
              <span className="islands-map-name">
                <span className="islands-region-number">{index + 1}</span>
                {region.name}
              </span>
            </button>
          );
        })}
      </div>
      {status === "fallback" && (
        <span className="island-scene-note">
          Карта без 3D · игра доступна полностью
        </span>
      )}
    </div>
  );
}
