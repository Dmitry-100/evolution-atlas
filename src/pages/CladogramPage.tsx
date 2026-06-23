import {
  ArrowRight,
  Fingerprint,
  GitFork,
  Milestone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CladogramPanel } from "../components/atlas/CladogramPanel";
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { OptimizedImage } from "../components/ui/optimized-image";
import { TooltipProvider } from "../components/ui/tooltip";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";
import { sortedStages, type EvolutionStage } from "../data/lineage";
import { buildCladogram, type CladogramBranch } from "../lib/cladogram";
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
  if (branch && !branch.stage) {
    return (
      <aside
        className="cladogram-inspector"
        aria-label="Выбранная ветвь дерева"
      >
        <figure className="cladogram-inspector-media">
          <OptimizedImage
            src={branch.image.src}
            alt={branch.image.altRu}
            loading="eager"
            decoding="async"
          />
        </figure>

        <div className="cladogram-inspector-marker">
          <Milestone aria-hidden="true" size={22} />
          <span>общий предок</span>
        </div>
        <p className="kicker">
          от узла: <strong>{branch.parent.titleRu}</strong>
        </p>
        <h2>{branch.titleRu}</h2>
        {branch.latin ? <p className="latin">{branch.latin}</p> : null}
        <p className="lead">{branch.descriptionRu}</p>

        <div className="cladogram-inspector-note">
          <span>Точка развилки</span>
          <strong>{branch.parent.titleRu}</strong>
          <small>{formatAgeRu(branch.parent.ageMa)}</small>
        </div>

        <div className="cladogram-inspector-actions">
          <button
            type="button"
            className="button button-secondary button-md"
            onClick={() => onSelectStage(branch.parent)}
          >
            Показать узел-родитель
            <ArrowRight aria-hidden="true" size={16} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="cladogram-inspector" aria-label="Выбранный узел дерева">
      <figure className="cladogram-inspector-media">
        <OptimizedImage
          src={stage.image.src}
          alt={stage.image.altRu}
          loading="eager"
          decoding="async"
        />
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
            <strong>Что дошло до нас</strong>
            <ul>
              {stage.inherited.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="cladogram-inspector-actions">
          <Link
            className="button button-secondary button-md"
            to={`/?mode=all&stage=${stage.slug}`}
          >
            Открыть в Атласе
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function CladogramPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeBranch, setActiveBranch] = useState<CladogramBranch | null>(
    null,
  );
  const tree = useMemo(() => buildCladogram(sortedStages), []);
  const activeStage = getStageFromParams(searchParams.get("stage"));

  function activateStage(stage: EvolutionStage) {
    setActiveBranch(null);
    setSearchParams({ stage: stage.slug }, { replace: true });
  }

  if (!activeStage) return null;

  return (
    <TooltipProvider delayDuration={160}>
      <section className="document-page cladogram-page">
        <div className="document-header">
          <p className="eyebrow">Кладограмма</p>
          <h1>Дерево родства</h1>
          <p>
            Это отдельный взгляд на тот же материал: не линия времени, а
            ветвящееся родство. Выбранный маршрут показывает ветвь, на которой
            находится Homo sapiens, а боковые линии показывают, от каких общих
            предков расходились родственники.
          </p>
        </div>

        <div className="cladogram-page-grid">
          <CladogramPanel
            tree={tree}
            activeStage={activeStage}
            activeBranch={activeBranch}
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
          eyebrow="Неожиданные переходы"
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
                “общий предок”: они показывают, от какого узла расходятся
                родственные линии.
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
