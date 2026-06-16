import { ChevronRight } from "lucide-react";
import type { EvolutionEra, EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";

type EraNavigationProps = {
  eras: EvolutionEra[];
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

export function EraNavigation({ eras, stages, activeStage, onActivate }: EraNavigationProps) {
  return (
    <nav className="era-nav" aria-label="Эпохи">
      {eras.map((era) => {
        const eraStages = stages.filter((stage) => stage.eraId === era.id);
        const target = eraStages[0];
        const isActive = activeStage.eraId === era.id;

        return (
          <button
            key={era.id}
            type="button"
            className={isActive ? "era-nav-item is-active" : "era-nav-item"}
            onClick={() => target && onActivate(target)}
            disabled={!target}
          >
            <span className="era-swatch" style={{ background: era.color }} aria-hidden="true" />
            <span>
              <strong>{era.titleRu}</strong>
              <small>
                {formatAgeRu(era.startsAtMa).replace(" назад", "")} - {formatAgeRu(era.endsAtMa).replace(" назад", "")}
              </small>
            </span>
            <ChevronRight aria-hidden="true" size={17} />
          </button>
        );
      })}
    </nav>
  );
}
