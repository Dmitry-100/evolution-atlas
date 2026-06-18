import {
  ArrowRight,
  BadgePercent,
  Binary,
  BookOpenCheck,
  Braces,
  Dna,
  ExternalLink,
  Fingerprint,
  GitBranch,
  Microscope,
  MousePointer2,
  Network,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CODON_DEMO,
  GENETICS_EVIDENCE,
  GENETICS_SOURCES,
  GENOME_COMPARISONS,
} from "../data/genetics";

const evidenceIcons = [Binary, Braces, Sparkles, Network, Fingerprint, Microscope];

const geneticsVisuals = {
  dna: {
    src: "/assets/images/education/genetics-dna.png",
    alt: "Схема связи хромосомы, ДНК и гена.",
    caption: "ДНК хранит наследственную информацию в последовательности оснований.",
    sourceUrl: "https://en.wikipedia.org/wiki/DNA",
  },
  rnaDna: {
    src: "/assets/images/education/genetics-rna-dna.png",
    alt: "Сравнение структуры РНК и ДНК с разными основаниями.",
    caption: "РНК и ДНК используют похожий химический язык, но играют разные роли.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Difference_DNA_RNA-EN.svg",
  },
  ribosome: {
    src: "/assets/images/education/genetics-ribosome.png",
    alt: "Трехмерная форма рибосомы.",
    caption: "Рибосома читает РНК и собирает белки.",
    sourceUrl: "https://en.wikipedia.org/wiki/Ribosome",
  },
  chromosome2: {
    src: "/assets/images/education/genetics-chromosome-2.png",
    alt: "Фрагмент кариотипа человека с хромосомой 2.",
    caption: "Хромосома 2 несет след слияния двух предковых хромосом.",
    sourceUrl: "https://en.wikipedia.org/wiki/Chromosome_2",
  },
  mutation: {
    src: "/assets/images/education/genetics-mutation.png",
    alt: "Схема хромосомных мутаций.",
    caption: "Мутации создают наследуемую изменчивость.",
    sourceUrl: "https://en.wikipedia.org/wiki/Mutation",
  },
};

const moleculeGallery = [
  {
    title: "ДНК",
    subtitle: "архив",
    text: "долговременное хранение наследственной инструкции",
    visual: geneticsVisuals.dna,
  },
  {
    title: "РНК",
    subtitle: "рабочая копия",
    text: "передает, регулирует и иногда ускоряет реакции",
    visual: geneticsVisuals.rnaDna,
  },
  {
    title: "Рибосома",
    subtitle: "переводчик",
    text: "собирает белки по последовательности кодонов",
    visual: geneticsVisuals.ribosome,
  },
];

const comparisonVisuals: Record<string, { percent: number; label: string }> = {
  "human-human": { percent: 99.9, label: "почти одна и та же инструкция" },
  "human-chimp": { percent: 98.8, label: "очень близкая сестринская ветвь" },
  "human-mouse": { percent: 85, label: "общая млекопитающая основа" },
  "human-fly": { percent: 60, label: "древний общий набор генов" },
  "human-banana": { percent: 25, label: "следы глубокой клеточной родни" },
};

const evidenceVisuals: Record<string, (typeof geneticsVisuals)[keyof typeof geneticsVisuals]> = {
  "shared-code": geneticsVisuals.rnaDna,
  "rna-translation": geneticsVisuals.ribosome,
  "mutation-variation": geneticsVisuals.mutation,
  "comparative-genomics": geneticsVisuals.dna,
  "chromosome-2": geneticsVisuals.chromosome2,
  "viral-fossils": geneticsVisuals.mutation,
};

