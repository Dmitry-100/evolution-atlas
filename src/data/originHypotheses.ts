import type { SourceRef } from "./lineage";

export type OriginHypothesis = {
  id: string;
  titleRu: string;
  shortRu: string;
  mechanismRu: string;
  evidenceRu: string;
  openQuestionRu: string;
  statusRu: string;
  sourceLabels: string[];
};

export const ORIGIN_SOURCES: SourceRef[] = [
  {
    label: "Understanding Evolution: From soup to cells",
    url: "https://evolution.berkeley.edu/from-soup-to-cells-the-origin-of-life/",
  },
  {
    label: "Nature Education: Origins of Life",
    url: "https://www.nature.com/scitable/topicpage/origins-of-life-14373903/",
  },
  {
    label: "Encyclopaedia Britannica: Origin of life",
    url: "https://www.britannica.com/science/life/Origin-of-life",
  },
  {
    label: "WHOI: Hydrothermal vents",
    url: "https://www.whoi.edu/ocean-learning-hub/ocean-topics/how-the-ocean-works/seafloor-below/hydrothermal-vents/",
  },
];

export const ORIGIN_HYPOTHESES: OriginHypothesis[] = [
  {
    id: "primordial-soup",
    titleRu: "Первичный бульон",
    shortRu:
      "Органические молекулы могли накапливаться в ранних водоемах и проходить химический отбор.",
    mechanismRu:
      "В атмосфере, океанах, лужах и при ударах молний простые вещества могли превращаться в аминокислоты, сахара и другие строительные блоки.",
    evidenceRu:
      "Эксперименты Миллера-Юри и их современные варианты показывают, что базовая органика может возникать из простых исходных веществ.",
    openQuestionRu:
      "Сложнее объяснить, как разбавленные молекулы собирались в устойчивые системы с наследованием.",
    statusRu: "исторически важная гипотеза",
    sourceLabels: [
      "Nature Education: Origins of Life",
      "Encyclopaedia Britannica: Origin of life",
    ],
  },
  {
    id: "rna-world",
    titleRu: "РНК-мир",
    shortRu:
      "До ДНК и белков могла существовать стадия, где РНК и хранила информацию, и ускоряла реакции.",
    mechanismRu:
      "РНК умеет быть матрицей для копирования и катализатором: рибозимы показывают, что молекула может совмещать две роли.",
    evidenceRu:
      "Рибосома, центральный механизм современных клеток, работает через РНК; известны каталитические РНК, способные ускорять реакции.",
    openQuestionRu:
      "Пока трудно показать полный путь от простой химии к самокопирующейся РНК в условиях ранней Земли.",
    statusRu: "одна из главных рабочих моделей",
    sourceLabels: [
      "Understanding Evolution: From soup to cells",
      "Nature Education: Origins of Life",
    ],
  },
  {
    id: "hydrothermal-vents",
    titleRu: "Гидротермальные источники",
    shortRu:
      "Жизнь могла стартовать в минеральных порах на дне океана, где были энергия, градиенты и каталитические поверхности.",
    mechanismRu:
      "Щелочные источники создают микрокамеры, поток водорода, минералы железа и серы, а также естественные протонные градиенты.",
    evidenceRu:
      "Такие условия напоминают энергетическую логику клеток: жизнь до сих пор использует мембраны и градиенты для получения энергии.",
    openQuestionRu:
      "Остается связать минеральные реакторы с появлением молекул наследственности и свободноживущих клеток.",
    statusRu: "сильная геохимическая версия",
    sourceLabels: [
      "WHOI: Hydrothermal vents",
      "Understanding Evolution: From soup to cells",
    ],
  },
  {
    id: "metabolism-first",
    titleRu: "Метаболизм сначала",
    shortRu:
      "До генов могли возникнуть самоподдерживающиеся сети реакций, которые постепенно обрели наследование.",
    mechanismRu:
      "Минералы могли ускорять циклы реакций, а отбор шел не между организмами, а между химическими сетями, устойчивыми к распаду.",
    evidenceRu:
      "Многие древние ферменты используют металлы; геохимия показывает, что часть реакций метаболизма возможна без сложных белков.",
    openQuestionRu:
      "Главная трудность — объяснить, как такие сети начали точно копировать полезные изменения.",
    statusRu: "конкурирующая модель к РНК-миру",
    sourceLabels: [
      "Understanding Evolution: From soup to cells",
      "Nature Education: Origins of Life",
    ],
  },
  {
    id: "lipid-world",
    titleRu: "Липидные протоклетки",
    shortRu:
      "Жизнь могла начаться с пузырьков-мембран, которые отделяли внутреннюю химию от внешней среды.",
    mechanismRu:
      "Жирные кислоты самособираются в пузырьки, могут расти, делиться и удерживать молекулы внутри — это уже похоже на оболочку клетки.",
    evidenceRu:
      "Лабораторные протоклетки показывают, что мембраны могут появляться до сложной биохимии и помогать концентрации реагентов.",
    openQuestionRu:
      "Нужно объяснить, как мембранные пузырьки связались с наследованием и энергетикой.",
    statusRu: "важный мост к первой клетке",
    sourceLabels: [
      "Understanding Evolution: From soup to cells",
      "Nature Education: Origins of Life",
    ],
  },
  {
    id: "panspermia",
    titleRu: "Панспермия",
    shortRu:
      "Органика или даже микробы могли попасть на Землю из космоса, но это не решает вопрос, как жизнь возникла впервые.",
    mechanismRu:
      "Метеориты, кометы и пыль могли доставлять аминокислоты и другие органические вещества на молодую Землю.",
    evidenceRu:
      "Органические молекулы действительно находят в метеоритах и межпланетной среде; космос богат химическими заготовками.",
    openQuestionRu:
      "Даже если доставка была важна, происхождение первой самовоспроизводящейся системы все равно нужно объяснить.",
    statusRu: "гипотеза доставки, не финальное объяснение",
    sourceLabels: [
      "Understanding Evolution: From soup to cells",
      "Encyclopaedia Britannica: Origin of life",
    ],
  },
];
