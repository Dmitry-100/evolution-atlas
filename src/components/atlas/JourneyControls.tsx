import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

type JourneyControlItem = {
  id: string;
  titleRu: string;
};

type JourneyControlsProps<TItem extends JourneyControlItem> = {
  stages: TItem[];
  activeStage: TItem;
  onActivate: (stage: TItem) => void;
  itemLabel?: string;
};

const JOURNEY_STEP_MS = 900;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

export function JourneyControls<TItem extends JourneyControlItem>({
  stages,
  activeStage,
  onActivate,
  itemLabel = "Этап",
}: JourneyControlsProps<TItem>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStage.id),
  );
  const isAtEnd = activeIndex >= stages.length - 1;
  const progress =
    stages.length > 1 ? (activeIndex / (stages.length - 1)) * 100 : 100;
  const effectiveIsPlaying = isPlaying && !prefersReducedMotion;

  useEffect(() => {
    if (!effectiveIsPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextStage = stages[activeIndex + 1];
      if (!nextStage) {
        setIsPlaying(false);
        return;
      }
      onActivate(nextStage);
    }, JOURNEY_STEP_MS);

    return () => window.clearInterval(interval);
  }, [activeIndex, effectiveIsPlaying, onActivate, stages]);

  function toggleJourney() {
    if (effectiveIsPlaying) {
      setIsPlaying(false);
      return;
    }
    if (prefersReducedMotion) {
      setIsPlaying(false);
      return;
    }

    if (!hasStarted || isAtEnd) {
      onActivate(stages[0]);
    }
    setHasStarted(true);
    setIsPlaying(true);
  }

  function restartJourney() {
    onActivate(stages[0]);
    setHasStarted(false);
    setIsPlaying(false);
  }

  const primaryLabel = effectiveIsPlaying
    ? "Поставить прокрутку на паузу"
    : hasStarted && !isAtEnd
      ? "Продолжить прокрутку по времени"
      : "Начать прокрутку по времени";

  return (
    <div className="journey-controls" aria-label="Управление прокруткой времени">
      <span className="journey-controls-title">Прокрутка по времени</span>
      <button
        className="journey-icon-button"
        type="button"
        aria-label={primaryLabel}
        title={primaryLabel}
        onClick={toggleJourney}
      >
        {effectiveIsPlaying ? (
          <Pause aria-hidden="true" size={18} />
        ) : (
          <Play aria-hidden="true" size={18} />
        )}
      </button>
      <button
        className="journey-icon-button"
        type="button"
        aria-label="Начать прокрутку сначала"
        title="Начать прокрутку сначала"
        onClick={restartJourney}
      >
        <RotateCcw aria-hidden="true" size={18} />
      </button>
      <div className="journey-meter">
        <span
          className="sr-only"
          aria-live={effectiveIsPlaying ? undefined : "polite"}
        >
          {itemLabel} {activeIndex + 1} из {stages.length}: {activeStage.titleRu}
        </span>
        <span className="journey-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      </div>
    </div>
  );
}
