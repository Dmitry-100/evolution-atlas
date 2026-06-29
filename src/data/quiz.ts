export const QUIZ_TOPIC_IDS = [
  "tree-thinking",
  "deep-time",
  "human-lineage",
  "dinosaurs-extinctions",
  "genetics-origin",
  "theory-evidence",
] as const;

export const QUIZ_ATTEMPT_SIZE = 10;

export type QuizTopicId = (typeof QUIZ_TOPIC_IDS)[number];

export type QuizTopicLink = {
  labelRu: string;
  href: string;
};

export type QuizTopic = {
  id: QuizTopicId;
  titleRu: string;
  practiceRu: string;
  links: QuizTopicLink[];
};

export type QuizOption = {
  id: string;
  textRu: string;
  isCorrect: boolean;
};

export type QuizQuestionBase = {
  id: string;
  type: "single-choice" | "order" | "branch-choice";
  topicId: QuizTopicId;
  promptRu: string;
  explanationRu: string;
};

export type SingleChoiceQuizQuestion = QuizQuestionBase & {
  type: "single-choice";
  options: QuizOption[];
};

export type OrderQuizItem = {
  id: string;
  textRu: string;
};

export type OrderQuizQuestion = QuizQuestionBase & {
  type: "order";
  instructionRu: string;
  items: OrderQuizItem[];
  correctOrder: string[];
};

export type BranchChoiceNode = {
  id: string;
  textRu: string;
  detailRu: string;
};

export type BranchChoiceQuizQuestion = QuizQuestionBase & {
  type: "branch-choice";
  instructionRu: string;
  nodes: BranchChoiceNode[];
  correctNodeId: string;
};

export type QuizQuestion = SingleChoiceQuizQuestion | OrderQuizQuestion | BranchChoiceQuizQuestion;

export type QuizAnswerValue = string | string[];

export type QuizTopicResult = {
  topicId: QuizTopicId;
  correct: number;
  wrong: number;
  total: number;
};

export type QuizScoreResult = {
  correct: number;
  total: number;
  topicResults: Record<QuizTopicId, QuizTopicResult>;
  recommendedTopics: QuizTopic[];
};

export const QUIZ_TOPICS: Record<QuizTopicId, QuizTopic> = {
  "tree-thinking": {
    id: "tree-thinking",
    titleRu: "Дерево родства",
    practiceRu: "Потренируйте привычку видеть ветвления и соседние линии, а не лестницу прогресса.",
    links: [
      { labelRu: "Открыть дерево родства", href: "/cladogram" },
      { labelRu: "Вернуться в Атлас", href: "/" },
    ],
  },
  "deep-time": {
    id: "deep-time",
    titleRu: "Глубокое время",
    practiceRu: "Полезно ещё раз почувствовать масштаб: почти всё главное для человека происходит в самом конце шкалы.",
    links: [
      { labelRu: "Открыть Атлас времени", href: "/" },
      { labelRu: "Материалы для закрепления", href: "/materials" },
    ],
  },
  "human-lineage": {
    id: "human-lineage",
    titleRu: "Линия человека",
    practiceRu: "Повторите, где проходят приматы, человекообразные, гоминины и соседние ветви людей.",
    links: [
      { labelRu: "Приматы → человек", href: "/primates" },
      { labelRu: "Дерево родства", href: "/cladogram" },
    ],
  },
  "dinosaurs-extinctions": {
    id: "dinosaurs-extinctions",
    titleRu: "Динозавры и вымирания",
    practiceRu: "Закрепите разницу между нептичьими динозаврами, птицами и большими кризисами жизни.",
    links: [
      { labelRu: "Вымерли ли динозавры", href: "/dinosaurs" },
      { labelRu: "Глобальные вымирания", href: "/extinctions" },
    ],
  },
  "genetics-origin": {
    id: "genetics-origin",
    titleRu: "ДНК и происхождение жизни",
    practiceRu: "Вернитесь к молекулярным следам родства: генетическому коду, хромосоме 2, LUCA и вложенным деревьям.",
    links: [
      { labelRu: "РНК/ДНК", href: "/genetics" },
      { labelRu: "Зарождение жизни", href: "/origin-of-life" },
    ],
  },
  "theory-evidence": {
    id: "theory-evidence",
    titleRu: "Теория и доказательства",
    practiceRu: "Освежите, что в науке значит теория и как отбор, ископаемые и ДНК складываются в объяснение.",
    links: [
      { labelRu: "Теория эволюции", href: "/theory" },
      { labelRu: "Источники", href: "/sources" },
    ],
  },
};

