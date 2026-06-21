import {
  Atom,
  CircleDot,
  FlaskConical,
  Network,
  Orbit,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { OptimizedImage } from "../components/ui/optimized-image";
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
    src: "/assets/images/education/origin-primordial-soup-generated.jpg",
    alt: "AI-визуализация первичного океана: молнии, вулканы, минералы и органические молекулы в ранней химической среде.",
    caption: "Первичный бульон: энергия ранней Земли могла собирать простые вещества в органические молекулы.",
    sourceUrl: "generated",
  },
  "rna-world": {
    src: "/assets/images/education/origin-rna-world-generated.jpg",
    alt: "AI-визуализация РНК-мира: молекулы РНК внутри протоклеточной оболочки и каталитические реакции.",
    caption: "РНК-мир: одна молекула могла хранить информацию и ускорять реакции.",
    sourceUrl: "generated",
  },
  "hydrothermal-vents": {
    src: "/assets/images/education/origin-hydrothermal-vent-generated.jpg",
    alt: "AI-визуализация гидротермального источника на океаническом дне с минеральными трубами и потоками горячей воды.",
    caption: "Гидротермальные источники: энергия, минералы и микрокамеры на дне океана.",
    sourceUrl: "generated",
  },
  "step-energy": {
    src: "/assets/images/education/origin-step-energy-generated.jpg",
    alt: "AI-визуализация ранней Земли: гидротермальный источник, вулканы, молнии и потоки энергии в океане.",
    caption: "Энергия ранней Земли могла запускать химические реакции.",
    sourceUrl: "generated",
  },
  "step-organics": {
    src: "/assets/images/education/origin-step-organics-generated.jpg",
    alt: "AI-визуализация образования органических молекул в океане рядом с вулканами, молниями и гидротермальными источниками.",
    caption: "Простая химия могла собираться в более сложные органические молекулы.",
    sourceUrl: "generated",
  },
  "step-membranes": {
    src: "/assets/images/education/origin-step-membranes-generated.jpg",
    alt: "AI-визуализация липидного пузырька, который удерживает молекулы внутри протоклеточной оболочки.",
    caption: "Оболочки отделяют внутреннюю химию от внешней среды.",
    sourceUrl: "generated",
  },
  "step-inheritance": {
    src: "/assets/images/education/origin-step-inheritance-generated.jpg",
    alt: "AI-визуализация протоклетки с молекулами РНК внутри и стрелками копирования наследственной информации.",
    caption: "Наследование начинается, когда удачные молекулярные варианты могут копироваться.",
    sourceUrl: "generated",
  },
  "metabolism-first": {
    src: "/assets/images/education/origin-metabolism-first-generated.jpg",
    alt: "AI-визуализация пористых минеральных поверхностей как сети микрореакторов для ранних химических циклов.",
    caption: "Метаболизм сначала: минеральные поры могли поддерживать устойчивые сети реакций.",
    sourceUrl: "generated",
  },
  "lipid-world": {
    src: "/assets/images/education/origin-lipid-protocells-generated.jpg",
    alt: "AI-визуализация липидной протоклетки: мембранный пузырек удерживает органические молекулы внутри.",
    caption: "Липидные протоклетки: мембранные пузырьки могли удерживать внутреннюю химию вместе.",
    sourceUrl: "generated",
  },
  panspermia: {
    src: "/assets/images/education/origin-panspermia-generated.jpg",
    alt: "AI-визуализация метеоритного потока над молодой Землей с океаном, вулканами и раскаленными обломками.",
    caption: "Панспермия: метеориты и кометы могли доставлять органику на молодую Землю.",
    sourceUrl: "generated",
  },
};

const originJourney = [
  {
    title: "Энергия",
    text: "молнии, ультрафиолет, вулканы и гидротермальные источники",
    visual: originVisuals["step-energy"],
  },
  {
    title: "Органика",
    text: "аминокислоты, сахара и азотистые основания как химические заготовки",
    visual: originVisuals["step-organics"],
  },
  {
    title: "Оболочки",
    text: "липидные пузырьки удерживают молекулы рядом друг с другом",
    visual: originVisuals["step-membranes"],
  },
  {
    title: "Наследование",
    text: "молекулы вроде РНК дают шанс копировать удачные варианты",
    visual: originVisuals["step-inheritance"],
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
      </div>

      <section className="theory-bridge-band atlas-note-band">
        <div>
          <Star aria-hidden="true" size={22} />
          <div>
            <strong>Главная мысль</strong>
            <p>
              Большинство рабочих сценариев предполагает не готовую клетку, а
              цепочку переходов: органические молекулы → границы →
              наследование → отбор. Детали этой цепочки пока проверяются.
            </p>
          </div>
        </div>
      </section>

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
              <OptimizedImage src={step.visual.src} alt={step.visual.alt} loading="lazy" decoding="async" />
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
                  <OptimizedImage src={visual.src} alt={visual.alt} loading="lazy" decoding="async" />
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
