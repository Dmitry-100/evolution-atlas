import {
  ArrowRight,
  Fingerprint,
  GitFork,
  Maximize2,
  Milestone,
  ScanSearch,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CladogramPanel,
  type CladogramBranchMode,
} from "../components/atlas/CladogramPanel";
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { ImageLightbox } from "../components/ui/image-lightbox";
import { OptimizedImage } from "../components/ui/optimized-image";
import { TooltipProvider } from "../components/ui/tooltip";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";
import { sortedStages, type EvolutionStage } from "../data/lineage";
import { buildCladogram, type CladogramBranch } from "../lib/cladogram";
import { getStageHref } from "../lib/atlasUrlState";
import { formatAgeRu } from "../lib/timeline";

function getStageFromParams(stageSlug: string | null) {
  return (
    sortedStages.find(
      (stage) => stage.slug === stageSlug || stage.id === stageSlug,
    ) ??
    sortedStages.at(-1) ??
    sortedStages[0]
  );
}

type CladogramInspectorProps = {
  stage: EvolutionStage;
  branch: CladogramBranch | null;
  onSelectStage: (stage: EvolutionStage) => void;
};

function CladogramInspector({
  stage,
  branch,
  onSelectStage,
}: CladogramInspectorProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const inspectorImage = branch?.image ?? stage.image;
  const inspectorTitle = branch?.titleRu ?? stage.titleRu;
  const lightboxLabel = branch
    ? "Увеличенное изображение ветви"
    : "Увеличенное изображение узла";

  if (branch) {
    return (
      <aside
        className="cladogram-inspector"
        aria-label="Выбранная ветвь дерева"
      >
        <figure className="cladogram-inspector-media">
          <button
            type="button"
            className="cladogram-inspector-image-zoom"
            onClick={() => setIsImageExpanded(true)}
            aria-label={`Увеличить изображение: ${branch.titleRu}`}
          >
            <OptimizedImage
              src={branch.image.src}
              alt={branch.image.altRu}
              loading="eager"
              decoding="async"
            />
            <span className="stage-plate-zoom-indicator">
              <Maximize2 aria-hidden="true" size={15} />
              Увеличить
            </span>
          </button>
        </figure>

        <div className="cladogram-inspector-marker">
          <Milestone aria-hidden="true" size={22} />
          <span>
            {branch.isLivingComparison ? "общий предок с нами" : "общий предок"}
          </span>
        </div>
        <p className="kicker">
          ветвь: <strong>{branch.titleRu}</strong>
        </p>
        <h2>{branch.titleRu}</h2>
        {branch.latin ? <p className="latin">{branch.latin}</p> : null}
        <p className="lead">{branch.descriptionRu}</p>

        <div className="cladogram-inspector-note">
          <span>Наш общий предок</span>
          <strong>{branch.commonAncestor.titleRu}</strong>
          <small>{formatAgeRu(branch.commonAncestor.ageMa)}</small>
          <p>{branch.commonAncestor.relationRu}</p>
        </div>

        <div
          className="cladogram-inspector-split"
          aria-label="Две ветви после общего предка"
        >
          <span>
            <strong>Наша ветвь</strong>
            <small>{branch.commonAncestor.titleRu} → Homo sapiens</small>
          </span>
          <span>
            <strong>Их ветвь</strong>
            <small>
              {branch.commonAncestor.titleRu} → {branch.titleRu}
            </small>
          </span>
        </div>

        {branch.isLivingComparison ? (
          <p className="cladogram-inspector-relationship">
            Это не предок человека, а современная соседняя ветвь.
          </p>
        ) : null}

        <div className="cladogram-inspector-actions">
          {branch.stage ? (
            <Link
              className="button button-secondary button-md"
              to={getStageHref(branch.stage)}
            >
              Открыть в Атласе
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          ) : (
            <button
              type="button"
              className="button button-secondary button-md"
              onClick={() => onSelectStage(branch.parent)}
            >
              Показать узел-родитель
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          )}
        </div>
        <ImageLightbox
          image={
            isImageExpanded
              ? {
                  src: inspectorImage.src,
                  alt: inspectorImage.altRu,
                  caption: `${inspectorTitle}. ${inspectorImage.altRu}`,
                }
              : null
          }
          ariaLabel={lightboxLabel}
          onClose={() => setIsImageExpanded(false)}
        />
      </aside>
    );
  }

  return (
    <aside className="cladogram-inspector" aria-label="Выбранный узел дерева">
      <figure className="cladogram-inspector-media">
        <button
          type="button"
          className="cladogram-inspector-image-zoom"
          onClick={() => setIsImageExpanded(true)}
          aria-label={`Увеличить изображение: ${stage.titleRu}`}
        >
          <OptimizedImage
            src={stage.image.src}
            alt={stage.image.altRu}
            loading="eager"
            decoding="async"
          />
          <span className="stage-plate-zoom-indicator">
            <Maximize2 aria-hidden="true" size={15} />
            Увеличить
          </span>
        </button>
        {stage.image.kind === "generated-reconstruction" ? (
          <figcaption>AI-реконструкция</figcaption>
        ) : null}
      </figure>

      <div className="cladogram-inspector-copy">
        <p className="kicker">{formatAgeRu(stage.ageMa)}</p>
        <h2>{stage.titleRu}</h2>
        <p className="latin">{stage.latin}</p>
        <p className="lead">{stage.summaryRu}</p>

        <div className="cladogram-inspector-traits">
          <Fingerprint aria-hidden="true" size={18} />
          <div>
            <strong>Карта признаков</strong>
            <ul>
              {stage.inherited.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link
              className="button button-secondary button-sm trait-map-link"
              to="/body-map"
            >
              <ScanSearch aria-hidden="true" size={15} />
              Карта признаков
            </Link>
          </div>
        </div>

        <div className="cladogram-inspector-actions">
          <Link
            className="button button-secondary button-md"
            to={getStageHref(stage)}
          >
            Открыть в Атласе
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
      <ImageLightbox
        image={
          isImageExpanded
            ? {
                src: inspectorImage.src,
                alt: inspectorImage.altRu,
                caption: `${inspectorTitle}. ${inspectorImage.altRu}`,
              }
            : null
        }
        ariaLabel={lightboxLabel}
        onClose={() => setIsImageExpanded(false)}
      />
    </aside>
  );
}

export function CladogramPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeBranch, setActiveBranch] = useState<CladogramBranch | null>(
    null,
  );
  const [branchMode, setBranchMode] = useState<CladogramBranchMode>("all");
  const tree = useMemo(() => buildCladogram(sortedStages), []);
  const activeStage = getStageFromParams(searchParams.get("stage"));

  function activateStage(stage: EvolutionStage) {
    setActiveBranch(null);
    setSearchParams({ stage: stage.slug }, { replace: true });
  }

  function changeBranchMode(mode: CladogramBranchMode) {
    setBranchMode(mode);

    if (mode === "all") {
      return;
    }

    if (activeBranch && !activeBranch.isLivingComparison) {
      setActiveBranch(null);
    }

    const activeStageIsVisible =
      tree.trunk.some((stage) => stage.id === activeStage.id) ||
      tree.livingBranches.some((branch) => branch.stage?.id === activeStage.id);

    if (!activeStageIsVisible) {
      const sapiens = tree.trunk.at(-1);
      if (sapiens) {
        activateStage(sapiens);
      }
    }
  }

  if (!activeStage) return null;

  return (
    <TooltipProvider delayDuration={160}>
      <section
        className="document-page cladogram-page"
        data-tour-stop-id="page-cladogram"
      >
        <div className="document-header">
          <p className="eyebrow">Кладограмма</p>
          <h1>Дерево родства</h1>
          <p>
            Кладограмма показывает родство без временной шкалы: где находится
            ветвь Homo sapiens и от каких узлов отходят современные и
            ископаемые родственники.
          </p>
        </div>

        <div className="cladogram-page-grid">
          <CladogramPanel
            tree={tree}
            activeStage={activeStage}
            activeBranch={activeBranch}
            branchMode={branchMode}
            onChangeBranchMode={changeBranchMode}
            onActivate={activateStage}
            onInspectBranch={setActiveBranch}
          />
          <CladogramInspector
            stage={activeStage}
            branch={activeBranch}
            onSelectStage={activateStage}
          />
        </div>

        <CuriosityFacts
          factIds={CURIOSITY_FACT_PAGE_GROUPS.cladogram}
          eyebrow="Странные родственники"
          title="Старые детали получают новые роли"
          description="Дерево родства интересно тем, что крупные изменения часто собираются из уже существующих структур."
          headingId="cladogram-curiosity-facts"
        />

        <div className="theory-bridge-band">
          <div>
            <GitFork aria-hidden="true" size={22} />
            <div>
              <strong>Как читать дерево</strong>
              <p>
                Сначала найдите выбранную ветвь, затем смотрите на подписи
                “общий предок с нами”: они показывают, от какого узла
                расходятся родственные линии.
              </p>
            </div>
          </div>
          <Link className="button button-secondary button-md" to="/">
            Вернуться в Атлас
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </TooltipProvider>
  );
}
