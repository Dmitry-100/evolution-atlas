import { useMemo, useRef, useState } from "react";
import { BookOpen, Compass, History, Search, Star } from "lucide-react";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
import { formatAgeRu } from "../lib/timeline";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { DeepTimeAxis } from "../components/atlas/DeepTimeAxis";
import { EraNavigation } from "../components/atlas/EraNavigation";
import { EvidenceSection } from "../components/atlas/EvidenceSection";
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
            <h1>Человек произошел от обезьяны? А от кого произошли обезьяны?</h1>
            <p className="hero-subtitle">Как отвечает на это теория эволюции.</p>
            <p>
              Эволюция - это не лестница к человеку, а ветвящееся дерево. Почти вся история жизни прошла до
              появления приматов; наша ветвь занимает только самый правый край шкалы.
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
          <aside className="left-rail" aria-label="Навигация по эпохам">
            <div className="rail-card">
              <div className="rail-heading">
                <BookOpen aria-hidden="true" size={19} />
                <span>Маршрут</span>
              </div>
              <EraNavigation eras={visibleEras} stages={visibleStages} activeStage={activeStage} onActivate={activateStage} />
            </div>
          </aside>

          <div className="center-stage">
            {mode === "primates" ? (
              <PrimateAxis stages={visibleStages} activeStage={activeStage} onActivate={activateStage} />
            ) : (
              <DeepTimeAxis stages={visibleStages} eras={visibleEras} activeStage={activeStage} onActivate={activateStage} />
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

        <EvidenceSection />
      </div>
    </TooltipProvider>
  );
}
