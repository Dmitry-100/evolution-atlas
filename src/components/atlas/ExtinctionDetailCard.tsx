import { AlertTriangle, ExternalLink, Maximize2, Sparkles, Waves } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  formatExtinctionTitleRu,
  type ExtinctionImage,
  type MassExtinctionEvent,
} from "../../data/extinctions";
import { ConstellationField } from "../ui/constellation-field";
import { FloatingPaths } from "../ui/floating-paths";
import { ImageLightbox } from "../ui/image-lightbox";
import { OptimizedImage } from "../ui/optimized-image";

type ExtinctionDetailCardProps = {
  event: MassExtinctionEvent;
};

export function ExtinctionDetailCard({ event }: ExtinctionDetailCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousImageRef = useRef<ExtinctionImage>(event.image);
  const [previousImage, setPreviousImage] = useState<ExtinctionImage | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const title = formatExtinctionTitleRu(event.titleRu);

  useEffect(() => {
    const lastImage = previousImageRef.current;
    if (lastImage.src !== event.image.src) {
      setPreviousImage(lastImage);
      setIsLoaded(false);
    }
    previousImageRef.current = event.image;
  }, [event.image]);

  useEffect(() => {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, [event.id]);

  useEffect(() => {
    const image = imageRef.current;

    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [event.image.src]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPreviousImage(null);
    }, 560);

    return () => window.clearTimeout(timeout);
  }, [event.image.src, isLoaded]);

  return (
    <aside
      className="stage-panel extinction-detail-panel"
      data-tour-stop-id={`extinction-${event.id}`}
      style={{ "--extinction-color": event.color } as CSSProperties}
      aria-label="Активное событие"
      aria-live="polite"
    >
      <figure className="stage-plate">
        <div
          className="stage-plate-media"
          data-image-state={isLoaded ? "loaded" : "loading"}
        >
          <div className="stage-plate-backdrop" aria-hidden="true">
            <FloatingPaths className="stage-plate-paths" density="panel" />
            <ConstellationField className="stage-plate-constellation" compact />
          </div>
          <button
            type="button"
            className="stage-plate-zoom"
            onClick={() => setIsImageExpanded(true)}
            aria-label={`Увеличить изображение: ${title}`}
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
              key={event.image.src}
              ref={imageRef}
              pictureClassName="stage-plate-picture"
              className={
                isLoaded
                  ? "stage-plate-main stage-plate-current is-loaded"
                  : "stage-plate-main stage-plate-current"
              }
              src={event.image.src}
              alt={event.image.altRu}
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
        <figcaption>{event.image.creditRu}</figcaption>
      </figure>

      <div className="stage-copy extinction-detail-copy">
        <p className="kicker">{event.windowRu}</p>
        <h2 ref={headingRef} tabIndex={-1}>{title}</h2>
        <p className="latin">{event.lossPercentRu}</p>
        <p className="lead">{event.lossRu}</p>

        <div className="extinction-detail-box">
          <div className="box-title">
            <Waves aria-hidden="true" size={20} />
            <span>Что произошло</span>
          </div>
          <p>{event.snapshotRu}</p>
        </div>

        <div className="extinction-detail-box">
          <div className="box-title">
            <AlertTriangle aria-hidden="true" size={20} />
            <span>Главные факторы</span>
          </div>
          <ul>
            {event.likelyCausesRu.slice(0, 4).map((cause) => (
              <li key={cause}>{cause}</li>
            ))}
          </ul>
        </div>

        <div className="why-box extinction-relation-box">
          <Sparkles aria-hidden="true" size={18} />
          <p>{event.relationRu}</p>
        </div>

        <Link className="button button-secondary button-sm extinction-detail-link" to="/extinctions">
          Открыть раздел
          <ExternalLink aria-hidden="true" size={15} />
        </Link>
      </div>

      <ImageLightbox
        image={
          isImageExpanded
            ? {
                src: event.image.src,
                alt: event.image.altRu,
                caption: `${title}. ${event.image.altRu}`,
              }
            : null
        }
        ariaLabel="Увеличенное изображение вымирания"
        onClose={() => setIsImageExpanded(false)}
      />
    </aside>
  );
}
