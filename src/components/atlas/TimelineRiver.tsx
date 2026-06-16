import { useMemo, type PointerEvent } from "react";
import { MoveHorizontal } from "lucide-react";
import type { EvolutionEra, EvolutionStage } from "../../data/lineage";
import { ageMaToPosition, findNearestStage, formatAgeRu, type TimelineScale } from "../../lib/timeline";
import { Slider } from "../ui/slider";

type TimelineRiverProps = {
  stages: EvolutionStage[];
  eras: EvolutionEra[];
  activeStage: EvolutionStage;
  scale: TimelineScale;
  mode: "all" | "primates";
  onActivate: (stage: EvolutionStage) => void;
};

export function TimelineRiver({ stages, eras, activeStage, scale, mode, onActivate }: TimelineRiverProps) {
  const activePosition = ageMaToPosition(activeStage.ageMa, scale) * 100;

  const eraBands = useMemo(
    () =>
      eras
        .map((era) => {
          const left = ageMaToPosition(era.startsAtMa, scale) * 100;
          const right = ageMaToPosition(era.endsAtMa, scale) * 100;
          const width = Math.max(1.5, right - left);
          return { ...era, left, width };
        })
        .filter((era) => era.left + era.width >= 0 && era.left <= 100),
    [eras, scale],
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    const nearest = findNearestStage(stages, position, scale);
    if (nearest && nearest.id !== activeStage.id) onActivate(nearest);
  }

  return (
    <section className="timeline-section" aria-label="Временная шкала эволюции">
      <div className="timeline-toolbar">
        <span>
          <MoveHorizontal aria-hidden="true" size={19} />
          Наведите на реку времени или двигайте ползунок
        </span>
        <strong>{mode === "primates" ? "масштаб: 65 млн лет" : "масштаб: 4 млрд лет"}</strong>
      </div>

      <div className="timeline-river" onPointerMove={handlePointerMove}>
        <div className="era-glow" aria-hidden="true" />
        <img
          src={mode === "primates" ? "/assets/images/timeline-river-clean.png" : "/assets/images/timeline-river-specimens.png"}
          alt=""
          aria-hidden="true"
        />

        {eraBands.map((era) => (
          <span
            key={era.id}
            className="era-band"
            style={{ left: `${era.left}%`, width: `${era.width}%`, background: era.color }}
            aria-hidden="true"
          />
        ))}

        <span className="active-line" style={{ left: `${activePosition}%` }} aria-hidden="true" />
        <div className="active-bubble" style={{ left: `${activePosition}%` }}>
          <span>{formatAgeRu(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
        </div>

        <div className="stage-points" role="list" aria-label="Этапы эволюции">
          {stages.map((stage) => {
            const position = ageMaToPosition(stage.ageMa, scale) * 100;
            const isActive = stage.id === activeStage.id;
            return (
              <button
                key={stage.id}
                className={isActive ? "stage-dot is-active" : "stage-dot"}
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
          const nearest = findNearestStage(stages, (value ?? 0) / 1000, scale);
          if (nearest) onActivate(nearest);
        }}
      />
    </section>
  );
}
