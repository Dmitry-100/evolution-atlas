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

const originVisuals: Record<
  string,
  {
    src: string;
    alt: string;
    caption: string;
    sourceUrl: string;
  }
> = {
  "primordial-soup": {
    src: "/assets/images/education/origin-miller-urey.png",
    alt: "Схема эксперимента Миллера-Юри с колбами, электродами и циркуляцией газов.",
    caption: "Эксперименты с ранней атмосферой показывают, что органика может возникать из простой химии.",
    sourceUrl: "https://en.wikipedia.org/wiki/Miller%E2%80%93Urey_experiment",
  },
  "rna-world": {
    src: "/assets/images/education/origin-rna-world.jpg",
    alt: "Трехмерная ленточная модель РНК-рибопереключателя.",
    caption: "РНК может быть не только носителем информации, но и рабочей молекулой.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:G_riboswitch_RNA_ribbon.jpg",
  },
  "hydrothermal-vents": {
    src: "/assets/images/education/origin-hydrothermal-vent.jpg",
    alt: "Черный гидротермальный источник на океаническом дне.",
    caption: "Гидротермальные источники дают энергию, минералы и естественные микрокамеры.",
    sourceUrl: "https://en.wikipedia.org/wiki/Hydrothermal_vent",
  },
  "metabolism-first": {
    src: "/assets/images/source-backed/protocells.jpg",
    alt: "Гидротермальный источник как геохимическая среда для ранних реакций.",
    caption: "Минеральные поверхности могли работать как первые геохимические реакторы.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hydrothermal_vent,_Mid-Cayman_Rise_(Expl6955_9664075828).jpg",
  },
  "lipid-world": {
    src: "/assets/images/education/origin-liposome.png",
    alt: "Схема липосомы с двойным липидным слоем.",
    caption: "Мембранные пузырьки отделяют внутреннюю химию от внешней среды.",
    sourceUrl: "https://en.wikipedia.org/wiki/Liposome",
  },
  panspermia: {
    src: "/assets/images/education/origin-meteorite.jpg",
    alt: "Фрагмент углистого хондрита, похожего на метеорит Мерчисон.",
    caption: "Метеориты могли доставлять органические молекулы, но не заменяют объяснение происхождения жизни.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Carbonaceous_chondrite_(Murchison_Meteorite)_(14601493358).jpg",
  },
};

const originJourney = [
  {
    title: "Энергия",
    text: "молнии, ультрафиолет, вулканы и гидротермальные источники",
    visual: originVisuals["hydrothermal-vents"],
  },
  {
    title: "Органика",
    text: "аминокислоты, сахара и азотистые основания как химические заготовки",
    visual: originVisuals["primordial-soup"],
  },
  {
    title: "Оболочки",
    text: "липидные пузырьки удерживают молекулы рядом друг с другом",
    visual: originVisuals["lipid-world"],
  },
  {
    title: "Наследование",
    text: "молекулы вроде РНК дают шанс копировать удачные варианты",
    visual: originVisuals["rna-world"],
  },
];

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
        <div className="origin-hero-panel">
          <figure className="origin-hero-image">
            <img
              src="/assets/images/education/origin-hydrothermal-vent.jpg"
              alt="Гидротермальный источник в глубине океана."
            />
            <figcaption>одна из сред, где химия могла получить постоянный источник энергии</figcaption>
          </figure>
          <div className="origin-answer-card">
            <Sparkles aria-hidden="true" size={30} />
            <strong>Главная мысль</strong>
            <span>
              Скорее всего, первой была не “готовая клетка”, а серия химических
              шагов: строительные блоки → оболочки → наследование → отбор.
            </span>
          </div>
        </div>
      </div>

      <section className="origin-visual-story" aria-labelledby="origin-visual-story-title">
        <div className="origin-section-heading">
          <Network aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Химия становится биологией</p>
            <h2 id="origin-visual-story-title">Не один скачок, а цепочка переходов</h2>
            <p>
              В гипотезах различаются детали, но почти всегда нужны четыре вещи:
              энергия, органические молекулы, граница и наследуемая изменчивость.
            </p>
          </div>
        </div>
        <div className="origin-story-grid">
          {originJourney.map((step, index) => (
            <article key={step.title} className="origin-story-card">
              <img src={step.visual.src} alt={step.visual.alt} loading="lazy" decoding="async" />
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

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
          const visual = originVisuals[hypothesis.id];
          return (
            <article key={hypothesis.id} className="origin-hypothesis-card">
              {visual ? (
                <figure className="origin-hypothesis-media">
                  <img src={visual.src} alt={visual.alt} loading="lazy" decoding="async" />
                  <figcaption>{visual.caption}</figcaption>
                </figure>
              ) : null}
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
