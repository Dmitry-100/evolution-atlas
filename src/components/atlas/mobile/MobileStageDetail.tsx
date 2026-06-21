import type { EvolutionStage } from "../../../data/lineage";
import { formatAgeRu } from "../../../lib/timeline";

type MobileStageDetailProps = {
  stage: EvolutionStage;
};

export function MobileStageDetail({ stage }: MobileStageDetailProps) {
  const featuredTraits = stage.inherited.slice(0, 4);

  return (
    <div className="mobile-stage-detail">
      <img
        src={stage.image.src}
        alt={stage.image.altRu}
        loading="lazy"
        decoding="async"
      />
      <div className="mobile-stage-detail-copy">
        <span>{formatAgeRu(stage.ageMa)}</span>
        <h3>{stage.titleRu}</h3>
        <p className="latin">{stage.latin}</p>
        <p>{stage.summaryRu}</p>
        <div
          className="mobile-stage-traits"
          aria-label="Унаследованные признаки"
        >
          {featuredTraits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <p className="mobile-stage-why">{stage.whyMattersRu}</p>
      </div>
    </div>
  );
}
