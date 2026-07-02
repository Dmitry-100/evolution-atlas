import { sortedStages, type EvolutionStage } from "./lineage";
import { getStageHref } from "../lib/atlasUrlState";

export type TourIntent =
  | "overview"
  | "skeptical"
  | "ancestors"
  | "child"
  | "origin"
  | "dinosaurs"
  | "presenter"
  | "browse"
  | "custom";

export type TourBudgetMin = 5 | 15;

export type TourIntentOption = {
  id: TourIntent;
  labelRu: string;
  darwinPromptRu: string;
};

export type TourStopKind = "page" | "stage";

export type TourStop = {
  id: string;
  kind: TourStopKind;
  titleRu: string;
  hintRu: string;
  href: string;
  ageMa?: number;
};

export type BrowseLink = {
  labelRu: string;
  href: string;
  descriptionRu: string;
};

export type TourNextStepKind =
  | "presentation"
  | "book"
  | "video"
  | "page"
  | "quiz";

export type TourNextStep = {
  kind: TourNextStepKind;
  labelRu: string;
  href: string;
  descriptionRu: string;
};

export const GUIDED_TOUR_INTENTS: TourIntentOption[] = [
  {
    id: "overview",
    labelRu: "Быстро понять портал",
    darwinPromptRu:
      "Проведу по всем разделам: шкала жизни, доказательства, происхождение жизни, дерево родства, вымирания, динозавры, проверка себя.",
  },
  {
    id: "skeptical",
    labelRu: "Разобраться, почему эволюция - не просто мнение",
    darwinPromptRu:
      "Разберем, что ученые называют теорией, на чем она держится и где проходят границы знания.",
  },
  {
    id: "ancestors",
    labelRu: "Пройти путь к человеку: кто были наши предки",
    darwinPromptRu:
      "Пройдем по родословной от ранней жизни до приматов и нашего вида.",
  },
  {
    id: "child",
    labelRu: "Объяснить ребенку эволюцию без занудства",
    darwinPromptRu:
      "Сделаем маршрут проще, короче и образнее, чтобы ребенок не утонул в миллиардах лет.",
  },
  {
    id: "origin",
    labelRu: "Понять, как вообще появилась жизнь",
    darwinPromptRu:
      "Начнем с самого трудного: как химия превратилась в наследование, клетки и эволюцию.",
  },
  {
    id: "dinosaurs",
    labelRu: "Узнать, почему динозавры не совсем исчезли",
    darwinPromptRu:
      "Пройдем через динозавров, птиц и кризис на границе мела и палеогена - со словом “вымерли” все непросто.",
  },
  {
    id: "presenter",
    labelRu: "Подготовить рассказ, урок или презентацию",
    darwinPromptRu:
      "Соберем маршрут не только для понимания, но и для объяснения другим: что показать, где взять материалы и как проверить источники.",
  },
  {
    id: "browse",
    labelRu: "Дайте мне карту, я сам буду исследовать",
    darwinPromptRu:
      "Хорошо, без экскурсии. Дам несколько входов - дальше вы сами.",
  },
  {
    id: "custom",
    labelRu: "У меня свой вопрос",
    darwinPromptRu:
      "Сформулируйте, что вас зацепило, а я подберу маршрут или короткий ответ по материалам сайта.",
  },
];

