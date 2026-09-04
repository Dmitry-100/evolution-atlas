// AfricaOriginMap shares the existing exhibit styles with the origin-of-life page.
import "../styles/pages/origin-of-life.css";
import { useMemo, useRef, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronDown, Dna, Globe2, Search } from "lucide-react";
import { AfricaOriginMap } from "../components/education/AfricaOriginMap";
import { GlossaryTermById } from "../components/education/GlossaryTerm";
import { MobileAtlas } from "../components/atlas/mobile/MobileAtlas";
import { PrimateAxis } from "../components/atlas/PrimateAxis";
import { StageDetailCard } from "../components/atlas/StageDetailCard";
import { ConstellationField } from "../components/ui/constellation-field";
import { FloatingPaths } from "../components/ui/floating-paths";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
import { PRIMATE_READING_GROUPS, getPrimateReadingGroup } from "../data/primateGroups";
import { getAccumulatedTraitGroups } from "../lib/accumulatedTraits";
import { getDefaultAtlasStage, parsePrimateUrlState, toStageSearchParams } from "../lib/atlasUrlState";
import { formatAgeRu } from "../lib/timeline";
import { useMediaQuery } from "../hooks/useMediaQuery";

function getStageIndex(stages: EvolutionStage[], stageId: string) {
  return Math.max(0, stages.findIndex((stage) => stage.id === stageId));
}

type PrimateNavigationOptions = {
  replace?: boolean;
};

const PRIMATE_BRANCH_STAGE_IDS = [
  "early-primates",
  "anthropoids",
  "early-apes",
  "hominins",
  "early-homo",
  "sapiens",
] as const;

function PrimateIntro({ mobile }: { mobile: boolean }) {
  return (
    <>
      <section className="atlas-hero">
        {!mobile ? <>
          <FloatingPaths className="atlas-hero-paths" />
          <ConstellationField className="atlas-hero-constellation" />
        </> : null}
        <div className="atlas-title">
          <h1>Эволюция человека: от ранних приматов до Homo sapiens</h1>
          <p className="hero-subtitle">66 млн лет истории нашей ветви. Людей и других приматов связывают общие предки.</p>
        </div>
      </section>

      <div className="primate-intro-tools">
        <details className="primate-context-note">
          <summary>
            <h2>Кто был общим предком человека и обезьян?</h2>
            <ChevronDown aria-hidden="true" size={17} />
          </summary>
          <p>
            Человек не произошел от современной обезьяны. Общие предки — это
            древние популяции. Например, линии людей и шимпанзе разошлись примерно
            7 млн лет назад; после разделения обе ветви эволюционировали независимо.
            Хронология показывает, где появляются{" "}
            <GlossaryTermById id="anthropoids">антропоиды</GlossaryTermById>,{" "}
            <GlossaryTermById id="apes">человекообразные</GlossaryTermById> и{" "}
            <GlossaryTermById id="hominins">гоминины</GlossaryTermById>.
          </p>
        </details>
        <nav className="primate-page-nav" aria-label="На этой странице">
          <a href="#primate-timeline">Шкала</a>
          <a href="#primate-branches">Развилки</a>
          <a href="#africa-origin-title">Африка</a>
        </nav>
      </div>
    </>
  );
}

