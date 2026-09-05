import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/cladogram.css";
import {
  ArrowRight,
  Fingerprint,
  GitFork,
  ArrowLeft,
  ScanSearch,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
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
import { TREE_OF_LIFE_POSTER } from "../data/treeOfLifePoster";
import { buildCladogram, type CladogramBranch } from "../lib/cladogram";
import { getStageHref } from "../lib/atlasUrlState";
import { formatAgeRu } from "../lib/timeline";
import { lockBodyScroll } from "../lib/bodyScrollLock";

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
  lightboxContainer?: RefObject<HTMLDialogElement | null>;
};

function CladogramInspector({
  stage,
  branch,
  onSelectStage,
  lightboxContainer,
}: CladogramInspectorProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const inspectorRef = useRef<HTMLElement>(null);
  const inspectorImage = branch?.image ?? stage.image;
  const inspectorTitle = branch?.titleRu ?? stage.titleRu;
  const latin = branch ? branch.latin : stage.latin;

  useEffect(() => {
    // Each selection starts with its title and photograph, even if the previous
    // card was scrolled to its last paragraph.
    if (inspectorRef.current) inspectorRef.current.scrollTop = 0;
  }, [stage.id, branch?.id]);

  return (
    <aside
      ref={inspectorRef}
      className="cladogram-inspector"
      aria-label={branch ? "Выбранная ветвь дерева" : "Выбранный узел дерева"}
    >
      <div className="cladogram-inspector-copy">
        <p className="eyebrow">{branch ? "Соседняя ветвь" : "Узел дерева"}</p>
        <h2 id="cladogram-inspector-title">{inspectorTitle}</h2>
        {latin ? <p className="latin">{latin}</p> : null}
        <p className="cladogram-inspector-age">
          {branch ? "Разделение ветвей: " : ""}
          {formatAgeRu(branch?.commonAncestor.ageMa ?? stage.ageMa)}
        </p>
        <p className="lead">{branch?.descriptionRu ?? stage.summaryRu}</p>
      </div>
      <figure className="cladogram-inspector-media">
        <button
          type="button"
          className="cladogram-inspector-image-zoom"
          onClick={() => setIsImageExpanded(true)}
          aria-haspopup="dialog"
          aria-label={`Увеличить изображение: ${inspectorTitle}`}
        >
          <OptimizedImage
            src={inspectorImage.src}
            alt={inspectorImage.altRu}
            loading="eager"
            decoding="async"
          />
        </button>
        {inspectorImage.kind === "generated-reconstruction" ? (
          <figcaption>AI-реконструкция</figcaption>
        ) : null}
      </figure>
      <div className="cladogram-inspector-copy">
        {branch ? (
          <>
            <div className="cladogram-inspector-note">
              <h3>
                {branch.isLivingComparison
                  ? "Общий предок с нами"
                  : "Наш общий предок"}
              </h3>
              <strong>{branch.commonAncestor.titleRu}</strong>
              <p>{branch.commonAncestor.relationRu}</p>
            </div>
            <div
              className="cladogram-inspector-split"
              aria-label="Две ветви после общего предка"
            >
              <div>
                <h3>Наша ветвь</h3>
                <p>От {branch.commonAncestor.titleRu} к Homo sapiens</p>
              </div>
              <div>
                <h3>Их ветвь</h3>
                <p>
                  От {branch.commonAncestor.titleRu} к {branch.titleRu}
                </p>
              </div>
            </div>
            {branch.isLivingComparison ? (
              <p className="cladogram-inspector-relationship">
                Это не предок человека, а современная соседняя ветвь.
              </p>
            ) : null}
          </>
        ) : (
          <div className="cladogram-inspector-traits">
            <Fingerprint aria-hidden="true" size={18} />
            <div>
              <h3>Карта признаков</h3>
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
        )}
        <div className="cladogram-inspector-actions">
          {branch && !branch.stage ? (
            <button
              type="button"
              className="button button-secondary button-md"
              onClick={() => onSelectStage(branch.parent)}
            >
              Показать узел-родитель
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          ) : (
            <Link
              className="button button-secondary button-md"
              to={getStageHref(branch?.stage ?? stage)}
            >
              Открыть в Атласе
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          )}
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
        ariaLabel={
          branch
            ? "Увеличенное изображение ветви"
            : "Увеличенное изображение узла"
        }
        portalTarget={lightboxContainer?.current}
        onClose={() => setIsImageExpanded(false)}
      />
    </aside>
  );
}

