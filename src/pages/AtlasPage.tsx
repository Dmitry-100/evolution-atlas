import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, History, Search, Star, Waves } from "lucide-react";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
import { formatAgeRu } from "../lib/timeline";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { DeepTimeAxis } from "../components/atlas/DeepTimeAxis";
import { EraNavigation } from "../components/atlas/EraNavigation";
import { PrimateAxis } from "../components/atlas/PrimateAxis";
import { StageDetailCard } from "../components/atlas/StageDetailCard";

type AtlasMode = "all" | "primates";

const DEFAULT_STAGE_ID = "early-primates";

function getInitialStage() {
  return sortedStages.find((stage) => stage.id === DEFAULT_STAGE_ID) ?? sortedStages[0];
}

function getStageIndex(stages: EvolutionStage[], stageId: string) {
  return Math.max(0, stages.findIndex((stage) => stage.id === stageId));
}

export function AtlasPage() {
  const [mode, setMode] = useState<AtlasMode>("all");
  const [activeStageId, setActiveStageId] = useState(DEFAULT_STAGE_ID);
  const atlasRef = useRef<HTMLDivElement>(null);

  const visibleStages = mode === "primates" ? primateStages : sortedStages;
  const visibleEras = useMemo(() => ERAS.filter((era) => visibleStages.some((stage) => stage.eraId === era.id)), [visibleStages]);
  const activeStage = visibleStages.find((stage) => stage.id === activeStageId) ?? getInitialStage();
  const activeIndex = getStageIndex(visibleStages, activeStage.id);
  const canStepPrevious = activeIndex > 0;
  const canStepNext = activeIndex < visibleStages.length - 1;

  function activateStage(stage: EvolutionStage) {
    setActiveStageId(stage.id);
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
          <div className="atlas-title">
            <h1>Человек произошел от обезьяны... а от кого произошла обезьяна?</h1>
            <p className="hero-subtitle">Короткий ответ теории эволюции - через дерево родства, а не лестницу прогресса.</p>
            <p>
              Почти вся история жизни прошла до появления приматов. Перемещайтесь по шкале, чтобы увидеть, как
              клеточные линии, рыбы, четвероногие, млекопитающие и древние приматы связаны с нашей ветвью.
            </p>
          </div>

          <div className="hero-actions" aria-label="Режимы атласа">
            <Tabs value={mode} onValueChange={(value) => setMode(value as AtlasMode)}>
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
                Наведите на шкалу, нажимайте точки или используйте стрелки, когда атлас в фокусе.
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
                activeStage={activeStage}
                onActivate={activateStage}
                onStep={moveActive}
                canStepPrevious={canStepPrevious}
                canStepNext={canStepNext}
              />
            )}

            <div className="specimen-strip" aria-label="Быстрый выбор видов">
              {visibleStages.slice(-12).map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  className={stage.id === activeStage.id ? "specimen-chip is-active" : "specimen-chip"}
                  onClick={() => activateStage(stage)}
                >
                  {stage.titleRu}
                </button>
              ))}
            </div>

            <div className="era-strip-card" aria-label="Навигация по эпохам">
              <div className="rail-heading">
                <BookOpen aria-hidden="true" size={19} />
                <span>Маршрут по эпохам</span>
              </div>
              <EraNavigation eras={visibleEras} stages={visibleStages} activeStage={activeStage} onActivate={activateStage} />
            </div>
          </div>

          <StageDetailCard stage={activeStage} />
        </section>

        <section className="takeaway-band">
          <div>
            <Star aria-hidden="true" size={20} />
            <strong>Главная мысль</strong>
          </div>
          <p>
            Эволюция не лестница к человеку, а ветвящееся дерево. На шкале показаны не “ступеньки прогресса”, а
            ключевые родственники и узлы, через которые удобно понять происхождение нашей линии.
          </p>
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
