export type PortalMaterial = {
  id: string;
  titleRu: string;
  subtitleRu: string;
  audienceRu: string;
  slideCount: number;
  coverSrc: string;
  pdfHref: string;
  summaryRu: string;
  highlightsRu: string[];
  tags: string[];
};

export type ReadingRecommendation = {
  id: string;
  titleRu: string;
  authorRu: string;
  themeRu: string;
  coverSrc?: string;
  coverAltRu?: string;
  publisherHref: string;
  linkLabelRu?: string;
  descriptionRu: string;
  whyReadRu: string;
};

export type WatchRecommendation = {
  id: string;
  titleRu: string;
  formatRu: string;
  href: string;
  imageSrc: string;
  imageAltRu: string;
  descriptionRu: string;
  whyWatchRu: string;
};

const MATERIAL_ASSET_ROOT = "/assets/materials";
const BOOK_ASSET_ROOT = "/assets/images/books";
const WATCH_ASSET_ROOT = "/assets/images/watch";

export const PORTAL_MATERIALS: PortalMaterial[] = [
  {
    id: "path-from-cell-to-human",
    titleRu: "Путь от клетки к человеку",
    subtitleRu: "Базовая лекция о большой линии эволюции",
    audienceRu: "для коллег и взрослых без биологической подготовки",
    slideCount: 18,
    coverSrc: `${MATERIAL_ASSET_ROOT}/covers/path-from-cell-to-human.jpg`,
    pdfHref: `${MATERIAL_ASSET_ROOT}/path-from-cell-to-human.pdf`,
    summaryRu:
      "Самый близкий к атласу материал: 4 млрд лет истории жизни, кислородная революция, выход на сушу, млекопитающие, приматы и Homo sapiens.",
    highlightsRu: [
      "показывает всю линию от ранних клеточных систем до Homo sapiens",
      "объясняет, почему большая часть истории жизни прошла до появления приматов",
      "связывает ключевые признаки: кислород, позвоночник, легкие, теплокровность и мозг",
    ],
    tags: ["базовый маршрут", "эволюция человека", "атлас"],
  },
  {
    id: "six-planet-apocalypses",
    titleRu: "Шесть апокалипсисов планеты",
    subtitleRu: "Глобальные вымирания, причины и последствия",
    audienceRu: "для раздела о кризисах биосферы",
    slideCount: 18,
    coverSrc: `${MATERIAL_ASSET_ROOT}/covers/six-planet-apocalypses.jpg`,
    pdfHref: `${MATERIAL_ASSET_ROOT}/six-planet-apocalypses.pdf`,
    summaryRu:
      "Готовая лекция для усиления страницы о вымираниях: ордовикское, девонское, пермское, триасово-юрское, мел-палеогеновое и современный кризис биоразнообразия.",
    highlightsRu: [
      "разбирает шесть крупных кризисов биоразнообразия, включая современный",
      "показывает, что вымирания не обнуляли жизнь, а меняли состав экосистем",
      "объясняет, почему после кризисов освобождались ниши для новых ветвей",
    ],
    tags: ["вымирания", "биосфера", "кризисы"],
  },
  {
    id: "cell-to-human-kids",
    titleRu: "От клетки до человека: детская версия",
    subtitleRu: "Простое объяснение для детей и новичков",
    audienceRu: "для детей примерно 12 лет и семейного просмотра",
    slideCount: 12,
    coverSrc: `${MATERIAL_ASSET_ROOT}/covers/cell-to-human-kids.jpg`,
    pdfHref: `${MATERIAL_ASSET_ROOT}/cell-to-human-kids.pdf`,
    summaryRu:
      "Самый доступный материал: клетки, митохондрии, Tiktaalik, рептилии, млекопитающие, приматы, первые Homo и культурное наследие.",
    highlightsRu: [
      "простым языком объясняет, как маленькие изменения накапливаются в большой истории",
      "помогает детям увидеть связь между рыбой, четвероногими, млекопитающими и человеком",
      "подходит как короткая семейная лекция перед основным Атласом",
    ],
    tags: ["детская версия", "простым языком", "новичкам"],
  },
  {
    id: "homo-luca-sapiens",
    titleRu: "Эволюция Homo: от LUCA к sapiens",
    subtitleRu: "Продвинутый слой о молекулярной и когнитивной эволюции",
    audienceRu: "для подготовленной аудитории",
    slideCount: 18,
    coverSrc: `${MATERIAL_ASSET_ROOT}/covers/homo-luca-sapiens.jpg`,
    pdfHref: `${MATERIAL_ASSET_ROOT}/homo-luca-sapiens.pdf`,
    summaryRu:
      "Плотная научная презентация: симбиогенез, генетическая регуляция, неокортекс, диета, язык, когнитивные функции и будущее Homo sapiens.",
    highlightsRu: [
      "идет глубже базового маршрута: от LUCA и митохондрий до нервной системы",
      "связывает молекулярную эволюцию с мозгом, диетой, языком и культурой",
      "подходит тем, кому после Атласа хочется более плотного научного слоя",
    ],
    tags: ["LUCA", "генетика", "мозг", "продвинутый"],
  },
  {
    id: "evolutionary-advantage-genes-behavior",
    titleRu: "Эволюционная выгода: гены и поведение",
    subtitleRu: "Родственный отбор, мемы, фенотип и поведение",
    audienceRu: "для отдельной лекции после базового атласа",
    slideCount: 12,
    coverSrc: `${MATERIAL_ASSET_ROOT}/covers/evolutionary-advantage-genes-behavior.jpg`,
    pdfHref: `${MATERIAL_ASSET_ROOT}/evolutionary-advantage-genes-behavior.pdf`,
    summaryRu:
      "Материал про эволюционную логику поведения: репликаторы, альтруизм, родственный отбор, расширенный фенотип, культурная эволюция и ограничения геноцентризма.",
    highlightsRu: [
      "объясняет, как эволюционная логика работает не только с телом, но и с поведением",
      "разбирает родственный отбор, альтруизм, мемы и расширенный фенотип",
      "хорошо подходит для дискуссии о том, где биология заканчивается и начинается культура",
    ],
    tags: ["поведение", "гены", "мемы", "культура"],
  },
];

