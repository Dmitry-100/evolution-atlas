import { useMemo, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, MoveHorizontal, TimerReset } from "lucide-react";
import type { MassExtinctionEvent } from "../../data/extinctions";
import type { EvolutionEra, EvolutionStage } from "../../data/lineage";
import { formatAgeRu, getPrePrimateShare, sortStagesOldestFirst } from "../../lib/timeline";
import { FloatingPaths } from "../ui/floating-paths";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type DeepTimeAxisProps = {
  stages: EvolutionStage[];
  eras: EvolutionEra[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
  extinctions?: MassExtinctionEvent[];
};

const ORIGIN_MA = 4000;
const PRIMATES_MA = 65;
const extinctionLabels: Record<string, string> = {
  "ordovician-silurian": "Ордовик",
  "late-devonian": "Девон",
  "permian-triassic": "Пермь",
  "triassic-jurassic": "Триас",
  "cretaceous-paleogene": "K-Pg",
};

function linearPosition(ageMa: number) {
  return Math.max(0, Math.min(1, 1 - ageMa / ORIGIN_MA));
}

function percentRu(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("ru-RU", { maximumFractionDigits });
}

function nearestStage(stages: EvolutionStage[], position: number) {
  return sortStagesOldestFirst(stages).reduce<{ stage: EvolutionStage; distance: number } | null>((nearest, stage) => {
    const distance = Math.abs(linearPosition(stage.ageMa) - position);
    if (!nearest || distance < nearest.distance) return { stage, distance };
    return nearest;
  }, null)?.stage;
}

export function DeepTimeAxis({
  stages,
  eras,
  activeStage,
  onActivate,
  onStep,
  canStepPrevious,
  canStepNext,
  extinctions = [],
}: DeepTimeAxisProps) {
  const activePosition = linearPosition(activeStage.ageMa) * 100;
  const activeCardClass =
    activePosition > 82 ? "deep-active-card align-right" : activePosition < 18 ? "deep-active-card align-left" : "deep-active-card";
  const prePrimateShare = getPrePrimateShare({ originMa: ORIGIN_MA, primatesMa: PRIMATES_MA });
  const activeElapsedShare = linearPosition(activeStage.ageMa);
  const primateStart = linearPosition(PRIMATES_MA) * 100;

  const eraBands = useMemo(
    () =>
      eras.map((era) => {
        const left = linearPosition(era.startsAtMa) * 100;
        const right = linearPosition(era.endsAtMa) * 100;
        return { ...era, left, width: Math.max(0.5, right - left) };
      }),
    [eras],
  );

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
    <section className="axis-panel deep-time-panel" aria-label="Глубокая шкала времени">
      <div className="axis-toolbar">
        <span className="axis-toolbar-copy">
          <MoveHorizontal aria-hidden="true" size={19} />
          Нажимайте точки, двигайте ползунок или используйте стрелки
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
        <strong>4 млрд лет одним взглядом</strong>
      </div>

      <div className="deep-time-stat">
        <TimerReset aria-hidden="true" size={24} />
        <div>
          <span>к выбранной точке прошло</span>
          <strong>{percentRu(activeElapsedShare * 100)}% истории жизни</strong>
          <small>до появления приматов - {percentRu(prePrimateShare * 100, 1)}%</small>
        </div>
      </div>

      <div
        className="deep-time-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Шкала времени. Используйте стрелки влево и вправо для перехода между этапами."
      >
        <div className="deep-time-water" aria-hidden="true" />
        <FloatingPaths className="deep-time-floating-paths" density="panel" />
        <img
          className="deep-time-river-image"
          src="/assets/images/timeline-river-specimens.png"
          alt=""
          aria-hidden="true"
        />
        <div className="pre-primate-field" style={{ width: `${primateStart}%` }}>
          <span>До приматов: примерно 3,94 млрд лет</span>
        </div>
        <div className="primate-sliver" style={{ left: `${primateStart}%` }}>
          <span>Приматы ~65 млн лет</span>
        </div>

        {eraBands.map((era) => (
          <span
            key={era.id}
            className="deep-era-band"
            style={{ left: `${era.left}%`, width: `${era.width}%`, background: era.color }}
            title={era.titleRu}
          />
        ))}

        <div className="extinction-markers" aria-label="Глобальные вымирания">
          {extinctions.map((event, index) => {
            const position = linearPosition(event.ageMa) * 100;
            const offset = (index - (extinctions.length - 1) / 2) * 66;
            return (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <a
                    className="extinction-marker"
                    style={
                      {
                        left: `${position}%`,
                        "--extinction-color": event.color,
                        "--marker-offset": `${offset}px`,
                        "--marker-y": `${22 + (index % 2) * 72}px`,
                      } as CSSProperties
                    }
                    href="/extinctions"
                    aria-label={`${event.titleRu} вымирание, ${event.windowRu}`}
                  >
                    <span aria-hidden="true" />
                    <strong>{extinctionLabels[event.id] ?? event.titleRu}</strong>
                    <small>{formatAgeRu(event.ageMa)}</small>
                  </a>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content extinction-tooltip">
                  <img src={event.image.src} alt="" aria-hidden="true" />
                  <span>{event.windowRu}</span>
                  <strong>{event.titleRu}</strong>
                  <p>{event.lossPercentRu}: {event.snapshotRu}</p>
                  <small>{event.keyFactsRu[0]}</small>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <span className="deep-active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />
        <div className={activeCardClass} style={{ left: `${activePosition}%` }}>
          <span>{formatAgeRu(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
          <small>{percentRu(activeElapsedShare * 100)}% истории уже прошло</small>
        </div>

        <div className="deep-stage-dots" role="list" aria-label="Этапы на глубокой шкале">
          {stages.map((stage) => {
            const position = linearPosition(stage.ageMa) * 100;
            const isActive = stage.id === activeStage.id;
            return (
              <button
                key={stage.id}
                className={isActive ? "deep-stage-dot is-active" : "deep-stage-dot"}
                style={{ left: `${position}%` }}
                type="button"
                aria-label={`${stage.titleRu}, ${formatAgeRu(stage.ageMa)}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onActivate(stage)}
              >
                <span />
              </button>
            );
          })}
        </div>
      </div>

      <Slider
        max={1000}
        min={0}
        step={1}
        value={[activePosition * 10]}
        onValueChange={([value]) => {
          const nearest = nearestStage(stages, (value ?? 0) / 1000);
          if (nearest) onActivate(nearest);
        }}
      />

      <div className="deep-time-ticks" aria-hidden="true">
        <span>4 млрд</span>
        <span>3 млрд</span>
        <span>2 млрд</span>
        <span>1 млрд</span>
        <span>600 млн</span>
        <span>200 млн</span>
        <span>65 млн</span>
        <span>сегодня</span>
      </div>
    </section>
  );
}
