import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Maximize2,
  MoveHorizontal,
} from "lucide-react";
import {
  formatExtinctionTitleRu,
  type MassExtinctionEvent,
} from "../../data/extinctions";
import {
  getGeologicContextForAge,
} from "../../data/geologicPeriods";
import { ERAS, type EvolutionEra, type EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";
import {
  toExtinctionTimelineItem,
  toStageTimelineItem,
  type TimelineItem,
} from "../../lib/timelineItems";
import { ImageLightbox } from "../ui/image-lightbox";
import { OptimizedImage } from "../ui/optimized-image";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { JourneyControls } from "./JourneyControls";

type DeepTimeAxisProps = {
  stages: EvolutionStage[];
  timelineItems: TimelineItem[];
  activeItem: TimelineItem;
  onActivateItem: (item: TimelineItem) => void;
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

type TimeRegionLabel = {
  eraId: EvolutionEra["id"];
  detail: string;
  align: "center" | "right";
  labelPosition: number;
  lane: number;
  href?: string;
};

const TIME_REGION_LABELS = [
  {
    eraId: "early-life",
    detail: "миллиарды лет до животных",
    align: "center",
    labelPosition: 22,
    lane: 0,
    href: "/origin-of-life",
  },
  {
    eraId: "animals",
    detail: "тела, ткани и хорда",
    align: "center",
    labelPosition: 42,
    lane: 1,
  },
  {
    eraId: "fish",
    detail: "скелет, челюсти, плавники",
    align: "center",
    labelPosition: 50,
    lane: 2,
  },
  {
    eraId: "land",
    detail: "пальцы и амниотическое яйцо",
    align: "center",
    labelPosition: 58,
    lane: 0,
  },
  {
    eraId: "synapsids",
    detail: "челюсти, зубы, будущий слух",
    align: "center",
    labelPosition: 66,
    lane: 1,
  },
  {
    eraId: "mammals",
    detail: "шерсть, молоко, забота",
    align: "center",
    labelPosition: 74,
    lane: 2,
  },
  {
    eraId: "primates",
    detail: "самый конец шкалы",
    align: "right",
    labelPosition: 96,
    lane: 0,
    href: "/primates",
  },
] satisfies readonly TimeRegionLabel[];

const ERA_BY_ID = new Map(ERAS.map((era) => [era.id, era]));

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

function nearestTimelineItem(items: TimelineItem[], position: number) {
  return items.reduce<{
    item: TimelineItem;
    distance: number;
  } | null>((nearest, item) => {
    const distance = Math.abs(visualTimePosition(item.ageMa) - position);
    if (!nearest || distance < nearest.distance) return { item, distance };
    return nearest;
  }, null)?.item;
}

export function DeepTimeAxis({
  stages,
  timelineItems,
  activeItem,
  onActivateItem,
  onStep,
  canStepPrevious,
  canStepNext,
  extinctions = [],
}: DeepTimeAxisProps) {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const activePosition = visualTimePosition(activeItem.ageMa) * 100;
  const activeColor =
    activeItem.kind === "extinction" ? activeItem.event.color : "var(--amber)";
  const showActiveCard = activeItem.kind === "stage";
  const activeCardClass = [
    "deep-active-card",
    activePosition > 82
      ? "align-right"
      : activePosition < 18
        ? "align-left"
        : null,
    activePosition > 70 ? "late-region" : null,
    activeItem.kind === "extinction" ? "is-extinction" : null,
  ]
    .filter(Boolean)
    .join(" ");
  const activeAgeLabel =
    activeItem.kind === "extinction"
      ? formatExtinctionAge(activeItem.event)
      : formatAgeRu(activeItem.stage.ageMa);
  const geologicContext = getGeologicContextForAge(activeItem.ageMa);
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
          src="/assets/images/timeline-river-evolution-21-9.png"
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
        />
        <button
          type="button"
          className="deep-time-image-zoom"
          onClick={() => setIsTimelineExpanded(true)}
          aria-label="Увеличить иллюстрацию шкалы времени"
        >
          <span>
            <Maximize2 aria-hidden="true" size={15} />
            Увеличить
          </span>
        </button>
        <div className="deep-time-region-labels">
          {TIME_REGION_LABELS.map((region) => {
            const era = ERA_BY_ID.get(region.eraId);
            if (!era) return null;

            const labelClass = `deep-time-region-label align-${region.align}`;
            const labelStyle = {
              left: `${region.labelPosition}%`,
              "--region-color": era.color,
              "--region-lane": region.lane,
            } as CSSProperties;

            if (region.href) {
              return (
                <Link
                  key={region.eraId}
                  className={`${labelClass} deep-time-region-link`}
                  style={labelStyle}
                  to={region.href}
                >
                  <strong>{era.titleRu}</strong>
                  <small>{region.detail}</small>
                </Link>
              );
            }

            return (
              <span key={region.eraId} className={labelClass} style={labelStyle}>
                <strong>{era.titleRu}</strong>
                <small>{region.detail}</small>
              </span>
            );
          })}
        </div>

        <div className="extinction-markers" aria-label="Глобальные вымирания">
          {visibleExtinctions.map((event, index) => {
            const position = visualTimePosition(event.ageMa) * 100;
            const item = toExtinctionTimelineItem(event);
            const isActive =
              activeItem.kind === "extinction" && activeItem.event.id === event.id;
            const offset =
              index === visibleExtinctions.length - 1 ? 0 : (index - 1.5) * 58;
            return (
              <Tooltip key={event.id}>
                <TooltipTrigger asChild>
                  <button
                    className={
                      isActive
                        ? "extinction-marker is-active"
                        : "extinction-marker"
                    }
                    style={
                      {
                        left: `${position}%`,
                        "--extinction-color": event.color,
                        "--marker-label-offset": `${offset}px`,
                        "--marker-y": `${24 + (index % 2) * 76}px`,
                      } as CSSProperties
                    }
                    type="button"
                    aria-label={`${event.titleRu} вымирание, ${event.windowRu}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => onActivateItem(item)}
                  >
                    <span aria-hidden="true" />
                    <strong>
                      {extinctionLabels[event.id] ?? event.titleRu}
                    </strong>
                    <small>{formatExtinctionAge(event)}</small>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="tooltip-content extinction-tooltip">
                  <OptimizedImage
                    src={event.image.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{event.windowRu}</span>
                  <strong>{formatExtinctionTitleRu(event.titleRu)}</strong>
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
          style={
            {
              left: `${activePosition}%`,
              "--active-item-color": activeColor,
            } as CSSProperties
          }
          aria-hidden="true"
        />
        {showActiveCard ? (
          <div
            className={activeCardClass}
            style={
              {
                left: `${activePosition}%`,
                "--active-item-color": activeColor,
              } as CSSProperties
            }
          >
            <span>{activeAgeLabel}</span>
            <strong>{activeItem.titleRu}</strong>
          </div>
        ) : null}

        <div
          className="deep-stage-dots"
          role="list"
          aria-label="Этапы на глубокой шкале"
        >
          {stages.map((stage) => {
            const position = visualTimePosition(stage.ageMa) * 100;
            const isActive =
              activeItem.kind === "stage" && stage.id === activeItem.stage.id;
            return (
              <button
                key={stage.id}
                className={
                  isActive ? "deep-stage-dot is-active" : "deep-stage-dot"
                }
                data-tour-stop-id={`stage-${stage.id}`}
                style={{ left: `${position}%` }}
                type="button"
                aria-label={`${stage.titleRu}, ${formatAgeRu(stage.ageMa)}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onActivateItem(toStageTimelineItem(stage))}
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
          const nearest = nearestTimelineItem(timelineItems, (value ?? 0) / 1000);
          if (nearest) onActivateItem(nearest);
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

      {geologicContext ? (
        <aside
          className="geologic-period-card"
          style={{ "--period-color": geologicContext.period.color } as CSSProperties}
          aria-label="Геологический контекст выбранной точки"
        >
          <div className="geologic-period-heading">
            <div className="box-title">
              <BookOpen aria-hidden="true" size={18} />
              <span>{geologicContext.period.systemRu}</span>
            </div>
            <div className="geologic-period-main">
              <h2>{geologicContext.period.titleRu}</h2>
              <p className="kicker">{geologicContext.period.intervalRu}</p>
              {geologicContext.boundary ? (
                <span className="geologic-boundary-chip">
                  {geologicContext.boundary.titleRu}
                </span>
              ) : null}
            </div>
          </div>
          <div className="geologic-period-copy">
            <p className="geologic-period-summary">
              {geologicContext.period.summaryRu}
            </p>
            <p className="geologic-period-boundary">
              <strong>Граница:</strong>{" "}
              {geologicContext.boundary?.noteRu ??
                geologicContext.period.boundaryRu}
            </p>
          </div>
        </aside>
      ) : null}

      <JourneyControls
        stages={timelineItems}
        activeStage={activeItem}
        onActivate={onActivateItem}
        itemLabel="Точка"
      />
      <ImageLightbox
        image={
          isTimelineExpanded
            ? {
                src: "/assets/images/timeline-river-evolution-21-9.png",
                alt: "Панорамная иллюстрация шкалы эволюции от ранней жизни к человеку.",
                caption:
                  "Шкала «4 млрд лет одним взглядом»: водная ранняя жизнь, выход на сушу, млекопитающие, приматы и линия Homo.",
              }
            : null
        }
        ariaLabel="Увеличенная иллюстрация шкалы времени"
        onClose={() => setIsTimelineExpanded(false)}
      />
    </section>
  );
}
