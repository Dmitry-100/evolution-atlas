import { useMemo, type PointerEvent } from "react";
import { MoveHorizontal, TimerReset } from "lucide-react";
import type { EvolutionEra, EvolutionStage } from "../../data/lineage";
import { formatAgeRu, getPrePrimateShare, sortStagesOldestFirst } from "../../lib/timeline";
import { Slider } from "../ui/slider";

type DeepTimeAxisProps = {
  stages: EvolutionStage[];
  eras: EvolutionEra[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

const ORIGIN_MA = 4000;
const PRIMATES_MA = 65;

function linearPosition(ageMa: number) {
  return Math.max(0, Math.min(1, 1 - ageMa / ORIGIN_MA));
}

function nearestStage(stages: EvolutionStage[], position: number) {
  return sortStagesOldestFirst(stages).reduce<{ stage: EvolutionStage; distance: number } | null>((nearest, stage) => {
    const distance = Math.abs(linearPosition(stage.ageMa) - position);
    if (!nearest || distance < nearest.distance) return { stage, distance };
    return nearest;
  }, null)?.stage;
}

export function DeepTimeAxis({ stages, eras, activeStage, onActivate }: DeepTimeAxisProps) {
  const activePosition = linearPosition(activeStage.ageMa) * 100;
  const activeCardClass =
    activePosition > 82 ? "deep-active-card align-right" : activePosition < 18 ? "deep-active-card align-left" : "deep-active-card";
  const prePrimateShare = getPrePrimateShare({ originMa: ORIGIN_MA, primatesMa: PRIMATES_MA });
  const primateStart = linearPosition(PRIMATES_MA) * 100;

  const eraBands = useMemo(
    () =>
      eras.map((era) => {
        const left = linearPosition(era.startsAtMa) * 100;
        const right = linearPosition(era.endsAtMa) * 100;
        return { ...era, left, width: Math.max(0.5, right - left) };
      }),
    [eras],
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    const nearest = nearestStage(stages, position);
    if (nearest && nearest.id !== activeStage.id) onActivate(nearest);
  }

  return (
    <section className="axis-panel deep-time-panel" aria-label="Глубокая шкала времени">
      <div className="axis-toolbar">
        <span>
          <MoveHorizontal aria-hidden="true" size={19} />
          Наведите на ленту времени или двигайте ползунок
        </span>
        <strong>4 млрд лет одним взглядом</strong>
      </div>

      <div className="deep-time-stat">
        <TimerReset aria-hidden="true" size={24} />
        <div>
          <span>до появления приматов прошло</span>
          <strong>{(prePrimateShare * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}% истории жизни</strong>
        </div>
      </div>

      <div className="deep-time-axis" onPointerMove={handlePointerMove}>
        <div className="deep-time-water" aria-hidden="true" />
        <div className="pre-primate-field" style={{ width: `${primateStart}%` }}>
          <span>До приматов: примерно 3,94 млрд лет</span>
        </div>
        <div className="primate-sliver" style={{ left: `${primateStart}%` }}>
          <span>Приматы ~65 млн лет</span>
        </div>

        {eraBands.map((era) => (
          <span
            key={era.id}
            className="deep-era-band"
            style={{ left: `${era.left}%`, width: `${era.width}%`, background: era.color }}
            title={era.titleRu}
          />
        ))}

        <span className="deep-active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />
        <div className={activeCardClass} style={{ left: `${activePosition}%` }}>
          <span>{formatAgeRu(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
        </div>

        <div className="deep-stage-dots" role="list" aria-label="Этапы на глубокой шкале">
          {stages.map((stage) => {
            const position = linearPosition(stage.ageMa) * 100;
            const isActive = stage.id === activeStage.id;
            return (
              <button
                key={stage.id}
                className={isActive ? "deep-stage-dot is-active" : "deep-stage-dot"}
                style={{ left: `${position}%` }}
                type="button"
                aria-label={`${stage.titleRu}, ${formatAgeRu(stage.ageMa)}`}
                aria-current={isActive ? "true" : undefined}
                onPointerEnter={() => onActivate(stage)}
                onFocus={() => onActivate(stage)}
                onClick={() => onActivate(stage)}
              >
                <span />
              </button>
            );
          })}
        </div>
      </div>

      <Slider
        max={1000}
        min={0}
        step={1}
        value={[activePosition * 10]}
        onValueChange={([value]) => {
          const nearest = nearestStage(stages, (value ?? 0) / 1000);
          if (nearest) onActivate(nearest);
        }}
      />

      <div className="deep-time-ticks" aria-hidden="true">
        <span>4 млрд</span>
        <span>3 млрд</span>
        <span>2 млрд</span>
        <span>1 млрд</span>
        <span>600 млн</span>
        <span>200 млн</span>
        <span>65 млн</span>
        <span>сегодня</span>
      </div>
    </section>
  );
}
