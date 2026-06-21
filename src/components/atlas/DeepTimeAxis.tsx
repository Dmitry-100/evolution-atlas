import { useMemo, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, MoveHorizontal } from "lucide-react";
import type { MassExtinctionEvent } from "../../data/extinctions";
import type { EvolutionStage } from "../../data/lineage";
import { formatAgeRu, sortStagesOldestFirst } from "../../lib/timeline";
import { OptimizedImage } from "../ui/optimized-image";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type DeepTimeAxisProps = {
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
  extinctions?: MassExtinctionEvent[];
};

const ORIGIN_MA = 4000;
const VISUAL_TIME_ANCHORS = [
  { ageMa: 4000, position: 0 },
  { ageMa: 3000, position: 1 / 7 },
  { ageMa: 2000, position: 2 / 7 },
  { ageMa: 1000, position: 3 / 7 },
  { ageMa: 600, position: 4 / 7 },
  { ageMa: 200, position: 5 / 7 },
  { ageMa: 66, position: 6 / 7 },
  { ageMa: 0, position: 1 },
] as const;

const extinctionLabels: Record<string, string> = {
  "ordovician-silurian": "Ордовик",
  "late-devonian": "Девон",
  "permian-triassic": "Пермь",
  "triassic-jurassic": "Триас",
  "cretaceous-paleogene": "K-Pg",
  "holocene-anthropocene": "Сегодня",
};

const TIME_REGION_LABELS = [
  {
    id: "cellular",
    ageMa: 2400,
    title: "Клеточная жизнь",
    detail: "миллиарды лет до животных",
    color: "#6aa8ad",
    align: "center",
  },
  {
    id: "vertebrates",
    ageMa: 430,
    title: "Хордовые и рыбы",
    detail: "скелет, хорда, челюсти",
    color: "#7aaed2",
    align: "center",
  },
  {
    id: "land",
    ageMa: 320,
    title: "Суша и амниоты",
    detail: "выход из воды",
    color: "#d0a35b",
    align: "center",
  },
  {
    id: "mammals",
    ageMa: 120,
    title: "Млекопитающие",
    detail: "теплокровность и забота",
    color: "#b87f59",
    align: "center",
  },
  {
    id: "primates",
    ageMa: 66,
    title: "Приматы и Homo",
    detail: "самый конец шкалы",
    color: "#9eb36e",
    align: "right",
  },
] as const;

function visualTimePosition(ageMa: number) {
  const clampedAge = Math.max(0, Math.min(ORIGIN_MA, ageMa));

  for (let index = 0; index < VISUAL_TIME_ANCHORS.length - 1; index += 1) {
    const older = VISUAL_TIME_ANCHORS[index];
    const younger = VISUAL_TIME_ANCHORS[index + 1];

    if (clampedAge <= older.ageMa && clampedAge >= younger.ageMa) {
      const span = older.ageMa - younger.ageMa;
      const progress = span === 0 ? 0 : (older.ageMa - clampedAge) / span;
      return older.position + progress * (younger.position - older.position);
    }
  }

  return clampedAge <= 0 ? 1 : 0;
}

function formatExtinctionAge(event: MassExtinctionEvent) {
  return event.ageMa <= 0 ? "сегодня" : formatAgeRu(event.ageMa);
}

function nearestStage(stages: EvolutionStage[], position: number) {
  return sortStagesOldestFirst(stages).reduce<{
    stage: EvolutionStage;
    distance: number;
  } | null>((nearest, stage) => {
    const distance = Math.abs(visualTimePosition(stage.ageMa) - position);
    if (!nearest || distance < nearest.distance) return { stage, distance };
    return nearest;
  }, null)?.stage;
}

export function DeepTimeAxis({
  stages,
  activeStage,
  onActivate,
  onStep,
  canStepPrevious,
  canStepNext,
  extinctions = [],
}: DeepTimeAxisProps) {
  const activePosition = visualTimePosition(activeStage.ageMa) * 100;
  const activeCardClass =
    activePosition > 82
      ? "deep-active-card align-right"
      : activePosition < 18
        ? "deep-active-card align-left"
        : "deep-active-card";
  const visibleExtinctions = useMemo(
    () => extinctions.filter((event) => event.ageMa > 0),
    [extinctions],
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
    <section
      className="axis-panel deep-time-panel"
      aria-label="Глубокая шкала времени"
    >
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

      <div
        className="deep-time-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Шкала времени. Используйте стрелки влево и вправо для перехода между этапами."
      >
        <OptimizedImage
          className="deep-time-river-image"
          preferOptimized={false}
          src="/assets/images/timeline-river-evolution-21-9.png"
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
        />
        <div className="deep-time-region-labels" aria-hidden="true">
          {TIME_REGION_LABELS.map((region) => (
            <span
              key={region.id}
              className={`deep-time-region-label align-${region.align}`}
              style={
                {
                  left: `${visualTimePosition(region.ageMa) * 100}%`,
                  "--region-color": region.color,
                } as CSSProperties
              }
            >
              <strong>{region.title}</strong>
              <small>{region.detail}</small>
            </span>
          ))}
        </div>

        <div className="extinction-markers" aria-label="Глобальные вымирания">
          {visibleExtinctions.map((event, index) => {
            const position = visualTimePosition(event.ageMa) * 100;
            const offset =
              index === visibleExtinctions.length - 1 ? 0 : (index - 1.5) * 58;
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
                        "--marker-y": `${24 + (index % 2) * 76}px`,
                      } as CSSProperties
                    }
                    href="/extinctions"
                    aria-label={`${event.titleRu} вымирание, ${event.windowRu}`}
                  >
                    <span aria-hidden="true" />
                    <strong>
                      {extinctionLabels[event.id] ?? event.titleRu}
                    </strong>
                    <small>{formatExtinctionAge(event)}</small>
                  </a>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content extinction-tooltip">
                  <img
                    src={event.image.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{event.windowRu}</span>
                  <strong>{event.titleRu}</strong>
                  <p>
                    {event.lossPercentRu}: {event.snapshotRu}
                  </p>
                  <small>{event.keyFactsRu[0]}</small>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <span
          className="deep-active-line"
          style={{ left: `${activePosition}%` }}
          aria-hidden="true"
        />
        <div className={activeCardClass} style={{ left: `${activePosition}%` }}>
          <span>{formatAgeRu(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
        </div>

        <div
          className="deep-stage-dots"
          role="list"
          aria-label="Этапы на глубокой шкале"
        >
          {stages.map((stage) => {
            const position = visualTimePosition(stage.ageMa) * 100;
            const isActive = stage.id === activeStage.id;
            return (
              <button
                key={stage.id}
                className={
                  isActive ? "deep-stage-dot is-active" : "deep-stage-dot"
                }
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
        <span>66 млн</span>
        <span>сегодня</span>
      </div>
    </section>
  );
}
