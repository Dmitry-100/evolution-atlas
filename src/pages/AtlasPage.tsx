import { useMemo, useRef, useState } from "react";
import { BookOpen, Compass, History, Search, Star } from "lucide-react";
import { ERAS, primateStages, sortedStages, type EvolutionStage } from "../data/lineage";
import { ageMaToPosition, formatAgeRu, type TimelineScale } from "../lib/timeline";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { EraNavigation } from "../components/atlas/EraNavigation";
import { StageDetailCard } from "../components/atlas/StageDetailCard";
import { TimelineRiver } from "../components/atlas/TimelineRiver";

type AtlasMode = "all" | "primates";

const ALL_SCALE: TimelineScale = { minMa: 0.01, maxMa: 4000 };
const PRIMATE_SCALE: TimelineScale = { minMa: 0.25, maxMa: 65 };
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
  const scale = mode === "primates" ? PRIMATE_SCALE : ALL_SCALE;
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
            <p className="eyebrow">Эволюция жизни</p>
            <h1>От кого произошли обезьяны? Путь к человеку за 4 млрд лет</h1>
            <p>
              Все слышали, что человек произошел от обезьяны. Этот атлас показывает следующий вопрос: от кого
              произошли обезьяны, приматы и вся линия, которая привела к нам.
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
            <TimelineRiver
              stages={visibleStages}
              eras={visibleEras}
              activeStage={activeStage}
              scale={scale}
              mode={mode}
              onActivate={activateStage}
            />

            <div className="specimen-strip" aria-label="Быстрый выбор видов">
              {visibleStages.slice(-12).map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  className={stage.id === activeStage.id ? "specimen-chip is-active" : "specimen-chip"}
                  onClick={() => activateStage(stage)}
                >
                  <span style={{ left: `${ageMaToPosition(stage.ageMa, scale) * 100}%` }} aria-hidden="true" />
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
      </div>
    </TooltipProvider>
  );
}
