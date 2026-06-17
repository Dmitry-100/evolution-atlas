import { GitCompareArrows } from "lucide-react";
import { useMemo, useState } from "react";
import { sortedStages } from "../../data/lineage";
import { compareStages } from "../../lib/stageComparison";
import { formatAgeRu } from "../../lib/timeline";

export function StageComparisonPanel() {
  const [firstId, setFirstId] = useState("chordates");
  const [secondId, setSecondId] = useState("sapiens");
  const firstStage = sortedStages.find((stage) => stage.id === firstId) ?? sortedStages[0];
  const secondStage = sortedStages.find((stage) => stage.id === secondId) ?? sortedStages.at(-1) ?? sortedStages[0];
  const comparison = useMemo(() => compareStages(sortedStages, firstStage, secondStage), [firstStage, secondStage]);

  return (
    <section className="comparison-panel" aria-labelledby="comparison-heading">
      <div className="comparison-heading">
        <GitCompareArrows aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Сравнение</p>
          <h2 id="comparison-heading">Сравнить два этапа</h2>
          <p>Выберите две точки и посмотрите, какой временной разрыв между ними и какие признаки накопились по пути.</p>
        </div>
      </div>

      <div className="comparison-body">
        <div className="comparison-controls">
          <label>
            Первый этап
            <select value={firstId} onChange={(event) => setFirstId(event.target.value)}>
              {sortedStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.titleRu}
                </option>
              ))}
            </select>
          </label>
          <label>
            Второй этап
            <select value={secondId} onChange={(event) => setSecondId(event.target.value)}>
              {sortedStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.titleRu}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="comparison-summary">
          <article>
            <span>Старшая точка</span>
            <strong>{comparison.older.titleRu}</strong>
            <small>{formatAgeRu(comparison.older.ageMa)}</small>
          </article>
          <article>
            <span>Младшая точка</span>
            <strong>{comparison.younger.titleRu}</strong>
            <small>{formatAgeRu(comparison.younger.ageMa)}</small>
          </article>
          <article>
            <span>Разрыв</span>
            <strong>{Math.round(comparison.ageGapMa).toLocaleString("ru-RU")} млн лет</strong>
            <small>между выбранными точками</small>
          </article>
        </div>

        <div className="comparison-traits">
          <strong>Между ними появилось</strong>
          <div>
            {comparison.newTraits.map((trait) => (
              <span key={trait}>{trait}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
