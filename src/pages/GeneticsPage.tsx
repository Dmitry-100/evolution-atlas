import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/genetics.css";
import {
  ArrowRight,
  BadgePercent,
  Binary,
  Braces,
  Dna,
  ExternalLink,
  Fingerprint,
  Microscope,
  MousePointer2,
  Network,
  ScanSearch,
  Sparkles,
  CircleStop,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { GlossaryTermById } from "../components/education/GlossaryTerm";
import { ConfidenceBadge } from "../components/education/ConfidenceBadge";
import { ImageLightbox } from "../components/ui/image-lightbox";
import { OptimizedImage } from "../components/ui/optimized-image";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";
import {
  CODON_DEMO,
  GENETICS_EVIDENCE,
  GENETICS_SOURCES,
  GENOME_COMPARISONS,
  MOLECULAR_MARKERS,
  type GenomeComparison,
} from "../data/genetics";

const evidenceIcons = [
  Binary,
  Braces,
  Sparkles,
  CircleStop,
  Network,
  Fingerprint,
  Microscope,
];

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
    caption:
      "ДНК хранит наследственную информацию в последовательности оснований.",
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
    caption:
      "РНК и ДНК используют похожий химический язык, но играют разные роли.",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Difference_DNA_RNA-EN.svg",
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
    sourceUrl:
      "https://www.genome.gov/about-genomics/fact-sheets/RNA-Fact-Sheet",
  },
  evidenceMutations: {
    src: "/assets/images/education/genetics-evidence-mutations.png",
    alt: "Схема мутаций ДНК и эволюционных фильтров в популяции.",
    caption:
      "Мутации создают варианты, а отбор, дрейф и миграция меняют их частоты.",
    sourceUrl:
      "https://evolution.berkeley.edu/dna-and-mutations/causes-of-mutations/",
  },
  evidenceComparison: {
    src: "/assets/images/education/genetics-evidence-comparison.png",
    alt: "Схема сравнения последовательностей ДНК и построения эволюционного дерева.",
    caption: "Сходство последовательностей помогает восстанавливать родство.",
    sourceUrl:
      "https://evolution.berkeley.edu/lines-of-evidence/molecular-biology/",
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
    caption:
      "Общая вирусная вставка в одном месте генома служит редкой меткой родства.",
    sourceUrl:
      "https://evolution.berkeley.edu/lines-of-evidence/molecular-biology/",
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

const comparisonGroups: {
  kind: GenomeComparison["metricKind"];
  title: string;
  description: string;
}[] = [
  {
    kind: "sequence-identity",
    title: "Последовательности ДНК",
    description:
      "Сходство напрямую сравнимых участков. Результат зависит от того, какие отличия учитывают.",
  },
  {
    kind: "coding-identity",
    title: "Кодирующие участки",
    description: "Сравнение участков, по которым клетка собирает белки.",
  },
  {
    kind: "ortholog-share",
    title: "Гены общего происхождения",
    description:
      "Доля узнаваемых родственных генов, а не процент одинаковой ДНК.",
  },
];

const additionalFactIds = CURIOSITY_FACT_PAGE_GROUPS.genetics.filter(
  (id) => !MOLECULAR_MARKERS.some((marker) => marker.id === id),
);

const evidenceVisuals: Record<string, GeneticsVisual> = {
  "shared-code": geneticsVisuals.evidenceCode,
  "rna-translation": geneticsVisuals.evidenceRibosome,
  "mutation-variation": geneticsVisuals.evidenceMutations,
  "comparative-genomics": geneticsVisuals.evidenceComparison,
  "chromosome-2": geneticsVisuals.evidenceChromosome2,
  "viral-fossils": geneticsVisuals.evidenceViralInsertions,
};

export function GeneticsPage() {
  const [activeCodonId, setActiveCodonId] = useState(
    CODON_DEMO[0]?.id ?? "start",
  );
  const [expandedVisual, setExpandedVisual] = useState<GeneticsVisual | null>(
    null,
  );
  const activeCodon =
    CODON_DEMO.find((codon) => codon.id === activeCodonId) ?? CODON_DEMO[0];

  const closeVisual = useCallback(() => setExpandedVisual(null), []);

  return (
    <section
      className="document-page genetics-page"
      data-tour-stop-id="page-genetics"
    >
      <PageHeader
        eyebrow="Молекулярные доказательства"
        title="Как ДНК подтверждает эволюцию и общее происхождение"
      >
        Общий генетический код, сходство ДНК и редкие метки в геноме помогают
        восстановить родство — и проверить его по независимым признакам.
      </PageHeader>

      <ol className="genetics-flow" aria-label="От ДНК к признакам">
        {[
          ["ДНК", "хранит наследственную информацию"],
          ["РНК", "переносит и помогает читать код"],
          ["Белок", "собирается по кодонам"],
          ["Признак", "влияет на организм"],
          ["Отбор", "меняет частоты вариантов"],
        ].map(([title, text], index) => (
          <li key={title}>
            <span className="genetics-step-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong>{title}</strong>
            <p>{text}</p>
          </li>
        ))}
      </ol>

      <section className="codon-lab" aria-labelledby="codon-lab-title">
        <div className="genetics-section-heading">
          <Binary aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Генетический код</p>
            <h2 id="codon-lab-title">Один код на всех</h2>
            <p>
              Тройка букв РНК —{" "}
              <GlossaryTermById id="codon">кодон</GlossaryTermById> — задаёт{" "}
              <GlossaryTermById id="amino-acid">аминокислоту</GlossaryTermById>{" "}
              или стоп-сигнал. Выберите пример и проследите перевод.
            </p>
          </div>
        </div>
        <div className="codon-workbench">
          <div className="codon-controls">
            <p className="codon-control-label" id="codon-choice-label">
              Выберите кодон · ДНК / РНК
            </p>
            <div
              className="codon-buttons"
              role="group"
              aria-labelledby="codon-choice-label"
            >
              {CODON_DEMO.map((codon) => (
                <button
                  key={codon.id}
                  type="button"
                  className={
                    codon.id === activeCodon?.id ? "is-active" : undefined
                  }
                  aria-pressed={codon.id === activeCodon?.id}
                  aria-controls="codon-result"
                  onClick={() => setActiveCodonId(codon.id)}
                >
                  <span>{codon.dnaRu}</span>
                  <small>{codon.rnaRu}</small>
                </button>
              ))}
            </div>
            <p className="codon-transcription-note">
              {activeCodon?.dnaRu === activeCodon?.rnaRu
                ? "В этом примере запись одинакова: GGC в ДНК и РНК."
                : "Выделены T и U в записях ДНК и РНК. Это переписывание, а не мутация."}
            </p>
          </div>

          {activeCodon ? (
            <div
              className="codon-reader"
              id="codon-result"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="codon-sequence">
                <span>ДНК</span>
                <strong aria-label={activeCodon.dnaRu}>
                  {Array.from(activeCodon.dnaRu).map((letter, index) => (
                    <span
                      key={index}
                      className={
                        letter !== activeCodon.rnaRu[index]
                          ? "is-transcribed"
                          : undefined
                      }
                      aria-hidden="true"
                    >
                      {letter}
                    </span>
                  ))}
                </strong>
              </div>
              <ArrowRight
                className="codon-translation-arrow"
                aria-hidden="true"
                size={20}
              />
              <div className="codon-sequence">
                <span>РНК</span>
                <strong aria-label={activeCodon.rnaRu}>
                  {Array.from(activeCodon.rnaRu).map((letter, index) => (
                    <span
                      key={index}
                      className={
                        letter !== activeCodon.dnaRu[index]
                          ? "is-transcribed"
                          : undefined
                      }
                      aria-hidden="true"
                    >
                      {letter}
                    </span>
                  ))}
                </strong>
              </div>
              <div
                className={`codon-meaning${activeCodon.id === "stop" ? " is-stop" : ""}`}
              >
                <span>Результат</span>
                <strong>
                  {activeCodon.id === "stop" ? (
                    <CircleStop aria-hidden="true" size={21} />
                  ) : null}
                  {activeCodon.aminoAcidRu}
                </strong>
              </div>
              <p>{activeCodon.noteRu}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="genetics-molecule-gallery"
        aria-labelledby="genetics-molecule-title"
      >
        <div className="genetics-section-heading">
          <Dna aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Молекулы наследования</p>
            <h2 id="genetics-molecule-title">Код, копия и переводчик</h2>
            <p>Три участника передачи наследственной информации.</p>
          </div>
        </div>
        <div className="molecule-gallery-grid">
          {moleculeGallery.map((item) => (
            <article key={item.title} className="molecule-card">
              <button
                type="button"
                className="genetics-image-zoom"
                aria-label={`Увеличить иллюстрацию: ${item.title}`}
                aria-haspopup="dialog"
                onClick={() => setExpandedVisual(item.visual)}
              >
                <OptimizedImage
                  src={item.visual.src}
                  alt={item.visual.alt}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <div className="molecule-card-copy">
                <span>{item.subtitle}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="genome-comparison-section"
        aria-labelledby="genome-comparison-title"
      >
        <div className="genetics-section-heading">
          <BadgePercent aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Проценты сходства</p>
            <h2 id="genome-comparison-title">
              Насколько похожа ДНК человека и шимпанзе?
            </h2>
            <p>
              Проценты полезны, но только если ясно, что именно сравнивают: весь
              выравниваемый геном, кодирующие участки, отдельные гены или
              консервативные функции.
            </p>
          </div>
        </div>

        <div className="genome-comparison-groups">
          {comparisonGroups.map((group) => (
            <section
              className="genome-comparison-group"
              key={group.kind}
              aria-labelledby={`metric-${group.kind}`}
            >
              <div className="genome-comparison-metric">
                <h3 id={`metric-${group.kind}`}>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className="genome-comparison-grid">
                {GENOME_COMPARISONS.filter(
                  (comparison) => comparison.metricKind === group.kind,
                ).map((comparison) => (
                  <article
                    key={comparison.id}
                    className="genome-comparison-card"
                    data-metric-kind={comparison.metricKind}
                  >
                    <h4>{comparison.titleRu}</h4>
                    <strong>{comparison.valueRu}</strong>
                    <p className="genome-comparison-definition">
                      {comparison.metricRu}
                    </p>
                    <p>{comparison.meaningRu}</p>
                    <small>{comparison.cautionRu}</small>
                    <a
                      href={comparison.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Источник <ExternalLink aria-hidden="true" size={14} />
                    </a>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section
        className="genetics-evidence-section"
        aria-labelledby="genetics-evidence-title"
      >
        <div className="genetics-section-heading">
          <ScanSearch aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">ДНК и дерево сходятся</p>
            <h2 id="genetics-evidence-title">Геном хранит ещё и историю</h2>
            <p>
              Независимые признаки — от общего кода до{" "}
              <GlossaryTermById id="chromosome-2">
                слияния хромосом
              </GlossaryTermById>{" "}
              и{" "}
              <GlossaryTermById id="endogenous-retroviruses">
                наследуемых вирусных вставок
              </GlossaryTermById>{" "}
              — помогают проверить общее происхождение.
            </p>
          </div>
        </div>

        <div className="genetics-evidence-grid">
          {GENETICS_EVIDENCE.map((item, index) => {
            const Icon = evidenceIcons[index] ?? Dna;
            const visual = evidenceVisuals[item.id];
            const marker = MOLECULAR_MARKERS.find(
              (candidate) => candidate.id === item.id,
            );
            const sources =
              marker && marker.source.url !== item.source.url
                ? [item.source, marker.source]
                : [item.source];
            return (
              <article
                key={item.id}
                className="genetics-evidence-card"
                data-evidence-id={item.id}
              >
                {visual ? (
                  <figure className="genetics-evidence-media">
                    <button
                      type="button"
                      className="genetics-evidence-zoom genetics-image-zoom"
                      aria-haspopup="dialog"
                      onClick={() => setExpandedVisual(visual)}
                      aria-label={`Увеличить схему: ${visual.caption}`}
                    >
                      <OptimizedImage
                        src={visual.src}
                        alt={visual.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                    <figcaption>{visual.caption}</figcaption>
                  </figure>
                ) : null}
                <div className="genetics-evidence-heading">
                  <Icon aria-hidden="true" size={22} />
                  <h3
                    id={
                      item.id === "chromosome-2"
                        ? "molecular-scars-title"
                        : undefined
                    }
                  >
                    {item.id === "chromosome-2"
                      ? "Почему у человека 46 хромосом, а у шимпанзе 48?"
                      : item.titleRu}
                  </h3>
                </div>
                <dl>
                  <div>
                    <dt>Наблюдение</dt>
                    <dd>{item.shortRu}</dd>
                  </div>
                  <div>
                    <dt>Что это показывает</dt>
                    <dd>
                      {item.id === "viral-fossils"
                        ? "Совпадение редких вставок в одних и тех же местах помогает проверять родство линий."
                        : item.whyItMattersRu}
                    </dd>
                  </div>
                </dl>
                <div className="genetics-evidence-sources">
                  {marker ? (
                    <ConfidenceBadge level={marker.confidence} />
                  ) : null}
                  {sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.label}
                      <ExternalLink aria-hidden="true" size={14} />
                    </a>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CuriosityFacts
        factIds={additionalFactIds}
        eyebrow="Разные линии наследования"
        title="Митохондрии, Ева и Адам"
        description="История клеточного симбиоза и двух отдельных линий родства."
        headingId="genetics-curiosity-facts"
      />

      <div className="genetics-sources">
        {GENETICS_SOURCES.slice(0, 8).map((source) => (
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

      <div className="genetics-bridge">
        <div>
          <MousePointer2 aria-hidden="true" size={22} />
          <div>
            <strong>Теперь посмотрите это на дереве</strong>
            <p>
              Кладограмма показывает ту же идею визуально: общие признаки и
              геномы складываются в ветвящееся родство.
            </p>
          </div>
        </div>
        <Link className="button button-secondary button-md" to="/cladogram">
          Открыть дерево
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>

      <ImageLightbox
        image={expandedVisual}
        ariaLabel="Увеличенная схема"
        onClose={closeVisual}
      />
    </section>
  );
}
