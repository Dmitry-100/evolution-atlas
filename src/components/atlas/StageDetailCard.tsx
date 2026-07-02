import { Fingerprint, Maximize2, ScanSearch, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getStageGlossaryTerm } from "../../data/glossary";
import type { EvolutionStage, StageImage } from "../../data/lineage";
import { getImagePlaceholder } from "../../lib/imagePlaceholders";
import { formatAgeRu } from "../../lib/timeline";
import { ConstellationField } from "../ui/constellation-field";
import { FloatingPaths } from "../ui/floating-paths";
import { ImageLightbox } from "../ui/image-lightbox";
import { OptimizedImage } from "../ui/optimized-image";
import { ConfidenceBadge } from "../education/ConfidenceBadge";
import { GlossaryTerm } from "./GlossaryTerm";

type StageDetailCardProps = {
  stage: EvolutionStage;
};

export function StageDetailCard({ stage }: StageDetailCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousImageRef = useRef<StageImage>(stage.image);
  const [previousImage, setPreviousImage] = useState<StageImage | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const imageLabel =
    stage.image.kind === "generated-reconstruction" ? "AI-реконструкция" : null;
  const glossaryTerm = getStageGlossaryTerm(stage.id);
  const imagePlaceholder = getImagePlaceholder(stage.image.kind);

  useEffect(() => {
    const lastImage = previousImageRef.current;
    if (lastImage.src !== stage.image.src) {
      setPreviousImage(lastImage);
      setIsLoaded(false);
    }
    previousImageRef.current = stage.image;
  }, [stage.image]);

  useEffect(() => {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, [stage.id]);

  useEffect(() => {
    const image = imageRef.current;

    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [stage.image.src]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPreviousImage(null);
    }, 560);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, stage.image.src]);

  return (
    <aside
      className="stage-panel"
      data-tour-stop-id={`stage-${stage.id}`}
      aria-label="Активный вид"
      aria-live="polite"
    >
      <figure className="stage-plate">
        <div
          className="stage-plate-media"
          data-image-state={isLoaded ? "loaded" : "loading"}
          style={{ "--stage-placeholder": imagePlaceholder } as CSSProperties}
        >
          <div className="stage-plate-backdrop" aria-hidden="true">
            <FloatingPaths className="stage-plate-paths" density="panel" />
            <ConstellationField className="stage-plate-constellation" compact />
          </div>
          <button
            type="button"
            className="stage-plate-zoom"
            onClick={() => setIsImageExpanded(true)}
            aria-label={`Увеличить изображение: ${stage.titleRu}`}
          >
            {previousImage ? (
              <OptimizedImage
                pictureClassName="stage-plate-picture"
                className="stage-plate-main stage-plate-previous"
                src={previousImage.src}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            ) : null}
            <OptimizedImage
              key={stage.image.src}
              ref={imageRef}
              pictureClassName="stage-plate-picture"
              className={
                isLoaded
                  ? "stage-plate-main stage-plate-current is-loaded"
                  : "stage-plate-main stage-plate-current"
              }
              src={stage.image.src}
              alt={stage.image.altRu}
              decoding="async"
              fetchPriority="high"
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(true)}
            />
            <span className="stage-plate-zoom-indicator">
              <Maximize2 aria-hidden="true" size={15} />
              Увеличить
            </span>
          </button>
        </div>
        {imageLabel ? <figcaption>{imageLabel}</figcaption> : null}
      </figure>

      <div className="stage-copy">
        <p className="kicker">{formatAgeRu(stage.ageMa)}</p>
        <h2 ref={headingRef} tabIndex={-1}>{stage.titleRu}</h2>
        <p className="latin">{stage.latin}</p>
        {stage.confidence ? (
          <ConfidenceBadge level={stage.confidence} className="stage-confidence" />
        ) : null}
        {glossaryTerm ? (
          <div className="stage-glossary-line">
            <span>Словарь</span>
            <GlossaryTerm term={glossaryTerm} />
          </div>
        ) : null}
        <p className="lead">{stage.summaryRu}</p>

        <div className="inheritance-box">
          <div className="box-title">
            <Fingerprint aria-hidden="true" size={20} />
            <span>Карта признаков</span>
          </div>
          <ul>
            {stage.inherited.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link
            className="button button-secondary button-sm trait-map-link"
            to="/body-map"
          >
            <ScanSearch aria-hidden="true" size={15} />
            Открыть карту признаков
          </Link>
        </div>

        <div className="why-box">
          <Sparkles aria-hidden="true" size={18} />
          <p>{stage.whyMattersRu}</p>
        </div>
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
    </aside>
  );
}
