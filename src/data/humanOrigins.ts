import type { ConfidenceLevel } from "./confidence";
import type { SourceRef } from "./lineage";

export type HumanOriginSite = {
  id: string;
  titleRu: string;
  regionRu: string;
  ageRu: string;
  evidenceRu: string;
  whyMattersRu: string;
  longitude: number;
  latitude: number;
  confidence: ConfidenceLevel;
  source: SourceRef;
};

export type HumanMigrationRoute = {
  id: string;
  titleRu: string;
  dateRu: string;
  summaryRu: string;
  points: Array<[longitude: number, latitude: number]>;
  confidence: ConfidenceLevel;
  source: SourceRef;
};

export const AFRICA_ORIGIN_NOTE =
  "Колыбель человечества — Африка, но не один сад Эдема: современный Homo sapiens складывался в связанных популяциях по континенту.";

export const HUMAN_ORIGIN_SITES: HumanOriginSite[] = [
  {
    id: "jebel-irhoud",
    titleRu: "Jebel Irhoud",
    regionRu: "Марокко, Северная Африка",
    ageRu: "около 315 тыс. лет назад",
    evidenceRu: "ранние черты Homo sapiens и каменные индустрии среднего каменного века",
    whyMattersRu:
      "Марокканские находки расширяют картину происхождения Homo sapiens за пределы одной восточноафриканской точки.",
    longitude: -8.87,
    latitude: 31.85,
    confidence: "solid",
    source: {
      label: "Nature: Jebel Irhoud",
      url: "https://www.nature.com/articles/nature22336",
    },
  },
  {
    id: "omo-kibish",
    titleRu: "Omo Kibish",
    regionRu: "Эфиопия, Восточная Африка",
    ageRu: "не моложе примерно 233 тыс. лет назад (нижняя оценка)",
    evidenceRu: "одни из важных ранних ископаемых Homo sapiens в Восточной Африке",
    whyMattersRu:
      "Omo Kibish показывает, что восточноафриканская часть истории остается центральной, но не единственной.",
    longitude: 36.05,
    latitude: 5.4,
    confidence: "solid",
    source: {
      label: "Nature: Omo Kibish age",
      url: "https://www.nature.com/articles/s41586-021-04275-8",
    },
  },
  {
    id: "herto",
    titleRu: "Herto",
    regionRu: "Эфиопия, Афар",
    ageRu: "около 160 тыс. лет назад",
    evidenceRu: "поздние африканские находки Homo sapiens с хорошо выраженной современной морфологией",
    whyMattersRu:
      "Herto помогает показать не одну дату возникновения, а серию африканских свидетельств на большой шкале времени.",
    longitude: 40.5,
    latitude: 10.25,
    confidence: "solid",
    source: {
      label: "Smithsonian: Homo sapiens",
      url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
    },
  },
  {
    id: "blombos",
    titleRu: "Blombos",
    regionRu: "Южная Африка",
    ageRu: "примерно 100-70 тыс. лет назад",
    evidenceRu: "поведенческие и культурные следы ранних Homo sapiens на юге континента",
    whyMattersRu:
      "Blombos переносит внимание от костей к культуре: символы, технологии и поведение тоже часть человеческой истории.",
    longitude: 21.22,
    latitude: -34.42,
    confidence: "solid",
    source: {
      label: "Smithsonian: Homo sapiens",
      url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
    },
  },
];

export const HUMAN_MIGRATION_ROUTES: HumanMigrationRoute[] = [
  {
    id: "african-mosaic",
    titleRu: "Африканская мозаика",
    dateRu: "примерно 315-160 тыс. лет назад",
    summaryRu:
      "Ранние свидетельства Homo sapiens распределены по Африке: это лучше похоже на сеть связанных популяций, чем на одну точку происхождения.",
    points: [
      [-8.87, 31.85],
      [36.05, 5.4],
      [40.5, 10.25],
      [21.22, -34.42],
    ],
    confidence: "likely",
    source: {
      label: "Smithsonian: Homo sapiens",
      url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
    },
  },
  {
    id: "levant-arabia",
    titleRu: "Северный выход: Левант и Аравия",
    dateRu: "ранние волны 194-85 тыс.; главная волна около 60-50 тыс. лет назад",
    summaryRu:
      "Вероятный коридор шел через Синай, Левант и Аравийский полуостров. Ранние выходы могли не оставить прямых потомков у современных людей.",
    points: [
      [35, 6],
      [32, 30],
      [35, 32],
      [45, 24],
      [55, 25],
    ],
    confidence: "likely",
    source: {
      label: "Natural History Museum: out of Africa",
      url: "https://www.nhm.ac.uk/discover/when-how-did-modern-humans-homo-sapiens-spread-out-of-africa.html",
    },
  },
  {
    id: "southern-asia-sahul",
    titleRu: "Южная дуга к Сахулу",
    dateRu: "примерно 70-50 тыс.; Австралия до около 65-42 тыс. лет назад",
    summaryRu:
      "Одна модель ведет людей вдоль южной Азии к Юго-Восточной Азии, Новой Гвинее и Австралии; часть дат и волн остается предметом обсуждения.",
    points: [
      [40, 10],
      [48, 14],
      [70, 19],
      [88, 21],
      [105, 12],
      [121, -4],
      [135, -25],
    ],
    confidence: "debated",
    source: {
      label: "Natural History Museum: Asia and Australia",
      url: "https://www.nhm.ac.uk/discover/when-how-did-modern-humans-homo-sapiens-spread-out-of-africa.html",
    },
  },
  {
    id: "europe",
    titleRu: "Европейская ветвь",
    dateRu: "примерно 54-45 тыс. лет назад",
    summaryRu:
      "В Европу Homo sapiens заходил не один раз; устойчивое распространение связано с периодом около 45 тыс. лет назад и контактами с неандертальцами.",
    points: [
      [35, 32],
      [28, 39],
      [15, 45],
      [2, 47],
    ],
    confidence: "likely",
    source: {
      label: "Natural History Museum: early modern humans in Europe",
      url: "https://www.nhm.ac.uk/discover/when-how-did-modern-humans-homo-sapiens-spread-out-of-africa.html",
    },
  },
  {
    id: "east-asia",
    titleRu: "Восточная Азия",
    dateRu: "примерно 120-40 тыс. лет назад, с несколькими волнами",
    summaryRu:
      "Азиатская картина включает ранние спорные находки, более поздние генетические волны и контакты с денисовцами.",
    points: [
      [70, 28],
      [90, 30],
      [105, 32],
      [116, 39],
    ],
    confidence: "debated",
    source: {
      label: "Natural History Museum: Asia",
      url: "https://www.nhm.ac.uk/discover/when-how-did-modern-humans-homo-sapiens-spread-out-of-africa.html",
    },
  },
  {
    id: "americas",
    titleRu: "Через Берингию в Америки",
    dateRu: "примерно 23-15 тыс. лет назад",
    summaryRu:
      "Переход из северо-восточной Азии в Америки шел через Берингию и/или прибрежные маршруты. Самые ранние даты до сих пор уточняются.",
    points: [
      [116, 39],
      [145, 55],
      [179, 60],
      [-170, 62],
      [-120, 48],
      [-99, 20],
      [-75, -12],
    ],
    confidence: "debated",
    source: {
      label: "Natural History Museum: first humans in North America",
      url: "https://www.nhm.ac.uk/discover/when-how-did-modern-humans-homo-sapiens-spread-out-of-africa.html",
    },
  },
];
