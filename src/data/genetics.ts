import type { SourceRef } from "./lineage";

export type GeneticsEvidence = {
  id: string;
  titleRu: string;
  shortRu: string;
  whyItMattersRu: string;
  source: SourceRef;
};

export type GenomeComparison = {
  id: string;
  titleRu: string;
  valueRu: string;
  metricRu: string;
  meaningRu: string;
  cautionRu: string;
  source: SourceRef;
};

export type CodonDemo = {
  id: string;
  dnaRu: string;
  rnaRu: string;
  aminoAcidRu: string;
  noteRu: string;
};

const source = (label: string, url: string): SourceRef => ({ label, url });

export const GENETICS_SOURCES: SourceRef[] = [
  source("NHGRI: Human Genomic Variation", "https://www.genome.gov/about-genomics/educational-resources/fact-sheets/human-genomic-variation"),
  source("NHGRI: Chimp-human genome comparison", "https://www.genome.gov/15515096/2005-release-new-genome-comparison-finds-chimps-humans-very-similar-at-dna-level"),
  source("NHGRI: Why Mouse Matters", "https://www.genome.gov/10001345/importance-of-mouse-genome"),
  source("NHGRI: Comparative Genomics Fact Sheet", "https://www.genome.gov/about-genomics/fact-sheets/Comparative-Genomics-Fact-Sheet"),
  source("NHGRI: Codon", "https://www.genome.gov/genetics-glossary/Codon"),
  source("NHGRI: RNA Fact Sheet", "https://www.genome.gov/about-genomics/educational-resources/fact-sheets/ribonucleic-acid-fact-sheet"),
  source("Understanding Evolution: Lines of Evidence", "https://evolution.berkeley.edu/lines-of-evidence/"),
  source("Understanding Evolution: Causes of mutations", "https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/the-causes-of-mutations/"),
  source("Genome.gov: Chromosomes 2 and 4", "https://www.genome.gov/13514624/2005-release-scientists-analyze-chromosomes-2-and-4"),
  source("PNAS: origin of human chromosome 2", "https://pmc.ncbi.nlm.nih.gov/articles/PMC52649/"),
  source("NCBI Bookshelf: human endogenous retroviruses", "https://www.ncbi.nlm.nih.gov/books/NBK6235/"),
  source("Dessimoz Lab: The Banana Conjecture", "https://lab.dessimoz.org/blog/2020/12/08/human-banana-orthologs"),
];

export const GENOME_COMPARISONS: GenomeComparison[] = [
  {
    id: "human-human",
    titleRu: "Два человека",
    valueRu: ">99%",
    metricRu: "часто говорят около 99,9% по однонуклеотидным отличиям",
    meaningRu:
      "Все люди чрезвычайно близки генетически, а индивидуальность создают миллионы небольших вариантов, регуляция, среда и жизненная история.",
    cautionRu:
      "NHGRI прямо отмечает: 99,9% - полезное упрощение, потому что структурные варианты и повторы тоже важны.",
    source: GENETICS_SOURCES[0],
  },
  {
    id: "human-chimp",
    titleRu: "Человек и шимпанзе",
    valueRu: "98,8%",
    metricRu: "в напрямую сравнимых участках ДНК; около 96% с учетом вставок и удалений",
    meaningRu:
      "Такой уровень сходства хорошо совпадает с идеей близких родственных ветвей, разошедшихся от общего предка.",
    cautionRu:
      "Это не значит, что человек 'на 98,8% шимпанзе': важны и отличия, и регуляция, и то, где именно меняется последовательность.",
    source: GENETICS_SOURCES[1],
  },
  {
    id: "human-mouse",
    titleRu: "Человек и мышь",
    valueRu: "85%",
    metricRu: "средняя идентичность белок-кодирующих участков",
    meaningRu:
      "Мышь далеко от человека на дереве, но многие базовые гены млекопитающих узнаваемо похожи, поэтому мыши важны в биомедицине.",
    cautionRu:
      "Это не та же метрика, что 98,8% с шимпанзе: здесь речь о кодирующих участках, а не о полном выравнивании генома.",
    source: GENETICS_SOURCES[2],
  },
  {
    id: "human-fly",
    titleRu: "Человек и дрозофила",
    valueRu: "~60%",
    metricRu: "доля консервативных генов в сравнении fly-human",
    meaningRu:
      "Даже очень дальние животные ветви сохраняют часть древнего набора генов, связанных с клеточными и развивающимися процессами.",
    cautionRu:
      "Это не '60% одинакового генома', а доля генов с узнаваемым общим происхождением в конкретном сравнении.",
    source: GENETICS_SOURCES[3],
  },
  {
    id: "human-banana",
    titleRu: "Человек и банан",
    valueRu: "17-25%",
    metricRu: "оценка доли человеческих белок-кодирующих генов с ортологами у банана в сравнении OMA/ортологов",
    meaningRu:
      "Даже у растений и животных остаются древние общие гены клеточной жизни: копирование ДНК, обмен веществ, работа белков и базовая регуляция.",
    cautionRu:
      "Это не '50% одинаковой ДНК' и не сходство всего генома: речь только о распознаваемых родственных белок-кодирующих генах.",
    source: GENETICS_SOURCES[11],
  },
];

