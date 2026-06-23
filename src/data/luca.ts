import type { ConfidenceLevel } from "./confidence";
import type { SourceRef } from "./lineage";

export type LucaTreeNodeId = "luca" | "bacteria" | "archaea" | "eukaryotes";

export type LucaTreeNode = {
  id: LucaTreeNodeId;
  titleRu: string;
  subtitleRu: string;
  bodyRu: string;
  inheritedRu: string[];
  confidence: ConfidenceLevel;
  source: SourceRef;
  children?: LucaTreeNodeId[];
};

export const LUCA_SOURCES: SourceRef[] = [
  {
    label: "Nature Ecology & Evolution: LUCA",
    url: "https://www.nature.com/articles/s41559-024-02461-1",
  },
  {
    label: "University of Bristol: LUCA explainer",
    url: "https://www.bristol.ac.uk/news/2024/july/luca.html",
  },
  {
    label: "Woese et al.: three domains",
    url: "https://pubmed.ncbi.nlm.nih.gov/2112744/",
  },
];

export const LUCA_EXHIBIT = {
  titleRu: "LUCA: древний общий узел жизни",
  eyebrowRu: "Последний общий предок",
  acronymEn: "Last Universal Common Ancestor",
  acronymRu: "последний универсальный общий предок",
  leadRu:
    "LUCA - не первый организм, а последний общий предок всех живых клеточных линий, которые дожили до наших дней.",
  noteRu:
    "Корректнее представлять LUCA не как одного персонажа, а как реконструируемую древнюю популяцию с набором клеточных механизмов.",
  ageRu: "около 4,2 млрд лет назад по одной современной модели",
  confidence: "debated" as ConfidenceLevel,
};

export const LUCA_INHERITANCE = [
  "почти общий генетический код",
  "рибосомы",
  "ATP и ионные градиенты",
  "клеточные мембраны",
  "базовый обмен веществ",
];

export const LUCA_TREE_NODES: LucaTreeNode[] = [
  {
    id: "luca",
    titleRu: "LUCA",
    subtitleRu: "последний универсальный общий предок",
    bodyRu:
      "Реконструкция LUCA помогает объяснить, почему у бактерий, архей, растений, грибов и животных остается общий молекулярный каркас.",
    inheritedRu: LUCA_INHERITANCE,
    confidence: "debated",
    source: LUCA_SOURCES[0],
    children: ["bacteria", "archaea", "eukaryotes"],
  },
  {
    id: "bacteria",
    titleRu: "Bacteria",
    subtitleRu: "бактериальная ветвь",
    bodyRu:
      "Бактерии сохранили огромную биохимическую гибкость и показывают, насколько древними могут быть базовые клеточные механизмы.",
    inheritedRu: ["мембраны", "рибосомы", "обмен веществ"],
    confidence: "solid",
    source: LUCA_SOURCES[2],
  },
  {
    id: "archaea",
    titleRu: "Archaea",
    subtitleRu: "архейная ветвь",
    bodyRu:
      "Археи важны для понимания ранней жизни: они глубоко отличаются от бактерий и связаны с происхождением эукариотической клетки.",
    inheritedRu: ["древние ферменты", "экстремальные метаболизмы", "клеточная регуляция"],
    confidence: "solid",
    source: LUCA_SOURCES[2],
  },
  {
    id: "eukaryotes",
    titleRu: "Eukaryotes",
    subtitleRu: "ветвь клеток с ядром",
    bodyRu:
      "Эукариоты объединяют животных, растения, грибы и множество одноклеточных; наша линия находится внутри этой поздней сложной ветви.",
    inheritedRu: ["ядро", "митохондрии", "сложная внутренняя организация"],
    confidence: "solid",
    source: LUCA_SOURCES[2],
  },
];
