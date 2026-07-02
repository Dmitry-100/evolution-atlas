import { useState } from "react";
import { Maximize2, ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { EvolutionStage } from "../../../data/lineage";
import { formatAgeRu } from "../../../lib/timeline";
import { ImageLightbox } from "../../ui/image-lightbox";
import { OptimizedImage } from "../../ui/optimized-image";

type MobileStageDetailProps = {
  stage: EvolutionStage;
};

export function MobileStageDetail({ stage }: MobileStageDetailProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const featuredTraits = stage.inherited.slice(0, 4);

  return (
    <div className="mobile-stage-detail">
      <button
        type="button"
        className="mobile-stage-detail-zoom"
        onClick={() => setIsImageExpanded(true)}
        aria-label={`Увеличить изображение: ${stage.titleRu}`}
      >
        <OptimizedImage
          src={stage.image.src}
          alt={stage.image.altRu}
          loading="lazy"
          decoding="async"
        />
        <span>
          <Maximize2 aria-hidden="true" size={15} />
          Увеличить
        </span>
      </button>
      <div className="mobile-stage-detail-copy">
        <span>{formatAgeRu(stage.ageMa)}</span>
        <h3>{stage.titleRu}</h3>
        <p className="latin">{stage.latin}</p>
        <p>{stage.summaryRu}</p>
        <div
          className="mobile-stage-traits"
          aria-label="Карта признаков"
        >
          {featuredTraits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <Link
          className="button button-secondary button-sm trait-map-link"
          to="/body-map"
        >
          <ScanSearch aria-hidden="true" size={15} />
          Карта признаков
        </Link>
        <p className="mobile-stage-why">{stage.whyMattersRu}</p>
      </div>
      <ImageLightbox
        image={
          isImageExpanded
            ? {
                src: stage.image.src,
                alt: stage.image.altRu,
                caption: `${stage.titleRu}. ${stage.image.altRu}`,
              }
            : null
        }
        ariaLabel="Увеличенное изображение этапа"
        onClose={() => setIsImageExpanded(false)}
      />
    </div>
  );
}
