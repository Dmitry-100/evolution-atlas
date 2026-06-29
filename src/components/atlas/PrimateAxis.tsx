import { ArrowLeft, ArrowRight, Maximize2, MoveHorizontal } from "lucide-react";
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { EvolutionStage } from "../../data/lineage";
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
const primateAxisZones = [
  { id: "roots", label: "древесные приматы", fromId: "early-primates", toId: "anthropoids" },
  { id: "monkeys", label: "обезьяны", fromId: "anthropoids", toId: "catarrhini" },
  { id: "apes", label: "человекообразные", fromId: "early-apes", toId: "hominins" },
  { id: "homo", label: "линия Homo", fromId: "early-homo", toId: "sapiens" },
];

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
  const activeCardClass =
    activePosition > 82
      ? "deep-active-card align-right"
      : activePosition < 18
        ? "deep-active-card align-left"
        : "deep-active-card";
  const positionById = useMemo(() => {
    const map = new Map<string, number>();
    stages.forEach((stage, index) => map.set(stage.id, positions[index] ?? 0));
    return map;
  }, [positions, stages]);

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
    <section className="axis-panel primate-focus-panel" aria-label="Временная шкала от ранних приматов к человеку">
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
        <strong>66 млн лет назад → сегодня</strong>
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

        <div className="primate-zone-bands" aria-hidden="true">
          {primateAxisZones.map((zone) => {
            const from = positionById.get(zone.fromId);
            const to = positionById.get(zone.toId);
            if (from === undefined || to === undefined) return null;
            const left = Math.min(from, to);
            const right = Math.max(from, to);
            return (
              <span key={zone.id} style={{ left: `${left}%`, width: `${Math.max(8, right - left)}%` }}>
                {zone.label}
              </span>
            );
          })}
        </div>

        <span className="deep-active-line primate-deep-active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />
        <div className={activeCardClass} style={{ left: `${activePosition}%` }}>
          <span>{formatAgeRu(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
        </div>

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
