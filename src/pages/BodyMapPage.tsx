import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/body-map.css";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ConfidenceBadge } from "../components/education/ConfidenceBadge";
import { GlossaryTermById } from "../components/education/GlossaryTerm";
import { ImageLightbox } from "../components/ui/image-lightbox";
import { OptimizedImage } from "../components/ui/optimized-image";
import {
  BODY_TRAIT_LAYERS,
  BODY_TRAITS,
  getBodyTraitsByLayer,
  type BodyTrait,
  type BodyTraitLayer,
  type BodyTraitLayerId,
} from "../data/bodyTraits";
import { getStageById, type EvolutionStage } from "../data/lineage";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { lockBodyScroll } from "../lib/bodyScrollLock";
import { formatAgeRu } from "../lib/timeline";

function atlasHrefFor(stage: EvolutionStage) {
  const mode = stage.isPrimateFocus ? "primates" : "all";
  return `/?mode=${mode}&stage=${stage.slug}`;
}

function getTraitStage(trait: BodyTrait) {
  return getStageById(trait.stageId);
}

function pinStyle(trait: BodyTrait) {
  return {
    "--trait-x": `${trait.anchor.x}%`,
    "--trait-y": `${trait.anchor.y}%`,
  } as CSSProperties;
}

const traitNumber = (index: number) => String(index + 1).padStart(2, "0");

type BodyLayerTabsProps = {
  layers: BodyTraitLayer[];
  activeLayerId: BodyTraitLayerId;
  onChange: (layerId: BodyTraitLayerId) => void;
};

function BodyLayerTabs({
  layers,
  activeLayerId,
  onChange,
}: BodyLayerTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={tabsRef}
      className="body-map-layer-tabs"
      role="tablist"
      aria-label="Слои карты признаков"
    >
      {layers.map((layer, index) => (
        <button
          key={layer.id}
          id={`body-layer-tab-${layer.id}`}
          type="button"
          role="tab"
          aria-selected={layer.id === activeLayerId}
          aria-controls="body-layer-panel"
          tabIndex={layer.id === activeLayerId ? 0 : -1}
          className={layer.id === activeLayerId ? "is-active" : undefined}
          onClick={() => onChange(layer.id)}
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % layers.length
                : event.key === "ArrowLeft"
                  ? (index + layers.length - 1) % layers.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? layers.length - 1
                      : null;
            if (next === null) return;
            event.preventDefault();
            onChange(layers[next].id);
            const tab =
              tabsRef.current?.querySelectorAll<HTMLButtonElement>(
                '[role="tab"]',
              )[next];
            tab?.focus({ preventScroll: true });
            if (tab && tabsRef.current) {
              tabsRef.current.scrollLeft = tab.offsetLeft - 8;
            }
          }}
        >
          {layer.shortTitleRu}
        </button>
      ))}
    </div>
  );
}

type BodyMapCanvasProps = {
  layer: BodyTraitLayer;
  traits: BodyTrait[];
  activeTrait: BodyTrait;
  onSelectTrait: (trait: BodyTrait) => void;
};