export const READING_RECOMMENDATIONS: ReadingRecommendation[] = [
  {
    id: "drobyshevsky-missing-link-1",
    titleRu: "Достающее звено. Книга первая",
    authorRu: "Станислав Дробышевский",
    themeRu: "палеоантропология",
    coverSrc: `${BOOK_ASSET_ROOT}/drobyshevsky-missing-link-1.jpg`,
    coverAltRu: "Обложка книги “Достающее звено. Книга первая”",
    publisherHref: "https://ast.ru/book/dostayushchee-zveno-kniga-pervaya-obezyany-i-vse-vse-vse-857798/",
    descriptionRu:
      "Плотный, но живой маршрут по ископаемым родственникам человека, вероятным предковым формам и спорным местам человеческой линии.",
    whyReadRu:
      "Хорошо продолжает Атлас: помогает увидеть, что антропогенез держится на множестве находок, а не на одной “переходной форме”.",
  },
  {
    id: "drobyshevsky-missing-link-2",
    titleRu: "Достающее звено. Книга вторая",
    authorRu: "Станислав Дробышевский",
    themeRu: "эволюция человека",
    coverSrc: `${BOOK_ASSET_ROOT}/drobyshevsky-missing-link-2.jpg`,
    coverAltRu: "Обложка книги “Достающее звено. Книга вторая”",
    publisherHref: "https://ast.ru/book/dostayushchee-zveno-kniga-vtoraya-lyudi-857799/",
    descriptionRu:
      "Продолжение истории Homo: больше деталей о поздних гомининах, расселениях, мозге, культуре и неоднозначных местах палеоантропологии.",
    whyReadRu:
      "Полезно после разделов про приматов и Homo sapiens, когда хочется перейти от большой шкалы к конкретным людям и находкам.",
  },
  {
    id: "markov-human-evolution",
    titleRu: "Эволюция человека",
    authorRu: "Александр Марков",
    themeRu: "антропогенез и генетика",
    coverSrc: `${BOOK_ASSET_ROOT}/markov-human-evolution.jpg`,
    coverAltRu: "Обложка книги “Эволюция человека” Александра Маркова",
    publisherHref: "https://ast.ru/book/evolyutsiya-cheloveka-v-3-kn-kn-1-obezyany-kosti-i-geny-048929/",
    descriptionRu:
      "Большая серия о происхождении человека через приматологию, палеонтологию, поведение, генетику и культуру.",
    whyReadRu:
      "Хороший мост между Атласом, деревом родства и разделом РНК/ДНК: показывает, как независимые линии доказательств сходятся.",
  },
  {
    id: "mukherjee-gene",
    titleRu: "Ген. Очень личная история",
    authorRu: "Сиддхартха Мукерджи",
    themeRu: "история генетики",
    coverSrc: `${BOOK_ASSET_ROOT}/mukherjee-gene.jpg`,
    coverAltRu: "Обложка книги “Ген. Очень личная история”",
    publisherHref:
      "https://www.corpus.ru/products/siddhartha-mukerdzhi-gen-ochen-lichnaya-istoriya.htm",
    descriptionRu:
      "История идеи гена от классической наследственности до молекулярной генетики, геномики, наследуемых болезней и этических споров.",
    whyReadRu:
      "Хорошо продолжает раздел РНК/ДНК: показывает, почему генетика — не простой приговор, а язык вероятностей, данных и ответственности.",
  },
  {
    id: "kleshchenko-dna-person",
    titleRu: "ДНК и ее человек",
    authorRu: "Елена Клещенко",
    themeRu: "ДНК-идентификация",
    coverSrc: `${BOOK_ASSET_ROOT}/kleshchenko-dna-person.jpg`,
    coverAltRu: "Обложка книги “ДНК и ее человек”",
    publisherHref: "https://alpinabook.ru/catalog/book-dnk-i-ee-chelovek/",
    descriptionRu:
      "Книга о ДНК-идентификации: как строятся генетические профили, где метод силен, где возможны ошибки и почему контекст важен.",
    whyReadRu:
      "Помогает не мифологизировать ДНК: совпадение и профиль остаются частью процесса, статистики и доказательной цепочки.",
  },
  {
    id: "heyer-gene-odyssey",
    titleRu: "Одиссея генов",
    authorRu: "Эвелин Эйер",
    themeRu: "популяционная генетика",
    coverSrc: `${BOOK_ASSET_ROOT}/heyer-gene-odyssey.jpg`,
    coverAltRu: "Обложка книги “Одиссея генов”",
    publisherHref:
      "https://sindbadbooks.ru/index.php?route=product/product&path=25&product_id=283",
    descriptionRu:
      "Путешествие по истории Homo sapiens через ДНК: миграции, смешения с древними людьми, демография, культура и следы исторических событий в геномах.",
    whyReadRu:
      "Отличное продолжение разделов о приматах и генетике: показывает, что человеческая история — сеть миграций и смешений, а не одна прямая линия.",
  },
  {
    id: "aleksenko-sex-with-scientists",
    titleRu: "Секс с учеными",
    authorRu: "Алексей Алексенко",
    themeRu: "половое размножение",
    coverSrc: `${BOOK_ASSET_ROOT}/aleksenko-sex-with-scientists.jpg`,
    coverAltRu: "Обложка книги “Секс с учеными”",
    publisherHref: "https://alpinabook.ru/catalog/book-seks-s-uchenymi/",
    descriptionRu:
      "Разбор эволюционной загадки секса: зачем нужен дорогой половой процесс, как работают мейоз, анизогамия, половые хромосомы и модели отбора.",
    whyReadRu:
      "Хорошо расширяет тему наследуемой изменчивости: объясняет, как перемешивание генов становится материалом для отбора и эволюционных компромиссов.",
  },
  {
    id: "dawkins-greatest-show",
    titleRu: "Самое грандиозное шоу на Земле",
    authorRu: "Ричард Докинз",
    themeRu: "доказательства эволюции",
    coverSrc: `${BOOK_ASSET_ROOT}/dawkins-greatest-show.jpg`,
    coverAltRu: "Обложка книги “Самое грандиозное шоу на Земле”",
    publisherHref: "https://ast.ru/book/samoe-grandioznoe-shou-na-zemle-037661/",
    descriptionRu:
      "Книга о том, почему эволюция — не догадка, а объяснение, подтверждаемое ископаемыми, селекцией, эмбриологией, биогеографией и генетикой.",
    whyReadRu:
      "Лучше всего подходит к разделу “Теория эволюции”: системно отвечает на вопрос “откуда мы это знаем?”.",
  },
  {
    id: "dawkins-selfish-gene",
    titleRu: "Эгоистичный ген",
    authorRu: "Ричард Докинз",
    themeRu: "отбор и поведение",
    coverSrc: `${BOOK_ASSET_ROOT}/dawkins-selfish-gene.jpg`,
    coverAltRu: "Обложка книги “Эгоистичный ген”",
    publisherHref: "https://ast.ru/book/egoistichnyy-gen-087739/",
    descriptionRu:
      "Геноцентричный взгляд на эволюцию: как наследуемые репликаторы помогают объяснять альтруизм, родственный отбор и стратегии поведения.",
    whyReadRu:
      "Помогает перейти от происхождения тела к эволюционной логике поведения и культурных паттернов.",
  },
  {
    id: "dawkins-extended-phenotype",
    titleRu: "Расширенный фенотип",
    authorRu: "Ричард Докинз",
    themeRu: "гены за пределами тела",
    coverSrc: `${BOOK_ASSET_ROOT}/dawkins-extended-phenotype.jpg`,
    coverAltRu: "Обложка книги “Расширенный фенотип”",
    publisherHref: "https://ast.ru/book/rasshirennyy-fenotip-dlinnaya-ruka-gena-035960/",
    descriptionRu:
      "Идея о том, что эффекты генов не заканчиваются кожей организма: они проявляются в поведении, постройках и влиянии на другие виды.",
    whyReadRu:
      "Хорошая продвинутая книга после “Эгоистичного гена”: расширяет взгляд на то, что именно отбирается эволюцией.",
  },
  {
    id: "nikitin-origin-life",
    titleRu: "Происхождение жизни",
    authorRu: "Михаил Никитин",
    themeRu: "абиогенез",
    coverSrc: `${BOOK_ASSET_ROOT}/nikitin-origin-life.jpg`,
    coverAltRu: "Обложка книги “Происхождение жизни” Михаила Никитина",
    publisherHref: "https://nonfiction.ru/books/proisxozhdenie-zhizni-ot-tumannosti-do-kletki-poket-format",
    descriptionRu:
      "Научный разбор того, как неживая химия могла перейти к наследованию, клеткам, метаболизму и первым живым системам.",
    whyReadRu:
      "Самое прямое продолжение раздела “Зарождение жизни”: убирает ощущение, что первая клетка появилась скачком.",
  },
  {
    id: "parthasarathy-simple-beginning",
    titleRu: "Простое начало",
    authorRu: "Рагувир Партасарати",
    themeRu: "биофизика жизни",
    coverSrc: `${BOOK_ASSET_ROOT}/parthasarathy-simple-beginning.jpg`,
    coverAltRu: "Обложка книги “Простое начало”",
    publisherHref: "https://ast.ru/book/prostoe-nachalo-870533/",
    descriptionRu:
      "Жизнь как физическая система: самосборка, регуляторные сети, предсказуемая случайность и ограничения масштаба.",
    whyReadRu:
      "Помогает увидеть, почему биология не магия: сложность часто вырастает из простых физических правил.",
  },
  {
    id: "vinarsky-luca",
    titleRu: "Евангелие от LUCA",
    authorRu: "Максим Винарский",
    themeRu: "дерево жизни",
    coverSrc: `${BOOK_ASSET_ROOT}/vinarsky-luca.jpg`,
    coverAltRu: "Обложка книги “Евангелие от LUCA”",
    publisherHref: "https://nonfiction.ru/books/evangelie-ot-luca.-v-poiskax-obshhego-predka-vsego-zhivogo-poket-format",
    descriptionRu:
      "Книга о том, как восстанавливают родословную живого мира и почему дерево жизни — это научная модель, а не красивая картинка.",
    whyReadRu:
      "Отлично ложится рядом с кладограммой: объясняет, как ученые вообще строят такие деревья.",
  },
  {
    id: "yastrebov-atoms-tree",
    titleRu: "От атомов к древу",
    authorRu: "Сергей Ястребов",
    themeRu: "современная биология",
    coverSrc: `${BOOK_ASSET_ROOT}/yastrebov-atoms-tree.jpg`,
    coverAltRu: "Обложка книги “От атомов к древу”",
    publisherHref: "https://nonfiction.ru/books/ot-atomov-k-drevu.-vvedenie-v-sovremennuyu-nauku-o-zhizni",
    descriptionRu:
      "Цельный обзор жизни как системы уровней: от молекул и клеток до организмов, популяций и эволюционного дерева.",
    whyReadRu:
      "Хороший вход для тех, кто хочет связать РНК/ДНК, клетки, эволюцию и дерево родства в одну картину.",
  },
  {
    id: "darwin-origin-species",
    titleRu: "Происхождение видов",
    authorRu: "Чарльз Дарвин",
    themeRu: "естественный отбор",
    coverSrc: `${BOOK_ASSET_ROOT}/darwin-origin-species.jpg`,
    coverAltRu: "Титульная страница книги “Происхождение видов” Чарльза Дарвина",
    publisherHref: "https://www.gutenberg.org/ebooks/1228",
    linkLabelRu: "Открыть текст",
    descriptionRu:
      "Главный труд 1859 года, обосновывающий теорию эволюции посредством естественного отбора. Часто называется “философией биологии”.",
    whyReadRu:
      "Фундаментальная точка входа в историю идеи: помогает увидеть, как Дарвин собрал наблюдения, селекцию, географию и ископаемые в единое объяснение.",
  },
  {
    id: "darwin-descent-man",
    titleRu: "Происхождение человека и половой отбор",
    authorRu: "Чарльз Дарвин",
    themeRu: "антропогенез",
    coverSrc: `${BOOK_ASSET_ROOT}/darwin-descent-man.jpg`,
    coverAltRu:
      "Титульная страница книги “Происхождение человека и половой отбор” Чарльза Дарвина",
    publisherHref: "https://www.gutenberg.org/ebooks/2300",
    linkLabelRu: "Открыть текст",
    descriptionRu:
      "Исследование 1871 года, доказывающее родство человека с высшими обезьянами и объясняющее движущие силы антропогенеза.",
    whyReadRu:
      "Хорошо читать рядом с разделами о приматах и Homo sapiens: здесь эволюционная идея применяется прямо к происхождению человека.",
  },
  {
    id: "drobyshevsky-botanika",
    titleRu: "Ботаника антрополога. Елки-палки",
    authorRu: "Станислав Дробышевский",
    themeRu: "растения и человек",
    coverSrc: `${BOOK_ASSET_ROOT}/drobyshevsky-botanika.jpg`,
    coverAltRu: "Обложка книги “Ботаника антрополога. Елки-палки”",
    publisherHref: "https://www.eksmo.ru/book/botanika-antropologa-ITD1424805/",
    descriptionRu:
      "Неочевидный взгляд на эволюцию человека через растения: пища, климат, ландшафты и биосфера как среда для нашей линии.",
    whyReadRu:
      "Хорошо расширяет портал за пределы “человек и животные”: показывает, что наша история связана со всей экосистемой.",
  },
];

