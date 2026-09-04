import type { CSSProperties } from "react";
import type { EvolutionEra, EvolutionStage } from "../../../data/lineage";
import { formatAgeRu } from "../../../lib/timeline";
import { MobileStageDetail } from "./MobileStageDetail";

export type MobileStageGroup = {
  id: string;
  titleRu: string;
  color: string;
  stages: EvolutionStage[];
  startsAtMa?: number;
  endsAtMa?: number;
};

type MobileStageMapProps = {
  eras: EvolutionEra[];
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
  groups?: MobileStageGroup[];
};

export function MobileStageMap({
  eras,
  stages,
  activeStage,
  onActivate,
  groups,
}: MobileStageMapProps) {
  const displayGroups: MobileStageGroup[] = groups ?? eras.map((era) => ({
    ...era,
    stages: stages.filter((stage) => stage.eraId === era.id),
  }));
  return (
    <div className="mobile-stage-map" aria-label="Вертикальная карта этапов">
      {displayGroups.map((era) => {
        const eraStages = era.stages;
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
                {formatAgeRu(era.startsAtMa ?? eraStages[0].ageMa)} - {formatAgeRu(era.endsAtMa ?? eraStages[eraStages.length - 1].ageMa)}
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
