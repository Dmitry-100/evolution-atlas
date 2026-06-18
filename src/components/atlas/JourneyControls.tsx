import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { EvolutionStage } from "../../data/lineage";

type JourneyControlsProps = {
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

const JOURNEY_STEP_MS = 900;

export function JourneyControls({
  stages,
  activeStage,
  onActivate,
}: JourneyControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStage.id),
  );
  const isAtEnd = activeIndex >= stages.length - 1;
  const progress =
    stages.length > 1 ? (activeIndex / (stages.length - 1)) * 100 : 100;

  useEffect(() => {
    if (!isPlaying) {
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
  }, [activeIndex, isPlaying, onActivate, stages]);

  function toggleJourney() {
    if (isPlaying) {
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
    setHasStarted(true);
    setIsPlaying(true);
  }

  const primaryLabel = isPlaying
    ? "Пауза"
    : hasStarted && !isAtEnd
      ? "Продолжить"
      : "Запустить путешествие";

  return (
    <div className="journey-controls" aria-label="Кинематографичный маршрут">
      <button
        className="button button-primary button-md"
        type="button"
        onClick={toggleJourney}
      >
        {isPlaying ? (
          <Pause aria-hidden="true" size={17} />
        ) : (
          <Play aria-hidden="true" size={17} />
        )}
        {primaryLabel}
      </button>
      <button
        className="button button-secondary button-md"
        type="button"
        onClick={restartJourney}
      >
        <RotateCcw aria-hidden="true" size={17} />
        Сначала
      </button>
      <div className="journey-meter" aria-hidden={!hasStarted}>
        <span className="journey-status" aria-live="polite">
          Маршрут {activeIndex + 1} из {stages.length}: {activeStage.titleRu}
        </span>
        <span className="journey-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      </div>
    </div>
  );
}
