import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";

type PrimateAxisProps = {
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
};

export function PrimateAxis({
  stages,
  activeStage,
  onActivate,
  onStep,
  canStepPrevious,
  canStepNext,
}: PrimateAxisProps) {
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
        <strong>65 млн лет - сегодня</strong>
      </div>

      <div className="primate-focus-intro">
        <p>
          Здесь миллиарды лет глубокой шкалы уже остаются за кадром: видна поздняя ветвь, где появляются древесные
          приматы, обезьяны, человекообразные и наша линия.
        </p>
      </div>

      <div
        className="primate-focus-grid"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Фокус на приматах. Используйте стрелки влево и вправо для перехода между этапами."
      >
        {stages.map((stage) => {
          const isActive = stage.id === activeStage.id;
          return (
            <button
              key={stage.id}
              type="button"
              className={isActive ? "primate-focus-card is-active" : "primate-focus-card"}
              aria-label={`${stage.titleRu}, ${formatAgeRu(stage.ageMa)}`}
              aria-current={isActive ? "true" : undefined}
              onPointerEnter={() => onActivate(stage)}
              onFocus={() => onActivate(stage)}
              onClick={() => onActivate(stage)}
            >
              <span className="primate-focus-image">
                <img src={stage.image.src} alt="" aria-hidden="true" />
              </span>
              <span className="primate-focus-text">
                <strong>{stage.titleRu}</strong>
                <small>{formatAgeRu(stage.ageMa)}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
