import type { CSSProperties } from "react";
import type { EvolutionEra, EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";

type EraNavigationProps = {
  eras: EvolutionEra[];
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

function renderEraTitle(titleRu: string) {
  if (titleRu === "Млекопитающие") {
    return (
      <>
        Млекопита
        <wbr />
        ющие
      </>
    );
  }

  return titleRu;
}

export function EraNavigation({ eras, stages, activeStage, onActivate }: EraNavigationProps) {
  return (
    <nav className="era-route" aria-label="Эпохи" style={{ "--era-count": eras.length } as CSSProperties}>
      {eras.map((era, index) => {
        const eraStages = stages.filter((stage) => stage.eraId === era.id);
        const target = eraStages[0];
        const isActive = activeStage.eraId === era.id;

        return (
          <button
            key={era.id}
            type="button"
            className={isActive ? "era-route-item is-active" : "era-route-item"}
            style={{ "--era-color": era.color } as CSSProperties}
            onClick={() => target && onActivate(target)}
            disabled={!target}
            aria-current={isActive ? "step" : undefined}
            aria-label={`${era.titleRu}, ${formatAgeRu(era.startsAtMa).replace(" назад", "")} - ${formatAgeRu(era.endsAtMa).replace(" назад", "")}`}
          >
            <span className="era-route-marker" aria-hidden="true">
              <span className="era-route-node" style={{ background: era.color }} />
            </span>
            <span className="era-route-copy">
              <span className="era-route-order">{String(index + 1).padStart(2, "0")}</span>
              <strong lang="ru">{renderEraTitle(era.titleRu)}</strong>
              <small>
                {formatAgeRu(era.startsAtMa).replace(" назад", "")} - {formatAgeRu(era.endsAtMa).replace(" назад", "")}
              </small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
