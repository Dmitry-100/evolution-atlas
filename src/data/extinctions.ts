export type ExtinctionSource = {
  label: string;
  url: string;
};

export type ExtinctionImage = {
  src: string;
  altRu: string;
  creditRu: string;
};

export type MassExtinctionEvent = {
  id: string;
  titleRu: string;
  ageMa: number;
  windowRu: string;
  lossRu: string;
  lossPercentRu: string;
  snapshotRu: string;
  keyFactsRu: string[];
  image: ExtinctionImage;
  color: string;
  likelyCausesRu: string[];
  afterRu: string;
  relationRu: string;
  sources: ExtinctionSource[];
};

const source = (label: string, url: string): ExtinctionSource => ({ label, url });

export const MASS_EXTINCTIONS: MassExtinctionEvent[] = [
  {
    id: "ordovician-silurian",
    titleRu: "Ордовикско-силурийское",
    ageMa: 444,
    windowRu: "примерно 444 млн лет назад",
    lossRu: "Исчезла большая часть морских видов; суша тогда еще почти не была заселена животными.",
    lossPercentRu: "около 85% морских видов",
    snapshotRu: "похолодание сковало Гондвану льдом, море отступило, а мелководные экосистемы потеряли огромную площадь.",
    keyFactsRu: [
      "По материалам презентации, уровень моря мог упасть примерно на 120 м, а первая волна уничтожила до 85% морских видов.",
      "Кризис ударил по “верхушке” морских пищевых сетей: трилобитам, брахиоподам, кораллам и другим обитателям шельфа.",
      "Вторая волна связывается с аноксией: когда кислорода в океане стало меньше, восстановление экосистем замедлилось.",
    ],
    image: {
      src: "/assets/images/extinctions/ordovician-silurian.jpg",
      altRu: "Слайд о позднеордовикском вымирании: карта оледенения, падение уровня моря и последствия для морской биоты",
      creditRu: "Презентация “Шесть апокалипсисов планеты”, слайд 3",
    },
    color: "#82b7b3",
    likelyCausesRu: ["оледенение", "падение уровня моря", "изменение химии океанов"],
    afterRu: "Морские экосистемы постепенно перестроились, а позвоночные продолжили путь к будущему разнообразию.",
    relationRu: "Наша линия тогда была далека от приматов: речь идет о ранних хордовых и позвоночных в океане.",
    sources: [
      source("Britannica: mass extinction", "https://www.britannica.com/science/mass-extinction"),
      source("Wikipedia: Ordovician-Silurian extinction events", "https://en.wikipedia.org/wiki/Ordovician%E2%80%93Silurian_extinction_events"),
    ],
  },
  {
    id: "late-devonian",
    titleRu: "Позднедевонское",
    ageMa: 372,
    windowRu: "несколько волн около 372-359 млн лет назад",
    lossRu: "Сильно пострадали рифы, морские беспозвоночные и многие группы рыб.",
    lossPercentRu: "около 75% видов",
    snapshotRu: "серия кризисов разрушила рифовые системы и особенно сильно ударила по морским экосистемам девона.",
    keyFactsRu: [
      "В презентации девонский кризис показан как цепочка: леса и почвы меняют сток веществ, океан теряет кислород, рифы рушатся.",
      "Особенно пострадали рифостроители: исчезновение рифов меняло не один вид, а целые места обитания.",
      "На фоне этих перестроек позвоночные продолжали экспериментировать с мелководьем и сушей.",
    ],
    image: {
      src: "/assets/images/extinctions/late-devonian.jpg",
      altRu: "Слайд о девонском вымирании: механизм кризиса, серые пульсации, иллюстрация падения разнообразия",
      creditRu: "Презентация “Шесть апокалипсисов планеты”, слайд 5",
    },
    color: "#83a8bf",
    likelyCausesRu: ["дефицит кислорода в океане", "климатические колебания", "перестройка наземных экосистем"],
    afterRu: "После кризиса меняется состав рыб и усиливается значение форм, связанных с будущим выходом позвоночных на сушу.",
    relationRu: "Это фон эпохи, в которой появляются переходные формы вроде Tiktaalik и ранние четвероногие.",
    sources: [
      source("Natural History Museum: mass extinctions", "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one.html"),
      source("Wikipedia: Late Devonian extinction", "https://en.wikipedia.org/wiki/Late_Devonian_extinction"),
    ],
  },
  {
    id: "permian-triassic",
    titleRu: "Пермское",
    ageMa: 252,
    windowRu: "примерно 252 млн лет назад",
    lossRu: "Крупнейший известный кризис: исчезла основная часть морских видов и множество наземных групп.",
    lossPercentRu: "около 90% всех видов; более 95% морских видов по классическим оценкам",
    snapshotRu: "Сибирские траппы выбросили колоссальные объемы CO2 и SO2; океаны нагрелись, закислились и потеряли кислород.",
    keyFactsRu: [
      "Это “Великое вымирание”: оценки обычно говорят об исчезновении около 90% всех видов и более 95% морских видов.",
      "Причина не один удар, а каскад: вулканизм, парниковый перегрев, закисление, аноксия и разрушение пищевых сетей.",
      "Выживание синапсид через этот фильтр важно для нашей линии: млекопитающие появятся позже, но корни ветви прошли кризис.",
    ],
    image: {
      src: "/assets/images/extinctions/permian-triassic.jpg",
      altRu: "Слайд о пермско-триасовом вымирании: Сибирские траппы, выбросы газов, нагрев океана и масштаб потерь",
      creditRu: "Презентация “Шесть апокалипсисов планеты”, слайд 7",
    },
    color: "#d0a35b",
    likelyCausesRu: ["масштабный вулканизм", "резкое потепление", "закисление и обескислороживание океанов"],
    afterRu: "Мир фактически пересобрался: выжившие линии заняли освободившиеся экологические роли.",
    relationRu: "Линия млекопитающих прошла через этот кризис в составе древних синапсид, задолго до настоящих млекопитающих.",
    sources: [
      source("Smithsonian: End-Permian extinction", "https://naturalhistory.si.edu/education/teaching-resources/paleontology/extinction-over-time/end-permian-extinction"),
      source("Wikipedia: Permian-Triassic extinction event", "https://en.wikipedia.org/wiki/Permian%E2%80%93Triassic_extinction_event"),
    ],
  },
  {
    id: "triassic-jurassic",
    titleRu: "Триасово-юрское",
    ageMa: 201,
    windowRu: "примерно 201 млн лет назад",
    lossRu: "Исчезли многие крупные амфибии, морские рептилии и конкуренты ранних динозавров.",
    lossPercentRu: "около 80% видов",
    snapshotRu: "на рубеже триаса и юры вулканизм и скачки CO2 резко перестроили климат, океан и наземные сообщества.",
    keyFactsRu: [
      "Кризис убрал многих конкурентов динозавров: после него началась их долгая мезозойская доминация.",
      "Ранние млекопитающие пережили этот период небольшими формами, не став главными сразу.",
      "Для нашей линии это урок выживания в тени: иногда эволюционный успех начинается не с доминирования, а с сохранения ветви.",
    ],
    image: {
      src: "/assets/images/extinctions/triassic-jurassic.jpg",
      altRu: "Слайд о триасово-юрском вымирании: вулканизм, CO2, кислотные дожди и начало эпохи динозавров",
      creditRu: "Презентация “Шесть апокалипсисов планеты”, слайд 9",
    },
    color: "#b47d56",
    likelyCausesRu: ["вулканизм Центрально-Атлантической магматической провинции", "парниковый эффект", "изменения океана"],
    afterRu: "Динозавры получили больше пространства, а ранние млекопитающие продолжили существовать небольшими ночными формами.",
    relationRu: "Для нашей линии это важный фильтр выживания: млекопитающие не стали главными сразу, но сохранились.",
    sources: [
      source("National Geographic: mass extinctions", "https://education.nationalgeographic.org/resource/mass-extinction/"),
      source("Wikipedia: Triassic-Jurassic extinction event", "https://en.wikipedia.org/wiki/Triassic%E2%80%93Jurassic_extinction_event"),
    ],
  },
  {
    id: "cretaceous-paleogene",
    titleRu: "Мел-палеогеновое",
    ageMa: 66,
    windowRu: "66 млн лет назад",
    lossRu: "Исчезли нептичьи динозавры и множество морских и наземных видов.",
    lossPercentRu: "примерно 75% видов",
    snapshotRu: "удар Чиксулуба и последующая глобальная тьма оборвали многие пищевые цепи, но открыли ниши для млекопитающих.",
    keyFactsRu: [
      "Это не только “динозавры исчезли”: пострадали морские рептилии, аммониты, планктон и наземные экосистемы.",
      "После катастрофы мелкие, всеядные и быстро размножающиеся млекопитающие получили больше свободных ниш.",
      "Рубеж 66 млн лет особенно важен для атласа: вскоре после него начинается короткий путь к ранним приматам.",
    ],
    image: {
      src: "/assets/images/extinctions/cretaceous-paleogene.jpg",
      altRu: "Слайд о мел-палеогеновом вымирании: астероид, региональные эффекты, цунами, пожары и последствия",
      creditRu: "Презентация “Шесть апокалипсисов планеты”, слайд 11",
    },
    color: "#91a96a",
    likelyCausesRu: ["удар астероида", "глобальная пыль и пожары", "дополнительный стресс от вулканизма"],
    afterRu: "Освободились экологические ниши, и млекопитающим стало легче быстро разнообразиться.",
    relationRu: "Именно после этого кризиса начинается тот мир, где приматы получают шанс стать заметной ветвью.",
    sources: [
      source("NASA: Chicxulub impact", "https://science.nasa.gov/solar-system/asteroids/chicxulub-impact-event/"),
      source("Wikipedia: Cretaceous-Paleogene extinction event", "https://en.wikipedia.org/wiki/Cretaceous%E2%80%93Paleogene_extinction_event"),
    ],
  },
  {
    id: "holocene-anthropocene",
    titleRu: "Современный кризис биоразнообразия",
    ageMa: 0,
    windowRu: "сейчас",
    lossRu:
      "Это не один удар астероида, а ускоренное исчезновение популяций и видов под давлением человека.",
    lossPercentRu:
      "около 1 млн видов находятся под угрозой исчезновения по оценке IPBES",
    snapshotRu:
      "изменение землепользования, прямое изъятие организмов, климат, загрязнение и инвазивные виды одновременно давят на биосферу.",
    keyFactsRu: [
      "В отличие от древних кризисов, этот происходит при нас: главные драйверы можно измерять и менять политикой, технологиями и поведением.",
      "IPBES оценивает, что около 1 млн видов животных и растений находятся под угрозой исчезновения.",
      "Это не доказательство “конца жизни”, но сильный сигнал: разнообразие ветвей может резко сократиться за исторически короткое время.",
    ],
    image: {
      src: "/assets/images/extinctions/holocene-anthropocene.jpg",
      altRu:
        "Слайд о шестом глобальном вымирании: человеческий фактор, драйверы и темпы исчезновения видов",
      creditRu: "Презентация “Шесть апокалипсисов планеты”, слайд 14",
    },
    color: "#d87c63",
    likelyCausesRu: [
      "изменение землепользования",
      "эксплуатация видов",
      "климат",
      "загрязнение",
      "инвазивные виды",
    ],
    afterRu:
      "Будущее этого кризиса не завершено: в отличие от древних вымираний, часть причин зависит от решений современных обществ.",
    relationRu:
      "Наша ветвь стала геологической силой: Homo sapiens впервые не только проходит через кризис, но и сам его усиливает или может ослабить.",
    sources: [
      source("IPBES: Global Assessment", "https://www.ipbes.net/global-assessment"),
      source("Natural History Museum: are we facing the sixth mass extinction?", "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one.html"),
      source("IUCN Red List", "https://www.iucnredlist.org/"),
    ],
  },
];