export const WATCH_RECOMMENDATIONS: WatchRecommendation[] = [
  {
    id: "photon-2017",
    titleRu: "Photon",
    formatRu: "фильм, 2017, Norman Leto",
    href: "https://www.youtube.com/watch?v=-FJVCrldAfM&ab_channel=%D0%97%D0%B0%D0%BD%D1%83%D0%B4%D0%B0-Zanuda",
    imageSrc: `${WATCH_ASSET_ROOT}/photon-2017.jpg`,
    imageAltRu: "Превью фильма Photon с абстрактным космическим объектом на темном фоне.",
    descriptionRu:
      "Экспериментальный нон-фикшн: от космологии и химии к эволюции, поведению, культуре и будущему человека. Вместо говорящих голов — CGI, плотный звук и почти гипнотическая подача.",
    whyWatchRu:
      "Это не учебник, а визуальный опыт: хорошо работает как эмоциональное продолжение идей Атласа.",
  },
  {
    id: "nick-lane-dwarkesh",
    titleRu: "Nick Lane — жизнь как химическая закономерность",
    formatRu: "интервью Dwarkesh Patel",
    href: "https://www.dwarkesh.com/p/nick-lane",
    imageSrc: `${WATCH_ASSET_ROOT}/nick-lane-dwarkesh.jpg`,
    imageAltRu: "Превью интервью Dwarkesh Patel с Nick Lane.",
    descriptionRu:
      "Разговор о том, почему жизнь может быть естественным продолжением геохимии: гидротермальные источники, протонные градиенты, митохондрии и главный барьер на пути к сложной клетке.",
    whyWatchRu:
      "Лучшее видео-дополнение к разделам “Зарождение жизни” и “РНК/ДНК”: показывает, как химия Земли превращается в биологию.",
  },
  {
    id: "drobyshevsky-lectures",
    titleRu: "Лекции Станислава Дробышевского",
    formatRu: "плейлист YouTube",
    href: "https://www.youtube.com/playlist?list=PLu9XBMrQghEENqWKlcIXcHDCN-o5CWKMe",
    imageSrc: `${WATCH_ASSET_ROOT}/drobyshevsky-lectures.jpg`,
    imageAltRu: "Превью плейлиста лекций Станислава Дробышевского об эволюции.",
    descriptionRu:
      "Большая серия лекций об антропогенезе, ископаемых людях, приматах, поведении и том, как палеоантропологи собирают историю человека из фрагментов.",
    whyWatchRu:
      "Подходит как длинный учебный трек после Атласа: можно идти от общего маршрута к деталям находок и видов.",
  },
];