function BodyMapCanvas({
  layer,
  traits,
  activeTrait,
  onSelectTrait,
}: BodyMapCanvasProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeIndex = traits.findIndex((trait) => trait.id === activeTrait.id);
  return (
    <>
      <figure
        className="body-map-figure"
        aria-labelledby="body-map-layer-title"
      >
        <div className="body-map-canvas">
          <button
            type="button"
            className="body-map-image-zoom"
            aria-label={`Увеличить карту: ${layer.titleRu}`}
            aria-haspopup="dialog"
            onClick={() => setIsExpanded(true)}
          >
            <OptimizedImage
              src={layer.image.src}
              alt={layer.image.altRu}
              width={1122}
              height={1402}
              loading="eager"
              decoding="async"
            />
          </button>
          <div
            className="body-map-pins"
            aria-label="Признаки на выбранном слое"
          >
            {traits.map((trait, index) => {
              const stage = getTraitStage(trait);
              const isActive = trait.id === activeTrait.id;
              return (
                <button
                  key={trait.id}
                  type="button"
                  className={
                    isActive ? "body-trait-pin is-active" : "body-trait-pin"
                  }
                  style={pinStyle(trait)}
                  aria-pressed={isActive}
                  aria-label={`${trait.titleRu}: ${stage?.titleRu ?? trait.stageId}`}
                  onClick={() => onSelectTrait(trait)}
                >
                  <span>{traitNumber(index)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <figcaption>
          <button
            type="button"
            className="body-map-selected"
            onClick={() => onSelectTrait(activeTrait)}
            aria-label={`Подробнее о признаке: ${activeTrait.titleRu}`}
          >
            <span className="body-trait-number" aria-hidden="true">
              {traitNumber(activeIndex)}
            </span>
            <span>
              <small>Выбранный признак</small>
              <strong>{activeTrait.titleRu}</strong>
            </span>
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </figcaption>
      </figure>
      <ImageLightbox
        image={
          isExpanded
            ? {
                src: layer.image.src,
                alt: layer.image.altRu,
                caption: layer.titleRu,
              }
            : null
        }
        ariaLabel="Карта признаков крупно"
        onClose={() => setIsExpanded(false)}
      />
    </>
  );
}

type BodyTraitInspectorProps = {
  layer: BodyTraitLayer;
  trait: BodyTrait;
  stage: EvolutionStage | undefined;
  number: string;
  lightboxContainer?: RefObject<HTMLDialogElement | null>;
};

function BodyTraitInspector({
  layer,
  trait,
  stage,
  number,
  lightboxContainer,
}: BodyTraitInspectorProps) {
  const inspectorRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    if (inspectorRef.current) inspectorRef.current.scrollTop = 0;
  }, [trait.id]);

  return (
    <aside
      ref={inspectorRef}
      className="body-trait-inspector"
      aria-label="Выбранный признак"
    >
      <div className="body-trait-inspector-heading">
        <p className="eyebrow">
          {number} · {layer.titleRu}
        </p>
        <h2 id="body-trait-title">{trait.titleRu}</h2>
        <ConfidenceBadge level={trait.confidence} />
      </div>
      <p className="body-trait-note">{trait.noteRu}</p>
      {trait.traitRu.toLocaleLowerCase("ru") !==
      trait.titleRu.toLocaleLowerCase("ru") ? (
        <p className="body-trait-inherited">
          Наследуемый признак: {trait.traitRu}
        </p>
      ) : null}
      {stage ? (
        <>
          <div className="body-trait-stage">
            <div className="body-trait-stage-copy">
              <span>Предковый узел</span>
              <strong>{stage.titleRu}</strong>
              <small>{formatAgeRu(stage.ageMa)}</small>
              <p className="body-trait-latin">{stage.latin}</p>
            </div>
            <Link
              className="button button-secondary button-md"
              to={atlasHrefFor(stage)}
            >
              Открыть этап в Атласе
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <figure className="body-trait-stage-media">
              <button
                type="button"
                className="body-map-image-zoom"
                aria-label={`Увеличить изображение: ${stage.titleRu}`}
                aria-haspopup="dialog"
                onClick={() => setIsExpanded(true)}
              >
                <OptimizedImage
                  src={stage.image.src}
                  alt={stage.image.altRu}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              {stage.image.kind === "generated-reconstruction" ? (
                <figcaption>AI-реконструкция</figcaption>
              ) : null}
            </figure>
          </div>
          <ImageLightbox
            image={
              isExpanded
                ? {
                    src: stage.image.src,
                    alt: stage.image.altRu,
                    caption: `${stage.titleRu}. ${stage.image.altRu}`,
                  }
                : null
            }
            ariaLabel="Изображение предкового узла крупно"
            portalTarget={lightboxContainer?.current}
            onClose={() => setIsExpanded(false)}
          />
        </>
      ) : null}
    </aside>
  );
}

function BodyTraitDialog({
  onClose,
  ...props
}: BodyTraitInspectorProps & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const unlockScroll = lockBodyScroll();
    dialog?.showModal();
    returnRef.current?.focus({ preventScroll: true });
    return () => {
      dialog?.close();
      unlockScroll();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialogRef}
      className="body-trait-dialog"
      aria-labelledby="body-trait-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="body-trait-dialog-toolbar">
        <button
          ref={returnRef}
          type="button"
          className="button button-secondary button-md"
          onClick={onClose}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Вернуться к карте
        </button>
      </div>
      <BodyTraitInspector {...props} lightboxContainer={dialogRef} />
    </dialog>,
    document.body,
  );
}

export function BodyMapPage() {
  const pageRef = useRef<HTMLElement>(null);
  const isCompact = useMediaQuery("(max-width: 959px)");
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeLayerId, setActiveLayerId] =
    useState<BodyTraitLayerId>("cells-energy");
  const traitsForActiveLayer = useMemo(
    () => getBodyTraitsByLayer(activeLayerId),
    [activeLayerId],
  );
  const activeLayer =
    BODY_TRAIT_LAYERS.find((layer) => layer.id === activeLayerId) ??
    BODY_TRAIT_LAYERS[0];
  const [activeTraitId, setActiveTraitId] = useState(
    traitsForActiveLayer[0]?.id ?? BODY_TRAITS[0]?.id,
  );
  const activeTrait =
    traitsForActiveLayer.find((trait) => trait.id === activeTraitId) ??
    traitsForActiveLayer[0] ??
    BODY_TRAITS[0];
  const activeStage = activeTrait ? getTraitStage(activeTrait) : undefined;

  useEffect(() => {
    const header = document.querySelector(".topbar");
    const page = pageRef.current;
    if (!header || !page) return;
    const update = () =>
      page.style.setProperty(
        "--body-map-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  function changeLayer(layerId: BodyTraitLayerId) {
    setActiveLayerId(layerId);
    setActiveTraitId(getBodyTraitsByLayer(layerId)[0]?.id ?? activeTraitId);
    setIsInspectorOpen(false);
  }
  function selectTrait(trait: BodyTrait) {
    setActiveTraitId(trait.id);
    setIsInspectorOpen(true);
  }
  if (!activeLayer || !activeTrait) return null;
  const number = traitNumber(
    traitsForActiveLayer.findIndex((trait) => trait.id === activeTrait.id),
  );
  const inspectorProps = {
    layer: activeLayer,
    trait: activeTrait,
    stage: activeStage,
    number,
  };

  return (
    <section
      ref={pageRef}
      className="document-page body-map-page"
      data-tour-stop-id="page-body-map"
    >
      <PageHeader
        eyebrow="Карта признаков"
        title="Какие древние решения живут в нашем теле"
      >
        Пять слоёв показывают, от каких предковых узлов наша линия унаследовала
        клеточные механизмы, план тела, движение, чувства, мозг и поведение.
      </PageHeader>
      <BodyLayerTabs
        layers={BODY_TRAIT_LAYERS}
        activeLayerId={activeLayerId}
        onChange={changeLayer}
      />
      <div
        id="body-layer-panel"
        role="tabpanel"
        aria-labelledby={`body-layer-tab-${activeLayerId}`}
        className="body-map-grid"
      >
        <div className="body-map-main">
          <div className="body-map-layer-heading">
            <h2 id="body-map-layer-title">{activeLayer.titleRu}</h2>
            <span>{traitsForActiveLayer.length} признаков</span>
            <p>{activeLayer.descriptionRu}</p>
          </div>
          <BodyMapCanvas
            key={activeLayerId}
            layer={activeLayer}
            traits={traitsForActiveLayer}
            activeTrait={activeTrait}
            onSelectTrait={selectTrait}
          />
          <ol
            className="body-trait-list"
            aria-label="Список признаков выбранного слоя"
          >
            {traitsForActiveLayer.map((trait, index) => (
              <li key={trait.id}>
                <button
                  type="button"
                  aria-pressed={trait.id === activeTrait.id}
                  onClick={() => selectTrait(trait)}
                >
                  <span className="body-trait-number">
                    {traitNumber(index)}
                  </span>
                  <span>{trait.titleRu}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </div>
        {isCompact ? (
          isInspectorOpen ? (
            <BodyTraitDialog
              {...inspectorProps}
              onClose={() => setIsInspectorOpen(false)}
            />
          ) : null
        ) : (
          <BodyTraitInspector {...inspectorProps} />
        )}
      </div>
      <div className="body-trait-caveat">
        <Info aria-hidden="true" size={18} />
        <p>
          Термин{" "}
          <GlossaryTermById id="ancestral-node">
            предковый узел
          </GlossaryTermById>{" "}
          означает ветвь и набор признаков, а не одну конкретную особь с
          паспортом предка.
        </p>
      </div>
    </section>
  );
}
