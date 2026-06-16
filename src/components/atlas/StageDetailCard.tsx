import { ExternalLink, Fingerprint, Sparkles } from "lucide-react";
import type { EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";

type StageDetailCardProps = {
  stage: EvolutionStage;
};

export function StageDetailCard({ stage }: StageDetailCardProps) {
  const imageLabel =
    stage.image.kind === "generated-reconstruction" ? "AI-реконструкция" : "изображение из открытого источника";

  return (
    <aside className="stage-panel" aria-label="Активный вид">
      <figure className="stage-plate">
        <img src={stage.image.src} alt={stage.image.altRu} />
        <figcaption>{imageLabel}</figcaption>
      </figure>

      <div className="stage-copy">
        <p className="kicker">{formatAgeRu(stage.ageMa)}</p>
        <h2>{stage.titleRu}</h2>
        <p className="latin">{stage.latin}</p>
        <p className="lead">{stage.summaryRu}</p>

        <div className="inheritance-box">
          <div className="box-title">
            <Fingerprint aria-hidden="true" size={20} />
            <span>Что дошло до нас</span>
          </div>
          <ul>
            {stage.inherited.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="why-box">
          <Sparkles aria-hidden="true" size={18} />
          <p>{stage.whyMattersRu}</p>
        </div>

        <div className="source-strip">
          <span>{stage.image.credit}</span>
          <a href={stage.image.sourceUrl} target="_blank" rel="noreferrer">
            license: {stage.image.license}
            <ExternalLink aria-hidden="true" size={14} />
          </a>
        </div>
      </div>
    </aside>
  );
}
