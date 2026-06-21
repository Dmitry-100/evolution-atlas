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
  Maximize2,
  ScanSearch,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "../components/ui/optimized-image";
import {
  CODON_DEMO,
  GENETICS_EVIDENCE,
  GENETICS_SOURCES,
  GENOME_COMPARISONS,
} from "../data/genetics";

const evidenceIcons = [Binary, Braces, Sparkles, Network, Fingerprint, Microscope];

type GeneticsVisual = {
  src: string;
  alt: string;
  caption: string;
  sourceUrl: string;
};

const geneticsVisuals: Record<string, GeneticsVisual> = {
  dna: {
    src: "/assets/images/education/genetics-dna-generated.jpg",
    alt: "AI-визуализация двойной спирали ДНК и генетической записи.",
    caption: "ДНК хранит наследственную информацию в последовательности оснований.",
    sourceUrl: "https://en.wikipedia.org/wiki/DNA",
  },
  rna: {
    src: "/assets/images/education/genetics-rna-generated.jpg",
    alt: "AI-визуализация молекулы РНК как рабочей копии генетического кода.",
    caption: "РНК переносит, читает и иногда сама выполняет работу в клетке.",
    sourceUrl: "https://en.wikipedia.org/wiki/RNA",
  },
  rnaDna: {
    src: "/assets/images/education/genetics-rna-dna-generated.jpg",
    alt: "AI-визуализация связи РНК и ДНК в общем химическом языке наследования.",
    caption: "РНК и ДНК используют похожий химический язык, но играют разные роли.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Difference_DNA_RNA-EN.svg",
  },
  ribosome: {
    src: "/assets/images/education/genetics-ribosome-generated.jpg",
    alt: "AI-визуализация рибосомы, читающей РНК и собирающей белок.",
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
  evidenceCode: {
    src: "/assets/images/education/genetics-evidence-code.png",
    alt: "Схема: ДНК переписывается в РНК, а кодоны переводятся в аминокислоты.",
    caption: "ДНК -> РНК -> аминокислоты: общий принцип генетического кода.",
    sourceUrl: "https://www.genome.gov/genetics-glossary/Codon",
  },
  evidenceRibosome: {
    src: "/assets/images/education/genetics-evidence-ribosome.png",
    alt: "Схема трансляции: мРНК, тРНК и рибосома собирают белок.",
    caption: "Рибосома читает мРНК и собирает белок из аминокислот.",
    sourceUrl: "https://www.genome.gov/about-genomics/fact-sheets/RNA-Fact-Sheet",
  },
  evidenceMutations: {
    src: "/assets/images/education/genetics-evidence-mutations.png",
    alt: "Схема мутаций ДНК и эволюционных фильтров в популяции.",
    caption: "Мутации создают варианты, а отбор, дрейф и миграция меняют их частоты.",
    sourceUrl: "https://evolution.berkeley.edu/dna-and-mutations/causes-of-mutations/",
  },
  evidenceComparison: {
    src: "/assets/images/education/genetics-evidence-comparison.png",
    alt: "Схема сравнения последовательностей ДНК и построения эволюционного дерева.",
    caption: "Сходство последовательностей помогает восстанавливать родство.",
    sourceUrl: "https://evolution.berkeley.edu/lines-of-evidence/molecular-biology/",
  },
  evidenceChromosome2: {
    src: "/assets/images/education/genetics-evidence-chromosome-2.png",
    alt: "Схема слияния двух древних хромосом в хромосому 2 человека.",
    caption: "Хромосома 2 несет след слияния двух предковых хромосом.",
    sourceUrl: "https://en.wikipedia.org/wiki/Chromosome_2",
  },
  evidenceViralInsertions: {
    src: "/assets/images/education/genetics-evidence-viral-insertions.png",
    alt: "Схема вирусной вставки как общего генетического маркера родственных линий.",
    caption: "Общая вирусная вставка в одном месте генома работает как редкая метка родства.",
    sourceUrl: "https://evolution.berkeley.edu/lines-of-evidence/molecular-biology/",
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
    visual: geneticsVisuals.rna,
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

const evidenceVisuals: Record<string, GeneticsVisual> = {
  "shared-code": geneticsVisuals.evidenceCode,
  "rna-translation": geneticsVisuals.evidenceRibosome,
  "mutation-variation": geneticsVisuals.evidenceMutations,
  "comparative-genomics": geneticsVisuals.evidenceComparison,
  "chromosome-2": geneticsVisuals.evidenceChromosome2,
  "viral-fossils": geneticsVisuals.evidenceViralInsertions,
};

export function GeneticsPage() {
  const [activeCodonId, setActiveCodonId] = useState(CODON_DEMO[0]?.id ?? "start");
  const [expandedVisual, setExpandedVisual] = useState<GeneticsVisual | null>(null);
  const activeCodon =
    CODON_DEMO.find((codon) => codon.id === activeCodonId) ?? CODON_DEMO[0];

  useEffect(() => {
    if (!expandedVisual) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpandedVisual(null);
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedVisual]);

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
      </div>

      <section className="theory-bridge-band atlas-note-band">
        <div>
          <Star aria-hidden="true" size={22} />
          <div>
            <strong>Главная мысль</strong>
            <p>
              Чем ближе родство, тем больше совпадений в ДНК; редкие общие метки
              в одних и тех же местах особенно трудно объяснить без общего
              происхождения.
            </p>
          </div>
        </div>
      </section>

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
              <OptimizedImage src={item.visual.src} alt={item.visual.alt} loading="lazy" decoding="async" />
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
                    <button
                      type="button"
                      className="genetics-evidence-zoom"
                      onClick={() => setExpandedVisual(visual)}
                      aria-label={`Увеличить схему: ${visual.caption}`}
                    >
                      <OptimizedImage src={visual.src} alt={visual.alt} loading="lazy" decoding="async" />
                      <span>
                        <Maximize2 aria-hidden="true" size={15} />
                        Увеличить
                      </span>
                    </button>
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

      {expandedVisual ? (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Увеличенная схема"
          onClick={() => setExpandedVisual(null)}
        >
          <div className="image-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="image-lightbox-close"
              onClick={() => setExpandedVisual(null)}
              aria-label="Закрыть увеличенную схему"
            >
              <X aria-hidden="true" size={20} />
            </button>
            <OptimizedImage src={expandedVisual.src} alt={expandedVisual.alt} />
            <p>{expandedVisual.caption}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
