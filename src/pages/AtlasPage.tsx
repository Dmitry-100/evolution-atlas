import { Suspense, lazy, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Dna,
  Fingerprint,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { MASS_EXTINCTIONS } from "../data/extinctions";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
import { formatAgeRu } from "../lib/timeline";
import { ConstellationField } from "../components/ui/constellation-field";
import { FloatingPaths } from "../components/ui/floating-paths";
import { EraNavigation } from "../components/atlas/EraNavigation";
import { ExtinctionDetailCard } from "../components/atlas/ExtinctionDetailCard";
import { StageDetailCard } from "../components/atlas/StageDetailCard";
import {
  getDefaultAtlasStage,
  parseAtlasUrlState,
  parsePrimateUrlState,
  toAtlasSearchParams,
  toStageSearchParams,
} from "../lib/atlasUrlState";
import { getAccumulatedTraitGroups } from "../lib/accumulatedTraits";
import {
  buildTimelineItems,
  getNearestStageForTimelineItem,
  toStageTimelineItem,
  type TimelineItem,
} from "../lib/timelineItems";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MobileAtlas } from "../components/atlas/mobile/MobileAtlas";
import { DARWIN_TOUR_MENU_EVENT } from "../components/tour/DarwinWelcome";

const LIFE_ORIGIN_MA = 4000;
const PRIMATES_MA = 66;
const DeepTimeAxis = lazy(() =>
  import("../components/atlas/DeepTimeAxis").then(({ DeepTimeAxis }) => ({
    default: DeepTimeAxis,
  })),
);
const TraitAccumulator = lazy(() =>
  import("../components/atlas/TraitAccumulator").then(({ TraitAccumulator }) => ({
    default: TraitAccumulator,
  })),
);

function percentRu(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("ru-RU", { maximumFractionDigits });
}

function elapsedShare(ageMa: number) {
  return Math.max(0, Math.min(1, (LIFE_ORIGIN_MA - ageMa) / LIFE_ORIGIN_MA));
}

