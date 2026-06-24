import { ChevronLeft, ChevronRight, Compass, Search } from "lucide-react";
import { AfricaOriginMap } from "../../education/AfricaOriginMap";
import type { EvolutionEra, EvolutionStage } from "../../../data/lineage";
import type { AccumulatedTraitGroup } from "../../../lib/accumulatedTraits";
import type { AtlasUrlMode } from "../../../lib/atlasUrlState";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { TraitAccumulator } from "../TraitAccumulator";
import { MobileStageMap } from "./MobileStageMap";

type MobileAtlasProps = {
  mode: AtlasUrlMode;
  stages: EvolutionStage[];
  eras: EvolutionEra[];
  activeStage: EvolutionStage;
  activeIndex: number;
  canStepPrevious: boolean;
  canStepNext: boolean;
  accumulatedTraitGroups: AccumulatedTraitGroup[];
  onActivateMode: (mode: AtlasUrlMode) => void;
  onActivateStage: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
};

export function MobileAtlas({
  mode,
  stages,
  eras,
  activeStage,
  activeIndex,
  canStepPrevious,
  canStepNext,
  accumulatedTraitGroups,
  onActivateMode,
  onActivateStage,
  onStep,
}: MobileAtlasProps) {
  return (
    <section className="mobile-atlas" aria-label="Мобильный атлас эволюции">
      <div className="mobile-atlas-hero">
        <p className="eyebrow">Атлас эволюции</p>
        <h1>Человек произошел от обезьяны... а от кого произошла обезьяна?</h1>
        <p>
          Выберите масштаб, двигайтесь по этапам и раскрывайте активную карточку
          прямо внутри карты.
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => onActivateMode(value as AtlasUrlMode)}
      >
        <TabsList className="mobile-atlas-tabs">
          <TabsTrigger value="all">
            <Compass aria-hidden="true" size={18} />
            Весь путь
          </TabsTrigger>
          <TabsTrigger value="primates">
            <Search aria-hidden="true" size={18} />
            Приматы → человек
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mobile-atlas-stepper" aria-label="Переключение этапов">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={!canStepPrevious}
          aria-label="Предыдущий этап"
        >
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <span aria-live="polite">
          {activeIndex + 1} из {stages.length}: {activeStage.titleRu}
        </span>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={!canStepNext}
          aria-label="Следующий этап"
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      </div>

      <MobileStageMap
        eras={eras}
        stages={stages}
        activeStage={activeStage}
        onActivate={onActivateStage}
      />

      <TraitAccumulator groups={accumulatedTraitGroups} />

      <AfricaOriginMap />
    </section>
  );
}
