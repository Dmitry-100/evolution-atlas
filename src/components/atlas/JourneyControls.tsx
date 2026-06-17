import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { EvolutionStage } from "../../data/lineage";

type JourneyControlsProps = {
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

const JOURNEY_STEP_MS = 900;

export function JourneyControls({ stages, activeStage, onActivate }: JourneyControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      const currentIndex = Math.max(0, stages.findIndex((stage) => stage.id === activeStage.id));
      const nextStage = stages[currentIndex + 1];
      if (!nextStage) {
        setIsPlaying(false);
        return;
      }
      onActivate(nextStage);
    }, JOURNEY_STEP_MS);

    return () => window.clearInterval(interval);
  }, [activeStage.id, isPlaying, onActivate, stages]);

  function startJourney() {
    onActivate(stages[0]);
    setIsPlaying(true);
  }

  function restartJourney() {
    onActivate(stages[0]);
    setIsPlaying(true);
  }

  return (
    <div className="journey-controls" aria-label="Кинематографичный маршрут">
      <button className="button button-primary button-md" type="button" onClick={isPlaying ? () => setIsPlaying(false) : startJourney}>
        {isPlaying ? <Pause aria-hidden="true" size={17} /> : <Play aria-hidden="true" size={17} />}
        {isPlaying ? "Пауза" : "Запустить путешествие"}
      </button>
      <button className="button button-secondary button-md" type="button" onClick={restartJourney}>
        <RotateCcw aria-hidden="true" size={17} />
        Сначала
      </button>
    </div>
  );
}