const PAGE_STOPS: TourStop[] = [
  {
    id: "page-primates",
    kind: "page",
    titleRu: "Приматы → человек",
    hintRu:
      "Приматы, человекообразные, гоминины, Homo и карта раннего расселения нашего вида.",
    href: "/primates",
  },
  {
    id: "page-theory",
    kind: "page",
    titleRu: "Теория эволюции",
    hintRu:
      "Что значит научная теория и почему это не догадка и не личное мнение.",
    href: "/theory",
  },
  {
    id: "page-origin-of-life",
    kind: "page",
    titleRu: "Зарождение жизни",
    hintRu:
      "Как ученые обсуждают переход от химии к наследованию, РНК-миру и клеткам.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-energy",
    kind: "page",
    titleRu: "Энергия ранней Земли",
    hintRu:
      "Молнии, ультрафиолет, вулканы и гидротермальные источники могли запускать раннюю химию.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-organics",
    kind: "page",
    titleRu: "Органические заготовки",
    hintRu:
      "Простые молекулы могли собираться в аминокислоты, сахара и основания для будущих наследственных систем.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-membranes",
    kind: "page",
    titleRu: "Первые оболочки",
    hintRu:
      "Липидные пузырьки отделяли внутреннюю химию от внешней среды и удерживали реагенты рядом.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-inheritance",
    kind: "page",
    titleRu: "Наследуемая информация",
    hintRu:
      "Жизнь начинается по-настоящему там, где удачные варианты могут копироваться и различаться.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-rna-world",
    kind: "page",
    titleRu: "РНК-мир",
    hintRu:
      "РНК интересна тем, что может хранить информацию и участвовать в химических реакциях.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-hydrothermal-vents",
    kind: "page",
    titleRu: "Гидротермальные источники",
    hintRu:
      "Минеральные поры на дне океана могли давать энергию, поверхность и микрокамеры для ранней химии.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-metabolism-first",
    kind: "page",
    titleRu: "Метаболизм сначала",
    hintRu:
      "Некоторые сценарии начинают с устойчивых сетей реакций, которые подпитываются энергией.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-lipid-world",
    kind: "page",
    titleRu: "Липидные протоклетки",
    hintRu:
      "Мембранные пузырьки могли стать первыми лабораториями, где внутренняя химия держалась вместе.",
    href: "/origin-of-life",
  },
  {
    id: "page-origin-luca",
    kind: "page",
    titleRu: "LUCA",
    hintRu:
      "Последний универсальный общий предок показывает, что уже было у жизни до разделения на бактерии, археи и эукариот.",
    href: "/origin-of-life",
  },
  {
    id: "page-genetics",
    kind: "page",
    titleRu: "РНК/ДНК",
    hintRu:
      "Молекулярные доказательства родства: ДНК, общие маркеры и проценты сходства.",
    href: "/genetics",
  },
  {
    id: "page-cladogram",
    kind: "page",
    titleRu: "Дерево родства",
    hintRu:
      "Ветвящееся дерево показывает общие развилки и соседние линии родства.",
    href: "/cladogram",
  },
  {
    id: "page-body-map",
    kind: "page",
    titleRu: "Карта признаков",
    hintRu:
      "Накопленные признаки показывают, какие древние решения тела дошли до выбранной точки маршрута.",
    href: "/body-map",
  },
  {
    id: "page-extinctions",
    kind: "page",
    titleRu: "Глобальные вымирания",
    hintRu:
      "Катастрофы меняли экосистемы и открывали новые возможности для выживших ветвей.",
    href: "/extinctions",
  },
  {
    id: "page-dinosaurs",
    kind: "page",
    titleRu: "Вымерли ли динозавры",
    hintRu:
      "Птицы показывают, почему эволюционная история редко заканчивается простым исчезновением.",
    href: "/dinosaurs",
  },
  {
    id: "page-quiz",
    kind: "page",
    titleRu: "Проверь себя",
    hintRu:
      "Короткий способ закрепить главные идеи после свободного исследования.",
    href: "/quiz",
  },
  {
    id: "page-materials",
    kind: "page",
    titleRu: "Дополнительные материалы",
    hintRu:
      "Презентации, книги и видео помогают продолжить маршрут после экскурсии или собрать объяснение для другой аудитории.",
    href: "/materials",
  },
  {
    id: "page-about",
    kind: "page",
    titleRu: "О проекте",
    hintRu:
      "Здесь объясняется, зачем портал собирает историю жизни как сеть родственных ветвей.",
    href: "/about",
  },
  {
    id: "page-sources",
    kind: "page",
    titleRu: "Источники",
    hintRu:
      "Ссылки, лицензии и научная база позволяют проверить визуальные материалы и ключевые утверждения портала.",
    href: "/sources",
  },
];

function stageHref(stage: EvolutionStage) {
  return getStageHref(stage);
}

const STAGE_STOPS: TourStop[] = sortedStages.map((stage) => ({
  id: `stage-${stage.id}`,
  kind: "stage",
  titleRu: stage.titleRu,
  hintRu: `${stage.summaryRu} ${stage.whyMattersRu}`,
  href: stageHref(stage),
  ageMa: stage.ageMa,
}));

export const GUIDED_TOUR_STOPS: TourStop[] = [...PAGE_STOPS, ...STAGE_STOPS];

export const GUIDED_TOUR_BROWSE_LINKS: BrowseLink[] = [
  {
    labelRu: "Открыть атлас",
    href: "/",
    descriptionRu:
      "Начните с общей шкалы от ранней жизни к нашей ветви.",
  },
  {
    labelRu: "Приматы → человек",
    href: "/primates",
    descriptionRu:
      "Откройте позднюю ветвь с приматами, Homo sapiens и картой расселения.",
  },
  {
    labelRu: "Посмотреть дерево родства",
    href: "/cladogram",
    descriptionRu:
      "Хороший вход, если хочется увидеть, как расходятся линии родства.",
  },
  {
    labelRu: "Проверить себя",
    href: "/quiz",
    descriptionRu:
      "Несколько вопросов помогут быстро понять, что уже стало яснее.",
  },
];

export function getTourStopById(id: string) {
  return GUIDED_TOUR_STOPS.find((stop) => stop.id === id);
}
