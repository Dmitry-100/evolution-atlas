import { CircleHelp } from "lucide-react";
import { REGIONS, TRAITS } from "../../game/content";
import { count, environment, traitCounts } from "../../game/engine";
import { foodBudget, traitComparison } from "../../game/expedition";
import type { GameState } from "../../game/types";

export function TraitBars({
  state,
  island,
  onExplain,
}: {
  state: GameState;
  island: number;
  onExplain: (index: number) => void;
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
      {TRAITS.map((trait, index) => (
        <div className="game-trait" key={trait.name}>
          <span>
            <button
              className="game-trait-help"
              onClick={() => onExplain(index)}
              aria-label={`Объяснить признак: ${trait.name}`}
            >
              {trait.name}
              <CircleHelp size={12} />
            </button>
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
export function TraitExplanation({
  state,
  island,
  index,
}: {
  state: GameState;
  island: number;
  index: number;
}) {
  const trait = TRAITS[index],
    values = traitCounts([state.regions[island]])[index],
    n = count(state.regions[island]),
    env = environment(state, island);
  const explanations = [
    [
      "Меньше потребность в пище, выше потери от хищников.",
      "Промежуточные затраты и защита.",
      "Больше потребность в пище, ниже потери от хищников.",
    ],
    [
      "Легче отдавать тепло в жару.",
      "Лучше подходит умеренная температура.",
      "Лучше сохраняет тепло в холоде.",
    ],
    [
      "Используют побеги; семена не заменяют им пищу.",
      "Используют оба ресурса, но менее эффективно, чем специалист.",
      "Используют семена; побеги не заменяют им пищу.",
    ],
    [
      "Реже уходят сами; шанс пережить обычный переход — 65%.",
      "Промежуточная частота переходов; выживание в пути — 80%.",
      "Чаще уходят сами; выживание в пути — 95%, но выше потребность в пище.",
    ],
  ];
  return (
    <div className="game-trait-explanation">
      <p>{trait.hint}</p>
      <div className="game-trait-legend">
        {trait.values.map((value, i) => (
          <article key={value}>
            <i className={`game-trait-dot variant-${i}`} />
            <h3>{value}</h3>
            <strong>
              {n
                ? `${Math.round((values[i] / n) * 100)}% · ${values[i]} существ`
                : "Нет популяции"}
            </strong>
            <p>{explanations[index][i]}</p>
          </article>
        ))}
      </div>
      <div className="game-note">
        <h3>На острове {REGIONS[island].name}</h3>
        <p>
          {index === 1
            ? `Сейчас ${Math.round(18 + env.temperature * 12)}°. «Тень и влага» охлаждает среду, убежище уменьшает температурный стресс. Сами карты не меняют шерсть животных.`
            : index === 0
              ? `Давление хищников: ${env.predators.toFixed(1)} в условных единицах. Укрытия снижают его, но занимают территорию. При нехватке пищи большой размер может стать затратным.`
              : index === 2
                ? "Сравнивайте оба источника пищи отдельно. Семенной сад помогает одним жителям, новые побеги — другим."
                : "Открытый путь допускает естественное расселение. Карта переносит группу сразу, а плот позволяет рискнуть в закрытом проливе с меньшими шансами выжить."}
        </p>
      </div>
      <p className="game-muted">
        Полосы показывают доли наследуемых вариантов среди жителей. Условные
        числовые зависимости относятся к этой игре.
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
function Portrait({ traits }: { traits: number[][] }) {
  const means = traits.map(
    (v) =>
      (v[1] + v[2] * 2) /
      Math.max(
        1,
        v.reduce((a, b) => a + b, 0),
      ),
  );
  const [size, coat, diet, mobility] = means;
  return (
    <svg
      viewBox="0 0 240 128"
      className="game-creature-portrait"
      aria-hidden="true"
    >
      <ellipse cx="119" cy="112" rx="76" ry="6" fill="#0003" />
      <g
        transform={`translate(${20 - size * 6} ${24 - size * 6}) scale(${0.72 + size * 0.15})`}
        fill={["#cbb889", "#bba06b", "#8b7754"][Math.round(coat)]}
        stroke="#e3cf9c"
        strokeWidth="1.2"
      >
        <path d={`M59 58 Q12 ${20 + coat * 8} 16 83 Q41 73 69 82`} />
        <ellipse cx="115" cy="64" rx="62" ry={26 + coat * 5} />
        {[76, 101, 139, 159].map((x, i) => (
          <path
            key={x}
            d={`M${x} 74 l${i % 2 ? 5 : -5} ${23 + mobility * 5} l15 1 l-5 -28`}
          />
        ))}
        <ellipse cx="174" cy="51" rx={23 + diet * 3} ry={19 - diet * 2} />
        <ellipse cx="160" cy="29" rx={7 + coat} ry={11 + coat * 2} />
        <circle cx="183" cy="44" r="3" fill="#17251f" />
        {coat > 0.8 &&
          [65, 82, 99, 116, 133].map((x) => (
            <path key={x} d={`M${x} 37 l5 -7 l7 6`} fill="none" />
          ))}
      </g>
    </svg>
  );
}
export function AnimalComparison({
  state,
  island,
}: {
  state: GameState;
  island: number;
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
      <div className="game-portraits">
        <figure>
          <Portrait traits={first.traits} />
          <figcaption>
            {first.turn
              ? `Первая запись · ход ${first.turn}`
              : "Начальная популяция"}
          </figcaption>
        </figure>
        <span>→</span>
        <figure>
          {alive ? (
            <Portrait traits={now} />
          ) : (
            <div className="game-portrait-empty">Колония исчезла</div>
          )}
          <figcaption>Сейчас · ход {state.turn}</figcaption>
        </figure>
      </div>
      <p className="game-muted">
        Условные силуэты по средним признакам. В 3D-сцене видны разные
        представители колонии.
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
