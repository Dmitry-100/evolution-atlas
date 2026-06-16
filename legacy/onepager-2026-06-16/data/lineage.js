const commons = (file, width = 900) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/\s/g, "_"))}?width=${width}`;

const wiki = (path) => `https://en.wikipedia.org/wiki/${path}`;

export const ERAS = [
  { id: "early-life", label: "ранняя жизнь", startMa: 4000, endMa: 541, color: "#61d6ff" },
  { id: "animals", label: "животные", startMa: 541, endMa: 360, color: "#ffd166" },
  { id: "land", label: "выход на сушу", startMa: 360, endMa: 200, color: "#f59e0b" },
  { id: "mammals", label: "млекопитающие", startMa: 200, endMa: 66, color: "#a7f3a0" },
  { id: "primates", label: "приматы", startMa: 66, endMa: 2.8, color: "#84ccff" },
  { id: "homo", label: "Homo", startMa: 2.8, endMa: 0, color: "#ff9472" }
];

export const STAGES = [
  {
    id: "protocells",
    title: "Протоклетки",
    latin: "protocells",
    ageMa: 3800,
    eraId: "early-life",
    framing: "representative",
    summary: "До организмов в современном смысле: мембраны, химические циклы и первые системы копирования информации.",
    inherited: "клеточная оболочка, обмен веществ, наследуемая информация",
    note: "Это гипотетический ранний этап, а не один конкретный найденный вид.",
    image: {
      src: "",
      remoteFallbacks: [],
      localFallback: true,
      alt: "Схематическая визуализация протоклеток",
      credit: "Wikimedia Commons или локальная схема"
    },
    sources: ["https://www.visualcapitalist.com/path-of-human-evolution/", wiki("Protocell")]
  },
  {
    id: "prokaryotes",
    title: "Первые прокариоты",
    latin: "Bacteria and Archaea",
    ageMa: 3500,
    eraId: "early-life",
    framing: "representative",
    summary: "Простые одноклеточные организмы стали устойчивой формой жизни на Земле.",
    inherited: "базовая биохимия клетки, рибосомы, ДНК/РНК-механизмы",
    note: "Современные бактерии и археи не застыли в прошлом; они тоже эволюционировали.",
    image: {
      src: "",
      remoteFallbacks: ["https://upload.wikimedia.org/wikipedia/commons/0/08/Halobacteria_%281%29.jpg", commons("Haloquadratum_Walsby_SEM.png")],
      alt: "Микрофотография архей и бактерий",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Prokaryote"), wiki("Archaea")]
  },
  {
    id: "cyanobacteria",
    title: "Цианобактерии",
    latin: "Cyanobacteria",
    ageMa: 3000,
    eraId: "early-life",
    framing: "representative",
    summary: "Кислородный фотосинтез постепенно изменил атмосферу и открыл путь сложной жизни.",
    inherited: "кислородная атмосфера и аэробная энергетика",
    note: "Это экологический перелом, а не прямой животный предок.",
    image: {
      src: "",
      remoteFallbacks: [commons("Stromatolites_in_Sharkbay.jpg"), commons("Shark_Bay_stromatolites.jpg")],
      alt: "Строматолиты как след древней микробной жизни",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Cyanobacteria"), wiki("Great_Oxidation_Event")]
  },
  {
    id: "eukaryotes",
    title: "Ранние эукариоты",
    latin: "Eukaryota",
    ageMa: 1800,
    eraId: "early-life",
    framing: "direct-lineage",
    summary: "Клетки с ядром и митохондриями получили новый уровень внутренней организации.",
    inherited: "ядро, митохондрии, сложная регуляция клетки",
    note: "Это крупная группа, внутри которой позднее возникли животные.",
    image: {
      src: "",
      remoteFallbacks: ["https://upload.wikimedia.org/wikipedia/commons/f/f1/Eukaryote_cell_diagram_ru.svg", commons("Animal_cell_structure_ru.svg")],
      alt: "Схема эукариотической клетки",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Eukaryote"), wiki("Symbiogenesis")]
  },
  {
    id: "choanoflagellates",
    title: "Хоанофлагелляты",
    latin: "Choanoflagellatea",
    ageMa: 800,
    eraId: "early-life",
    framing: "close-relative",
    summary: "Ближайшие одноклеточные родственники животных показывают, как могли работать клеточная адгезия и сигналинг.",
    inherited: "клеточная коммуникация и предпосылки многоклеточности",
    note: "Это близкие родственники животных, а не обезьяны в миниатюре.",
    image: {
      src: "",
      remoteFallbacks: [commons("Sphaeroeca-colony.jpg"), commons("Monosiga_Brevicollis_Phase.jpg")],
      alt: "Колония хоанофлагеллят",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Choanoflagellate")]
  },
  {
    id: "ediacaran",
    title: "Эдиакарская биота",
    latin: "Dickinsonia and Ediacaran biota",
    ageMa: 575,
    eraId: "early-life",
    framing: "representative",
    summary: "Мягкотелые многоклеточные организмы появились до кембрийского расцвета животных.",
    inherited: "крупное многоклеточное тело и экосистемные взаимодействия",
    note: "Родство многих эдиакарских форм с современными животными остается спорным.",
    image: {
      src: "",
      remoteFallbacks: [commons("Dickinsonia_costata.jpg"), commons("Dickinsonia_costata_Imprint_-_South_Australia.jpg")],
      alt: "Ископаемая Dickinsonia",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Ediacaran_biota"), wiki("Dickinsonia")]
  },
  {
    id: "early-chordates",
    title: "Ранние хордовые",
    latin: "Pikaia / Metaspriggina",
    ageMa: 505,
    eraId: "animals",
    framing: "stem-form",
    summary: "Появилась ось тела, похожая на будущую хорду позвоночных.",
    inherited: "ось тела, нервная трубка, сегментированные мышцы",
    note: "Показанный вид представляет ранний хордовый план строения.",
    image: {
      src: "",
      remoteFallbacks: [commons("Pikaia_BW.jpg"), commons("Metaspriggina_ARM.jpg")],
      alt: "Реконструкция раннего хордового",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Pikaia"), wiki("Metaspriggina")]
  },
  {
    id: "early-vertebrates",
    title: "Ранние позвоночные",
    latin: "early Vertebrata",
    ageMa: 480,
    eraId: "animals",
    framing: "stem-form",
    summary: "Нервная система и опорные структуры стали основой будущего позвоночника и черепа.",
    inherited: "череп, позвоночная ось, сложные органы чувств",
    note: "Это этап формирования позвоночного плана, а не один установленный прямой предок.",
    image: {
      src: "",
      remoteFallbacks: [commons("Arandaspis_BW.jpg"), commons("Haikouichthys3d.png")],
      alt: "Реконструкция ранней бесчелюстной рыбы",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Vertebrate"), wiki("Jawless_fish")]
  },
  {
    id: "jawed-fish",
    title: "Челюстные рыбы",
    latin: "Gnathostomata",
    ageMa: 430,
    eraId: "animals",
    framing: "direct-lineage",
    summary: "Челюсти и парные плавники радикально расширили возможности питания и движения.",
    inherited: "челюсти, зубы, парные конечностные зачатки",
    note: "От этой большой линии происходят и современные рыбы, и наземные позвоночные.",
    image: {
      src: "",
      remoteFallbacks: [commons("Entelognathus_primordialis_restoration.jpg"), commons("Dunkleosteus_BW.jpg")],
      alt: "Реконструкция ранней челюстной рыбы",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Gnathostomata"), wiki("Entelognathus")]
  },
  {
    id: "lobe-finned",
    title: "Лопастеперые рыбы",
    latin: "Sarcopterygii",
    ageMa: 410,
    eraId: "animals",
    framing: "direct-lineage",
    summary: "Мясистые плавники содержали элементы, из которых позже развились конечности.",
    inherited: "плечо, предплечье и кистевой план конечности",
    note: "Линия наземных позвоночных находится внутри лопастеперых.",
    image: {
      src: "",
      remoteFallbacks: [commons("Eusthenopteron_BW.jpg"), commons("Guiyu_oneiros.jpg")],
      alt: "Реконструкция лопастеперой рыбы",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Sarcopterygii"), wiki("Eusthenopteron")]
  },
  {
    id: "tiktaalik",
    title: "Тиктаалик",
    latin: "Tiktaalik roseae",
    ageMa: 375,
    eraId: "animals",
    framing: "stem-form",
    summary: "Переходная форма с рыбьими и четвероногими признаками: шея, опорные плавники, плоский череп.",
    inherited: "механика опоры тела, шея, элементы будущего запястья",
    note: "Близкая форма, показывающая переход к четвероногим; не обязательно буквальный прямой предок.",
    image: {
      src: "",
      remoteFallbacks: [commons("Tiktaalik_roseae_life_restor.jpg"), "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tiktaalik2.jpg"],
      alt: "Реконструкция Tiktaalik",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Tiktaalik")]
  },
  {
    id: "early-tetrapods",
    title: "Ранние четвероногие",
    latin: "Acanthostega / Ichthyostega",
    ageMa: 365,
    eraId: "land",
    framing: "stem-form",
    summary: "Пальцы и конечности появились еще у преимущественно водных животных.",
    inherited: "конечности с пальцами, укрепленный позвоночник, новая координация движения",
    note: "Ранние четвероногие были разнообразной группой водно-наземных форм.",
    image: {
      src: "",
      remoteFallbacks: [commons("Acanthostega_gunnari.JPG"), commons("Ichthyostega_BHG.jpg")],
      alt: "Реконструкция раннего четвероногого",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Tetrapod"), wiki("Acanthostega")]
  },
  {
    id: "amniotes",
    title: "Амниоты",
    latin: "Amniota",
    ageMa: 315,
    eraId: "land",
    framing: "direct-lineage",
    summary: "Амниотическое яйцо позволило размножаться вдали от воды и стало базой для рептилий, птиц и млекопитающих.",
    inherited: "эмбриональные оболочки и независимость размножения от воды",
    note: "Линия млекопитающих отделилась внутри ранних амниот.",
    image: {
      src: "",
      remoteFallbacks: [commons("Hylonomus_lyelli_model.jpg"), commons("Amniote_egg_diagram_ru.svg")],
      alt: "Реконструкция раннего амниота",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Amniote"), wiki("Hylonomus")]
  },
  {
    id: "synapsids",
    title: "Ранние синапсиды",
    latin: "Synapsida",
    ageMa: 295,
    eraId: "land",
    framing: "direct-lineage",
    summary: "Синапсидный череп стал основой линии, которая приведет к млекопитающим.",
    inherited: "изменение челюсти, зубов и височной области черепа",
    note: "Dimetrodon похож на рептилию внешне, но ближе к линии млекопитающих, чем к динозаврам.",
    image: {
      src: "",
      remoteFallbacks: [commons("Dimetrodon_BW.jpg"), commons("Ophiacodon_mirabilis_back.jpg")],
      alt: "Реконструкция раннего синапсида",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Synapsid"), wiki("Dimetrodon")]
  },
  {
    id: "cynodonts",
    title: "Цинодонты",
    latin: "Cynodontia",
    ageMa: 247,
    eraId: "land",
    framing: "direct-lineage",
    summary: "У цинодонтов усилились признаки будущих млекопитающих: вторичное небо, зубная специализация, вероятная шерсть.",
    inherited: "жевание, теплокровность, забота о потомстве",
    note: "Это стволовая группа млекопитающих.",
    image: {
      src: "",
      remoteFallbacks: [commons("Thrinaxodon_NT.jpg"), commons("Thrinaxodon.jpg")],
      alt: "Реконструкция Thrinaxodon",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Cynodont"), wiki("Thrinaxodon")]
  },
  {
    id: "early-mammals",
    title: "Ранние млекопитающие",
    latin: "Morganucodon",
    ageMa: 205,
    eraId: "mammals",
    framing: "stem-form",
    summary: "Маленькие ночные животные развивали слух, обоняние, шерсть и кормление детенышей.",
    inherited: "молоко, шерсть, слуховые косточки, теплокровность",
    note: "Morganucodon показывает ранний млекопитающий набор признаков.",
    image: {
      src: "",
      remoteFallbacks: [commons("Morganucodon_NT.jpg"), commons("Morganucodon_BW.jpg")],
      alt: "Реконструкция Morganucodon",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Morganucodon"), wiki("Mammalia")]
  },
  {
    id: "placentals",
    title: "Ранние плацентарные",
    latin: "Eutheria",
    ageMa: 125,
    eraId: "mammals",
    framing: "direct-lineage",
    summary: "Линия плацентарных млекопитающих дала начало большинству современных млекопитающих, включая приматов.",
    inherited: "длительное внутриутробное развитие и плацентарная физиология",
    note: "Датировки ранней истории плацентарных уточняются по ископаемым и молекулярным данным.",
    image: {
      src: "",
      remoteFallbacks: [commons("Eomaia_scansoria.jpg"), commons("Eomaia_fossil.jpg")],
      alt: "Ископаемое или реконструкция ранней эутерии",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Eutheria"), wiki("Eomaia")]
  },
  {
    id: "after-kpg",
    title: "После вымирания K-Pg",
    latin: "mammalian radiation",
    ageMa: 66,
    eraId: "mammals",
    framing: "representative",
    summary: "После исчезновения нептичьих динозавров млекопитающие быстро заняли новые экологические ниши.",
    inherited: "разнообразие форм тела и экологических стратегий млекопитающих",
    note: "Это событие среды, а не отдельный предок.",
    image: {
      src: "",
      remoteFallbacks: ["https://upload.wikimedia.org/wikipedia/commons/8/85/Chicxulub_Landsat.jpg", commons("Chicxulub-crater.jpg")],
      alt: "Район кратера Чиксулуб как маркер K-Pg события",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Cretaceous%E2%80%93Paleogene_extinction_event"), wiki("Adaptive_radiation")]
  },
  {
    id: "early-primates",
    title: "Ранние приматы",
    latin: "Primates",
    ageMa: 55,
    eraId: "primates",
    framing: "direct-lineage",
    summary: "Древесная жизнь усилила хват, зрение вперед и координацию движений.",
    inherited: "руки, ногти вместо когтей, бинокулярное зрение, гибкое поведение",
    note: "От ранних приматов расходятся линии лемуров, долгопятов, обезьян и человекообразных.",
    image: {
      src: "",
      remoteFallbacks: [commons("Purgatorius_BW.jpg"), commons("Notharctus_tenebrosus_AMNH.jpg")],
      alt: "Реконструкция раннего примата",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Primates"), wiki("Purgatorius")]
  },
  {
    id: "anthropoids",
    title: "Антропоиды",
    latin: "Simiiformes",
    ageMa: 40,
    eraId: "primates",
    framing: "direct-lineage",
    summary: "Линия обезьян получила более крупный мозг, сложное зрение и дневную социальную жизнь.",
    inherited: "сложное зрение, социальность, увеличенный мозг",
    note: "Антропоиды включают обезьян Нового и Старого Света, а также человекообразных.",
    image: {
      src: "",
      remoteFallbacks: [commons("Aegyptopithecus_NT.jpg"), commons("Aegyptopithecus_zeuxis.jpg")],
      alt: "Реконструкция Aegyptopithecus",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Simian"), wiki("Aegyptopithecus")]
  },
  {
    id: "old-world-monkeys",
    title: "Узконосые приматы",
    latin: "Catarrhini",
    ageMa: 30,
    eraId: "primates",
    framing: "direct-lineage",
    summary: "В этой группе позднее разделились мартышкообразные и человекообразные.",
    inherited: "узконосый тип приматов, новые формы социальной и древесной жизни",
    note: "Это мост к ответу: человекообразные обезьяны происходят от более ранних узконосых приматов.",
    image: {
      src: "",
      remoteFallbacks: [commons("Parapithecus_grangeri.jpg"), commons("Aegyptopithecus_NT.jpg")],
      alt: "Ископаемый или реконструированный ранний узконосый примат",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Catarrhini"), wiki("Old_World_monkey")]
  },
  {
    id: "early-apes",
    title: "Ранние человекообразные",
    latin: "Proconsul and early Hominoidea",
    ageMa: 20,
    eraId: "primates",
    framing: "stem-form",
    summary: "Вот где появляется ответ: обезьяны произошли от более ранних приматов, а человекообразные выделились внутри узконосых.",
    inherited: "подвижное плечо, хват, крупный мозг, социальное обучение",
    note: "Proconsul и похожие формы представляют ранних человекообразных, а не современную обезьяну.",
    image: {
      src: "",
      remoteFallbacks: [commons("Proconsul_nyanzae_skeleton.jpg"), commons("Proconsul_skull_at_AMNH.jpg")],
      alt: "Скелет или череп Proconsul",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Proconsul_(mammal)"), wiki("Ape")]
  },
  {
    id: "great-apes",
    title: "Большие человекообразные",
    latin: "Hominidae",
    ageMa: 14,
    eraId: "primates",
    framing: "direct-lineage",
    summary: "Линия больших человекообразных объединяет орангутанов, горилл, шимпанзе и людей.",
    inherited: "крупное тело, сложное обучение, долгая забота о потомстве",
    note: "Люди не произошли от современных шимпанзе; у нас общий предок.",
    image: {
      src: "",
      remoteFallbacks: [commons("Pierolapithecus_catalaunicus_(Kopie).jpg"), commons("Sivapithecus_indicus.jpg")],
      alt: "Реконструкция раннего большого человекообразного",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Hominidae"), wiki("Pierolapithecus")]
  },
  {
    id: "early-hominins",
    title: "Ранние гоминины",
    latin: "Sahelanthropus / Orrorin",
    ageMa: 7,
    eraId: "primates",
    framing: "stem-form",
    summary: "После разделения с линией шимпанзе появляются формы с признаками ранней двуногости.",
    inherited: "изменение основания черепа, бедра и походки",
    note: "Положение некоторых ранних гоминин в дереве обсуждается.",
    image: {
      src: "",
      remoteFallbacks: [commons("Sahelanthropus_tchadensis_-_TM_266-01-060-1.jpg"), commons("Sahelanthropus_tchadensis_(Toumaï).JPG")],
      alt: "Череп Sahelanthropus tchadensis",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Sahelanthropus"), wiki("Orrorin")]
  },
  {
    id: "ardipithecus",
    title: "Ардипитек",
    latin: "Ardipithecus ramidus",
    ageMa: 4.4,
    eraId: "primates",
    framing: "stem-form",
    summary: "Лесной гоминин с сочетанием древесного лазания и двуногой ходьбы.",
    inherited: "переходные черты таза, стопы и хватательной анатомии",
    note: "Не современная обезьяна и не человек, а мозаичная ранняя форма.",
    image: {
      src: "",
      remoteFallbacks: [commons("Ardipithecus_ramidus_Ardi_IMG_5604_BMNH.jpg"), commons("Ardipithecus_ramidus.JPG")],
      alt: "Реконструкция Ardipithecus ramidus",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Ardipithecus"), wiki("Ardipithecus_ramidus")]
  },
  {
    id: "australopithecus",
    title: "Австралопитеки",
    latin: "Australopithecus afarensis",
    ageMa: 3.2,
    eraId: "homo",
    framing: "direct-lineage",
    summary: "Устойчивая двуногость появилась задолго до большого мозга Homo.",
    inherited: "свод стопы, коленный валгус, регулярная двуногая ходьба",
    note: "Люси представляет важный этап, но родословная ранних гоминин ветвится.",
    image: {
      src: "",
      remoteFallbacks: [commons("Reconstruction_of_the_fossil_skeleton_of_\"Lucy\"_the_Australopithecus_afarensis.jpg"), commons("Australopithecus_afarensis_reconstruction.JPG")],
      alt: "Скелет Люси Australopithecus afarensis",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Australopithecus_afarensis"), wiki("Lucy_(Australopithecus)")]
  },
  {
    id: "early-homo",
    title: "Ранние Homo",
    latin: "Homo habilis / Homo rudolfensis",
    ageMa: 2.4,
    eraId: "homo",
    framing: "stem-form",
    summary: "Ранние Homo связаны с ростом мозга, изменением кисти и каменными орудиями.",
    inherited: "точный хват, изготовление орудий, рост мозга",
    note: "Границы между ранними видами Homo и поздними австралопитеками сложны.",
    image: {
      src: "",
      remoteFallbacks: [commons("Homo_habilis_-_forensic_facial_reconstruction.png"), commons("Homo_rudolfensis_skull_-_Naturmuseum_Senckenberg_-_DSC02095.JPG")],
      alt: "Реконструкция раннего Homo",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Homo_habilis"), wiki("Homo_rudolfensis")]
  },
  {
    id: "homo-erectus",
    title: "Homo erectus",
    latin: "Homo erectus / ergaster",
    ageMa: 1.8,
    eraId: "homo",
    framing: "direct-lineage",
    summary: "Длинные ноги, дальние перемещения, ашельские орудия и освоение новых регионов.",
    inherited: "пропорции тела для ходьбы и бега, технологическая традиция",
    note: "Homo erectus широко расселился и существовал очень долго.",
    image: {
      src: "",
      remoteFallbacks: [commons("Turkana_Boy.jpg"), commons("Em_-_Homo_erectus,_Turkana_boy_-_1.jpg")],
      alt: "Скелет Туркана бой Homo erectus",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Homo_erectus"), wiki("Turkana_Boy")]
  },
  {
    id: "heidelbergensis",
    title: "Homo heidelbergensis",
    latin: "Homo heidelbergensis",
    ageMa: 0.6,
    eraId: "homo",
    framing: "stem-form",
    summary: "Промежуточные популяции поздних Homo связаны с происхождением неандертальцев и sapiens.",
    inherited: "крупный мозг, охота, сложное поведение",
    note: "Таксономия среднеплейстоценовых Homo активно уточняется.",
    image: {
      src: "",
      remoteFallbacks: [commons("Broken_Hill_skull_01.jpg"), commons("Broken_Hill_Skull_(Replica01).jpg")],
      alt: "Череп Kabwe 1 Homo heidelbergensis",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Homo_heidelbergensis"), wiki("Kabwe_1")]
  },
  {
    id: "neanderthals",
    title: "Неандертальцы",
    latin: "Homo neanderthalensis",
    ageMa: 0.12,
    eraId: "homo",
    framing: "side-branch",
    summary: "Близкие родственники людей с культурой, технологиями и частичным генетическим вкладом в современные популяции.",
    inherited: "часть генетического наследия у внеафриканских популяций",
    note: "Неандертальцы не были предками всех людей; это сестринская линия, с которой было скрещивание.",
    image: {
      src: "",
      remoteFallbacks: [commons("Homo_neanderthalensis_reconstruction2_(University_of_Zurich).JPG"), commons("Homme_de_Chapelle-aux-saints.jpg")],
      alt: "Реконструкция неандертальца",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Neanderthal"), wiki("Human_evolution")]
  },
  {
    id: "early-sapiens",
    title: "Ранние Homo sapiens",
    latin: "Homo sapiens",
    ageMa: 0.3,
    eraId: "homo",
    framing: "direct-lineage",
    summary: "Ранние представители нашего вида сочетали почти современное лицо с продолжающейся эволюцией мозга и культуры.",
    inherited: "анатомия нашего вида, язык и символическое поведение в дальнейшем развитии",
    note: "Homo sapiens тоже часть ветвящегося дерева, а не финальная цель эволюции.",
    image: {
      src: "",
      remoteFallbacks: [commons("Jebel_Irhoud-1_NMNH.jpg"), commons("Omo_II_01.jpg")],
      alt: "Череп раннего Homo sapiens",
      credit: "Wikimedia Commons"
    },
    sources: [wiki("Jebel_Irhoud"), wiki("Homo_sapiens")]
  }
];
