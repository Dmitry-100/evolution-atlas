import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { EvolutionStage } from "../../data/lineage";
import { PRIMATE_READING_GROUPS } from "../../data/primateGroups";
import { ageMaToPosition, formatAgeRu } from "../../lib/timeline";
import { FloatingPaths } from "../ui/floating-paths";
import { ImageLightbox } from "../ui/image-lightbox";
import { OptimizedImage } from "../ui/optimized-image";
import { Slider } from "../ui/slider";
import { JourneyControls } from "./JourneyControls";

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

function nearestStageByPosition(stages: EvolutionStage[], positions: number[], target: number) {
  return stages.reduce<{ stage: EvolutionStage; distance: number } | null>((nearest, stage, index) => {
    const position = (positions[index] ?? 0) / 100;
    const distance = Math.abs(position - target);
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
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const positions = useMemo(() => makeReadablePositions(stages), [stages]);
  const activeIndex = Math.max(0, stages.findIndex((stage) => stage.id === activeStage.id));
  const activePosition = positions[activeIndex] ?? 2;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" && canStepNext) {
      event.preventDefault();
      event.stopPropagation();
      onStep(1);
    }

    if (event.key === "ArrowLeft" && canStepPrevious) {
      event.preventDefault();
      event.stopPropagation();
      onStep(-1);
    }
  }

  return (
    <section id="primate-timeline" className="axis-panel primate-focus-panel" aria-label="Временная шкала от ранних приматов к человеку">
      <div className="axis-toolbar">
        <div className="deep-time-selection" aria-label="Выбранная точка">
          <span>{formatAgeRu(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
        </div>
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
      </div>

      <div className="primate-zone-bands" aria-label="Группы этапов">
        {PRIMATE_READING_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            style={{ "--primate-group-color": group.color } as CSSProperties}
            aria-pressed={group.stages.some((stage) => stage.id === activeStage.id)}
            onClick={() => onActivate(group.stages[0])}
          >
            {group.titleRu}
          </button>
        ))}
      </div>

      <div
        className="deep-time-axis primate-deep-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Шкала от ранних приматов к Homo sapiens. Используйте стрелки влево и вправо."
      >
        <div className="deep-time-water primate-time-water" aria-hidden="true" />
        <FloatingPaths className="deep-time-floating-paths primate-time-floating-paths" density="panel" />
        <OptimizedImage
          className="primate-timeline-river-image"
          src="/assets/images/timelines/primates-timeline-21-9.png"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <button
          type="button"
          className="deep-time-image-zoom"
          onClick={() => setIsTimelineExpanded(true)}
          aria-label="Увеличить иллюстрацию шкалы приматов"
        >
          <span>
            <Maximize2 aria-hidden="true" size={15} />
            Увеличить
          </span>
        </button>

        <span className="deep-active-line primate-deep-active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />

        <div className="deep-stage-dots primate-stage-dots" role="list" aria-label="Этапы на шкале приматов">
          {stages.map((stage, index) => {
            const isActive = stage.id === activeStage.id;
            const position = positions[index] ?? 2;

            return (
              <button
                key={stage.id}
                type="button"
                className={isActive ? "deep-stage-dot is-active" : "deep-stage-dot"}
                data-tour-stop-id={`stage-${stage.id}`}
                style={{ left: `${position}%` } as CSSProperties}
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
          const nearest = nearestStageByPosition(stages, positions, (value ?? 0) / 1000);
          if (nearest) onActivate(nearest);
        }}
      />

      <div className="deep-time-ticks primate-time-ticks" aria-hidden="true">
        <span>66 млн</span>
        <span>40 млн</span>
        <span>20 млн</span>
        <span>7 млн</span>
        <span>сегодня</span>
      </div>
      <p className="deep-time-instruction">66 млн лет назад — сегодня. Выбирайте точки, двигайте ползунок или используйте стрелки.</p>
      <JourneyControls
        stages={stages}
        activeStage={activeStage}
        onActivate={onActivate}
      />
      <ImageLightbox
        image={
          isTimelineExpanded
            ? {
                src: "/assets/images/timelines/primates-timeline-21-9.png",
                alt: "Панорамная иллюстрация шкалы от ранних приматов к Homo sapiens.",
                caption:
                  "Шкала приматов: от ранних древесных форм к антропоидам, человекообразным и Homo sapiens.",
              }
            : null
        }
        ariaLabel="Увеличенная иллюстрация шкалы приматов"
        onClose={() => setIsTimelineExpanded(false)}
      />
    </section>
  );
}
