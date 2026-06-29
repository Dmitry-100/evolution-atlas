import { EVIDENCE_MODULES, SCIENTIFIC_THEORY_EXPLAINER } from "../data/evidence";
import { BODY_TRAIT_LAYERS, BODY_TRAITS } from "../data/bodyTraits";
import {
  GENETICS_EVIDENCE,
  GENETICS_SOURCES,
  GENOME_COMPARISONS,
  MOLECULAR_MARKERS,
} from "../data/genetics";
import {
  getStageById,
  sortedStages,
  type EvolutionStage,
  type SourceRef,
} from "../data/lineage";
import { PORTAL_MATERIALS, READING_RECOMMENDATIONS } from "../data/materials";
import { SCIENCE_SOURCE_GROUPS } from "../data/scienceSources";
import { getStageHref } from "./atlasUrlState";
import { formatAgeRu } from "./timeline";

export type DarwinGuideCitation = {
  label: string;
  url: string;
};

export type DarwinGuideRelatedLink = {
  labelRu: string;
  href: string;
};

export type DarwinGuideContextInput = {
  message: string;
  pagePath: string;
  stageId?: string;
  atlasMode?: "all" | "primates";
};

export type DarwinGuideContext = {
  currentPage: {
    titleRu: string;
    href: string;
  };
  currentStage?: Pick<
    EvolutionStage,
    "id" | "slug" | "titleRu" | "latin" | "summaryRu" | "whyMattersRu"
  >;
  contextRu: string;
  citations: DarwinGuideCitation[];
  relatedLinks: DarwinGuideRelatedLink[];
};

const PAGE_TITLES: Record<string, string> = {
  "/": "Атлас",
  "/primates": "Приматы → человек",
  "/theory": "Теория эволюции",
  "/origin-of-life": "Зарождение жизни",
  "/genetics": "РНК/ДНК",
  "/cladogram": "Дерево родства",
  "/body-map": "Карта признаков",
  "/extinctions": "Глобальные вымирания",
  "/dinosaurs": "Вымерли ли динозавры",
  "/materials": "Дополнительные материалы",
  "/about": "О проекте",
  "/quiz": "Проверь себя",
  "/sources": "Источники",
};

const DIRECT_ROUTE_LINKS: DarwinGuideRelatedLink[] = [
  { labelRu: "Открыть дерево родства", href: "/cladogram" },
  { labelRu: "Открыть карту признаков", href: "/body-map" },
  { labelRu: "Открыть доказательства эволюции", href: "/theory" },
  { labelRu: "Открыть молекулярные доказательства", href: "/genetics" },
  { labelRu: "Открыть материалы", href: "/materials" },
];

const EXTERNAL_SEARCH_PATTERNS = [
  /нов(ое|ые|ая|ый|ых)?\b/i,
  /свеж(ее|ие|ая|ий|их)?\b/i,
  /последн(ее|ие|яя|ий|их)?\b/i,
  /сегодня|вчера|недавн/i,
  /\b20[2-9]\d\b/,
  /что известно сейчас/i,
  /latest|recent|today/i,
];

