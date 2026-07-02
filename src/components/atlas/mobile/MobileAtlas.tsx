import { Suspense, lazy } from "react";
import { ChevronLeft, ChevronRight, Compass, Search } from "lucide-react";
import { AfricaOriginMap } from "../../education/AfricaOriginMap";
import type { EvolutionEra, EvolutionStage } from "../../../data/lineage";
import type { AccumulatedTraitGroup } from "../../../lib/accumulatedTraits";
import type { AtlasUrlMode } from "../../../lib/atlasUrlState";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { MobileStageMap } from "./MobileStageMap";

const TraitAccumulator = lazy(() =>
  import("../TraitAccumulator").then(({ TraitAccumulator }) => ({
    default: TraitAccumulator,
  })),
);

type MobileAtlasProps = {
  mode?: AtlasUrlMode;
  eyebrow?: string;
  title?: string;
  description?: string;
  showAfricaOriginMap?: boolean;
  showTraitAccumulator?: boolean;
  stages: EvolutionStage[];
  eras: EvolutionEra[];
  activeStage: EvolutionStage;
  activeIndex: number;
  canStepPrevious: boolean;
  canStepNext: boolean;
  accumulatedTraitGroups: AccumulatedTraitGroup[];
  onActivateMode?: (mode: AtlasUrlMode) => void;
  onActivateStage: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
};

export function MobileAtlas({
  mode,
  eyebrow = "Атлас эволюции",
  title = "Человек произошел от обезьяны... а от кого произошла обезьяна?",
  description = "Двигайтесь по этапам и раскрывайте активную карточку прямо внутри карты.",
  showAfricaOriginMap = false,
  showTraitAccumulator = true,
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
  const showModeTabs = Boolean(mode && onActivateMode);

  return (
    <section className="mobile-atlas" aria-label="Мобильный атлас эволюции">
      <div className="mobile-atlas-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {showModeTabs ? (
        <Tabs
          value={mode}
          onValueChange={(value) => onActivateMode?.(value as AtlasUrlMode)}
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
      ) : null}

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

      {showTraitAccumulator ? (
        <Suspense fallback={null}>
          <TraitAccumulator groups={accumulatedTraitGroups} />
        </Suspense>
      ) : null}

      {showAfricaOriginMap ? <AfricaOriginMap /> : null}
    </section>
  );
}
