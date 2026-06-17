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
  license: "см. исходный источник",
  sourceUrl,
});

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
    image: dinoImage(
      "diapsids.jpg",
      "Скелетная реконструкция раннего диапсида на музейной пластине",
      "Wikimedia Commons",
      "https://commons.wikimedia.org/wiki/File:Claudiosaurus_skeletals2.jpg",
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
    image: dinoImage(
      "archosaurs.jpg",
      "Реконструкция архозавра на темной музейной пластине",
      "Wikimedia Commons",
      "https://commons.wikimedia.org/wiki/File:Proterosuchus_BW.jpg",
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
    whyMattersRu: "Важно увидеть не карикатурного гиганта, а исходную архитектуру: вертикальная постановка конечностей, легкость и подвижность.",
    evidenceRu: "Ранние находки вроде Eoraptor и Herrerasaurus показывают небольших триасовых динозавров с уже узнаваемыми особенностями таза и конечностей.",
    inherited: ["вертикальная постановка ног", "активное движение", "динозавровая ветвь"],
    image: dinoImage(
      "early-dinosaurs.svg",
      "Иллюстрация ранних динозавров триасового периода",
      "Локальная музейная иллюстрация",
      "https://en.wikipedia.org/wiki/Eoraptor",
      "local-plate",
    ),
    sources: [wiki("Dinosaur", "Dinosaur"), wiki("Eoraptor", "Eoraptor")],
  },
  {
    id: "theropods",
    slug: "theropods",
    titleRu: "Тероподы",
    latin: "Theropoda",
    ageMa: 220,
    summaryRu: "Тероподы были двуногими хищными динозаврами. Именно внутри этой группы возникнут перья, крылья и птичья линия.",
    whyMattersRu: "Если вопрос звучит 'вымерли ли динозавры?', ключ нужно искать здесь: птицы являются живыми тероподами.",
    evidenceRu: "Кладистические анализы связывают птиц с манирапторными тероподами по строению кисти, вилочки, таза, стопы, перьев и дыхательной системы.",
    inherited: ["двуногость", "легкий скелет", "трехпалая конечность"],
    image: dinoImage(
      "theropods.svg",
      "Иллюстрация бегущего теропода как предковой ветви птиц",
      "Локальная музейная иллюстрация",
      "https://en.wikipedia.org/wiki/Theropoda",
      "local-plate",
    ),
    sources: [wiki("Theropoda", "Theropoda"), wiki("Maniraptora", "Maniraptora")],
  },
  {
    id: "feathered-dinosaurs",
    slug: "feathered-dinosaurs",
    titleRu: "Пернатые динозавры",
    latin: "Pennaraptora",
    ageMa: 160,
    summaryRu: "Перья появились не только для полета: они могли работать как теплоизоляция, сигнал и элемент поведения задолго до настоящих птиц.",
    whyMattersRu: "Пернатые динозавры ломают привычную картинку: многие признаки птиц появились ещё у нептичьих родственников.",
    evidenceRu: "Ископаемые из лагерштеттов Китая сохранили отпечатки перьев у Anchiornis, Microraptor, Sinosauropteryx и других динозавров.",
    inherited: ["перья", "теплоизоляция", "визуальные сигналы"],
    image: dinoImage(
      "feathered-dinosaurs.svg",
      "Иллюстрация пернатого нептичьего динозавра с длинными перьями на конечностях",
      "Локальная музейная иллюстрация",
      "https://en.wikipedia.org/wiki/Feathered_dinosaur",
      "local-plate",
    ),
    sources: [wiki("Feathered dinosaur", "Feathered_dinosaur"), wiki("Anchiornis", "Anchiornis")],
  },
  {
    id: "archaeopteryx",
    slug: "archaeopteryx",
    titleRu: "Археоптерикс",
    latin: "Archaeopteryx lithographica",
    ageMa: 150,
    summaryRu: "Археоптерикс сочетал птичьи перья и крылья с динозавровыми чертами: зубами, когтями на крыльях и длинным костным хвостом.",
    whyMattersRu: "Это не 'первая птица' в школьном смысле, а яркая переходная форма, где видно, как смешаны старые и новые признаки.",
    evidenceRu: "Сольнхофенские окаменелости сохранили отпечатки перьев и скелетные признаки, связывающие Archaeopteryx с манирапторными тероподами.",
    inherited: ["крылья", "маховые перья", "сочетание птичьих и динозавровых черт"],
    image: dinoImage(
      "archaeopteryx.svg",
      "Иллюстрация Archaeopteryx с крыльями, когтями и длинным хвостом",
      "Локальная музейная иллюстрация",
      "https://en.wikipedia.org/wiki/Archaeopteryx",
      "local-plate",
    ),
    sources: [wiki("Archaeopteryx", "Archaeopteryx"), dinoSource("Natural History Museum: Archaeopteryx", "https://www.nhm.ac.uk/discover/dino-directory/archaeopteryx.html")],
  },
  {
    id: "early-birds",
    slug: "early-birds",
    titleRu: "Ранние птицы",
    latin: "Avialae",
    ageMa: 125,
    summaryRu: "В меловом периоде птичья линия уже разнообразна: появляются формы с разной экологией, полетом, хвостом и строением клюва.",
    whyMattersRu: "Птицы не возникли одной внезапной вспышкой: это целая ветвь экспериментов внутри динозавровой истории.",
    evidenceRu: "Находки Confuciusornis, Enantiornithes и других ранних птиц показывают постепенную перестройку хвоста, грудного пояса, клюва и полета.",
    inherited: ["развитые крылья", "укорочение хвоста", "птичья ветвь"],
    image: dinoImage(
      "early-birds.svg",
      "Иллюстрация ранних меловых птиц над водой и хвойным лесом",
      "Локальная музейная иллюстрация",
      "https://en.wikipedia.org/wiki/Avialae",
      "local-plate",
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
    image: dinoImage(
      "kpg-survivors.jpg",
      "Иллюстрация астероидного удара и кризиса на границе мела и палеогена",
      "Локальный ассет раздела о вымираниях",
      "https://en.wikipedia.org/wiki/Cretaceous%E2%80%93Paleogene_extinction_event",
      "local-plate",
    ),
    sources: [wiki("Cretaceous-Paleogene extinction event", "Cretaceous%E2%80%93Paleogene_extinction_event"), wiki("Chicxulub crater", "Chicxulub_crater")],
  },
  {
    id: "modern-birds",
    slug: "modern-birds",
    titleRu: "Современные птицы",
    latin: "Aves / Neornithes",
    ageMa: 0,
    summaryRu: "Современные птицы — живая динозавровая ветвь. Поэтому честный ответ: нептичьи динозавры исчезли, но динозавры не исчезли полностью.",
    whyMattersRu: "Когда вы видите птицу, вы видите не 'потомка рядом с динозаврами', а одну из выживших ветвей динозавров.",
    evidenceRu: "Молекулярные данные, кладистические признаки скелета, перья, яйца, дыхательная система и ископаемые переходные формы объединяют птиц с тероподами.",
    inherited: ["перья", "клюв", "птичья дыхательная система", "живое динозавровое наследие"],
    image: dinoImage(
      "modern-birds.svg",
      "Иллюстрация современной птицы как живой динозавровой ветви",
      "Локальная музейная иллюстрация",
      "https://en.wikipedia.org/wiki/Bird",
      "local-plate",
    ),
    sources: [wiki("Bird", "Bird"), wiki("Origin of birds", "Origin_of_birds")],
  },
];

export const dinosaurAnswer =
  "Нептичьи динозавры вымерли, но птицы — живая динозавровая ветвь.";
