import {
  Atom,
  CircleDot,
  FlaskConical,
  Network,
  Orbit,
  Sparkles,
  Waves,
} from "lucide-react";
import { ORIGIN_HYPOTHESES, ORIGIN_SOURCES } from "../data/originHypotheses";

const icons = [FlaskConical, Atom, Waves, Network, CircleDot, Orbit];

export function OriginOfLifePage() {
  return (
    <section className="document-page origin-page">
      <div className="origin-hero">
        <div>
          <p className="eyebrow">До первой клетки</p>
          <h1>Гипотезы зарождения жизни</h1>
          <p>
            Теория эволюции объясняет, как меняются уже живые системы. Вопрос
            “как химия стала жизнью?” изучает абиогенез: несколько гипотез
            спорят не о магии, а о том, где появились энергия, мембраны,
            наследование и первые самоподдерживающиеся реакции.
          </p>
        </div>
        <div className="origin-answer-card">
          <Sparkles aria-hidden="true" size={30} />
          <strong>Главная мысль</strong>
          <span>
            Скорее всего, первой была не “готовая клетка”, а серия химических
            шагов: строительные блоки → оболочки → наследование → отбор.
          </span>
        </div>
      </div>

      <div className="origin-map">
        <span>химия</span>
        <span>органика</span>
        <span>протоклетки</span>
        <span>наследование</span>
        <span>отбор</span>
        <span>жизнь</span>
      </div>

      <div className="origin-hypotheses-grid">
        {ORIGIN_HYPOTHESES.map((hypothesis, index) => {
          const Icon = icons[index] ?? Sparkles;
          return (
            <article key={hypothesis.id} className="origin-hypothesis-card">
              <div className="origin-card-heading">
                <Icon aria-hidden="true" size={24} />
                <div>
                  <span>{hypothesis.statusRu}</span>
                  <h2>{hypothesis.titleRu}</h2>
                </div>
              </div>
              <p>{hypothesis.shortRu}</p>
              <dl>
                <div>
                  <dt>Как это могло работать</dt>
                  <dd>{hypothesis.mechanismRu}</dd>
                </div>
                <div>
                  <dt>Почему это серьезно</dt>
                  <dd>{hypothesis.evidenceRu}</dd>
                </div>
                <div>
                  <dt>Что пока не закрыто</dt>
                  <dd>{hypothesis.openQuestionRu}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <section className="origin-note" aria-labelledby="origin-not-one-answer">
        <h2 id="origin-not-one-answer">
          Почему нет одной “официальной” версии?
        </h2>
        <p>
          Потому что зарождение жизни произошло очень давно и не оставило такой
          же прямой летописи, как кости или ДНК более поздних организмов.
          Поэтому ученые проверяют не легенды, а химические сценарии: какие
          реакции возможны, где есть энергия, как молекулы концентрируются и как
          появляется наследуемая изменчивость.
        </p>
      </section>

      <div className="origin-sources">
        {ORIGIN_SOURCES.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.label}
          </a>
        ))}
      </div>
    </section>
  );
}