function CladogramDetailsDialog({
  onClose,
  ...props
}: CladogramInspectorProps & { onClose: () => void }) {
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
      className="cladogram-mobile-panel"
      aria-labelledby="cladogram-inspector-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="cladogram-mobile-toolbar">
        <button
          ref={returnRef}
          className="button button-secondary button-md"
          type="button"
          onClick={onClose}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Вернуться к дереву
        </button>
      </div>
      <CladogramInspector {...props} lightboxContainer={dialogRef} />
    </dialog>,
    document.body,
  );
}

export function CladogramPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageRef = useRef<HTMLElement>(null);
  const isCompact = useMediaQuery("(max-width: 959px)");
  const [inspectorOpen, setInspectorOpen] = useState(() =>
    searchParams.has("stage"),
  );
  const [activeBranch, setActiveBranch] = useState<CladogramBranch | null>(
    null,
  );
  const [branchMode, setBranchMode] = useState<CladogramBranchMode>("all");
  const [isPosterExpanded, setIsPosterExpanded] = useState(false);
  const tree = useMemo(() => buildCladogram(sortedStages), []);
  const activeStage = getStageFromParams(searchParams.get("stage"));

  useEffect(() => {
    const header = document.querySelector(".topbar");
    const page = pageRef.current;
    if (!header || !page) return;
    const update = () =>
      page.style.setProperty(
        "--cladogram-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  function inspectStage(stage: EvolutionStage) {
    activateStage(stage);
    setInspectorOpen(true);
  }

  function inspectBranch(branch: CladogramBranch) {
    setActiveBranch(branch);
    setInspectorOpen(true);
  }

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
        ref={pageRef}
        className="document-page cladogram-page"
        data-tour-stop-id="page-cladogram"
      >
        <PageHeader eyebrow="Кладограмма" title="Дерево родства">
          Homo sapiens находится на выделенной ветви. Кладограмма показывает,
          где расходятся современные и ископаемые родственники; расстояние между
          узлами не отражает время.
        </PageHeader>

        <div className="cladogram-page-grid">
          <CladogramPanel
            tree={tree}
            activeStage={activeStage}
            activeBranch={activeBranch}
            branchMode={branchMode}
            onChangeBranchMode={changeBranchMode}
            onActivate={inspectStage}
            onInspectBranch={inspectBranch}
          />
          {isCompact ? (
            inspectorOpen ? (
              <CladogramDetailsDialog
                stage={activeStage}
                branch={activeBranch}
                onSelectStage={activateStage}
                onClose={() => setInspectorOpen(false)}
              />
            ) : null
          ) : (
            <CladogramInspector
              stage={activeStage}
              branch={activeBranch}
              onSelectStage={activateStage}
            />
          )}
        </div>

        <figure
          className="tree-of-life-poster is-compact"
          aria-labelledby="tree-of-life-poster-title"
        >
          <button
            type="button"
            className="tree-of-life-poster-media"
            onClick={() => setIsPosterExpanded(true)}
            aria-label="Рассмотреть постер дерева жизни крупно"
          >
            <OptimizedImage
              src={TREE_OF_LIFE_POSTER.src}
              alt={TREE_OF_LIFE_POSTER.altRu}
              loading="lazy"
              decoding="async"
            />
          </button>
          <figcaption>
            <span className="eyebrow">Плакат</span>
            <strong id="tree-of-life-poster-title">
              Обзорная карта дерева жизни
            </strong>
            <p>
              Большая схема помогает увидеть всю развилку: ветвь человека идет
              через синапсид и млекопитающих, а ветвь птиц отделяется от амниот
              в диапсидную сторону.
            </p>
          </figcaption>
        </figure>

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
                “общий предок с нами”: они показывают, от какого узла расходятся
                родственные линии.
              </p>
            </div>
          </div>
          <Link className="button button-secondary button-md" to="/">
            Вернуться в Атлас
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <ImageLightbox
          image={
            isPosterExpanded
              ? {
                  src: TREE_OF_LIFE_POSTER.src,
                  alt: TREE_OF_LIFE_POSTER.altRu,
                  caption:
                    "Обзорная карта дерева жизни: человек и птицы показаны как разные ветви от ранних амниот.",
                }
              : null
          }
          ariaLabel="Постер дерева жизни крупно"
          displayMode="natural"
          onClose={() => setIsPosterExpanded(false)}
        />
      </section>
    </TooltipProvider>
  );
}
