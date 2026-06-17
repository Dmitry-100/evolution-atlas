import { useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, Clock3, Compass, Dna, History, Search, Sparkles, Star, Waves } from "lucide-react";
import { MASS_EXTINCTIONS } from "../data/extinctions";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
import { formatAgeRu } from "../lib/timeline";
import { Button } from "../components/ui/button";
import { ConstellationField } from "../components/ui/constellation-field";
import { FloatingPaths } from "../components/ui/floating-paths";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { DeepTimeAxis } from "../components/atlas/DeepTimeAxis";
import { EraNavigation } from "../components/atlas/EraNavigation";
import { PrimateAxis } from "../components/atlas/PrimateAxis";
import { StageDetailCard } from "../components/atlas/StageDetailCard";
import { CladogramPanel } from "../components/atlas/CladogramPanel";
import { TraitAccumulator } from "../components/atlas/TraitAccumulator";
import { DeepTimeCalendarPanel } from "../components/atlas/DeepTimeCalendarPanel";
import { QuizPanel } from "../components/atlas/QuizPanel";
import { getDefaultAtlasStage, parseAtlasUrlState, toAtlasSearchParams, type AtlasUrlMode } from "../lib/atlasUrlState";
import { getAccumulatedTraitGroups } from "../lib/accumulatedTraits";
import { buildCladogram } from "../lib/cladogram";

const LIFE_ORIGIN_MA = 4000;
const PRIMATES_MA = 65;

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

