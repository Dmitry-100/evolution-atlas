import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";
import { Slider } from "../ui/slider";

type PrimateAxisProps = {
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
};

const EDGE_PADDING = 0.09;

function displayPosition(index: number, total: number) {
  if (total <= 1) return 0.5;
  return EDGE_PADDING + (index / (total - 1)) * (1 - EDGE_PADDING * 2);
}

function nearestPrimate(stages: EvolutionStage[], position: number) {
  return stages.reduce<{ stage: EvolutionStage; distance: number } | null>((nearest, stage, index) => {
    const distance = Math.abs(displayPosition(index, stages.length) - position);
    if (!nearest || distance < nearest.distance) return { stage, distance };
    return nearest;
  }, null)?.stage;
}

export function PrimateAxis({
  stages,
  activeStage,
  onActivate,
  onStep,
  canStepPrevious,
  canStepNext,
}: PrimateAxisProps) {
  const activeIndex = Math.max(0, stages.findIndex((stage) => stage.id === activeStage.id));
  const activePosition = displayPosition(activeIndex, stages.length) * 100;

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
    <section className="axis-panel primate-axis-panel" aria-label="Крупная шкала приматов">
      <div className="axis-toolbar">
        <span className="axis-toolbar-copy">
          <MoveHorizontal aria-hidden="true" size={19} />
          Приматы крупно: нажимайте портреты или используйте стрелки
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
        <strong>последние ~65 млн лет</strong>
      </div>

      <div
        className="primate-portrait-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Крупная шкала приматов. Используйте стрелки влево и вправо для перехода между этапами."
      >
        <div
          className="primate-axis-track"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const nearest = nearestPrimate(stages, (event.clientX - rect.left) / rect.width);
            if (nearest && nearest.id !== activeStage.id) onActivate(nearest);
          }}
        >
          <div className="primate-branch" aria-hidden="true" />
          {stages.map((stage, index) => {
            const position = displayPosition(index, stages.length) * 100;
            const isActive = stage.id === activeStage.id;
            return (
              <button
                key={stage.id}
                type="button"
                className={isActive ? "primate-node is-active" : "primate-node"}
                style={{ left: `${position}%`, "--node-row": index % 2 } as CSSProperties}
                aria-label={`${stage.titleRu}, ${formatAgeRu(stage.ageMa)}`}
                aria-current={isActive ? "true" : undefined}
                onPointerEnter={() => onActivate(stage)}
                onFocus={() => onActivate(stage)}
                onClick={() => onActivate(stage)}
              >
                <img src={stage.image.src} alt="" aria-hidden="true" />
                <span>{stage.titleRu}</span>
              </button>
            );
          })}
          <span className="primate-active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />
        </div>
      </div>

      <Slider
        max={1000}
        min={0}
        step={1}
        value={[activePosition * 10]}
        onValueChange={([value]) => {
          const nearest = nearestPrimate(stages, (value ?? 0) / 1000);
          if (nearest) onActivate(nearest);
        }}
      />

      <div className="primate-axis-ticks" aria-hidden="true">
        <span>65 млн</span>
        <span>55 млн</span>
        <span>40 млн</span>
        <span>25 млн</span>
        <span>7 млн</span>
        <span>сегодня</span>
      </div>
    </section>
  );
}
