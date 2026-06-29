import {
  ArrowRight,
  GitFork,
  Info,
  Layers3,
  MapPin,
  ScanSearch,
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ConfidenceBadge } from "../components/education/ConfidenceBadge";
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
  return (
    <div
      className="body-map-layer-tabs"
      role="tablist"
      aria-label="Слои карты признаков"
    >
      {layers.map((layer) => (
        <button
          key={layer.id}
          type="button"
          role="tab"
          aria-selected={layer.id === activeLayerId}
          className={layer.id === activeLayerId ? "is-active" : undefined}
          onClick={() => onChange(layer.id)}
        >
          <Layers3 aria-hidden="true" size={16} />
          <span>{layer.shortTitleRu}</span>
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
  return (
    <figure className="body-map-canvas" aria-labelledby="body-map-layer-title">
      <OptimizedImage
        src={layer.image.src}
        alt={layer.image.altRu}
        loading="eager"
        decoding="async"
      />
      <div className="body-map-pins" aria-label="Признаки на выбранном слое">
        {traits.map((trait) => {
          const stage = getTraitStage(trait);
          const isActive = trait.id === activeTrait.id;

          return (
            <button
              key={trait.id}
              type="button"
              className={isActive ? "body-trait-pin is-active" : "body-trait-pin"}
              style={pinStyle(trait)}
              aria-pressed={isActive}
              aria-label={`${trait.titleRu}: ${stage?.titleRu ?? trait.stageId}`}
              onClick={() => onSelectTrait(trait)}
            >
              <MapPin aria-hidden="true" size={18} />
              <span>{trait.titleRu}</span>
            </button>
          );
        })}
      </div>
    </figure>
  );
}

type BodyTraitInspectorProps = {
  layer: BodyTraitLayer;
  trait: BodyTrait;
  stage: EvolutionStage | undefined;
};

function BodyTraitInspector({
  layer,
  trait,
  stage,
}: BodyTraitInspectorProps) {
  return (
    <aside className="body-trait-inspector" aria-live="polite">
      <div className="body-trait-inspector-heading">
        <ScanSearch aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">{layer.titleRu}</p>
          <h2>{trait.titleRu}</h2>
        </div>
        <ConfidenceBadge level={trait.confidence} />
      </div>

      {stage ? (
        <div className="body-trait-stage">
          <span>Предковый узел</span>
          <strong>{stage.titleRu}</strong>
          <small>
            {stage.latin}, {formatAgeRu(stage.ageMa)}
          </small>
        </div>
      ) : null}

      <p className="body-trait-note">{trait.noteRu}</p>

      <div className="body-trait-source">
        <GitFork aria-hidden="true" size={18} />
        <div>
          <strong>Что именно отмечено</strong>
          <p>{trait.traitRu}</p>
        </div>
      </div>

      <div className="body-trait-caveat">
        <Info aria-hidden="true" size={18} />
        <p>
          “От предкового узла” означает ветвь и набор признаков, а не одну
          конкретную особь с паспортом предка.
        </p>
      </div>

      {stage ? (
        <Link className="button button-secondary button-md" to={atlasHrefFor(stage)}>
          Открыть этап в Атласе
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      ) : null}
    </aside>
  );
}

export function BodyMapPage() {
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
  function changeLayer(layerId: BodyTraitLayerId) {
    const nextTraits = getBodyTraitsByLayer(layerId);
    setActiveLayerId(layerId);
    setActiveTraitId(nextTraits[0]?.id ?? activeTraitId);
  }

  if (!activeLayer || !activeTrait) return null;

  return (
    <section
      className="document-page body-map-page"
      data-tour-stop-id="page-body-map"
    >
      <div className="document-header body-map-header">
        <p className="eyebrow">Карта признаков</p>
        <h1>Какие древние решения живут в нашем теле</h1>
        <p>
          Пять музейных слоев показывают, от каких предковых узлов наша линия
          получила клеточные механизмы, план тела, движение, органы чувств,
          мозг и социальное поведение.
        </p>
      </div>

      <BodyLayerTabs
        layers={BODY_TRAIT_LAYERS}
        activeLayerId={activeLayerId}
        onChange={changeLayer}
      />

      <div className="body-map-grid">
        <div className="body-map-main">
          <div className="body-map-layer-heading">
            <div>
              <p className="eyebrow">Активный слой</p>
              <h2 id="body-map-layer-title">{activeLayer.titleRu}</h2>
              <p>{activeLayer.descriptionRu}</p>
            </div>
            <span>{traitsForActiveLayer.length} признаков</span>
          </div>

          <BodyMapCanvas
            layer={activeLayer}
            traits={traitsForActiveLayer}
            activeTrait={activeTrait}
            onSelectTrait={(trait) => setActiveTraitId(trait.id)}
          />
        </div>

        <BodyTraitInspector
          layer={activeLayer}
          trait={activeTrait}
          stage={activeStage}
        />
      </div>
    </section>
  );
}