function shareToClock(share: number) {
  const totalMinutes = Math.round(share * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getStageIndex(stages: EvolutionStage[], stageId: string) {
  return Math.max(0, stages.findIndex((stage) => stage.id === stageId));
}

type AtlasNavigationOptions = {
  replace?: boolean;
};

function toAtlasEventSearchParams(eventId: string) {
  const params = new URLSearchParams();
  params.set("mode", "all");
  params.set("event", eventId);
  return params;
}

export function AtlasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlState = useMemo(() => parseAtlasUrlState(searchParams), [searchParams]);
  const atlasRef = useRef<HTMLDivElement>(null);
  const isMobileAtlas = useMediaQuery("(max-width: 640px)");

  const visibleStages = sortedStages;
  const visibleEras = useMemo(
    () => ERAS.filter((era) => visibleStages.some((stage) => stage.eraId === era.id)),
    [visibleStages],
  );
  const timelineItems = useMemo(
    () => buildTimelineItems(visibleStages, MASS_EXTINCTIONS),
    [visibleStages],
  );
  const requestedEvent = MASS_EXTINCTIONS.find(
    (event) => event.ageMa > 0 && event.id === searchParams.get("event"),
  );
  const activeStage = visibleStages.find((stage) => stage.id === urlState.stageId) ?? getDefaultAtlasStage(visibleStages);
  const activeItem =
    (requestedEvent
      ? timelineItems.find(
          (item) =>
            item.kind === "extinction" && item.event.id === requestedEvent.id,
        )
      : null) ??
    timelineItems.find(
      (item) => item.kind === "stage" && item.stage.id === activeStage.id,
    ) ??
    timelineItems[0] ??
    toStageTimelineItem(activeStage);
  const contextStage =
    getNearestStageForTimelineItem(visibleStages, activeItem) ?? activeStage;
  const activeThemeColor = activeItem.kind === "extinction"
    ? activeItem.event.color
    : ERAS.find((era) => era.id === activeItem.stage.eraId)?.color ?? "#d0a35b";
  const mobileThemeColor =
    ERAS.find((era) => era.id === activeStage.eraId)?.color ?? "#d0a35b";
  const accumulatedTraitGroups = useMemo(
    () => getAccumulatedTraitGroups(sortedStages, contextStage),
    [contextStage],
  );
  const activeIndex = Math.max(
    0,
    timelineItems.findIndex((item) => item.id === activeItem.id),
  );
  const activeStageIndex = getStageIndex(visibleStages, activeStage.id);
  const canStepPrevious = activeIndex > 0;
  const canStepNext = activeIndex < timelineItems.length - 1;
  const canStepStagePrevious = activeStageIndex > 0;
  const canStepStageNext = activeStageIndex < visibleStages.length - 1;
  const activeElapsedShare = elapsedShare(activeItem.ageMa);
  const traitCount = accumulatedTraitGroups.reduce((sum, group) => sum + group.traits.length, 0);
  const wowFacts = [
    {
      icon: Clock3,
      label: "К выбранной точке",
      value: `${percentRu(activeElapsedShare * 100)}%`,
      text: `истории жизни прошло к точке “${activeItem.titleRu}”.`,
    },
    {
      icon: Sparkles,
      label: "Один день жизни",
      value: shareToClock(activeElapsedShare),
      text: "время выбранного этапа, если 4 млрд лет сжать в 24 часа.",
    },
    {
      icon: Fingerprint,
      label: "Накоплено признаков",
      value: traitCount.toLocaleString("ru-RU"),
      text: "унаследованных признаков уже собрано к этой точке маршрута.",
      href: "/body-map",
    },
    {
      icon: Star,
      label: "До приматов",
      value: `${percentRu(elapsedShare(PRIMATES_MA) * 100, 1)}%`,
      text: "истории жизни прошло до появления первых приматов.",
    },
  ];

  useEffect(() => {
    if (searchParams.get("mode") !== "primates") return;

    const primateState = parsePrimateUrlState(searchParams);
    const primateStage =
      primateStages.find((stage) => stage.id === primateState.stageId) ??
      getDefaultAtlasStage(primateStages);

    navigate(`/primates?${toStageSearchParams(primateStage).toString()}`, {
      replace: true,
    });
  }, [navigate, searchParams]);

  function activateStage(
    stage: EvolutionStage,
    options: AtlasNavigationOptions = {},
  ) {
    setSearchParams(toAtlasSearchParams({ mode: "all", stage }), {
      replace: options.replace ?? true,
    });
  }

  function activateTimelineItem(
    item: TimelineItem,
    options: AtlasNavigationOptions = {},
  ) {
    if (item.kind === "stage") {
      activateStage(item.stage, options);
      return;
    }

    setSearchParams(toAtlasEventSearchParams(item.event.id), {
      replace: options.replace ?? true,
    });
  }

  function moveActive(delta: number, options: AtlasNavigationOptions = {}) {
    const nextIndex = Math.min(timelineItems.length - 1, Math.max(0, activeIndex + delta));
    activateTimelineItem(timelineItems[nextIndex], options);
  }

  function moveStage(delta: number, options: AtlasNavigationOptions = {}) {
    const nextIndex = Math.min(visibleStages.length - 1, Math.max(0, activeStageIndex + delta));
    activateStage(visibleStages[nextIndex], options);
  }

  if (isMobileAtlas) {
    return (
      <div
        className="atlas atlas-mobile-shell"
        ref={atlasRef}
        tabIndex={0}
        style={{ "--active-era-color": mobileThemeColor } as CSSProperties}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveStage(1, { replace: false });
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveStage(-1, { replace: false });
          }
        }}
      >
        <p className="sr-only" aria-live="polite">
          Выбран этап {activeStage.titleRu}, {formatAgeRu(activeStage.ageMa)}
        </p>
        <MobileAtlas
          stages={visibleStages}
          eras={visibleEras}
          activeStage={activeStage}
          activeIndex={activeStageIndex}
          canStepPrevious={canStepStagePrevious}
          canStepNext={canStepStageNext}
          accumulatedTraitGroups={accumulatedTraitGroups}
          onActivateStage={(stage) => activateStage(stage, { replace: false })}
          onStep={(delta) => moveStage(delta, { replace: false })}
        />
      </div>
    );
  }

  return (
    <div
      className="atlas"
      ref={atlasRef}
      tabIndex={0}
      style={{ "--active-era-color": activeThemeColor } as CSSProperties}
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
        {activeItem.kind === "extinction"
          ? `Выбрано событие ${activeItem.titleRu}, ${activeItem.event.windowRu}`
          : `Выбран этап ${activeItem.stage.titleRu}, ${formatAgeRu(activeItem.stage.ageMa)}`}
      </p>

      <section className="atlas-hero">
        <FloatingPaths className="atlas-hero-paths" />
        <ConstellationField className="atlas-hero-constellation" />
        <div className="atlas-title">
          <h1>Человек произошел от обезьяны... а от кого произошла обезьяна?</h1>
          <p className="hero-subtitle">Короткий ответ теории эволюции — через дерево родства, а не лестницу прогресса.</p>
          <p>
            Почти вся история жизни прошла до появления приматов. Перемещайтесь по шкале, чтобы увидеть, как
            клеточные линии, рыбы, четвероногие, млекопитающие и древние приматы связаны с нашей ветвью.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="button button-primary button-md"
              onClick={() => window.dispatchEvent(new Event(DARWIN_TOUR_MENU_EVENT))}
            >
              Подобрать экскурсию
            </button>
            <Link className="button button-secondary button-md" to="/quiz">
              Проверить себя
            </Link>
          </div>
          <p className="atlas-first-run-hint">
            Если вы здесь впервые, экскурсия соберет короткий маршрут по главным
            узлам.
          </p>
        </div>
      </section>

      <section className="theory-bridge-band atlas-note-band">
        <div>
          <Star aria-hidden="true" size={22} />
          <div>
            <strong>Общие предки</strong>
            <p>
              Каждый узел на маршруте показывает группу, от которой
              расходились родственные линии. Наша ветвь — одна из них.
            </p>
          </div>
        </div>
      </section>

      <section className="wow-facts-band" aria-label="Факты о масштабе времени">
        {wowFacts.map(({ icon: Icon, label, value, text, href }) => (
          <article key={label}>
            <Icon aria-hidden="true" size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{text}</p>
            {href ? (
              <Link className="wow-fact-link" to={href}>
                Открыть карту признаков
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      <section className="atlas-grid">
        <div className="center-stage">
          <Suspense
            fallback={
              <section className="route-loading" aria-live="polite">
                Загружаем шкалу времени...
              </section>
            }
          >
            <DeepTimeAxis
              stages={visibleStages}
              timelineItems={timelineItems}
              extinctions={MASS_EXTINCTIONS}
              activeItem={activeItem}
              onActivateItem={activateTimelineItem}
              onStep={moveActive}
              canStepPrevious={canStepPrevious}
              canStepNext={canStepNext}
            />
          </Suspense>

          <div className="era-strip-card" aria-label="Навигация по эпохам">
            <div className="rail-heading">
              <BookOpen aria-hidden="true" size={19} />
              <span>Маршрут по эпохам</span>
            </div>
            <EraNavigation eras={visibleEras} stages={visibleStages} activeStage={contextStage} onActivate={activateStage} />
          </div>
        </div>

        {activeItem.kind === "extinction" ? (
          <ExtinctionDetailCard event={activeItem.event} />
        ) : (
          <StageDetailCard stage={activeItem.stage} />
        )}
      </section>

      <Suspense
        fallback={
          <section className="route-loading" aria-live="polite">
            Загружаем карту признаков...
          </section>
        }
      >
        <TraitAccumulator groups={accumulatedTraitGroups} />
      </Suspense>

      <section className="theory-bridge-band">
        <div>
          <Dna aria-hidden="true" size={22} />
          <div>
            <strong>Дерево родства</strong>
            <p>Кладограмма выделяет ветвь Homo sapiens и соседние линии, которые отходят от разных общих предков.</p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/cladogram">
          Открыть дерево
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <section className="theory-bridge-band">
        <div>
          <BookOpen aria-hidden="true" size={22} />
          <div>
            <strong>Почему эволюция называется теорией?</strong>
            <p>Коротко о научном значении слова “теория” и о доказательствах общего происхождения.</p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/theory">
          Открыть раздел
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <section className="theory-bridge-band">
        <div>
          <Dna aria-hidden="true" size={22} />
          <div>
            <strong>Как это видно в ДНК?</strong>
            <p>РНК, ДНК, мутации и сравнение геномов показывают родство как код, а не только как форму тела.</p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/genetics">
          РНК/ДНК
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>

      <section className="theory-bridge-band extinction-link-band">
        <div>
          <Waves aria-hidden="true" size={22} />
          <div>
            <strong>Почему история жизни менялась рывками?</strong>
            <p>Шесть крупных кризисов резко меняли экосистемы: одни группы исчезали, другие занимали освободившиеся ниши.</p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/extinctions">
          Глобальные вымирания
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </div>
  );
}
