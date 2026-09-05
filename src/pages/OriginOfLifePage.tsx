import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/origin-of-life.css";
import {
  Atom,
  CircleDot,
  FlaskConical,
  Network,
  Orbit,
  Sparkles,
  Waves,
} from "lucide-react";
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { GlossaryTermById } from "../components/education/GlossaryTerm";
import { LucaExhibit } from "../components/education/LucaExhibit";
import { OptimizedImage } from "../components/ui/optimized-image";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";
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
    caption:
      "Первичный бульон: энергия ранней Земли могла собирать простые вещества в органические молекулы.",
    sourceUrl: "generated",
  },
  "rna-world": {
    src: "/assets/images/education/origin-rna-world-generated.jpg",
    alt: "AI-визуализация РНК-мира: молекулы РНК внутри протоклеточной оболочки и каталитические реакции.",
    caption:
      "РНК-мир: одна молекула могла хранить информацию и ускорять реакции.",
    sourceUrl: "generated",
  },
  "hydrothermal-vents": {
    src: "/assets/images/education/origin-hydrothermal-vent-generated.jpg",
    alt: "AI-визуализация гидротермального источника на океаническом дне с минеральными трубами и потоками горячей воды.",
    caption:
      "Гидротермальные источники: энергия, минералы и микрокамеры на дне океана.",
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
    caption:
      "Простая химия могла собираться в более сложные органические молекулы.",
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
    caption:
      "Наследование начинается, когда удачные молекулярные варианты могут копироваться.",
    sourceUrl: "generated",
  },
  "metabolism-first": {
    src: "/assets/images/education/origin-metabolism-first-generated.jpg",
    alt: "AI-визуализация пористых минеральных поверхностей как сети микрореакторов для ранних химических циклов.",
    caption:
      "Метаболизм сначала: минеральные поры могли поддерживать устойчивые сети реакций.",
    sourceUrl: "generated",
  },
  "lipid-world": {
    src: "/assets/images/education/origin-lipid-protocells-generated.jpg",
    alt: "AI-визуализация липидной протоклетки: мембранный пузырек удерживает органические молекулы внутри.",
    caption:
      "Липидные протоклетки: мембранные пузырьки могли удерживать внутреннюю химию вместе.",
    sourceUrl: "generated",
  },
  panspermia: {
    src: "/assets/images/education/origin-panspermia-generated.jpg",
    alt: "AI-визуализация метеоритного потока над молодой Землей с океаном, вулканами и раскаленными обломками.",
    caption:
      "Панспермия: метеориты и кометы могли доставлять органику на молодую Землю.",
    sourceUrl: "generated",
  },
};

const originJourney = [
  {
    id: "page-origin-energy",
    title: "Химия и энергия",
    text: "молнии, ультрафиолет, вулканы и гидротермальные источники",
    visual: originVisuals["step-energy"],
  },
  {
    id: "page-origin-organics",
    title: "Органика",
    text: "аминокислоты, сахара и азотистые основания как химические заготовки",
    visual: originVisuals["step-organics"],
  },
  {
    id: "page-origin-membranes",
    title: "Протоклетки",
    text: "липидные оболочки удерживают молекулы рядом друг с другом",
    visual: originVisuals["step-membranes"],
  },
  {
    id: "page-origin-inheritance",
    title: "Наследование и отбор",
    text: "копирование молекул даёт наследуемые различия, на которые может действовать отбор",
    visual: originVisuals["step-inheritance"],
  },
];

export function OriginOfLifePage() {
  return (
    <section
      className="document-page origin-page"
      data-tour-stop-id="page-origin-of-life"
    >
      <PageHeader
        eyebrow="До первой клетки"
        title="Как появилась жизнь на Земле: основные научные гипотезы"
      >
        <GlossaryTermById id="abiogenesis">Абиогенез</GlossaryTermById> — переход
        от неживой химии к первым клеточным системам. Единственного
        подтверждённого сценария пока нет.
      </PageHeader>

      <section
        className="origin-visual-story"
        aria-labelledby="origin-visual-story-title"
      >
        <div className="origin-section-heading">
          <Network aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Химия становится биологией</p>
            <h2 id="origin-visual-story-title">Цепочка переходов</h2>
            <p>
              От простых реакций к системам с границей, наследованием и отбором.
            </p>
          </div>
        </div>
        <ol className="origin-story-grid" aria-label="Возможные переходы от химии к жизни">
          {originJourney.map((step, index) => (
            <li
              key={step.title}
              className="origin-story-card"
              data-tour-stop-id={step.id}
            >
              <span className="origin-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <OptimizedImage
                src={step.visual.src}
                alt={step.visual.alt}
                loading="lazy"
                decoding="async"
              />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="origin-story-note">
          Это схема возможных переходов к жизни, а не установленная хронология:
          порядок ранних процессов пока обсуждается.
        </p>
      </section>

      <LucaExhibit />

      <CuriosityFacts
        factIds={CURIOSITY_FACT_PAGE_GROUPS.origin}
        eyebrow="Когда отход стал ресурсом"
        title="Жизнь изменила планету раньше животных"
        description="Кислородная катастрофа отравила прежний мир и одновременно открыла дорогу новому обмену веществ."
        headingId="origin-curiosity-facts"
      />

      <div className="origin-section-heading origin-hypotheses-heading">
        <FlaskConical aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Рабочие модели</p>
          <h2>Основные гипотезы происхождения жизни</h2>
          <p>
            Эти сценарии не обязательно исключают друг друга: разные процессы
            могли быть частями одного перехода от химии к первым клеткам.
          </p>
        </div>
      </div>

      <div className="origin-hypotheses-grid">
        {ORIGIN_HYPOTHESES.map((hypothesis, index) => {
          const Icon = icons[index] ?? Sparkles;
          const visual = originVisuals[hypothesis.id];
          return (
            <article
              key={hypothesis.id}
              className="origin-hypothesis-card"
              data-tour-stop-id={`page-origin-${hypothesis.id}`}
            >
              {visual ? (
                <figure className="origin-hypothesis-media">
                  <OptimizedImage
                    src={visual.src}
                    alt={visual.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>{visual.caption}</figcaption>
                </figure>
              ) : null}
              <div className="origin-card-heading">
                <p className="origin-hypothesis-status">
                  <Icon aria-hidden="true" size={18} />
                  {hypothesis.statusRu}
                </p>
                <h3>{hypothesis.titleRu}</h3>
              </div>
              <p>{hypothesis.shortRu}</p>
              <dl>
                <div>
                  <dt>Механизм</dt>
                  <dd>{hypothesis.mechanismRu}</dd>
                </div>
                <div>
                  <dt>Подтверждения</dt>
                  <dd>{hypothesis.evidenceRu}</dd>
                </div>
                <div>
                  <dt>Открытый вопрос</dt>
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
