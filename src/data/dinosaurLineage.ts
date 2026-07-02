import { STAGES, type EvolutionStage, type SourceRef, type StageImage } from "./lineage";

export type DinosaurLineageStage = {
  id: string;
  slug: string;
  titleRu: string;
  latin: string;
  ageMa: number;
  summaryRu: string;
  whyMattersRu: string;
  evidenceRu: string;
  inherited: string[];
  image: StageImage;
  sources: SourceRef[];
};

const sharedAnimalBranchIds = [
  "early-animals",
  "bilaterians",
  "chordates",
  "vertebrates",
  "jawed-fish",
  "lobe-finned",
  "tiktaalik",
  "tetrapods",
  "amniotes",
] as const;

const wiki = (label: string, slug: string): SourceRef => ({
  label,
  url: `https://en.wikipedia.org/wiki/${slug}`,
});

const dinoSource = (label: string, url: string): SourceRef => ({ label, url });

const dinoImage = (
  fileName: string,
  altRu: string,
  credit: string,
  sourceUrl: string,
  kind: StageImage["kind"] = "source-backed",
): StageImage => ({
  src: `/assets/images/dinosaurs/${fileName}`,
  altRu,
  kind,
  credit,
  license:
    kind === "generated-reconstruction" ? "AI-реконструкция; визуальная иллюстрация" : "см. исходный источник",
  sourceUrl,
});

const generatedDinoImage = (fileName: string, altRu: string): StageImage =>
  dinoImage(
    `generated-branch/${fileName}`,
    altRu,
    "AI-реконструкция / локальный визуальный слот",
    "https://openai.com/",
    "generated-reconstruction",
  );

const getSharedStage = (id: (typeof sharedAnimalBranchIds)[number]) => {
  const stage = STAGES.find((candidate) => candidate.id === id);
  if (!stage) {
    throw new Error(`Shared animal branch stage "${id}" is missing from STAGES`);
  }
  return stage;
};

export const sharedAnimalBranch: EvolutionStage[] = sharedAnimalBranchIds.map(getSharedStage);

