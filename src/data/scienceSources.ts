export type ScienceSourceKind = "primary" | "review" | "museum" | "education" | "data";

export type ScienceSource = {
  id: string;
  label: string;
  url: string;
  kind: ScienceSourceKind;
  noteRu: string;
};

export type ScienceSourceGroup = {
  id: string;
  titleRu: string;
  noteRu: string;
  routeHref: string;
  sources: ScienceSource[];
};

export const SCIENCE_SOURCE_KIND_LABELS: Record<ScienceSourceKind, string> = {
  primary: "первичная статья",
  review: "обзор",
  museum: "музей / университет",
  education: "образовательный обзор",
  data: "данные / доклад",
};

export const SCIENCE_SOURCE_GROUPS: ScienceSourceGroup[] = [
  {
    id: "luca",
    titleRu: "LUCA и древний корень жизни",
    noteRu: "Источники о LUCA как реконструируемом общем предковом узле, а не первой жизни.",
    routeHref: "/origin-of-life",
    sources: [
      {
        id: "nature-luca-2024",
        label: "Nature Ecology & Evolution: LUCA",
        url: "https://www.nature.com/articles/s41559-024-02461-1",
        kind: "primary",
        noteRu: "Современная реконструкция природы LUCA и его возможной роли в ранней экосистеме Земли.",
      },
      {
        id: "bristol-luca-explainer",
        label: "University of Bristol: LUCA explainer",
        url: "https://www.bristol.ac.uk/news/2024/july/luca.html",
        kind: "museum",
        noteRu: "Доступное объяснение результатов статьи о LUCA и датировки около 4,2 млрд лет.",
      },
      {
        id: "woese-three-domains",
        label: "Woese et al.: three domains",
        url: "https://pubmed.ncbi.nlm.nih.gov/2112744/",
        kind: "primary",
        noteRu: "Классическая работа о доменах Bacteria, Archaea и Eukarya как каркасе дерева жизни.",
      },
    ],
  },
  {
    id: "origin",
    titleRu: "Абиогенез и гипотезы происхождения жизни",
    noteRu: "Обзорные источники для РНК-мира, протоклеток, первичной химии и гидротермальных сценариев.",
    routeHref: "/origin-of-life",
    sources: [
      {
        id: "berkeley-soup-cells",
        label: "Understanding Evolution: From soup to cells",
        url: "https://evolution.berkeley.edu/from-soup-to-cells-the-origin-of-life/",
        kind: "education",
        noteRu: "Учебный маршрут по переходу от химии к клеточным системам и наследованию.",
      },
      {
        id: "berkeley-rna-world",
        label: "Understanding Evolution: RNA world",
        url: "https://evolution.berkeley.edu/from-the-origin-of-life-to-the-future-of-biotech/the-rna-world/",
        kind: "education",
        noteRu: "Понятный разбор того, почему РНК-мир считается сильной рабочей моделью.",
      },
      {
        id: "whoi-lost-city",
        label: "WHOI: Lost City vents",
        url: "https://www.whoi.edu/oceanus/feature/lost-city-pumps-life-essential-chemicals-at-rates-unseen-at-typical-black-smokers/",
        kind: "museum",
        noteRu: "Материал о гидротермальных источниках и химии, важной для сценариев ранней жизни.",
      },
    ],
  },
  {
    id: "geologic-time",
    titleRu: "Геологическая шкала времени",
    noteRu: "Источники для границ периодов, названий систем и привязки возрастов к породам и ископаемым.",
    routeHref: "/",
    sources: [
      {
        id: "ics-chart",
        label: "International Chronostratigraphic Chart",
        url: "https://stratigraphy.org/chart",
        kind: "data",
        noteRu:
          "Официальная международная шкала эонов, эр, периодов и ярусов с актуальными возрастными границами.",
      },
      {
        id: "gsa-geologic-time-scale",
        label: "Geological Society of America: Geologic Time Scale",
        url: "https://www.geosociety.org/GSA/Education_Careers/Geologic_Time_Scale/GSA/timescale/home.aspx",
        kind: "education",
        noteRu:
          "Образовательный обзор геологического времени, стратиграфии и принципа деления истории Земли.",
      },
    ],
  },
  {
    id: "lineage",
    titleRu: "Большая линия от клеток к человеку",
    noteRu: "Опорные источники для кислородной революции, митохондрий, переходных форм и масштаба эволюционного времени.",
    routeHref: "/",
    sources: [
      {
        id: "asm-great-oxidation",
        label: "ASM: Great Oxidation Event",
        url: "https://asm.org/articles/2022/february/the-great-oxidation-event-how-cyanobacteria-change",
        kind: "review",
        noteRu: "Обзор роли цианобактерий и кислородного фотосинтеза в изменении атмосферы Земли.",
      },
      {
        id: "nature-mitochondria",
        label: "Nature Scitable: origin of mitochondria",
        url: "https://www.nature.com/scitable/topicpage/the-origin-of-mitochondria-14232356/",
        kind: "education",
        noteRu: "Разбор эндосимбиотического происхождения митохондрий и эукариотической клетки.",
      },
      {
        id: "shubin-tiktaalik",
        label: "Shubin Lab: Tiktaalik",
        url: "https://shubinlab.uchicago.edu/research-2-2/",
        kind: "museum",
        noteRu: "Источник от исследовательской группы, связанной с открытием Tiktaalik и переходом к конечностям.",
      },
    ],
  },
  {
    id: "human-origins",
    titleRu: "Африка и происхождение Homo sapiens",
    noteRu: "Источники для карты африканских находок и пан-африканской модели происхождения человека.",
    routeHref: "/primates",
    sources: [
      {
        id: "smithsonian-homo-sapiens",
        label: "Smithsonian: Homo sapiens",
        url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
        kind: "museum",
        noteRu: "Обзор появления Homo sapiens, ранних находок и позднего расселения нашего вида.",
      },
      {
        id: "smithsonian-jebel-irhoud",
        label: "Smithsonian: Jebel Irhoud",
        url: "https://humanorigins.si.edu/research/whats-hot-human-origins/our-species-arose-least-300000-years-ago",
        kind: "museum",
        noteRu: "Объяснение значения марокканских находок Jebel Irhoud для ранней истории Homo sapiens.",
      },
      {
        id: "nature-jebel-irhoud",
        label: "Nature: new fossils from Jebel Irhoud",
        url: "https://www.nature.com/articles/nature22336",
        kind: "primary",
        noteRu: "Первичная статья о датировке и морфологии ранних Homo sapiens из Марокко.",
      },
      {
        id: "nhm-human-dispersal",
        label: "Natural History Museum: Homo sapiens dispersal",
        url: "https://www.nhm.ac.uk/discover/when-how-did-modern-humans-homo-sapiens-spread-out-of-africa.html",
        kind: "museum",
        noteRu: "Обзор маршрутов расселения Homo sapiens, ранних волн, Европы, Азии, Австралии и Америк.",
      },
      {
        id: "natural-earth-map-data",
        label: "Natural Earth: public domain map data",
        url: "https://www.naturalearthdata.com/about/terms-of-use/",
        kind: "data",
        noteRu: "Открытые картографические данные, использованные для локальной SVG-подложки карты мира.",
      },
    ],
  },
  {
    id: "genetics",
    titleRu: "Молекулярные доказательства",
    noteRu: "Источники для хромосомы 2, вирусных вставок, общего генетического кода и сравнительной геномики.",
    routeHref: "/genetics",
    sources: [
      {
        id: "nhgri-chromosome-2",
        label: "NHGRI: chromosomes 2 and 4",
        url: "https://www.genome.gov/13514624/2005-release-scientists-analyze-chromosomes-2-and-4",
        kind: "museum",
        noteRu: "Популярное объяснение анализа человеческой хромосомы 2 и ее связи с родством человекообразных.",
      },
      {
        id: "pnas-chromosome-2",
        label: "PNAS: origin of human chromosome 2",
        url: "https://www.pnas.org/doi/abs/10.1073/pnas.88.20.9051",
        kind: "primary",
        noteRu: "Классическая статья о следах слияния предковых хромосом в человеческой хромосоме 2.",
      },
      {
        id: "ncbi-herv",
        label: "NCBI Bookshelf: endogenous retroviruses",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK6235/",
        kind: "review",
        noteRu: "Обзор эндогенных ретровирусов как наследуемых вставок в геномах.",
      },
    ],
  },
  {
    id: "cladogram",
    titleRu: "Дерево родства и кладограммы",
    noteRu: "Источники для объяснения ветвящегося родства, доменов жизни и синтетических деревьев.",
    routeHref: "/cladogram",
    sources: [
      {
        id: "open-tree-life",
        label: "PNAS: Open Tree of Life",
        url: "https://www.pnas.org/doi/10.1073/pnas.1423041112",
        kind: "primary",
        noteRu: "Статья о синтетическом дереве жизни как объединении разных филогенетических данных.",
      },
      {
        id: "berkeley-lines-evidence",
        label: "Understanding Evolution: Lines of evidence",
        url: "https://evolution.berkeley.edu/lines-of-evidence/",
        kind: "education",
        noteRu: "Обзор того, как ископаемые, анатомия, ДНК и биогеография сходятся в дерево родства.",
      },
    ],
  },
  {
    id: "dinosaurs",
    titleRu: "Динозавры, тероподы и птицы",
    noteRu: "Источники для связи птиц с тероподами, переходных форм и перьев до полноценного полета.",
    routeHref: "/dinosaurs",
    sources: [
      {
        id: "ucmp-origin-birds",
        label: "UCMP: The origin of birds",
        url: "https://ucmp.berkeley.edu/diapsids/avians.html",
        kind: "education",
        noteRu: "Классический образовательный обзор связи птиц с динозаврами и тероподами.",
      },
      {
        id: "nhm-dinosaurs-birds",
        label: "Natural History Museum: dinosaurs to birds",
        url: "https://www.nhm.ac.uk/discover/how-dinosaurs-evolved-into-birds.html",
        kind: "museum",
        noteRu: "Музейный материал о переходе от динозавровых признаков к птичьей линии.",
      },
      {
        id: "nhm-archaeopteryx",
        label: "Natural History Museum: Archaeopteryx",
        url: "https://www.nhm.ac.uk/discover/dino-directory/archaeopteryx.html",
        kind: "museum",
        noteRu: "Справочник по Archaeopteryx как мозаичной переходной форме.",
      },
    ],
  },
  {
    id: "extinctions",
    titleRu: "Глобальные вымирания",
    noteRu: "Источники для большой пятерки, K-Pg, современного кризиса биоразнообразия и роли человека.",
    routeHref: "/extinctions",
    sources: [
      {
        id: "nps-mass-extinctions",
        label: "NPS: Mass extinctions through geologic time",
        url: "https://www.nps.gov/subjects/fossils/mass-extinctions-through-geologic-time.htm",
        kind: "education",
        noteRu: "Обзор крупных вымираний в геологическом времени с привязкой к ископаемой летописи.",
      },
      {
        id: "nasa-chicxulub",
        label: "NASA: Chicxulub impact",
        url: "https://science.nasa.gov/earth/deep-impact-and-the-mass-extinction-of-species-65-million-years-ago/",
        kind: "museum",
        noteRu: "Объяснение связи ударного события и мел-палеогенового кризиса.",
      },
      {
        id: "ipbes-global-assessment",
        label: "IPBES: Global Assessment",
        url: "https://www.ipbes.net/global-assessment",
        kind: "data",
        noteRu: "Ключевой современный доклад о рисках биоразнообразия и угрозе исчезновения видов.",
      },
    ],
  },
];