export function GeneticsPage() {
  const [activeCodonId, setActiveCodonId] = useState(CODON_DEMO[0]?.id ?? "start");
  const activeCodon =
    CODON_DEMO.find((codon) => codon.id === activeCodonId) ?? CODON_DEMO[0];

  return (
    <section className="document-page genetics-page">
      <div className="genetics-hero">
        <div>
          <p className="eyebrow">Молекулярные доказательства</p>
          <h1>РНК/ДНК: родство записано в коде</h1>
          <p>
            Ископаемые показывают форму, а геномы показывают инструкцию. Современная молекулярная генетика объясняет
            эволюцию через наследование, мутации, общий генетический код и сравнение последовательностей, из которых
            можно строить родственные деревья.
          </p>
        </div>
        <div className="genetics-hero-panel">
          <figure className="genetics-hero-image">
            <img
              src="/assets/images/education/genetics-rna-dna.png"
              alt="Сравнение молекулярной структуры РНК и ДНК."
            />
            <figcaption>общий химический язык наследования</figcaption>
          </figure>
          <div className="genetics-answer-card">
            <Dna aria-hidden="true" size={34} />
            <strong>Главная мысль</strong>
            <span>
              Чем ближе родство, тем больше совпадений в ДНК; редкие общие метки в одних и тех же местах особенно трудно
              объяснить без общего происхождения.
            </span>
          </div>
        </div>
      </div>

      <div className="genetics-flow" aria-label="От ДНК к признакам">
        {[
          ["ДНК", "хранит наследственную информацию"],
          ["РНК", "переносит и помогает читать код"],
          ["Белок", "собирается по кодонам"],
          ["Признак", "влияет на организм"],
          ["Отбор", "меняет частоты вариантов"],
        ].map(([title, text]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{text}</span>
          </article>
        ))}
      </div>

      <section className="genetics-molecule-gallery" aria-labelledby="genetics-molecule-title">
        <div className="genetics-section-heading">
          <Dna aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Молекулы крупно</p>
            <h2 id="genetics-molecule-title">Код, копия и переводчик</h2>
            <p>
              Эволюция становится видимой на молекулярном уровне: информация копируется,
              читается и иногда меняется, а эти изменения наследуются.
            </p>
          </div>
        </div>
        <div className="molecule-gallery-grid">
          {moleculeGallery.map((item) => (
            <article key={item.title} className="molecule-card">
              <img src={item.visual.src} alt={item.visual.alt} loading="lazy" decoding="async" />
              <div>
                <span>{item.subtitle}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="codon-lab" aria-labelledby="codon-lab-title">
        <div className="codon-lab-copy">
          <p className="eyebrow">Мини-лаборатория</p>
          <h2 id="codon-lab-title">Один и тот же принцип перевода</h2>
          <p>
            Генетический код читается тройками. ДНК-триплет переписывается в РНК-кодон, а кодон указывает аминокислоту
            или стоп-сигнал. Именно этот общий переводчик делает молекулярное родство таким убедительным.
          </p>
          <div className="codon-buttons" aria-label="Выберите кодон">
            {CODON_DEMO.map((codon) => (
              <button
                key={codon.id}
                type="button"
                className={codon.id === activeCodon?.id ? "is-active" : undefined}
                onClick={() => setActiveCodonId(codon.id)}
              >
                <span>{codon.dnaRu}</span>
                <small>{codon.rnaRu}</small>
              </button>
            ))}
          </div>
        </div>

        {activeCodon ? (
          <div className="codon-reader" aria-live="polite">
            <div>
              <span>ДНК</span>
              <strong>{activeCodon.dnaRu}</strong>
            </div>
            <ArrowRight aria-hidden="true" size={20} />
            <div>
              <span>РНК</span>
              <strong>{activeCodon.rnaRu}</strong>
            </div>
            <ArrowRight aria-hidden="true" size={20} />
            <div>
              <span>смысл</span>
              <strong>{activeCodon.aminoAcidRu}</strong>
            </div>
            <p>{activeCodon.noteRu}</p>
          </div>
        ) : null}
      </section>

      <section className="genome-comparison-section" aria-labelledby="genome-comparison-title">
        <div className="genetics-section-heading">
          <BadgePercent aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Проценты сходства</p>
            <h2 id="genome-comparison-title">Как читать “одинаковый геном”</h2>
            <p>
              Проценты полезны, но только если ясно, что именно сравнивают: весь выравниваемый геном, кодирующие
              участки, отдельные гены или консервативные функции.
            </p>
          </div>
        </div>

        <div className="genome-comparison-grid">
          {GENOME_COMPARISONS.map((comparison) => (
            <article key={comparison.id} className="genome-comparison-card">
              <span>{comparison.titleRu}</span>
              <strong>{comparison.valueRu}</strong>
              <div
                className="genome-comparison-meter"
                aria-label={`${comparisonVisuals[comparison.id]?.percent ?? 0}%`}
              >
                <i style={{ width: `${comparisonVisuals[comparison.id]?.percent ?? 0}%` }} />
              </div>
              <b>{comparisonVisuals[comparison.id]?.label}</b>
              <p>{comparison.metricRu}</p>
              <div className="genome-comparison-proof">
                <BookOpenCheck aria-hidden="true" size={17} />
                <p>{comparison.meaningRu}</p>
              </div>
              <small>{comparison.cautionRu}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="genetics-evidence-section" aria-labelledby="genetics-evidence-title">
        <div className="genetics-section-heading">
          <ScanSearch aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Почему это сильное доказательство</p>
            <h2 id="genetics-evidence-title">Геном хранит не только сходство, но и историю</h2>
            <p>
              Для эволюции важно не одно число, а совпадающий набор независимых признаков: код, мутации, редкие вставки,
              перестройки хромосом и деревья родства из разных генов.
            </p>
          </div>
        </div>

        <div className="genetics-evidence-grid">
          {GENETICS_EVIDENCE.map((item, index) => {
            const Icon = evidenceIcons[index] ?? Dna;
            const visual = evidenceVisuals[item.id];
            return (
              <article key={item.id} className="genetics-evidence-card">
                {visual ? (
                  <figure className="genetics-evidence-media">
                    <img src={visual.src} alt={visual.alt} loading="lazy" decoding="async" />
                    <figcaption>{visual.caption}</figcaption>
                  </figure>
                ) : null}
                <Icon aria-hidden="true" size={24} />
                <h3>{item.titleRu}</h3>
                <p>{item.shortRu}</p>
                <strong>{item.whyItMattersRu}</strong>
                <a href={item.source.url} target="_blank" rel="noreferrer">
                  {item.source.label}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="genetics-note" aria-labelledby="genetics-note-title">
        <GitBranch aria-hidden="true" size={24} />
        <div>
          <h2 id="genetics-note-title">Почему это делает эволюцию очевиднее</h2>
          <p>
            Молекулярные данные работают как независимая проверка атласа: если линии действительно ветвились, то ДНК
            должна сохранять вложенный рисунок родства. Именно это и видно: человек ближе к шимпанзе, чем к мыши; мышь
            ближе к нам, чем дрозофила; а у всех живых систем остаются глубокие общие механизмы чтения наследственной
            информации.
          </p>
        </div>
      </section>

      <div className="genetics-sources">
        {GENETICS_SOURCES.slice(0, 8).map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        ))}
      </div>

      <div className="genetics-bridge">
        <div>
          <MousePointer2 aria-hidden="true" size={22} />
          <div>
            <strong>Теперь посмотрите это на дереве</strong>
            <p>Кладограмма показывает ту же идею визуально: общие признаки и геномы складываются в ветвящееся родство.</p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/cladogram">
          Открыть дерево
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