const QUESTION_TOPIC_IDS = {
  "monkey-origin": "human-lineage",
  "deep-time": "deep-time",
  "fish-to-limbs": "tree-thinking",
  neanderthals: "human-lineage",
  "tree-not-ladder": "tree-thinking",
  "chimp-common-ancestor": "human-lineage",
  "most-time-before-primates": "deep-time",
  "mammals-late": "deep-time",
  "chordates-feature": "human-lineage",
  "vertebrates-feature": "human-lineage",
  "jawed-fish": "human-lineage",
  "lobe-finned-meaning": "human-lineage",
  "tiktaalik-mosaic": "human-lineage",
  "tetrapods-digits": "human-lineage",
  "amniotes-land": "human-lineage",
  "synapsids-branch": "human-lineage",
  therapsids: "human-lineage",
  "cynodonts-jaw": "human-lineage",
  "mammal-traits": "human-lineage",
  placentals: "human-lineage",
  "kpg-mammal-opportunity": "dinosaurs-extinctions",
  "early-primates-traits": "human-lineage",
  anthropoids: "human-lineage",
  "new-world-monkeys": "human-lineage",
  "apes-no-tail": "human-lineage",
  hominins: "human-lineage",
  australopithecus: "human-lineage",
  "homo-erectus": "human-lineage",
  "sapiens-age": "deep-time",
  "darwin-origin": "theory-evidence",
  "scientific-theory": "theory-evidence",
  "natural-selection": "theory-evidence",
  "fossil-evidence": "theory-evidence",
  "dna-evidence": "genetics-origin",
  "five-mass-extinctions": "dinosaurs-extinctions",
  "ordovician-extinction": "dinosaurs-extinctions",
  "devonian-reefs": "dinosaurs-extinctions",
  "permian-largest": "dinosaurs-extinctions",
  "triassic-jurassic-dinosaurs": "dinosaurs-extinctions",
  "kpg-loss": "dinosaurs-extinctions",
  "birds-are-dinosaurs": "dinosaurs-extinctions",
  "theropods-birds": "dinosaurs-extinctions",
  "feathers-before-flight": "dinosaurs-extinctions",
  "archaeopteryx-mosaic": "dinosaurs-extinctions",
  cladogram: "tree-thinking",
  "accumulated-traits": "tree-thinking",
  "selected-point-percent": "deep-time",
  "genetic-code": "genetics-origin",
  "chimp-dna-percent": "genetics-origin",
  "chromosome-2": "genetics-origin",
  "dna-tree": "genetics-origin",
  "luca-not-first-life": "genetics-origin",
  "africa-origin-network": "human-lineage",
  "molecular-scars": "genetics-origin",
} as const satisfies Record<string, QuizTopicId>;

type QuizQuestionId = keyof typeof QUESTION_TOPIC_IDS;

const question = (
  id: QuizQuestionId,
  promptRu: string,
  explanationRu: string,
  options: Array<[id: string, textRu: string, isCorrect?: boolean]>,
): SingleChoiceQuizQuestion => ({
  id,
  type: "single-choice",
  topicId: QUESTION_TOPIC_IDS[id],
  promptRu,
  explanationRu,
  options: options.map(([optionId, textRu, isCorrect = false]) => ({
    id: optionId,
    textRu,
    isCorrect,
  })),
});

const orderQuestion = (
  id: QuizQuestionId,
  promptRu: string,
  explanationRu: string,
  items: OrderQuizItem[],
  correctOrder: string[],
): OrderQuizQuestion => ({
  id,
  type: "order",
  topicId: QUESTION_TOPIC_IDS[id],
  promptRu,
  explanationRu,
  instructionRu: "Расставьте карточки от более раннего события к более позднему.",
  items,
  correctOrder,
});

