import { CreatureComparison } from "./CreatureComparison";
import { CircleHelp } from "lucide-react";
import { TRAITS } from "../../game/content";
import { count, traitCounts } from "../../game/engine";
import { foodBudget, traitComparison } from "../../game/expedition";
import type { GameState } from "../../game/types";

export function TraitBars({
  state,
  island,
  onExplain,
}: {
  state: GameState;
  island: number;
  onExplain: () => void;
}) {
  const population = count(state.regions[island]);
  const traits = traitCounts([state.regions[island]]);
  if (!population)
    return (
      <div className="game-empty-population">
        <strong>Остров пока не заселён</strong>
        <p>
          Наследуемые признаки появятся после прибытия животных. Проверьте
          морской путь или используйте плот.
        </p>
      </div>
    );
  return (
    <div className="game-traits">
      <button className="game-traits-help" onClick={onExplain}>
        Признаки жителей <CircleHelp size={14} />
        <span>Что это?</span>
      </button>
      {TRAITS.map((trait, index) => (
        <div className="game-trait" key={trait.name}>
          <span>
            <span>{trait.name}</span>
            <strong>
              {trait.values[traits[index].indexOf(Math.max(...traits[index]))]}
            </strong>
          </span>
          <div
            role="img"
            aria-label={`${trait.name}: ${trait.values.map((label, i) => `${label} ${Math.round((traits[index][i] / population) * 100)}%`).join(", ")}`}
          >
            {traits[index].map((v, i) => (
              <i key={i} style={{ flex: v }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export function TraitExplanation() {
  return (
    <div className="game-traits-simple">
      <p>Эти особенности передаются от родителей потомкам.</p>
      <dl>
        <div>
          <dt>Размер</dt>
          <dd>Крупным нужно больше еды, зато их реже ловят хищники.</dd>
        </div>
        <div>
          <dt>Шерсть</dt>
          <dd>Густая помогает в холоде, редкая — в жару.</dd>
        </div>
        <div>
          <dt>Питание</dt>
          <dd>Одни едят побеги, другие — семена, третьи — и то и другое.</dd>
        </div>
        <div>
          <dt>Расселение</dt>
          <dd>Подвижные чаще добираются до соседних островов.</dd>
        </div>
      </dl>
      <p className="game-muted">
        Ширина цвета на полосе — доля животных с этим вариантом.
      </p>
    </div>
  );
}
export function FoodBudget({
  state,
  island,
}: {
  state: GameState;
  island: number;
}) {
  if (!count(state.regions[island])) return null;
  return (
    <details className="game-food-budget">
      <summary>Хватит ли пищи колонии?</summary>
      <p>
        Оценка по текущей численности и рациону на одно поколение. Будущее
        размножение и новое событие могут изменить баланс.
      </p>
      {foodBudget(state, island).map((f, i) => (
        <p key={i}>
          <strong>
            {i ? "Семена" : "Побеги"}: {f.shortage ? "дефицит" : "хватает"}
          </strong>
          <span>
            Доступно {Math.round(f.available)} · нужно около {Math.ceil(f.need)}
          </span>
        </p>
      ))}
    </details>
  );
}
export function AnimalComparison({
  state,
  island,
  paused = false,
}: {
  state: GameState;
  island: number;
  paused?: boolean;
}) {
  const { first, now, changes } = traitComparison(state, island);
  if (!first)
    return (
      <p className="game-muted">
        Сравнение появится после первого отчёта о живой колонии на этом острове.
      </p>
    );
  const alive = count(state.regions[island]) > 0;
  return (
    <section className="game-animal-comparison">
      <h3>Как менялись жители</h3>
      {alive ? (
        <CreatureComparison
          paused={paused}
          before={first.traits}
          beforeCounts={first.counts}
          afterCounts={state.regions[island].counts}
          after={now}
          beforeLabel={
            first.turn
              ? `Первая запись · ход ${first.turn}`
              : "Начальная популяция"
          }
          afterLabel={`Сейчас · ход ${state.turn}`}
        />
      ) : (
        <p>Колония исчезла.</p>
      )}
      <p className="game-muted">
        Фигурки показывают представителей популяции. Поверните их
        перетаскиванием. В 3D-сцене видны разные представители колонии.
      </p>
      {alive && (
        <div className="game-change-list">
          {changes.map((c) => (
            <p key={c.name}>
              <span>
                {c.name} · {c.value.toLowerCase()}
              </span>
              <strong>
                {Math.round(c.before * 100)}% → {Math.round(c.after * 100)}%
              </strong>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