function normalizePath(pagePath: string) {
  const [path = "/"] = pagePath.split(/[?#]/);
  return path || "/";
}

function resolveStage(stageId?: string) {
  if (!stageId) return undefined;

  return (
    getStageById(stageId) ??
    sortedStages.find((stage) => stage.slug === stageId) ??
    sortedStages.find((stage) => stage.id === stageId.replace(/^stage:/, ""))
  );
}

function pushCitation(
  citations: DarwinGuideCitation[],
  seenUrls: Set<string>,
  source: SourceRef | DarwinGuideCitation,
) {
  if (!source.url || seenUrls.has(source.url)) return;
  seenUrls.add(source.url);
  citations.push({ label: source.label, url: source.url });
}

function summarizeStage(stage: EvolutionStage) {
  return [
    `Выбранный этап: ${stage.titleRu} (${stage.latin}), ${formatAgeRu(stage.ageMa)}.`,
    stage.summaryRu,
    `Почему важен: ${stage.whyMattersRu}`,
    `Унаследованные/ключевые признаки: ${stage.inherited.join(", ")}.`,
  ].join(" ");
}

function pageTitleFor(pathname: string) {
  return PAGE_TITLES[pathname] ?? "Атлас";
}

function sourceGroupsForPath(pathname: string) {
  if (pathname === "/") {
    return SCIENCE_SOURCE_GROUPS.filter((group) =>
      ["lineage", "cladogram"].includes(group.id),
    );
  }

  return SCIENCE_SOURCE_GROUPS.filter((group) => group.routeHref === pathname);
}

function stageLink(stage: EvolutionStage) {
  return getStageHref(stage);
}

export function buildDarwinGuideContext(
  input: DarwinGuideContextInput,
): DarwinGuideContext {
  const pathname = normalizePath(input.pagePath);
  const stage = resolveStage(input.stageId);
  const citations: DarwinGuideCitation[] = [];
  const seenUrls = new Set<string>();
  const sourceGroups = sourceGroupsForPath(pathname);

  if (stage) {
    for (const source of stage.sources) pushCitation(citations, seenUrls, source);
  }

  for (const group of sourceGroups) {
    for (const source of group.sources) pushCitation(citations, seenUrls, source);
  }

  pushCitation(citations, seenUrls, SCIENTIFIC_THEORY_EXPLAINER.source);
  for (const source of GENETICS_SOURCES.slice(0, 4)) {
    pushCitation(citations, seenUrls, source);
  }

  const relatedLinks: DarwinGuideRelatedLink[] = [...DIRECT_ROUTE_LINKS];
  if (stage) {
    relatedLinks.unshift({
      labelRu: `Открыть этап: ${stage.titleRu}`,
      href: stageLink(stage),
    });
  }

  const theoryText = [
    `Дарвин важен как автор механизма естественного отбора и идеи общего происхождения, но современная генетика, LUCA и сравнительная геномика появились позже его времени.`,
    `Научная теория: ${SCIENTIFIC_THEORY_EXPLAINER.bodyRu}`,
    ...EVIDENCE_MODULES.map(
      (module) =>
        `${module.titleRu}: ${module.summaryRu} Пример: ${module.exampleRu}`,
    ),
  ].join("\n");

  const geneticsText = [
    ...GENETICS_EVIDENCE.map(
      (item) => `${item.titleRu}: ${item.shortRu} Значение: ${item.whyItMattersRu}`,
    ),
    ...GENOME_COMPARISONS.slice(0, 3).map(
      (item) => `${item.titleRu}: ${item.valueRu}; ${item.meaningRu} Осторожность: ${item.cautionRu}`,
    ),
    ...MOLECULAR_MARKERS.map(
      (item) => `${item.titleRu}: ${item.markerRu}; ${item.explanationRu}`,
    ),
  ].join("\n");

  const materialsText = PORTAL_MATERIALS.map(
    (material) =>
      `${material.titleRu}: ${material.summaryRu} Подходит: ${material.audienceRu}.`,
  ).join("\n");

  const bodyTraitsText = BODY_TRAIT_LAYERS.map((layer) => {
    const traits = BODY_TRAITS.filter((trait) => trait.layerId === layer.id)
      .slice(0, 8)
      .map((trait) => `${trait.titleRu} (${trait.stageId})`)
      .join(", ");

    return `${layer.titleRu}: ${layer.descriptionRu} Примеры признаков: ${traits}.`;
  }).join("\n");

  const booksText = READING_RECOMMENDATIONS.slice(0, 4)
    .map((book) => `${book.titleRu} (${book.authorRu}): ${book.whyReadRu}`)
    .join("\n");

  const sourceText = citations
    .map((citation, index) => `${index + 1}. ${citation.label}: ${citation.url}`)
    .join("\n");

  const stageText = stage
    ? summarizeStage(stage)
    : "Выбранного этапа нет: отвечай по текущей странице и общим материалам сайта.";

  return {
    currentPage: {
      titleRu: pageTitleFor(pathname),
      href: pathname,
    },
    currentStage: stage
      ? {
          id: stage.id,
          slug: stage.slug,
          titleRu: stage.titleRu,
          latin: stage.latin,
          summaryRu: stage.summaryRu,
          whyMattersRu: stage.whyMattersRu,
        }
      : undefined,
    contextRu: [
      `Текущая страница: ${pageTitleFor(pathname)} (${pathname}).`,
      stageText,
      "Роль ИИ: Дарвин говорит живо и образно, современный научный редактор уточняет факты по современной науке.",
      "Главное правило сайта: эволюция - ветвящееся дерево родства, а не лестница прогресса к человеку.",
      "Теория и доказательства:",
      theoryText,
      "Молекулярная генетика:",
      geneticsText,
      "Карта признаков:",
      bodyTraitsText,
      "Материалы сайта:",
      materialsText,
      "Рекомендации для продолжения:",
      booksText,
      "Источники контекста:",
      sourceText,
    ].join("\n\n"),
    citations,
    relatedLinks,
  };
}

export function shouldUseExternalSearch(
  message: string,
  context: DarwinGuideContext,
) {
  if (EXTERNAL_SEARCH_PATTERNS.some((pattern) => pattern.test(message))) {
    return true;
  }

  if (context.citations.length === 0) {
    return true;
  }

  return false;
}