export const birdDinosaurBranch: DinosaurLineageStage[] = [
  {
    id: "diapsids",
    slug: "diapsids",
    titleRu: "Диапсиды",
    latin: "Diapsida",
    ageMa: 310,
    summaryRu: "После амниот ветка рептилий разделилась: диапсиды стали линией, из которой позже выйдут ящерицы, крокодилы, динозавры и птицы.",
    whyMattersRu: "Птицы не ответвляются от нашей линии млекопитающих: их путь начинается рядом с амниотами, но дальше уходит в диапсидную сторону.",
    evidenceRu: "Диапсидный череп с двумя височными окнами показывает отдельную ветку амниот, отличную от синапсидной линии млекопитающих.",
    inherited: ["амниотическое развитие", "диапсидный череп", "сухопутная линия позвоночных"],
    image: generatedDinoImage(
      "diapsids.jpg",
      "AI-реконструкция ранней диапсидной ветви в музейной сцене",
    ),
    sources: [wiki("Diapsid", "Diapsid"), wiki("Amniote", "Amniote")],
  },
  {
    id: "archosaurs",
    slug: "archosaurs",
    titleRu: "Архозавры",
    latin: "Archosauria",
    ageMa: 250,
    summaryRu: "Архозавры дали две особенно заметные живые и ископаемые линии: крокодилов и динозавровую ветвь, внутри которой находятся птицы.",
    whyMattersRu: "Это развилка, где будущая птичья линия отделяется от большинства других рептилий и приближается к динозаврам.",
    evidenceRu: "Общие черты черепа, зубов, голеностопа и строения конечностей связывают архозавров с крокодилами, птерозаврами и динозаврами.",
    inherited: ["архозавровая походка", "измененный череп", "ветвь к динозаврам"],
    image: generatedDinoImage(
      "archosaurs.jpg",
      "AI-реконструкция архозавровой ветви в лесной мезозойской сцене",
    ),
    sources: [wiki("Archosaur", "Archosaur"), wiki("Avemetatarsalia", "Avemetatarsalia")],
  },
  {
    id: "early-dinosaurs",
    slug: "early-dinosaurs",
    titleRu: "Ранние динозавры",
    latin: "Dinosauria",
    ageMa: 230,
    summaryRu: "Первые динозавры триаса были чаще небольшими, быстрыми животными. Их успех начался задолго до гигантов юры и мела.",
    whyMattersRu: "Первые динозавры — не карикатурные гиганты, а лёгкие подвижные животные с вертикально поставленными ногами.",
    evidenceRu: "Ранние находки вроде Eoraptor и Herrerasaurus показывают небольших триасовых динозавров с уже узнаваемыми особенностями таза и конечностей.",
    inherited: ["вертикальная постановка ног", "активное движение", "динозавровая ветвь"],
    image: dinoImage(
      "generated-early-dinosaurs.png",
      "AI-реконструкция ранних динозавров на пути к птичьей ветви",
      "AI-реконструкция / локальный визуальный слот",
      "https://openai.com/",
      "generated-reconstruction",
    ),
    sources: [wiki("Dinosaur", "Dinosaur"), wiki("Eoraptor", "Eoraptor")],
  },
  {
    id: "theropods",
    slug: "theropods",
    titleRu: "Тероподы",
    latin: "Theropoda",
    ageMa: 220,
    summaryRu: "Тероподы были двуногими динозаврами. Именно внутри этой ветви возникает птичья линия, а многие перьевые признаки накапливались у близких нептичьих родственников.",
    whyMattersRu: "Если вопрос звучит 'вымерли ли динозавры?', ключ нужно искать здесь: птицы являются живыми тероподами.",
    evidenceRu: "Кладистические анализы связывают птиц с манирапторными тероподами по строению кисти, вилочки, таза, стопы, перьев и дыхательной системы.",
    inherited: ["двуногость", "легкий скелет", "трехпалая конечность"],
    image: generatedDinoImage(
      "theropods.jpg",
      "AI-реконструкция тероподов как динозавровой линии, ведущей к птицам",
    ),
    sources: [
      dinoSource("UCMP Berkeley: The Origin of Birds", "https://ucmp.berkeley.edu/diapsids/avians.html"),
      wiki("Theropoda", "Theropoda"),
      wiki("Maniraptora", "Maniraptora"),
    ],
  },
  {
    id: "feathered-dinosaurs",
    slug: "feathered-dinosaurs",
    titleRu: "Пернатые динозавры",
    latin: "Pennaraptora",
    ageMa: 160,
    summaryRu: "У многих нептичьих динозавров был покров, который помогал сохранять тепло, подавать сигналы и участвовать в поведении.",
    whyMattersRu: "Многие птичьи признаки появились ещё у нептичьих родственников.",
    evidenceRu: "Ископаемые из лагерштеттов Китая сохранили отпечатки сложных перьев у Anchiornis, Microraptor и других манирапторных динозавров.",
    inherited: ["перья", "теплоизоляция", "визуальные сигналы"],
    image: generatedDinoImage(
      "feathered-dinosaurs.jpg",
      "AI-реконструкция пернатых нептичьих динозавров",
    ),
    sources: [
      dinoSource("Natural History Museum: dinosaurs to birds", "https://www.nhm.ac.uk/discover/how-dinosaurs-evolved-into-birds.html"),
      wiki("Feathered dinosaur", "Feathered_dinosaur"),
      wiki("Anchiornis", "Anchiornis"),
    ],
  },
  {
    id: "archaeopteryx",
    slug: "archaeopteryx",
    titleRu: "Археоптерикс",
    latin: "Archaeopteryx lithographica",
    ageMa: 150,
    summaryRu: "Археоптерикс сочетал птичьи перья и крылья с динозавровыми чертами: зубами, когтями на крыльях и длинным костным хвостом.",
    whyMattersRu: "Не 'первая птица' из учебника, а переходная форма, где старые и новые признаки идут вперемешку.",
    evidenceRu: "Сольнхофенские окаменелости сохранили отпечатки перьев и скелетные признаки, связывающие Archaeopteryx с манирапторными тероподами.",
    inherited: ["крылья", "маховые перья", "сочетание птичьих и динозавровых черт"],
    image: generatedDinoImage(
      "archaeopteryx.jpg",
      "AI-реконструкция Archaeopteryx с крыльями, когтями и длинным хвостом",
    ),
    sources: [
      dinoSource("Natural History Museum: Archaeopteryx", "https://www.nhm.ac.uk/discover/dino-directory/archaeopteryx.html"),
      dinoSource("UCMP Berkeley: The Origin of Birds", "https://ucmp.berkeley.edu/diapsids/avians.html"),
      wiki("Archaeopteryx", "Archaeopteryx"),
    ],
  },
  {
    id: "early-birds",
    slug: "early-birds",
    titleRu: "Ранние птицы",
    latin: "Avialae",
    ageMa: 125,
    summaryRu: "В меловом периоде птичья линия уже разнообразна: появляются формы с разной экологией, полетом, хвостом и строением клюва.",
    whyMattersRu: "Птицы не возникли одной вспышкой — это целая ветвь экспериментов внутри динозавров.",
    evidenceRu: "Находки Confuciusornis, Enantiornithes и других ранних птиц показывают постепенную перестройку хвоста, грудного пояса, клюва и полета.",
    inherited: ["развитые крылья", "укорочение хвоста", "птичья ветвь"],
    image: generatedDinoImage(
      "early-birds.jpg",
      "AI-реконструкция ранних птиц мелового периода",
    ),
    sources: [wiki("Avialae", "Avialae"), wiki("Confuciusornis", "Confuciusornis")],
  },
  {
    id: "kpg-survivors",
    slug: "kpg-survivors",
    titleRu: "Рубеж K-Pg",
    latin: "Cretaceous-Paleogene extinction",
    ageMa: 66,
    summaryRu: "Около 66 млн лет назад удар астероида и последующие климатические изменения уничтожили нептичьих динозавров.",
    whyMattersRu: "Здесь рождается точный ответ: нептичьи динозавры вымерли, но часть птичьей ветви пережила кризис.",
    evidenceRu: "Иридиевый слой, кратер Чиксулуб, резкая смена фауны и исчезновение многих групп показывают глобальный кризис на границе мела и палеогена.",
    inherited: ["пережившая птичья линия", "малый размер", "адаптация к новым экосистемам"],
    image: generatedDinoImage(
      "kpg-survivors.jpg",
      "AI-реконструкция рубежа K-Pg и выжившей птичьей линии",
    ),
    sources: [wiki("Cretaceous-Paleogene extinction event", "Cretaceous%E2%80%93Paleogene_extinction_event"), wiki("Chicxulub crater", "Chicxulub_crater")],
  },
  {
    id: "modern-birds",
    slug: "modern-birds",
    titleRu: "Современные птицы",
    latin: "Aves / Neornithes",
    ageMa: 0,
    summaryRu: "Современные птицы — живая динозавровая ветвь. Точнее сказать так: нептичьи динозавры исчезли, но динозавры не исчезли полностью.",
    whyMattersRu: "Когда вы видите птицу, перед вами одна из выживших ветвей динозавров, а не отдельная линия рядом с ними.",
    evidenceRu: "Молекулярные данные, кладистические признаки скелета, перья, яйца, дыхательная система и ископаемые переходные формы объединяют птиц с тероподами.",
    inherited: ["перья", "клюв", "птичья дыхательная система", "живое динозавровое наследие"],
    image: generatedDinoImage(
      "modern-birds.jpg",
      "AI-реконструкция современных птиц как живой динозавровой ветви",
    ),
    sources: [
      wiki("Bird", "Bird"),
      wiki("Origin of birds", "Origin_of_birds"),
      dinoSource("Natural History Museum: dinosaurs to birds", "https://www.nhm.ac.uk/discover/how-dinosaurs-evolved-into-birds.html"),
      dinoSource("UCMP Berkeley: The Origin of Birds", "https://ucmp.berkeley.edu/diapsids/avians.html"),
    ],
  },
];

export const dinosaurCommonAncestor = {
    titleRu: "Ранние амниоты",
    latin: "Amniota",
    ageMa: 320,
    valueRu: "~320 млн лет назад",
  summaryRu:
    "Последний общий предок нашей линии и линии птиц был близок к ранним амниотам позднего карбона. После этой развилки синапсидная линия ведет к млекопитающим, а диапсидная — к ящерицам, крокодилам, динозаврам и птицам.",
  humanBranchRu: "синапсиды → терапсиды → цинодонты → млекопитающие → приматы → человек",
  dinosaurBranchRu: "диапсиды → архозавры → динозавры → тероподы → птицы",
  sources: [wiki("Amniote", "Amniote"), wiki("Synapsid", "Synapsid"), wiki("Diapsid", "Diapsid")],
};

export const dinosaurAnswer =
  "Нептичьи динозавры вымерли, но птицы — живая динозавровая ветвь.";