export const GENETICS_EVIDENCE: GeneticsEvidence[] = [
  {
    id: "shared-code",
    titleRu: "Единый язык кодонов",
    shortRu:
      "ДНК и РНК читаются тройками букв: 64 кодона задают аминокислоты или стоп-сигналы. Варианты кода редки и обычно малы.",
    whyItMattersRu:
      "Если жизнь возникала бы независимо много раз, мы ожидали бы разные таблицы перевода. Почти общий код выглядит как наследство от древнего общего источника.",
    source: GENETICS_SOURCES[4],
  },
  {
    id: "rna-translation",
    titleRu: "РНК соединяет ген и белок",
    shortRu:
      "mRNA переносит информацию от ДНК к рибосоме, tRNA подбирает аминокислоты, а рибосома собирает белок.",
    whyItMattersRu:
      "Один и тот же принцип работы у бактерий, растений, грибов и животных показывает глубоко общий клеточный механизм.",
    source: GENETICS_SOURCES[5],
  },
  {
    id: "mutation-variation",
    titleRu: "Мутации дают материал для отбора",
    shortRu:
      "Изменения в ДНК/РНК создают наследуемые варианты; отбор, дрейф, миграция и случайность меняют их частоты в популяциях.",
    whyItMattersRu:
      "Молекулярная генетика показывает механизм, которого не было у Дарвина: откуда берется наследуемая изменчивость.",
    source: GENETICS_SOURCES[7],
  },
  {
    id: "comparative-genomics",
    titleRu: "Сходство убывает с расстоянием родства",
    shortRu:
      "Близкие ветви имеют больше похожих последовательностей, дальние - меньше, а функциональные участки часто сохраняются сильнее.",
    whyItMattersRu:
      "Это превращает родство в проверяемое предсказание: деревья по ДНК должны согласовываться с анатомией и ископаемыми.",
    source: GENETICS_SOURCES[6],
  },
  {
    id: "chromosome-2",
    titleRu: "Хромосома 2 как редкая метка",
    shortRu:
      "У человека 23 пары хромосом, у других больших человекообразных - 24. Данные указывают, что человеческая хромосома 2 возникла слиянием двух предковых хромосом.",
    whyItMattersRu:
      "Это не просто 'похожесть', а след конкретного события в линии после расхождения с другими человекообразными.",
    source: GENETICS_SOURCES[8],
  },
  {
    id: "viral-fossils",
    titleRu: "Вирусные следы в геноме",
    shortRu:
      "Эндогенные ретровирусы - древние вставки вирусного происхождения, которые могут наследоваться вместе с геномом.",
    whyItMattersRu:
      "Когда редкие вставки сравнивают между линиями, они работают как молекулярные метки происхождения и помогают уточнять ветвление.",
    source: GENETICS_SOURCES[10],
  },
];

export const CODON_DEMO: CodonDemo[] = [
  {
    id: "start",
    dnaRu: "ATG",
    rnaRu: "AUG",
    aminoAcidRu: "метионин / старт",
    noteRu:
      "AUG часто служит стартовым сигналом: рибосома понимает, где начинать сборку белка.",
  },
  {
    id: "gly",
    dnaRu: "GGC",
    rnaRu: "GGC",
    aminoAcidRu: "глицин",
    noteRu:
      "Та же логика кодона работает в очень разных организмах: это исторически унаследованный переводчик.",
  },
  {
    id: "trp",
    dnaRu: "TGG",
    rnaRu: "UGG",
    aminoAcidRu: "триптофан",
    noteRu:
      "Одна замена буквы может изменить аминокислоту, не изменить смысл или создать стоп-сигнал.",
  },
  {
    id: "stop",
    dnaRu: "TAA",
    rnaRu: "UAA",
    aminoAcidRu: "стоп",
    noteRu:
      "Стоп-кодоны завершают чтение: без таких сигналов белки собирались бы неправильно.",
  },
];