const branchQuestion = (
  id: QuizQuestionId,
  promptRu: string,
  explanationRu: string,
  nodes: BranchChoiceNode[],
  correctNodeId: string,
): BranchChoiceQuizQuestion => ({
  id,
  type: "branch-choice",
  topicId: QUESTION_TOPIC_IDS[id],
  promptRu,
  explanationRu,
  instructionRu: "Выберите правильный узел на мини-схеме родства.",
  nodes,
  correctNodeId,
});

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  question(
    "monkey-origin",
    "А от кого произошла обезьяна?",
    "Не от современных обезьян, а от более древних приматов. Современные обезьяны - наши родственники на соседних ветвях.",
    [
      ["early-primates", "От более ранних приматов", true],
      ["modern-chimp", "От современных шимпанзе"],
      ["dinosaurs", "От динозавров"],
    ],
  ),
  orderQuestion(
    "deep-time",
    "Расставьте события жизни от раннего к позднему.",
    "Приматы появляются только в конце декабря, а Homo sapiens - почти в самом конце. Это помогает почувствовать, насколько поздно наша ветвь возникает в истории жизни.",
    [
      { id: "primates", textRu: "Первые приматы" },
      { id: "early-life", textRu: "Ранняя клеточная жизнь" },
      { id: "sapiens", textRu: "Homo sapiens" },
      { id: "vertebrates", textRu: "Позвоночные" },
      { id: "mammals", textRu: "Млекопитающие" },
    ],
    ["early-life", "vertebrates", "mammals", "primates", "sapiens"],
  ),
  question(
    "fish-to-limbs",
    "Какая идея лучше всего объясняет переход плавника к конечности?",
    "Конечность не появляется с нуля: эволюция перестраивает старую архитектуру плавника, опоры и мышц.",
    [
      ["instant", "Мгновенное появление готовой ноги"],
      ["remodeling", "Постепенная перестройка старой структуры", true],
      ["choice", "Сознательный выбор организма"],
    ],
  ),
  question(
    "neanderthals",
    "Неандертальцы были нашими прямыми предками?",
    "Скорее это близкая боковая ветвь людей. Homo sapiens частично смешивался с ними, но это не лестница 'ниже-выше'.",
    [
      ["side-branch", "Нет, это близкая боковая ветвь", true],
      ["apes", "Да, это древние обезьяны"],
      ["dinosaurs", "Нет, это динозавры"],
    ],
  ),
  question(
    "tree-not-ladder",
    "Почему эволюцию лучше представлять деревом, а не лестницей?",
    "Линии родства ветвятся. Одни ветви продолжаются, другие исчезают, но они не образуют прямую лестницу от 'простого' к человеку.",
    [
      ["tree", "Потому что линии родства ветвятся", true],
      ["ladder", "Потому что все виды идут одной очередью"],
      ["goal", "Потому что цель эволюции - человек"],
    ],
  ),
  branchQuestion(
    "chimp-common-ancestor",
    "Что точнее: человек произошел от шимпанзе или человек и шимпанзе имеют общего предка?",
    "Современные шимпанзе не наши предки. Мы и шимпанзе - родственные ветви, которые разошлись от общего предка.",
    [
      { id: "modern-chimp", textRu: "Современный шимпанзе", detailRu: "Соседняя современная ветвь, а не наш предок." },
      { id: "common-ancestor", textRu: "Общий предок", detailRu: "От него расходятся линии человека и шимпанзе." },
      { id: "sapiens", textRu: "Homo sapiens", detailRu: "Наша современная ветвь, а не источник родства." },
    ],
    "common-ancestor",
  ),
  question(
    "most-time-before-primates",
    "Какая часть истории жизни прошла до появления ранних приматов?",
    "Если считать от округленной шкалы в 4 млрд лет, к моменту ранних родственников приматов прошло около 98,4% этого пути.",
    [
      ["small", "Примерно 10%"],
      ["half", "Около половины"],
      ["almost-all", "Около 98,4%", true],
    ],
  ),
  orderQuestion(
    "mammals-late",
    "Расставьте эти события так, чтобы стало видно, почему млекопитающие появляются поздно.",
    "Первые млекопитающие появляются примерно 200 млн лет назад: это уже около 95% пути от ранней жизни до современности, а приматы появляются еще позже.",
    [
      { id: "primates", textRu: "Первые приматы" },
      { id: "early-life", textRu: "Ранняя жизнь" },
      { id: "mammals", textRu: "Первые млекопитающие" },
      { id: "early-animals", textRu: "Первые животные" },
    ],
    ["early-life", "early-animals", "mammals", "primates"],
  ),
  question(
    "chordates-feature",
    "Что делает ранних хордовых важными для нашей линии?",
    "У хордовых появляется внутренняя опорная ось и нервная трубка - основа будущей позвоночной архитектуры.",
    [
      ["wings", "У них впервые появляются крылья"],
      ["notochord", "У них есть хорда и нервная трубка", true],
      ["fur", "У них появляется шерсть"],
    ],
  ),
  question(
    "vertebrates-feature",
    "Что добавляет ветвь позвоночных к истории нашей линии?",
    "Позвоночные развивают внутренний скелет, череп и более защищенную нервную систему, что меняет возможности движения и чувств.",
    [
      ["spine", "Внутренний скелет и череп", true],
      ["flowers", "Цветковые растения"],
      ["milk", "Молоко и шерсть"],
    ],
  ),
  question(
    "jawed-fish",
    "Почему челюстные рыбы - важный шаг на шкале?",
    "Челюсти открыли новые способы питания и охоты, а вместе с ними усилилась перестройка головы и органов чувств.",
    [
      ["jaws", "Появляются челюсти и новые способы питания", true],
      ["hands", "Появляются хватательные кисти"],
      ["speech", "Появляется речь"],
    ],
  ),
  question(
    "lobe-finned-meaning",
    "Почему лопастеперые рыбы важны для понимания конечностей?",
    "В их плавниках уже есть костная и мышечная организация, из которой позже можно понять происхождение конечностей наземных позвоночных.",
    [
      ["random", "Потому что они случайно похожи на птиц"],
      ["limb-plan", "Потому что их плавники напоминают заготовку конечности", true],
      ["mammal", "Потому что это первые млекопитающие"],
    ],
  ),
  question(
    "tiktaalik-mosaic",
    "Почему Tiktaalik часто называют переходной формой?",
    "У него есть сочетание рыбьих и четвероногих признаков: плавники, шея, плоская голова и опора на мелководье.",
    [
      ["mosaic", "Он сочетает рыбьи и наземные признаки", true],
      ["human", "Он был первым человеком"],
      ["bird", "Он был первой птицей"],
    ],
  ),
  question(
    "tetrapods-digits",
    "Что означает слово 'четвероногие' в эволюционном контексте?",
    "Это ветвь позвоночных с конечностями, пальцами и архитектурой тела, из которой вышли амфибии, рептилии, птицы и млекопитающие.",
    [
      ["four-limbs", "Ветвь позвоночных с конечностями и пальцами", true],
      ["four-eyes", "Животные с четырьмя глазами"],
      ["four-brains", "Животные с четырьмя мозгами"],
    ],
  ),
  question(
    "amniotes-land",
    "Что дало амниотическое развитие древним позвоночным?",
    "Амниотические оболочки позволили эмбриону развиваться более независимо от воды, что усилило освоение суши.",
    [
      ["water-only", "Полную зависимость размножения от воды"],
      ["land-egg", "Более независимое развитие эмбриона на суше", true],
      ["photosynthesis", "Способность к фотосинтезу"],
    ],
  ),
  question(
    "synapsids-branch",
    "К какой большой ветви относятся синапсиды на пути к человеку?",
    "Синапсиды - это линия, из которой позже выйдут терапсиды, цинодонты и млекопитающие, а не динозавровая ветвь.",
    [
      ["mammal-line", "К линии млекопитающих", true],
      ["flower-line", "К линии цветковых растений"],
      ["bird-line-only", "Только к линии современных птиц"],
    ],
  ),
  question(
    "therapsids",
    "Почему терапсиды выглядят важным мостиком к млекопитающим?",
    "У терапсид заметнее перестройки черепа, зубов, конечностей и обмена веществ, которые приближают их к млекопитающей линии.",
    [
      ["mammal-like", "У них усиливаются млекопитающие черты", true],
      ["no-bones", "У них исчезают все кости"],
      ["modern-apes", "Это современные обезьяны"],
    ],
  ),
  question(
    "cynodonts-jaw",
    "Какая перестройка у цинодонтов особенно важна для истории млекопитающих?",
    "В линии цинодонтов меняются зубы и челюсть; часть костей задней челюсти позже станет связана со слухом у млекопитающих.",
    [
      ["jaw-ear", "Перестройка зубов, челюсти и будущего слухового аппарата", true],
      ["wings", "Появление маховых перьев"],
      ["shell", "Появление панциря черепахи"],
    ],
  ),
  question(
    "mammal-traits",
    "Какие признаки лучше всего описывают млекопитающих?",
    "Млекопитающие кормят детенышей молоком; для группы также характерны волосы и особое строение слуховых косточек.",
    [
      ["milk-hair", "Молоко, волосы и слуховые косточки", true],
      ["scales-gills", "Чешуя и жабры"],
      ["petals", "Лепестки и пыльца"],
    ],
  ),
  question(
    "placentals",
    "Почему ранние эутерии важны для нашей ветви?",
    "Ранние эутерии вроде Eomaia не были 'готовыми современными плацентарными', но относятся к ветви, внутри которой позже возникли плацентарные млекопитающие, включая человека.",
    [
      ["eutheria", "Это ранняя ветвь, ведущая к плацентарным млекопитающим", true],
      ["dinosaurs", "Это группа нептичьих динозавров"],
      ["fish", "Это первые рыбы с челюстями"],
    ],
  ),
  question(
    "kpg-mammal-opportunity",
    "Что изменилось для млекопитающих после мел-палеогенового вымирания 66 млн лет назад?",
    "После исчезновения нептичьих динозавров освободились экологические ниши, и млекопитающие быстрее разнообразились.",
    [
      ["niches", "Освободилось больше экологических ниш", true],
      ["mammals-extinct", "Все млекопитающие вымерли"],
      ["no-change", "Ничего заметного не изменилось"],
    ],
  ),
  question(
    "early-primates-traits",
    "Почему ранних родственников приматов связывают с древесной жизнью?",
    "Для ранней приматной линии важны жизнь на ветвях, питание плодами и насекомыми и постепенный путь к хватанию и точной ориентации.",
    [
      ["arboreal", "Древесная жизнь и путь к хватанию", true],
      ["gills", "Жабры и боковая линия"],
      ["horns", "Рога и копыта"],
    ],
  ),
  question(
    "anthropoids",
    "Кто такие антропоиды в нашей истории?",
    "Антропоиды - это ветвь приматов, в которую входят обезьяны, человекообразные обезьяны и люди.",
    [
      ["primates", "Ветвь приматов с обезьянами, человекообразными и людьми", true],
      ["fish", "Ветвь лопастеперых рыб"],
      ["plants", "Ветвь древних растений"],
    ],
  ),
  question(
    "new-world-monkeys",
    "Почему широконосые обезьяны на шкале не являются 'ступенькой' к человеку?",
    "Это боковая ветвь антропоидов. Она помогает понять родство обезьян, но не является прямым предком человека.",
    [
      ["side", "Это боковая ветвь антропоидов", true],
      ["direct", "Это прямые предки Homo sapiens"],
      ["dinosaurs", "Это поздние динозавры"],
    ],
  ),
  question(
    "apes-no-tail",
    "Какой простой внешний признак часто отличает человекообразных обезьян от многих других обезьян?",
    "У человекообразных обезьян нет хвоста, хотя одного этого признака недостаточно для полного понимания родства.",
    [
      ["tail", "У них всегда длинный хвост"],
      ["no-tail", "У них нет хвоста", true],
      ["gills", "У них есть жабры"],
    ],
  ),
  question(
    "hominins",
    "Кого называют гомининами?",
    "Гоминины - это ветвь ближе к человеку после расхождения с линией шимпанзе; туда входят австралопитеки и род Homo.",
    [
      ["human-branch", "Ветвь ближе к человеку после расхождения с шимпанзе", true],
      ["all-mammals", "Все млекопитающие без исключения"],
      ["all-fish", "Все рыбы с челюстями"],
    ],
  ),
  question(
    "australopithecus",
    "Почему австралопитеки важны, хотя это не Homo sapiens?",
    "Они показывают раннюю гомининную мозаику: двуногость уже важна, но мозг и культура еще не похожи на позднего Homo.",
    [
      ["bipedal-mosaic", "Они показывают раннюю двуногость и мозаику признаков", true],
      ["modern-human", "Это полностью современные люди"],
      ["bird-line", "Это птичья ветвь динозавров"],
    ],
  ),
  question(
    "homo-erectus",
    "Что делает Homo erectus важным этапом в истории рода Homo?",
    "Homo erectus связан с более крупным телом, дальними расселениями и длительной историей существования рода Homo.",
    [
      ["spread", "Дальние расселения и длительное существование", true],
      ["first-fish", "Первое появление рыб"],
      ["first-feathers", "Первое появление перьев"],
    ],
  ),
  question(
    "sapiens-age",
    "Насколько поздно появляется Homo sapiens на шкале 4 млрд лет?",
    "Homo sapiens появляется примерно 300 тысяч лет назад, то есть почти в самом конце истории жизни.",
    [
      ["very-late", "Почти в самом конце", true],
      ["middle", "Примерно в середине"],
      ["first", "Самым первым видом жизни"],
    ],
  ),
  question(
    "darwin-origin",
    "Почему Дарвин важен для темы эволюции?",
    "Дарвин сформулировал мощное объяснение эволюционных изменений через естественный отбор и общее происхождение видов.",
    [
      ["selection", "Он объяснил роль естественного отбора", true],
      ["dna", "Он открыл структуру ДНК"],
      ["asteroid", "Он нашел кратер Чиксулуб"],
    ],
  ),
  question(
    "scientific-theory",
    "Что означает слово 'теория' в выражении 'теория эволюции'?",
    "В науке теория - это не догадка, а хорошо проверенная объяснительная система, объединяющая факты и предсказания.",
    [
      ["guess", "Просто ничем не подтвержденная догадка"],
      ["framework", "Проверенная объяснительная система", true],
      ["law", "Запрет задавать вопросы"],
    ],
  ),
  question(
    "natural-selection",
    "Что требуется для естественного отбора?",
    "Нужны наследуемые различия, влияние этих различий на выживание или размножение и передача признаков потомкам.",
    [
      ["inheritance", "Наследуемые различия и разный репродуктивный успех", true],
      ["choice", "Сознательное желание организма измениться"],
      ["magic", "Мгновенное превращение без наследственности"],
    ],
  ),
  question(
    "fossil-evidence",
    "Как ископаемые поддерживают идею эволюции?",
    "Ископаемые показывают последовательности форм, переходные сочетания признаков и смену жизни в разных слоях времени.",
    [
      ["layers", "Показывают смену форм и переходные признаки", true],
      ["no-time", "Доказывают, что времени не было"],
      ["all-modern", "Показывают только современные виды"],
    ],
  ),
  question(
    "dna-evidence",
    "Почему ДНК стала сильным доказательством общего происхождения?",
    "Сходство и различия в геномах позволяют строить родственные деревья, которые часто согласуются с ископаемыми и анатомией.",
    [
      ["genomes", "Геномы позволяют сравнивать родство линий", true],
      ["unrelated", "ДНК показывает, что все виды не связаны"],
      ["no-information", "ДНК не несет наследственной информации"],
    ],
  ),
  question(
    "five-mass-extinctions",
    "Что обычно называют 'большой пятеркой' глобальных вымираний?",
    "Так называют пять крупнейших кризисов фанерозоя, когда исчезала значительная доля видов и экосистемы перестраивались.",
    [
      ["five-crises", "Пять крупных кризисов исчезновения видов", true],
      ["five-apes", "Пять современных обезьян"],
      ["five-planets", "Пять планет Солнечной системы"],
    ],
  ),
  question(
    "ordovician-extinction",
    "Почему ордовикско-силурийское вымирание в основном описывают как морской кризис?",
    "Около 444 млн лет назад животная жизнь была главным образом морской, поэтому удар пришелся по шельфам, рифам и морским группам.",
    [
      ["marine", "Тогда животная жизнь была в основном морской", true],
      ["cities", "Тогда исчезли города людей"],
      ["birds", "Тогда исчезли современные птицы"],
    ],
  ),
  question(
    "devonian-reefs",
    "Какие экосистемы особенно пострадали в позднедевонском кризисе?",
    "Позднедевонские события сильно ударили по рифовым системам, морским беспозвоночным и многим группам рыб.",
    [
      ["reefs", "Рифы и морские экосистемы", true],
      ["primates", "Современные приматы"],
      ["cities", "Человеческие города"],
    ],
  ),
  question(
    "permian-largest",
    "Какое из глобальных вымираний считается крупнейшим известным кризисом?",
    "Пермское вымирание около 252 млн лет назад называют 'Великим вымиранием': исчезла огромная доля морских видов.",
    [
      ["kpg", "Мел-палеогеновое"],
      ["permian", "Пермское", true],
      ["recent", "Вымирание динозавров в XIX веке"],
    ],
  ),
  question(
    "triassic-jurassic-dinosaurs",
    "Как триасово-юрское вымирание связано с динозаврами?",
    "После этого кризиса исчезли многие конкуренты, и динозавры получили больше пространства для мезозойской радиации.",
    [
      ["opportunity", "Оно освободило ниши для расцвета динозавров", true],
      ["humans", "Оно сразу породило Homo sapiens"],
      ["no-dinosaurs", "Оно произошло после исчезновения всех птиц"],
    ],
  ),
  question(
    "kpg-loss",
    "Что произошло на границе мела и палеогена 66 млн лет назад?",
    "Кризис K-Pg уничтожил нептичьих динозавров и около 75% видов, но птичья ветвь динозавров пережила его.",
    [
      ["non-avian", "Исчезли нептичьи динозавры и многие другие виды", true],
      ["all-life", "Исчезла вся жизнь на Земле"],
      ["first-fish", "Появились первые рыбы"],
    ],
  ),
  branchQuestion(
    "birds-are-dinosaurs",
    "В каком смысле динозавры не вымерли полностью?",
    "Нептичьи динозавры исчезли, но современные птицы являются живой ветвью динозавров, связанной с тероподами.",
    [
      { id: "non-avian", textRu: "Нептичьи динозавры", detailRu: "Эта часть ветви исчезла на границе K-Pg." },
      { id: "birds", textRu: "Птичья ветвь", detailRu: "Современные птицы - живые динозавры внутри тероподной линии." },
      { id: "mammals", textRu: "Млекопитающие", detailRu: "Наша линия соседствует с динозавровой, но не входит в нее." },
    ],
    "birds",
  ),
  question(
    "theropods-birds",
    "Внутри какой динозавровой ветви находится происхождение птиц?",
    "Птицы входят в тероподную линию динозавров, особенно рядом с манирапторными формами.",
    [
      ["theropods", "Тероподы", true],
      ["trilobites", "Трилобиты"],
      ["cynodonts", "Цинодонты"],
    ],
  ),
  question(
    "feathers-before-flight",
    "Что важно помнить о перьях у динозавров?",
    "Перья появились не только как инструмент полета: они могли работать для теплоизоляции, сигналов и поведения раньше полноценного полета.",
    [
      ["only-flight", "Перья всегда сразу нужны только для полета"],
      ["many-functions", "Перья могли иметь разные функции до полета", true],
      ["no-dinosaurs", "У динозавров никогда не было перьев"],
    ],
  ),
  question(
    "archaeopteryx-mosaic",
    "Почему Archaeopteryx так часто показывают как переходную форму?",
    "Он сочетает птичьи признаки, например перья и крылья, с динозавровыми чертами вроде зубов, когтей и длинного хвоста.",
    [
      ["mosaic", "Он соединяет птичьи и динозавровые признаки", true],
      ["modern-crow", "Он был полностью современной вороной"],
      ["mammal", "Он был ранним млекопитающим"],
    ],
  ),
  question(
    "cladogram",
    "Что показывает кладограмма лучше обычной прямой шкалы?",
    "Кладограмма показывает ветвление родства: где проходит выбранная ветвь Homo sapiens и где отходят соседние линии.",
    [
      ["branching", "Ветвление родства", true],
      ["height", "Рост каждого животного в сантиметрах"],
      ["temperature", "Температуру тела каждого вида"],
    ],
  ),
  question(
    "accumulated-traits",
    "Зачем в Атласе нужен накопитель признаков?",
    "Он показывает, что признаки не появляются все сразу у человека, а накапливаются по мере движения по линии предков.",
    [
      ["accumulation", "Чтобы видеть постепенное накопление наследованных признаков", true],
      ["ranking", "Чтобы расставить виды от плохих к хорошим"],
      ["weather", "Чтобы показывать погоду каждой эпохи"],
    ],
  ),
  question(
    "selected-point-percent",
    "Что означает процент 'выбранная точка' в вау-фактах Атласа?",
    "Он показывает, какая доля истории жизни уже прошла к выбранному этапу на шкале.",
    [
      ["elapsed", "Долю истории жизни, прошедшую к выбранному этапу", true],
      ["accuracy", "Вероятность правильного ответа"],
      ["population", "Процент современных людей с этим признаком"],
    ],
  ),
  question(
    "genetic-code",
    "Почему общий генетический код важен для эволюции?",
    "Почти общий способ читать кодоны у разных организмов выглядит как глубокое наследство от общего источника жизни.",
    [
      ["shared-code", "Он показывает общий молекулярный язык жизни", true],
      ["no-relation", "Он доказывает, что виды не связаны"],
      ["only-humans", "Он есть только у Homo sapiens"],
    ],
  ),
  question(
    "chimp-dna-percent",
    "Что корректнее означает фраза 'человек и шимпанзе похожи по ДНК примерно на 98,8%'?",
    "Это сходство напрямую сравнимых участков ДНК, а не утверждение, что человек 'почти шимпанзе'. Важны и отличия, и регуляция генов.",
    [
      ["aligned", "Сходство напрямую сравнимых участков ДНК", true],
      ["same-species", "Это один и тот же вид"],
      ["no-differences", "Между нами вообще нет генетических отличий"],
    ],
  ),
  question(
    "chromosome-2",
    "Почему человеческая хромосома 2 часто упоминается как молекулярное доказательство родства?",
    "У человека 23 пары хромосом, у других больших человекообразных - 24; данные указывают на слияние двух предковых хромосом.",
    [
      ["fusion", "Она несет след слияния двух предковых хромосом", true],
      ["extra", "У человека появилась лишняя отдельная хромосома"],
      ["unrelated", "Она показывает отсутствие родства с обезьянами"],
    ],
  ),
  branchQuestion(
    "dna-tree",
    "Что ожидает теория эволюции от сравнения геномов разных видов?",
    "Если виды связаны родством, геномы должны складываться в ветвящееся дерево, где близкие родственники похожи сильнее дальних.",
    [
      { id: "random", textRu: "Случайные совпадения", detailRu: "Не объясняет согласованные уровни сходства." },
      { id: "nested-tree", textRu: "Вложенное дерево", detailRu: "Близкие родственники группируются вместе." },
      { id: "ladder", textRu: "Прямая лестница", detailRu: "Подменяет родство идеей линейного прогресса." },
    ],
    "nested-tree",
  ),
  question(
    "luca-not-first-life",
    "Что точнее всего означает LUCA?",
    "LUCA - это не первая жизнь и не один сказочный предок, а реконструируемый последний общий предок всех живых клеточных линий сегодня.",
    [
      ["last-common", "Последний общий предок живых клеточных линий", true],
      ["first-cell", "Самая первая клетка на Земле"],
      ["modern-species", "Современный микроб, который до сих пор не изменился"],
    ],
  ),
  question(
    "africa-origin-network",
    "Почему аккуратнее говорить, что колыбель человечества - Африка, но не одна точка?",
    "Ранние свидетельства Homo sapiens распределены по нескольким регионам Африки, а современная картина больше похожа на сеть связанных популяций.",
    [
      ["network", "Потому что важны связанные популяции по континенту", true],
      ["single-garden", "Потому что все произошло в одном неизменном месте"],
      ["outside-africa", "Потому что Homo sapiens возник только за пределами Африки"],
    ],
  ),
  question(
    "molecular-scars",
    "Что делает хромосому 2 и вирусные вставки особенно сильными доказательствами родства?",
    "Это не просто общий процент похожести, а следы конкретных редких событий, которые можно сравнивать между родственными линиями.",
    [
      ["rare-markers", "Это редкие исторические метки в геноме", true],
      ["random-noise", "Это случайный шум без эволюционного смысла"],
      ["only-culture", "Это следы только культурного обучения"],
    ],
  ),
];