export function PrimatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parsePrimateUrlState(searchParams), [searchParams]);
  const atlasRef = useRef<HTMLDivElement>(null);
  const isMobileAtlas = useMediaQuery("(max-width: 720px)");

  const visibleStages = primateStages;
  const visibleEras = useMemo(
    () => ERAS.filter((era) => visibleStages.some((stage) => stage.eraId === era.id)),
    [visibleStages],
  );
  const activeStage = visibleStages.find((stage) => stage.id === urlState.stageId) ?? getDefaultAtlasStage(visibleStages);
  const activeEra = ERAS.find((era) => era.id === activeStage.eraId);
  const accumulatedTraitGroups = useMemo(() => getAccumulatedTraitGroups(sortedStages, activeStage), [activeStage]);
  const activeIndex = getStageIndex(visibleStages, activeStage.id);
  const canStepPrevious = activeIndex > 0;
  const canStepNext = activeIndex < visibleStages.length - 1;
  const branchStages = useMemo(
    () =>
      PRIMATE_BRANCH_STAGE_IDS
        .map((stageId) => visibleStages.find((stage) => stage.id === stageId))
        .filter((stage): stage is EvolutionStage => Boolean(stage)),
    [visibleStages],
  );

  function activateStage(
    stage: EvolutionStage,
    options: PrimateNavigationOptions = {},
  ) {
    setSearchParams(toStageSearchParams(stage), {
      replace: options.replace ?? true,
    });
  }

  function moveActive(delta: number, options: PrimateNavigationOptions = {}) {
    const currentIndex = getStageIndex(visibleStages, activeStage.id);
    const nextIndex = Math.min(visibleStages.length - 1, Math.max(0, currentIndex + delta));
    activateStage(visibleStages[nextIndex], options);
  }

  const branchMilestones = (
    <section id="primate-branches" className="primate-branch-panel" aria-labelledby="primate-branch-title">
      <div className="primate-branch-panel-heading">
        <div>
          <p className="eyebrow">Развилки ветви</p>
          <h2 id="primate-branch-title">Этапы эволюции человека в хронологическом порядке</h2>
        </div>
        <span>{activeIndex + 1} из {visibleStages.length}</span>
      </div>
      <div className="primate-branch-milestones" aria-label="Этапы ветви приматов">
        {branchStages.map((stage) => {
          const group = getPrimateReadingGroup(stage);
          return (
            <button
              key={stage.id}
              type="button"
              className={`primate-branch-milestone${stage.id === activeStage.id ? " is-active" : ""}`}
              style={{ "--primate-group-color": group?.color } as CSSProperties}
              aria-current={stage.id === activeStage.id ? "true" : undefined}
              onClick={() => {
                activateStage(stage, { replace: false });
                if (isMobileAtlas) {
                  requestAnimationFrame(() => {
                    atlasRef.current?.querySelector(".mobile-stage-row.is-active")?.scrollIntoView({ block: "start" });
                  });
                }
              }}
            >
              <span className="primate-milestone-group">{group?.titleRu}</span>
              <span>{formatAgeRu(stage.ageMa)}</span>
              <strong>{stage.titleRu}</strong>
              <small>{stage.inherited.slice(0, 2).join(" · ")}</small>
            </button>
          );
        })}
      </div>
    </section>
  );

  if (isMobileAtlas) {
    return (
      <div
        className="atlas atlas-mobile-shell primates-page"
        data-tour-stop-id="page-primates"
        ref={atlasRef}
        tabIndex={0}
        style={{ "--active-era-color": activeEra?.color ?? "#d0a35b" } as CSSProperties}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveActive(1, { replace: false });
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveActive(-1, { replace: false });
          }
        }}
      >
        <p className="sr-only" aria-live="polite">
          Выбран этап {activeStage.titleRu}, {formatAgeRu(activeStage.ageMa)}
        </p>
        <MobileAtlas
          header={<PrimateIntro mobile />}
          afterMap={branchMilestones}
          timelineId="primate-timeline"
          groups={PRIMATE_READING_GROUPS}
          showSelectedAge
          showAfricaOriginMap
          showTraitAccumulator={false}
          stages={visibleStages}
          eras={visibleEras}
          activeStage={activeStage}
          activeIndex={activeIndex}
          canStepPrevious={canStepPrevious}
          canStepNext={canStepNext}
          accumulatedTraitGroups={accumulatedTraitGroups}
          onActivateStage={(stage) => activateStage(stage, { replace: false })}
          onStep={(delta) => moveActive(delta, { replace: false })}
        />
      </div>
    );
  }

  return (
    <div
      className="atlas primates-page"
      ref={atlasRef}
      tabIndex={0}
      style={{ "--active-era-color": activeEra?.color ?? "#d0a35b" } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveActive(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveActive(-1);
        }
      }}
    >
      <p className="sr-only" aria-live="polite">
        Выбран этап {activeStage.titleRu}, {formatAgeRu(activeStage.ageMa)}
      </p>

      <PrimateIntro mobile={false} />

      <section className="atlas-grid" data-tour-stop-id="page-primates">
        <div className="center-stage">
          <PrimateAxis
            stages={visibleStages}
            activeStage={activeStage}
            onActivate={activateStage}
            onStep={moveActive}
            canStepPrevious={canStepPrevious}
            canStepNext={canStepNext}
          />

          {branchMilestones}
        </div>

        <StageDetailCard stage={activeStage} />
      </section>

      <section className="theory-bridge-band">
        <div>
          <Globe2 aria-hidden="true" size={22} />
          <div>
            <strong>Африка и первые выходы</strong>
            <p>
              Карта ниже показывает ранние африканские находки Homo sapiens
              и основные направления расселения за пределы Африки.
            </p>
          </div>
        </div>
      </section>

      <AfricaOriginMap />

      <section className="theory-bridge-band">
        <div>
          <Dna aria-hidden="true" size={22} />
          <div>
            <strong>Как это видно в ДНК?</strong>
            <p>
              Хромосома 2, сравнение геномов и наследуемые молекулярные маркеры помогают проверить родство
              человекообразных линий независимо от формы костей.
            </p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/genetics">
          РНК/ДНК
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <section className="theory-bridge-band">
        <div>
          <Search aria-hidden="true" size={22} />
          <div>
            <strong>Соседние ветви</strong>
            <p>
              Кладограмма показывает, где от нашей ветви отходят долгопяты, мартышковые, гиббоны, орангутаны,
              гориллы, шимпанзе и ископаемые родственники.
            </p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/cladogram">
          Открыть дерево
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </div>
  );
}
