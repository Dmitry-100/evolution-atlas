import type { CSSProperties } from "react";
import type { EvolutionEra, EvolutionStage } from "../../../data/lineage";
import { formatAgeRu } from "../../../lib/timeline";
import { MobileStageDetail } from "./MobileStageDetail";

type MobileStageMapProps = {
  eras: EvolutionEra[];
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

export function MobileStageMap({
  eras,
  stages,
  activeStage,
  onActivate,
}: MobileStageMapProps) {
  return (
    <div className="mobile-stage-map" aria-label="Вертикальная карта этапов">
      {eras.map((era) => {
        const eraStages = stages.filter((stage) => stage.eraId === era.id);
        if (eraStages.length === 0) return null;

        return (
          <section
            key={era.id}
            className="mobile-era-group"
            style={{ "--mobile-era-color": era.color } as CSSProperties}
          >
            <div className="mobile-era-heading">
              <span>{era.titleRu}</span>
              <small>
                {formatAgeRu(era.startsAtMa)} - {formatAgeRu(era.endsAtMa)}
              </small>
            </div>

            <div className="mobile-era-stages">
              {eraStages.map((stage) => {
                const isActive = stage.id === activeStage.id;

                return (
                  <article
                    key={stage.id}
                    className={
                      isActive
                        ? "mobile-stage-row is-active"
                        : "mobile-stage-row"
                    }
                    data-tour-stop-id={`stage-${stage.id}`}
                  >
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => onActivate(stage)}
                    >
                      <span>{formatAgeRu(stage.ageMa)}</span>
                      <strong>{stage.titleRu}</strong>
                    </button>
                    {isActive ? <MobileStageDetail stage={stage} /> : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
