export type GeologicPeriod = {
  id: string;
  titleRu: string;
  systemRu: string;
  intervalRu: string;
  olderMa: number;
  youngerMa: number;
  color: string;
  namedForRu: string;
  boundaryRu: string;
  summaryRu: string;
  atlasRu: string;
};

export type GeologicBoundary = {
  id: string;
  titleRu: string;
  ageMa: number;
  toleranceMa?: number;
  periodBeforeId: GeologicPeriod["id"];
  periodAfterId: GeologicPeriod["id"];
  noteRu: string;
};

export type GeologicContext = {
  period: GeologicPeriod;
  boundary?: GeologicBoundary;
};

export const GEOLOGIC_PERIODS: GeologicPeriod[] = [
  {
    id: "archean",
    titleRu: "Архей",
    systemRu: "эон",
    intervalRu: "4,0–2,5 млрд лет назад",
    olderMa: 4000,
    youngerMa: 2500,
    color: "#63a5aa",
    namedForRu: "от греческого слова «древний»",
    boundaryRu:
      "Опора — древнейшие породы, изотопы и следы ранней земной коры.",
    summaryRu:
      "Ранняя Земля, первые устойчивые клеточные линии и микробные экосистемы.",
    atlasRu:
      "В Атласе сюда попадают первые клетки, прокариоты и ранние микробные следы.",
  },
  {
    id: "proterozoic",
    titleRu: "Протерозой",
    systemRu: "эон",
    intervalRu: "2,5 млрд – 635 млн лет назад",
    olderMa: 2500,
    youngerMa: 635,
    color: "#6fb7ab",
    namedForRu: "буквально «ранняя жизнь»",
    boundaryRu:
      "Начало связано с перестройкой коры, океанов и атмосферы.",
    summaryRu:
      "Почти два миллиарда лет: кислород, эукариоты и подготовка многоклеточности.",
    atlasRu:
      "Здесь находятся цианобактерии, эукариоты и одноклеточные родственники животных.",
  },
  {
    id: "ediacaran",
    titleRu: "Эдиакарий",
    systemRu: "период",
    intervalRu: "635–538,8 млн лет назад",
    olderMa: 635,
    youngerMa: 538.8,
    color: "#8ec3a0",
    namedForRu: "по холмам Эдиакара в Южной Австралии",
    boundaryRu:
      "Нижняя граница идет после глобальных оледенений; верхняя упирается в кембрий.",
    summaryRu:
      "Поздний докембрий с крупными мягкотелыми организмами и сложными сообществами.",
    atlasRu:
      "В Атласе это ближайший фон для первых животных и двусторонних форм.",
  },
  {
    id: "cambrian",
    titleRu: "Кембрий",
    systemRu: "период",
    intervalRu: "538,8–486,9 млн лет назад",
    olderMa: 538.8,
    youngerMa: 486.9,
    color: "#aac474",
    namedForRu: "по латинскому названию Уэльса — Cambria",
    boundaryRu:
      "Начало видно по следам животных и смене морских фаун.",
    summaryRu:
      "Морские животные становятся особенно заметны: панцири, глаза, хищники.",
    atlasRu:
      "Здесь удобно смотреть кембрийский взрыв, ранних хордовых и первые узнаваемые планы тела.",
  },
  {
    id: "ordovician",
    titleRu: "Ордовик",
    systemRu: "период",
    intervalRu: "486,9–443,8 млн лет назад",
    olderMa: 486.9,
    youngerMa: 443.8,
    color: "#93b978",
    namedForRu: "по кельтскому племени ордовиков",
    boundaryRu:
      "Границы уточняют по морским ископаемым, особенно граптолитам и конодонтам.",
    summaryRu:
      "Расцвет морских экосистем, ранние позвоночные и поздний ледниковый кризис.",
    atlasRu:
      "На шкале рядом находятся ранние позвоночные и ордовикско-силурийское вымирание.",
  },
  {
    id: "silurian",
    titleRu: "Силур",
    systemRu: "период",
    intervalRu: "443,8–419,2 млн лет назад",
    olderMa: 443.8,
    youngerMa: 419.2,
    color: "#7fb99a",
    namedForRu: "по кельтскому племени силуров",
    boundaryRu:
      "Силур начинается после ордовикского кризиса; слои читают по морским организмам.",
    summaryRu:
      "Моря восстанавливаются, челюстные рыбы распространяются, жизнь закрепляется на суше.",
    atlasRu:
      "Он связывает первых позвоночных с будущей линией челюстных рыб.",
  },
  {
    id: "devonian",
    titleRu: "Девон",
    systemRu: "период",
    intervalRu: "419,2–358,9 млн лет назад",
    olderMa: 419.2,
    youngerMa: 358.9,
    color: "#78a9bd",
    namedForRu: "по графству Девон в Англии",
    boundaryRu:
      "Границы задают морские слои и ископаемые, а не круглые даты.",
    summaryRu:
      "Рыбы разнообразны, появляются леса и первые позвоночные у кромки суши.",
    atlasRu:
      "В Атласе это область челюстных рыб, лопастеперых и девонских кризисов.",
  },
  {
    id: "carboniferous",
    titleRu: "Карбон",
    systemRu: "период",
    intervalRu: "358,9–298,9 млн лет назад",
    olderMa: 358.9,
    youngerMa: 298.9,
    color: "#97ad65",
    namedForRu: "по угленосным пластам Европы",
    boundaryRu:
      "Период выделили по угольным пластам, растениям и морским фаунам.",
    summaryRu:
      "Влажные леса, угленакопление, крупные членистоногие и ранние амниоты.",
    atlasRu:
      "На этой части шкалы появляются наземные позвоночные и амниотическое яйцо.",
  },
  {
    id: "permian",
    titleRu: "Пермь",
    systemRu: "период",
    intervalRu: "298,9–251,9 млн лет назад",
    olderMa: 298.9,
    youngerMa: 251.9,
    color: "#c48d5d",
    namedForRu: "по Пермскому краю и Уралу",
    boundaryRu:
      "Конец периода узнают по резкой смене слоев и фаун после большого вымирания.",
    summaryRu:
      "Синапсиды, сухие внутренние области Пангеи и жесткий климатический фон.",
    atlasRu:
      "Здесь видны терапсиды и перелом перед ранними млекопитающими родственниками.",
  },
  {
    id: "triassic",
    titleRu: "Триас",
    systemRu: "период",
    intervalRu: "251,9–201,4 млн лет назад",
    olderMa: 251.9,
    youngerMa: 201.4,
    color: "#be8061",
    namedForRu: "по трехчастной толще пород в Германии",
    boundaryRu:
      "Триас начинается после пермского кризиса и заканчивается новым крупным кризисом.",
    summaryRu:
      "Экосистемы восстанавливаются; появляются первые динозавры и ранние млекопитающие формы.",
    atlasRu:
      "В Атласе сюда попадают цинодонты и переход к млекопитающим признакам.",
  },
  {
    id: "jurassic",
    titleRu: "Юра",
    systemRu: "период",
    intervalRu: "201,4–145 млн лет назад",
    olderMa: 201.4,
    youngerMa: 145,
    color: "#83a85d",
    namedForRu: "по горам Юра в Европе",
    boundaryRu:
      "Начало юры видно по перестройке морских и наземных фаун после кризиса.",
    summaryRu:
      "Крупные динозавры, морские рептилии, первые птицы и мелкие млекопитающие.",
    atlasRu:
      "На человеческой линии это время ранних млекопитающих и сохранения мелких ночных форм.",
  },
  {
    id: "cretaceous",
    titleRu: "Мел",
    systemRu: "период",
    intervalRu: "145–66 млн лет назад",
    olderMa: 145,
    youngerMa: 66,
    color: "#a8bd6d",
    namedForRu: "по меловым отложениям Европы",
    boundaryRu:
      "Конец мела отмечают иридиевый слой, Чиксулуб и смена ископаемых.",
    summaryRu:
      "Цветковые растения, поздние динозавры, птицы и млекопитающие перед K-Pg.",
    atlasRu:
      "Эта граница важна для дальнейшего расцвета млекопитающих и ранней ветви приматов.",
  },
  {
    id: "paleogene",
    titleRu: "Палеоген",
    systemRu: "период",
    intervalRu: "66–23,03 млн лет назад",
    olderMa: 66,
    youngerMa: 23.03,
    color: "#d1ad61",
    namedForRu: "как «древняя часть» кайнозойской истории",
    boundaryRu:
      "Старт связан с глобальным слоем последствий удара на K-Pg-границе.",
    summaryRu:
      "После исчезновения нептичьих динозавров быстро разнообразятся млекопитающие и ранние приматы.",
    atlasRu:
      "В Атласе отсюда начинается отдельная ось приматов и человека.",
  },
  {
    id: "neogene",
    titleRu: "Неоген",
    systemRu: "период",
    intervalRu: "23,03–2,58 млн лет назад",
    olderMa: 23.03,
    youngerMa: 2.58,
    color: "#d7b86f",
    namedForRu: "как «новая часть» кайнозоя",
    boundaryRu:
      "Неоген отделяют по морским микрофоссилиям, климату и наземным фаунам.",
    summaryRu:
      "Похолодание, расширение открытых ландшафтов, человекообразные и ранняя линия Homo.",
    atlasRu:
      "Он охватывает человекообразных, гоминин и первые крупные шаги нашей ветви.",
  },
  {
    id: "quaternary",
    titleRu: "Четвертичный период",
    systemRu: "период",
    intervalRu: "2,58 млн лет назад — сегодня",
    olderMa: 2.58,
    youngerMa: 0,
    color: "#e1c780",
    namedForRu: "историческое название самой молодой части кайнозоя",
    boundaryRu:
      "Начало связано с усилением ледниковых циклов Северного полушария.",
    summaryRu:
      "Ледниковые циклы, расселение Homo, неандертальцы, денисовцы и Homo sapiens.",
    atlasRu:
      "Здесь находятся поздние Homo, ранние находки Homo sapiens и расселение за пределы Африки.",
  },
];