export function isQuizAnswerCorrect(question: QuizQuestion, answer: QuizAnswerValue | undefined) {
  if (question.type === "single-choice") {
    const selectedOption = question.options.find((option) => option.id === answer);
    return selectedOption?.isCorrect === true;
  }

  if (question.type === "order") {
    return (
      Array.isArray(answer) &&
      answer.length === question.correctOrder.length &&
      answer.every((itemId, index) => itemId === question.correctOrder[index])
    );
  }

  return answer === question.correctNodeId;
}

export function createQuizAttempt(
  questions: QuizQuestion[] = QUIZ_QUESTIONS,
  size = QUIZ_ATTEMPT_SIZE,
  random: () => number = Math.random,
) {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.min(index, Math.floor(random() * (index + 1)));
    [shuffledQuestions[index], shuffledQuestions[randomIndex]] = [
      shuffledQuestions[randomIndex],
      shuffledQuestions[index],
    ];
  }

  return shuffledQuestions.slice(0, Math.min(size, shuffledQuestions.length));
}

function createEmptyTopicResults(): Record<QuizTopicId, QuizTopicResult> {
  return Object.fromEntries(
    QUIZ_TOPIC_IDS.map((topicId) => [
      topicId,
      {
        topicId,
        correct: 0,
        wrong: 0,
        total: 0,
      },
    ]),
  ) as Record<QuizTopicId, QuizTopicResult>;
}

export function scoreQuiz(answers: Record<string, QuizAnswerValue>, questions: QuizQuestion[] = QUIZ_QUESTIONS): QuizScoreResult {
  const topicResults = createEmptyTopicResults();
  let correct = 0;

  for (const question of questions) {
    const isCorrect = isQuizAnswerCorrect(question, answers[question.id]);
    const topicResult = topicResults[question.topicId];
    topicResult.total += 1;

    if (isCorrect) {
      correct += 1;
      topicResult.correct += 1;
    } else {
      topicResult.wrong += 1;
    }
  }

  const recommendedTopics = QUIZ_TOPIC_IDS.filter((topicId) => topicResults[topicId].wrong > 0)
    .sort((leftTopicId, rightTopicId) => {
      const wrongDifference = topicResults[rightTopicId].wrong - topicResults[leftTopicId].wrong;
      if (wrongDifference !== 0) return wrongDifference;
      return QUIZ_TOPIC_IDS.indexOf(leftTopicId) - QUIZ_TOPIC_IDS.indexOf(rightTopicId);
    })
    .slice(0, 3)
    .map((topicId) => QUIZ_TOPICS[topicId]);

  return {
    correct,
    total: questions.length,
    topicResults,
    recommendedTopics,
  };
}
