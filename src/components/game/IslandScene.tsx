import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bug, Mountain } from "lucide-react";
import { IslandMap } from "./IslandMap";
import { REGIONS } from "../../game/content";
import { count } from "../../game/engine";
import type { GameState } from "../../game/types";
import type { SceneController } from "./archipelagoScene";

type Props = {
  state: GameState;
  selected: number;
  onSelect: (index: number) => void;
  paused?: boolean;
  evolving?: boolean;
  resetView?: number;
};
export function IslandScene({
  state,
  selected,
  onSelect,
  paused = false,
  evolving = false,
  resetView = 0,
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
  return (
    <div className="island-scene" ref={host} data-renderer={status}>
      {status !== "ready" && (
        <IslandMap state={state} selected={selected} onSelect={onSelect} />
      )}
      <div
        className="island-scene-labels"
        style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        aria-hidden={status !== "ready"}
      >
        {REGIONS.map((region, index) => {
          const population = count(state.regions[index]);
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
              tabIndex={status === "ready" ? 0 : -1}
            >
              <span className="islands-map-marker">
                {population ? <Bug size={14} /> : <Mountain size={14} />}
                <b>{population || "—"}</b>
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