export const GEOLOGIC_BOUNDARIES: GeologicBoundary[] = [
  {
    id: "ediacaran-cambrian",
    titleRu: "Граница эдиакарий — кембрий",
    ageMa: 538.8,
    toleranceMa: 3,
    periodBeforeId: "ediacaran",
    periodAfterId: "cambrian",
    noteRu:
      "Ее ставят по следам животных и смене морских ископаемых.",
  },
  {
    id: "ordovician-silurian",
    titleRu: "Граница ордовик — силур",
    ageMa: 443.8,
    toleranceMa: 1,
    periodBeforeId: "ordovician",
    periodAfterId: "silurian",
    noteRu:
      "В слоях видны потери морских видов и последующее восстановление фаун.",
  },
  {
    id: "permian-triassic",
    titleRu: "Граница пермь — триас",
    ageMa: 251.9,
    toleranceMa: 1,
    periodBeforeId: "permian",
    periodAfterId: "triassic",
    noteRu:
      "Ископаемые резко меняются после крупнейшего массового вымирания фанерозоя.",
  },
  {
    id: "triassic-jurassic",
    titleRu: "Граница триас — юра",
    ageMa: 201.4,
    toleranceMa: 1,
    periodBeforeId: "triassic",
    periodAfterId: "jurassic",
    noteRu:
      "После кризиса конца триаса наземные экосистемы быстро перестраиваются.",
  },
  {
    id: "cretaceous-paleogene",
    titleRu: "Граница мел — палеоген",
    ageMa: 66,
    toleranceMa: 1,
    periodBeforeId: "cretaceous",
    periodAfterId: "paleogene",
    noteRu:
      "Ее узнают по ударному слою, кратеру Чиксулуб и смене ископаемых.",
  },
  {
    id: "neogene-quaternary",
    titleRu: "Граница неоген — четвертичный период",
    ageMa: 2.58,
    toleranceMa: 0.08,
    periodBeforeId: "neogene",
    periodAfterId: "quaternary",
    noteRu:
      "Рубеж связан с усилением ледниковых циклов Северного полушария.",
  },
];

const PERIOD_BY_ID = new Map(
  GEOLOGIC_PERIODS.map((period) => [period.id, period]),
);

export function getGeologicPeriodById(id: string) {
  return PERIOD_BY_ID.get(id);
}

export function getGeologicPeriodForAge(ageMa: number) {
  return GEOLOGIC_PERIODS.find(
    (period) => ageMa <= period.olderMa && ageMa >= period.youngerMa,
  );
}

export function getGeologicBoundaryForAge(ageMa: number, toleranceMa = 0.35) {
  return GEOLOGIC_BOUNDARIES.find(
    (boundary) =>
      Math.abs(boundary.ageMa - ageMa) <=
      (boundary.toleranceMa ?? toleranceMa),
  );
}

export function getGeologicContextForAge(ageMa: number): GeologicContext | null {
  const boundary = getGeologicBoundaryForAge(ageMa);

  if (boundary) {
    const period =
      getGeologicPeriodById(boundary.periodAfterId) ??
      getGeologicPeriodById(boundary.periodBeforeId);

    return period ? { period, boundary } : null;
  }

  const period = getGeologicPeriodForAge(ageMa);

  return period ? { period } : null;
}
