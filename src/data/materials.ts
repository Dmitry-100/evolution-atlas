export type PortalMaterial = {
  id: string;
  titleRu: string;
  subtitleRu: string;
  audienceRu: string;
  slideCount: number;
  coverSrc: string;
  pdfHref: string;
  pptxHref: string;
  summaryRu: string;
  portalUseRu: string[];
  tags: string[];
};

export const PORTAL_MATERIALS: PortalMaterial[] = [
  {
    id: "path-from-cell-to-human",
    titleRu: "Путь от клетки к человеку",
    subtitleRu: "Базовая лекция о большой линии эволюции",
    audienceRu: "для коллег и взрослых без биологической подготовки",
    slideCount: 18,
    coverSrc: "/materials/covers/path-from-cell-to-human.jpg",
    pdfHref: "/materials/path-from-cell-to-human.pdf",
    pptxHref: "/materials/path-from-cell-to-human.pptx",
    summaryRu:
      "Самый близкий к атласу материал: 4 млрд лет истории жизни, кислородная революция, выход на сушу, млекопитающие, приматы и Homo sapiens.",
    portalUseRu: [
      "использовать как расширенный конспект к главному атласу",
      "перенести отдельные тезисы в карточки этапов",
      "оставить PDF как лекцию для самостоятельного просмотра",
    ],
    tags: ["базовый маршрут", "эволюция человека", "атлас"],
  },
  {
    id: "six-planet-apocalypses",
    titleRu: "Шесть апокалипсисов планеты",
    subtitleRu: "Глобальные вымирания, причины и последствия",
    audienceRu: "для раздела о кризисах биосферы",
    slideCount: 18,
    coverSrc: "/materials/covers/six-planet-apocalypses.jpg",
    pdfHref: "/materials/six-planet-apocalypses.pdf",
    pptxHref: "/materials/six-planet-apocalypses.pptx",
    summaryRu:
      "Готовая лекция для усиления страницы о вымираниях: ордовикское, девонское, пермское, триасово-юрское, мел-палеогеновое и современный кризис биоразнообразия.",
    portalUseRu: [
      "расширить страницу “Глобальные вымирания”",
      "добавить сценарии причин и последствий",
      "показать связь кризисов с новыми ветвями эволюции",
    ],
    tags: ["вымирания", "биосфера", "кризисы"],
  },
  {
    id: "cell-to-human-kids",
    titleRu: "От клетки до человека: детская версия",
    subtitleRu: "Простое объяснение для детей и новичков",
    audienceRu: "для детей примерно 12 лет и семейного просмотра",
    slideCount: 12,
    coverSrc: "/materials/covers/cell-to-human-kids.jpg",
    pdfHref: "/materials/cell-to-human-kids.pdf",
    pptxHref: "/materials/cell-to-human-kids.pptx",
    summaryRu:
      "Самый доступный материал: клетки, митохондрии, Tiktaalik, рептилии, млекопитающие, приматы, первые Homo и культурное наследие.",
    portalUseRu: [
      "сделать режим “объяснить проще”",
      "вынести отдельные детские формулировки в подсказки",
      "использовать как отдельную лекцию для родителей и детей",
    ],
    tags: ["детская версия", "простым языком", "новичкам"],
  },
  {
    id: "homo-luca-sapiens",
    titleRu: "Эволюция Homo: от LUCA к sapiens",
    subtitleRu: "Продвинутый слой о молекулярной и когнитивной эволюции",
    audienceRu: "для подготовленной аудитории",
    slideCount: 18,
    coverSrc: "/materials/covers/homo-luca-sapiens.jpg",
    pdfHref: "/materials/homo-luca-sapiens.pdf",
    pptxHref: "/materials/homo-luca-sapiens.pptx",
    summaryRu:
      "Плотная научная презентация: симбиогенез, генетическая регуляция, неокортекс, диета, язык, когнитивные функции и будущее Homo sapiens.",
    portalUseRu: [
      "сделать продвинутую страницу “генетика и мозг”",
      "использовать схемы как основу для новых нативных инфографик",
      "не смешивать с главным атласом, чтобы не перегрузить первый экран",
    ],
    tags: ["LUCA", "генетика", "мозг", "продвинутый"],
  },
  {
    id: "evolutionary-advantage-genes-behavior",
    titleRu: "Эволюционная выгода: гены и поведение",
    subtitleRu: "Родственный отбор, мемы, фенотип и поведение",
    audienceRu: "для отдельной лекции после базового атласа",
    slideCount: 12,
    coverSrc: "/materials/covers/evolutionary-advantage-genes-behavior.jpg",
    pdfHref: "/materials/evolutionary-advantage-genes-behavior.pdf",
    pptxHref: "/materials/evolutionary-advantage-genes-behavior.pptx",
    summaryRu:
      "Материал про эволюционную логику поведения: репликаторы, альтруизм, родственный отбор, расширенный фенотип, культурная эволюция и ограничения геноцентризма.",
    portalUseRu: [
      "вынести в отдельный модуль после теории эволюции",
      "связать биологическую эволюцию с культурной",
      "использовать как лекцию для дискуссии, а не как часть шкалы видов",
    ],
    tags: ["поведение", "гены", "мемы", "культура"],
  },
];
