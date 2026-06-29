import { useMemo, useRef, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Dna, Globe2, Search, Star } from "lucide-react";
import { AfricaOriginMap } from "../components/education/AfricaOriginMap";
import { MobileAtlas } from "../components/atlas/mobile/MobileAtlas";
import { PrimateAxis } from "../components/atlas/PrimateAxis";
import { StageDetailCard } from "../components/atlas/StageDetailCard";
import { ConstellationField } from "../components/ui/constellation-field";
import { FloatingPaths } from "../components/ui/floating-paths";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
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

  if (isMobileAtlas) {
    return (
      <div
        className="atlas atlas-mobile-shell"
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
          eyebrow="Приматы → человек"
          title="Последние 66 млн лет крупно"
          description="Пройдите ветвь от ранних приматов к Homo sapiens и посмотрите карту ранних свидетельств и маршрутов расселения."
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

      <section className="atlas-hero">
        <FloatingPaths className="atlas-hero-paths" />
        <ConstellationField className="atlas-hero-constellation" />
        <div className="atlas-title">
          <h1>Приматы → человек</h1>
          <p className="hero-subtitle">Последние 66 млн лет крупно: от древесных приматов к Homo sapiens.</p>
          <p>
            Здесь собрана поздняя ветвь маршрута: антропоиды, человекообразные, гоминины, ранние Homo,
            соседние человеческие линии и раннее расселение нашего вида.
          </p>
        </div>
      </section>

      <section className="theory-bridge-band atlas-note-band">
        <div>
          <Star aria-hidden="true" size={22} />
          <div>
            <strong>Не лестница к человеку</strong>
            <p>
              Эта ось показывает молодую часть дерева родства. Современные обезьяны не являются нашими предками:
              мы делим с ними общих предков, а дальше ветви расходятся.
            </p>
          </div>
        </div>
      </section>

      <section className="atlas-grid">
        <div className="center-stage">
          <PrimateAxis
            stages={visibleStages}
            activeStage={activeStage}
            onActivate={activateStage}
            onStep={moveActive}
            canStepPrevious={canStepPrevious}
            canStepNext={canStepNext}
          />
        </div>

        <StageDetailCard stage={activeStage} />
      </section>

      <section className="theory-bridge-band">
        <div>
          <Globe2 aria-hidden="true" size={22} />
          <div>
            <strong>От находок к маршрутам</strong>
            <p>
              Карта ниже связывает ранние африканские свидетельства Homo sapiens с осторожными маршрутами
              расселения за пределы Африки.
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
