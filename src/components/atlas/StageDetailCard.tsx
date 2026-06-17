import { ExternalLink, Fingerprint, Sparkles } from "lucide-react";
import { getStageGlossaryTerm } from "../../data/glossary";
import type { EvolutionStage } from "../../data/lineage";
import { formatAgeRu } from "../../lib/timeline";
import { ConstellationField } from "../ui/constellation-field";
import { FloatingPaths } from "../ui/floating-paths";
import { GlossaryTerm } from "./GlossaryTerm";

type StageDetailCardProps = {
  stage: EvolutionStage;
};

export function StageDetailCard({ stage }: StageDetailCardProps) {
  const imageLabel =
    stage.image.kind === "generated-reconstruction" ? "AI-реконструкция" : "изображение из открытого источника";
  const glossaryTerm = getStageGlossaryTerm(stage.id);

  return (
    <aside className="stage-panel" aria-label="Активный вид">
      <figure className="stage-plate">
        <div className="stage-plate-media">
          <div className="stage-plate-backdrop" aria-hidden="true">
            <FloatingPaths className="stage-plate-paths" density="panel" />
            <ConstellationField className="stage-plate-constellation" compact />
          </div>
          <img
            key={stage.image.src}
            className="stage-plate-main stage-plate-current"
            src={stage.image.src}
            alt={stage.image.altRu}
          />
        </div>
        <figcaption>{imageLabel}</figcaption>
      </figure>

      <div className="stage-copy">
        <p className="kicker">{formatAgeRu(stage.ageMa)}</p>
        <h2>{stage.titleRu}</h2>
        <p className="latin">{stage.latin}</p>
        {glossaryTerm ? (
          <div className="stage-glossary-line">
            термин: <GlossaryTerm term={glossaryTerm} />
          </div>
        ) : null}
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