export function AtlasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parseAtlasUrlState(searchParams), [searchParams]);
  const mode = urlState.mode;
  const atlasRef = useRef<HTMLDivElement>(null);

  const visibleStages = mode === "primates" ? primateStages : sortedStages;
  const cladogram = useMemo(() => buildCladogram(sortedStages), []);
  const visibleEras = useMemo(() => ERAS.filter((era) => visibleStages.some((stage) => stage.eraId === era.id)), [visibleStages]);
  const activeStage = visibleStages.find((stage) => stage.id === urlState.stageId) ?? getDefaultAtlasStage(visibleStages);
  const accumulatedTraitGroups = useMemo(() => getAccumulatedTraitGroups(sortedStages, activeStage), [activeStage]);
  const activeIndex = getStageIndex(visibleStages, activeStage.id);
  const canStepPrevious = activeIndex > 0;
  const canStepNext = activeIndex < visibleStages.length - 1;
  const activeElapsedShare = elapsedShare(activeStage.ageMa);
  const wowFacts = [
    {
      icon: Clock3,
      label: "До приматов",
      value: `${percentRu(elapsedShare(PRIMATES_MA) * 100, 1)}%`,
      text: "истории жизни уже прошло, прежде чем появились ранние приматы.",
    },
    {
      icon: Dna,
      label: "Млекопитающие",
      value: "95%",
      text: "пути уже было позади к моменту появления первых млекопитающих.",
    },
    {
      icon: Sparkles,
      label: "24 часа жизни",
      value: shareToClock(elapsedShare(PRIMATES_MA)),
      text: "примерное время появления приматов, если всю историю жизни сжать в один день.",
    },
    {
      icon: Star,
      label: "Выбранная точка",
      value: `${percentRu(activeElapsedShare * 100)}%`,
      text: `истории жизни прошло к этапу “${activeStage.titleRu}”.`,
    },
  ];

  function activateStage(stage: EvolutionStage) {
    setSearchParams(toAtlasSearchParams({ mode, stage }), { replace: true });
  }

  function activateMode(nextMode: AtlasUrlMode) {
    const nextVisibleStages = nextMode === "primates" ? primateStages : sortedStages;
    const nextStage = nextVisibleStages.find((stage) => stage.id === activeStage.id) ?? getDefaultAtlasStage(nextVisibleStages);
    setSearchParams(toAtlasSearchParams({ mode: nextMode, stage: nextStage }), { replace: true });
  }

  function moveActive(delta: number) {
    const currentIndex = getStageIndex(visibleStages, activeStage.id);
    const nextIndex = Math.min(visibleStages.length - 1, Math.max(0, currentIndex + delta));
    activateStage(visibleStages[nextIndex]);
  }

  return (
    <TooltipProvider delayDuration={160}>
      <div
        className="atlas"
        ref={atlasRef}
        tabIndex={0}
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
            <h1>Человек произошел от обезьяны... а от кого произошла обезьяна?</h1>
            <p className="hero-subtitle">Короткий ответ теории эволюции - через дерево родства, а не лестницу прогресса.</p>
            <p>
              Почти вся история жизни прошла до появления приматов. Перемещайтесь по шкале, чтобы увидеть, как
              клеточные линии, рыбы, четвероногие, млекопитающие и древние приматы связаны с нашей ветвью.
            </p>
          </div>

          <div className="hero-actions" aria-label="Режимы атласа">
            <Tabs value={mode} onValueChange={(value) => activateMode(value as AtlasUrlMode)}>
              <TabsList>
                <TabsTrigger value="all">
                  <Compass aria-hidden="true" size={18} />
                  Весь путь
                </TabsTrigger>
                <TabsTrigger value="primates">
                  <Search aria-hidden="true" size={18} />
                  Приматы крупно
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Подсказка по управлению">
                  <History aria-hidden="true" size={19} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Нажимайте точки на шкале, двигайте ползунок или используйте стрелки, когда атлас в фокусе.
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

        <section className="atlas-grid">
          <div className="center-stage">
            {mode === "primates" ? (
              <PrimateAxis
                stages={visibleStages}
                activeStage={activeStage}
                onActivate={activateStage}
                onStep={moveActive}
                canStepPrevious={canStepPrevious}
                canStepNext={canStepNext}
              />
            ) : (
              <DeepTimeAxis
                stages={visibleStages}
                eras={visibleEras}
                extinctions={MASS_EXTINCTIONS}
                activeStage={activeStage}
                onActivate={activateStage}
                onStep={moveActive}
                canStepPrevious={canStepPrevious}
                canStepNext={canStepNext}
              />
            )}

            {mode === "all" ? (
              <div className="era-strip-card" aria-label="Навигация по эпохам">
                <div className="rail-heading">
                  <BookOpen aria-hidden="true" size={19} />
                  <span>Маршрут по эпохам</span>
                </div>
                <EraNavigation eras={visibleEras} stages={visibleStages} activeStage={activeStage} onActivate={activateStage} />
              </div>
            ) : null}
          </div>

        <StageDetailCard stage={activeStage} />
        </section>

        <CladogramPanel tree={cladogram} activeStage={activeStage} onActivate={activateStage} />

        <TraitAccumulator groups={accumulatedTraitGroups} />

        <DeepTimeCalendarPanel activeStage={activeStage} />

        <QuizPanel />

        <section className="wow-facts-band" aria-label="Вау-факты о масштабе времени">
          {wowFacts.map(({ icon: Icon, label, value, text }) => (
            <article key={label}>
              <Icon aria-hidden="true" size={21} />
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="theory-bridge-band atlas-note-band">
          <div>
            <Star aria-hidden="true" size={22} />
            <div>
              <strong>Главная мысль</strong>
              <p>
                Эволюция не лестница к человеку, а ветвящееся дерево. На шкале показаны не “ступеньки прогресса”, а
                ключевые родственники и узлы, через которые удобно понять происхождение нашей линии.
              </p>
            </div>
          </div>
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

        <section className="theory-bridge-band extinction-link-band">
          <div>
            <Waves aria-hidden="true" size={22} />
            <div>
              <strong>Почему история жизни менялась рывками?</strong>
              <p>Пять глобальных вымираний показывают, как кризисы открывали место новым ветвям эволюции.</p>
            </div>
          </div>
          <Link className="button button-secondary button-md" to="/extinctions">
            Глобальные вымирания
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      </div>
    </TooltipProvider>
  );
}
