import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { useMemo, type CSSProperties, type KeyboardEvent } from "react";
import type { EvolutionStage } from "../../data/lineage";
import { ageMaToPosition, formatAgeRu } from "../../lib/timeline";
import { ConstellationField } from "../ui/constellation-field";
import { FloatingPaths } from "../ui/floating-paths";

type PrimateAxisProps = {
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
};

const PRIMATE_SCALE = { minMa: 0.25, maxMa: 66 };

function makeReadablePositions(stages: EvolutionStage[]) {
  const raw = stages.map((stage) => Math.max(6, Math.min(94, ageMaToPosition(stage.ageMa, PRIMATE_SCALE) * 100)));
  const minimumGap = 5.6;
  const positions = raw.map((position) => position);

  for (let index = 1; index < positions.length; index += 1) {
    positions[index] = Math.max(positions[index], positions[index - 1] + minimumGap);
  }

  if (positions[positions.length - 1] > 94) {
    positions[positions.length - 1] = 94;
    for (let index = positions.length - 2; index >= 0; index -= 1) {
      positions[index] = Math.min(positions[index], positions[index + 1] - minimumGap);
    }
  }

  return positions.map((position) => Math.max(6, Math.min(94, position)));
}

export function PrimateAxis({
  stages,
  activeStage,
  onActivate,
  onStep,
  canStepPrevious,
  canStepNext,
}: PrimateAxisProps) {
  const positions = useMemo(() => makeReadablePositions(stages), [stages]);
  const activeIndex = Math.max(0, stages.findIndex((stage) => stage.id === activeStage.id));
  const activePosition = positions[activeIndex] ?? 2;
  const activeChipPosition = Math.max(8, Math.min(92, activePosition));

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" && canStepNext) {
      event.preventDefault();
      onStep(1);
    }

    if (event.key === "ArrowLeft" && canStepPrevious) {
      event.preventDefault();
      onStep(-1);
    }
  }

  return (
    <section className="axis-panel primate-focus-panel" aria-label="Приматы крупно">
      <div className="axis-toolbar">
        <span className="axis-toolbar-copy">
          <Search aria-hidden="true" size={19} />
          Фокус на приматах
        </span>
        <div className="axis-step-controls" aria-label="Переключение этапов">
          <button
            type="button"
            className="axis-step-button"
            aria-label="Предыдущий этап"
            disabled={!canStepPrevious}
            onClick={() => onStep(-1)}
          >
            <ArrowLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="axis-step-button"
            aria-label="Следующий этап"
            disabled={!canStepNext}
            onClick={() => onStep(1)}
          >
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
        <strong>65 млн лет крупно</strong>
      </div>

      <div className="primate-focus-intro">
        <p>
          Здесь миллиарды лет остаются за кадром: увеличена короткая поздняя ветвь, где появляются древесные приматы,
          обезьяны, человекообразные и наша линия.
        </p>
      </div>

      <div
        className="primate-photo-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Фокус на приматах. Используйте стрелки влево и вправо для перехода между этапами."
      >
        <div className="primate-timeline-stage">
          <div className="primate-canopy" aria-hidden="true" />
          <FloatingPaths className="primate-floating-paths" density="panel" />
          <ConstellationField className="primate-constellation" compact />
          <div className="primate-track-line" aria-hidden="true" />
          <span className="primate-active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />
          <div className="primate-active-chip" style={{ left: `${activeChipPosition}%` }}>
            <span>{formatAgeRu(activeStage.ageMa)}</span>
            <strong>{activeStage.titleRu}</strong>
          </div>

          {stages.map((stage, index) => {
            const isActive = stage.id === activeStage.id;
            const position = positions[index] ?? 2;
            const lane = index % 3;
            const edgeClass = index < 2 ? " align-left" : index > stages.length - 3 ? " align-right" : "";
            const style = {
              left: `${position}%`,
              "--node-top": `${58 + lane * 110}px`,
              "--node-line-height": `${272 - lane * 110}px`,
            } as CSSProperties;

            return (
              <button
                key={stage.id}
                type="button"
                className={`${isActive ? "primate-photo-node is-active" : "primate-photo-node"}${edgeClass}`}
                style={style}
                aria-label={`${stage.titleRu}, ${formatAgeRu(stage.ageMa)}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onActivate(stage)}
              >
                <span className="primate-node-image">
                  <img src={stage.image.src} alt="" aria-hidden="true" />
                </span>
                <span className="primate-node-copy">
                  <strong>{stage.titleRu}</strong>
                  <small>{formatAgeRu(stage.ageMa)}</small>
                </span>
              </button>
            );
          })}

          <div className="primate-axis-ticks" aria-hidden="true">
            <span>66 млн</span>
            <span>40 млн</span>
            <span>20 млн</span>
            <span>7 млн</span>
            <span>сегодня</span>
          </div>
        </div>
      </div>
    </section>
  );
}
