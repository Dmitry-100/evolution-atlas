import type { EvolutionStage, StageImage } from "../data/lineage";

export type CladogramRoot = {
  id: "luca";
  titleRu: string;
  latin: string;
  ageMa: number;
  descriptionRu: string;
};

export type CladogramCommonAncestor = {
  titleRu: string;
  ageMa: number;
  scopeRu: string;
  relationRu: string;
};

export type CladogramBranch = {
  id: string;
  titleRu: string;
  latin?: string;
  ageMa?: number;
  descriptionRu: string;
  image: StageImage;
  kind: "stage" | "context";
  parent: EvolutionStage;
  commonAncestor: CladogramCommonAncestor;
  isLivingComparison: boolean;
  stage?: EvolutionStage;
};

export type Cladogram = {
  root: CladogramRoot;
  trunk: EvolutionStage[];
  branches: CladogramBranch[];
  livingBranches: CladogramBranch[];
};

type ContextBranchSeed = Omit<
  CladogramBranch,
  "kind" | "parent" | "stage" | "commonAncestor" | "isLivingComparison"
> & { parentId: string };

type CommonAncestorSeed = Partial<CladogramCommonAncestor>;

const cladogramRoot: CladogramRoot = {
  id: "luca",
  titleRu: "LUCA — общий предок всей современной жизни",
  latin: "last universal common ancestor",
  ageMa: 3800,
  descriptionRu:
    "LUCA - реконструируемый узел, от которого расходятся современные клеточные линии: бактерии, археи и линия эукариот.",
};

const filePage = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName).replace(/%20/g, "_")}`;

const cladogramImage = (
  fileName: string,
  commonsTitle: string,
  altRu: string,
  credit = "Wikimedia Commons",
  license = "см. страницу файла",
): StageImage => ({
  src: `/assets/images/cladogram/${fileName}`,
  altRu,
  kind: "source-backed",
  credit,
  license,
  sourceUrl: filePage(commonsTitle),
});

const wikiLeadImage = (
  fileName: string,
  pageSlug: string,
  altRu: string,
): StageImage => ({
  src: `/assets/images/cladogram/${fileName}`,
  altRu,
  kind: "source-backed",
  credit: "Wikipedia / Wikimedia Commons",
  license: "см. страницу изображения",
  sourceUrl: `https://en.wikipedia.org/wiki/${pageSlug}`,
});

const localSourceImage = (
  src: string,
  sourceUrl: string,
  altRu: string,
  credit = "Wikimedia Commons",
  license = "см. исходный источник",
): StageImage => ({
  src,
  altRu,
  kind: "source-backed",
  credit,
  license,
  sourceUrl,
});

const trunkRoles = new Set<EvolutionStage["lineageRole"]>([
  "foundation",
  "stem-form",
  "direct-lineage",
]);
const extraTrunkStageIds = new Set(["early-animals"]);
const branchRoles = new Set<EvolutionStage["lineageRole"]>([
  "representative",
  "side-branch",
  "close-relative",
]);

const livingComparisonBranchIds = new Set([
  "prokaryotes",
  "cyanobacteria",
  "choanoflagellates",
  "branch-plants-algae",
  "branch-fungi",
  "branch-sponges",
  "branch-arthropods",
  "branch-mollusks-worms",
  "branch-tunicates-lancelets",
  "branch-jawless-fish",
  "branch-cartilaginous-fish",
  "branch-ray-finned-fish",
  "branch-living-sarcopterygians",
  "branch-amphibians",
  "branch-diapsids",
  "branch-monotremes",
  "branch-marsupials",
  "branch-laurasiatheria",
  "branch-rodents",
  "branch-lemurs-lorises",
  "branch-tarsiers",
  "new-world-monkeys",
  "old-world-monkeys",
  "branch-gibbons",
  "branch-orangutans",
  "branch-gorillas",
  "branch-chimpanzees",
]);

const ancestorTitleByStageId: Record<string, string> = {
  "cell-lines": "Ранние клеточные линии",
  eukaryotes: "Эукариотический предок",
  "early-animals": "Ранний животный предок",
  bilaterians: "Двусторонний животный предок",
  chordates: "Ранний хордовый предок",
  vertebrates: "Ранний позвоночный предок",
  "jawed-fish": "Челюстной позвоночный предок",
  "lobe-finned": "Лопастеперый предок",
  tetrapods: "Ранний четвероногий",
  amniotes: "Ранний амниот",
  mammals: "Раннее млекопитающее",
  placentals: "Ранний плацентарный предок",
  "early-primates": "Ранний приматный предок",
  anthropoids: "Предок антропоидов",
  catarrhini: "Предок узконосых обезьян",
  "early-apes": "Предок человекообразных",
  "great-apes": "Предок больших человекообразных",
  hominins: "Предок линии Homo-Pan",
  heidelbergensis: "Предковый круг поздних Homo",
};

const ancestorScopeByStageId: Record<string, string> = {
  "cell-lines": "вся современная клеточная жизнь",
  eukaryotes: "эукариоты",
  "early-animals": "животные",
  bilaterians: "двусторонние животные",
  chordates: "хордовые",
  vertebrates: "позвоночные",
  "jawed-fish": "челюстные позвоночные",
  "lobe-finned": "лопастеперые",
  tetrapods: "четвероногие",
  amniotes: "амниоты",
  mammals: "млекопитающие",
  placentals: "плацентарные",
  "early-primates": "приматы",
  anthropoids: "обезьяны",
  catarrhini: "узконосые обезьяны",
  "early-apes": "человекообразные",
  "great-apes": "большие человекообразные",
  hominins: "линии Homo и Pan",
  heidelbergensis: "поздние человеческие линии",
};

const commonAncestorOverrides: Record<string, CommonAncestorSeed> = {
  prokaryotes: {
    titleRu: "LUCA",
    ageMa: cladogramRoot.ageMa,
    scopeRu: "вся современная клеточная жизнь",
    relationRu:
      "общий предок с нами, бактериями и археями - LUCA; после него клеточные линии пошли разными путями.",
  },
  "branch-plants-algae": {
    titleRu: "Эукариотический предок",
    relationRu:
      "общий предок с нами, растениями и водорослями - ранний эукариот с ядром и сложной клеточной организацией.",
  },
  "branch-fungi": {
    titleRu: "Эукариотический предок",
    relationRu:
      "общий предок с нами и грибами находится среди ранних эукариот; дальше животная и грибная линии разделились.",
  },
  "branch-arthropods": {
    titleRu: "Двусторонний животный предок",
    relationRu:
      "общий предок с нами и членистоногими - раннее двустороннее животное; дальше одна ветвь пошла к хордовой линии, другая к членистоногим.",
  },
  "branch-ray-finned-fish": {
    titleRu: "Челюстной позвоночный предок",
    relationRu:
      "общий предок с нами и большинством современных рыб - ранний челюстной позвоночный.",
  },
  "branch-amphibians": {
    titleRu: "Ранний четвероногий",
    relationRu:
      "общий предок с нами и земноводными - ранний четвероногий; наша линия дальше пошла через амниот.",
  },
  "branch-diapsids": {
    titleRu: "Ранний амниот",
    relationRu:
      "общий предок с нами, птицами и рептилиями - ранний амниот; после этой развилки наша линия идет к синапсидам.",
  },
  "branch-monotremes": {
    titleRu: "Раннее млекопитающее",
    relationRu:
      "общий предок с нами и однопроходными - раннее млекопитающее, от которого отделилась яйцекладущая ветвь.",
  },
  "branch-marsupials": {
    titleRu: "Раннее млекопитающее",
    relationRu:
      "общий предок с нами и сумчатыми - раннее млекопитающее; плацентарная линия пошла дальше отдельно.",
  },
  "branch-rodents": {
    titleRu: "Ранний плацентарный предок",
    relationRu:
      "общий предок с нами и грызунами находится среди ранних плацентарных млекопитающих.",
  },
  "branch-laurasiatheria": {
    titleRu: "Ранний плацентарный предок",
    relationRu:
      "общий предок с нами, китами, копытными, летучими мышами и хищными находится среди ранних плацентарных млекопитающих.",
  },
  "branch-lemurs-lorises": {
    titleRu: "Ранний приматный предок",
    relationRu:
      "общий предок с нами, лемурами и лори - ранний приматный предок; дальше мокроносые приматы и наша линия разошлись.",
  },
  "old-world-monkeys": {
    titleRu: "Предок узконосых обезьян",
    relationRu:
      "общий предок с нами и мартышковыми - предок узконосых обезьян; человекообразные и мартышковые затем разошлись.",
  },
  "branch-orangutans": {
    titleRu: "Предок больших человекообразных",
    relationRu:
      "общий предок с нами и орангутанами - ранний большой человекообразный; орангутаны не предки человека, а современная соседняя ветвь.",
  },
  "branch-gorillas": {
    titleRu: "Африканский человекообразный предок",
    ageMa: 9,
    scopeRu: "африканские человекообразные",
    relationRu:
      "общий предок с нами и гориллами - африканский человекообразный предок; ветви горилл и Homo-Pan затем разделились.",
  },
  "branch-chimpanzees": {
    titleRu: "Предок линии Homo-Pan",
    relationRu:
      "общий предок с нами, шимпанзе и бонобо - предок линии Homo-Pan; современные шимпанзе не являются нашими предками.",
  },
};

const livingStageImageOverrides: Record<string, StageImage> = {
  "new-world-monkeys": localSourceImage(
    "/assets/images/source-backed/capuchin-branch.jpg",
    "https://en.wikipedia.org/wiki/White-headed_capuchin",
    "Живой капуцин на ветке как представитель широконосых обезьян.",
    "Wikimedia Commons / локальная обработка",
  ),
  "old-world-monkeys": localSourceImage(
    "/assets/images/source-backed/douc-langur-head.jpg",
    "https://en.wikipedia.org/wiki/Red-shanked_douc",
    "Живой дук крупным планом как представитель мартышковых обезьян.",
    "Wikimedia Commons / локальная обработка",
  ),
};

const contextBranches: ContextBranchSeed[] = [
  {
    id: "branch-plants-algae",
    parentId: "eukaryotes",
    titleRu: "Растения и водоросли",
    latin: "Archaeplastida",
    ageMa: 1600,
    descriptionRu:
      "Другая крупная эукариотическая ветвь пошла к фотосинтезу, водорослям и растениям, а не к животным.",
    image: cladogramImage(
      "branch-plants-algae.jpg",
      "Ulva_lactuca.jpeg",
      "Зеленая водоросль Ulva lactuca в воде.",
    ),
  },
  {
    id: "branch-fungi",
    parentId: "eukaryotes",
    titleRu: "Грибы",
    latin: "Fungi",
    ageMa: 1000,
    descriptionRu:
      "Грибы ближе к животным, чем растения, но это отдельная сестринская ветвь эукариот.",
    image: cladogramImage(
      "branch-fungi.jpg",
      "Mushroom in Swedish forest 2.jpg",
      "Грибы на лесной подстилке.",
    ),
  },
  {
    id: "branch-sponges",
    parentId: "early-animals",
    titleRu: "Губки и гребневики",
    latin: "Porifera / Ctenophora",
    ageMa: 560,
    descriptionRu:
      "Ранние животные быстро разошлись на несколько планов тела; часть линий не пошла к двусторонней симметрии.",
    image: cladogramImage(
      "branch-sponges.jpg",
      "Green and yellow sea sponges, Antarctica.JPG",
      "Морские губки на дне океана.",
    ),
  },
  {
    id: "branch-arthropods",
    parentId: "bilaterians",
    titleRu: "Членистоногие",
    latin: "Arthropoda",
    ageMa: 520,
    descriptionRu:
      "Насекомые, пауки и ракообразные показывают, что двусторонние животные дали огромную боковую радиацию.",
    image: wikiLeadImage(
      "branch-arthropods.jpg",
      "Trilobite",
      "Фоссилия трилобита как древнего членистоногого.",
    ),
  },
  {
    id: "branch-mollusks-worms",
    parentId: "bilaterians",
    titleRu: "Моллюски и черви",
    latin: "Lophotrochozoa",
    ageMa: 520,
    descriptionRu:
      "Еще одна большая ветвь двусторонних животных: от осьминогов и улиток до кольчатых червей.",
    image: cladogramImage(
      "branch-mollusks-worms.jpg",
      "Red Octopus rescued.jpg",
      "Красный осьминог в воде.",
    ),
  },
  {
    id: "branch-tunicates-lancelets",
    parentId: "chordates",
    titleRu: "Оболочники и ланцетники",
    latin: "Tunicates / Cephalochordata",
    ageMa: 515,
    descriptionRu:
      "Хордовые не сразу стали позвоночными: рядом остались морские родственники с хордой, но без позвоночника.",
    image: cladogramImage(
      "branch-tunicates-lancelets.jpg",
      "Branchiostoma lanceolatum.jpg",
      "Ланцетник на темном фоне.",
    ),
  },
  {
    id: "branch-jawless-fish",
    parentId: "vertebrates",
    titleRu: "Бесчелюстные рыбы",
    latin: "Agnatha",
    ageMa: 500,
    descriptionRu:
      "Миноги и миксины напоминают о позвоночных до появления челюстей.",
    image: cladogramImage(
      "branch-jawless-fish.jpg",
      "Petromyzon marinus.004 - Aquarium Finisterrae.jpg",
      "Минога в аквариуме.",
    ),
  },
  {
    id: "branch-cartilaginous-fish",
    parentId: "jawed-fish",
    titleRu: "Хрящевые рыбы",
    latin: "Chondrichthyes",
    ageMa: 420,
    descriptionRu:
      "Акулы, скаты и химеры ушли по собственной линии челюстных позвоночных.",
    image: cladogramImage(
      "branch-cartilaginous-fish.jpg",
      "Great White Shark (14730709620).jpg",
      "Белая акула под водой.",
    ),
  },
  {
    id: "branch-ray-finned-fish",
    parentId: "jawed-fish",
    titleRu: "Лучеперые рыбы",
    latin: "Actinopterygii",
    ageMa: 420,
    descriptionRu:
      "Большинство современных рыб относится к лучеперым; ветвь, ведущая к наземным позвоночным, проходит через лопастеперых.",
    image: cladogramImage(
      "branch-ray-finned-fish.jpg",
      "Common lion fish Pterois volitans 2.jpg",
      "Крылатка как представитель лучеперых рыб.",
    ),
  },
  {
    id: "branch-living-sarcopterygians",
    parentId: "lobe-finned",
    titleRu: "Целаканты и двоякодышащие",
    latin: "Coelacanths / Lungfish",
    ageMa: 390,
    descriptionRu:
      "Живые родственники лопастеперых помогают увидеть, что конечности выросли из рыбьей архитектуры.",
    image: localSourceImage(
      "/assets/images/source-backed/lobe-finned.jpg",
      filePage("Latimeria_Chalumnae_-_Coelacanth_-_NHMW.jpg"),
      "Целакант, современный представитель лопастеперых.",
      "Alberto Fernandez Fernandez / Wikimedia Commons",
      "CC BY-SA 3.0",
    ),
  },
  {
    id: "branch-amphibians",
    parentId: "tetrapods",
    titleRu: "Земноводные",
    latin: "Amphibia",
    ageMa: 360,
    descriptionRu:
      "Часть четвероногих осталась тесно связана с водой, а наша линия пошла через амниот.",
    image: cladogramImage(
      "branch-amphibians.jpg",
      "Red-eyed Leaf Frog (49661076226).jpg",
      "Красноглазая квакша на листе.",
    ),
  },
  {
    id: "branch-diapsids",
    parentId: "amniotes",
    titleRu: "Диапсиды: ящерицы, крокодилы, динозавры и птицы",
    latin: "Diapsida",
    ageMa: 310,
    descriptionRu:
      "От амниот вправо уходит линия рептилий, динозавров и птиц; наша линия здесь идет через синапсид.",
    image: cladogramImage(
      "branch-diapsids.jpg",
      "Nile monitor lizard (Varanus niloticus) head.jpg",
      "Голова нильского варана как представителя диапсид.",
    ),
  },
  {
    id: "branch-monotremes",
    parentId: "mammals",
    titleRu: "Однопроходные",
    latin: "Monotremata",
    ageMa: 170,
    descriptionRu:
      "Утконос и ехидны показывают древнюю боковую ветвь млекопитающих, сохранившую яйцекладность.",
    image: wikiLeadImage(
      "branch-monotremes.jpg",
      "Platypus",
      "Утконос в воде.",
    ),
  },
  {
    id: "branch-marsupials",
    parentId: "mammals",
    titleRu: "Сумчатые",
    latin: "Marsupialia",
    ageMa: 160,
    descriptionRu:
      "Кенгуру, коалы и опоссумы развили собственную стратегию раннего рождения и донашивания детенышей.",
    image: cladogramImage(
      "branch-marsupials.jpg",
      "Cute Kangaroo (Unsplash).jpg",
      "Кенгуру на открытой местности.",
    ),
  },
  {
    id: "branch-laurasiatheria",
    parentId: "placentals",
    titleRu: "Киты, копытные, летучие мыши и хищные",
    latin: "Laurasiatheria",
    ageMa: 95,
    descriptionRu:
      "Плацентарные млекопитающие дали множество ветвей; приматы - только одна из них.",
    image: wikiLeadImage(
      "branch-laurasiatheria.jpg",
      "Bat",
      "Летучая мышь в полете.",
    ),
  },
  {
    id: "branch-rodents",
    parentId: "placentals",
    titleRu: "Грызуны и зайцеобразные",
    latin: "Glires",
    ageMa: 85,
    descriptionRu:
      "Еще одна мощная плацентарная ветвь: мыши, белки, бобры, зайцы и их родственники.",
    image: cladogramImage(
      "branch-rodents.jpg",
      "Red squirrel head.jpg",
      "Рыжая белка крупным планом.",
    ),
  },
  {
    id: "branch-lemurs-lorises",
    parentId: "early-primates",
    titleRu: "Лемуры и лори",
    latin: "Strepsirrhini",
    ageMa: 55,
    descriptionRu:
      "Одна из ранних ветвей приматов сохранила собственный путь в сторону мокроносых приматов.",
    image: cladogramImage(
      "branch-lemurs-lorises.jpg",
      "Ring-tailed lemur portrait 2.jpg",
      "Кольцехвостый лемур крупным планом.",
    ),
  },
  {
    id: "branch-tarsiers",
    parentId: "anthropoids",
    titleRu: "Долгопяты",
    latin: "Tarsiiformes",
    ageMa: 45,
    descriptionRu:
      "Долгопяты - близкие родственники обезьян и человекообразных, но не часть нашей прямой линии.",
    image: wikiLeadImage(
      "branch-tarsiers.jpg",
      "Tarsier",
      "Долгопят на ветке.",
    ),
  },
  {
    id: "branch-gibbons",
    parentId: "early-apes",
    titleRu: "Гиббоны",
    latin: "Hylobatidae",
    ageMa: 17,
    descriptionRu:
      "Малые человекообразные отделились раньше больших человекообразных и стали виртуозами движения в кронах.",
    image: wikiLeadImage(
      "branch-gibbons.jpg",
      "Gibbon",
      "Гиббон на дереве.",
    ),
  },
  {
    id: "branch-orangutans",
    parentId: "great-apes",
    titleRu: "Орангутаны",
    latin: "Pongo",
    ageMa: 12,
    descriptionRu:
      "Орангутаны - боковая ветвь больших человекообразных, а не ступень перед человеком.",
    image: wikiLeadImage(
      "branch-orangutans.jpg",
      "Orangutan",
      "Орангутан крупным планом.",
    ),
  },
  {
    id: "branch-gorillas",
    parentId: "great-apes",
    titleRu: "Гориллы",
    latin: "Gorilla",
    ageMa: 9,
    descriptionRu:
      "Гориллы отделились после орангутанов, но до расхождения линий человека и шимпанзе.",
    image: wikiLeadImage(
      "branch-gorillas.jpg",
      "Western_gorilla",
      "Западная горилла крупным планом.",
    ),
  },
  {
    id: "branch-chimpanzees",
    parentId: "hominins",
    titleRu: "Шимпанзе и бонобо",
    latin: "Pan",
    ageMa: 7,
    descriptionRu:
      "Это ближайшая живая сестринская ветвь людей: у нас был общий предок, но современные шимпанзе не являются нашими предками.",
    image: localSourceImage(
      "/assets/images/source-backed/chimpanzees-branch.jpg",
      filePage("2006-12-09_Chipanzees_D_Bruyere.JPG"),
      "Шимпанзе в группе.",
      "David Bruyere / Wikimedia Commons",
      "CC BY-SA 2.0",
    ),
  },
  {
    id: "branch-denisovans",
    parentId: "heidelbergensis",
    titleRu: "Денисовцы",
    latin: "Denisovans",
    ageMa: 0.3,
    descriptionRu:
      "Поздняя человеческая боковая ветвь известна прежде всего по ДНК и показывает, что рядом с Homo sapiens жили другие люди.",
    image: wikiLeadImage(
      "branch-denisovans.jpg",
      "Denisovan",
      "Фрагмент денисовской кости, известный по молекулярным данным.",
    ),
  },
];

function oldestFirst(stages: EvolutionStage[]) {
  return [...stages].sort((a, b) => b.ageMa - a.ageMa);
}

function findNearestOlderTrunkStage(
  stage: EvolutionStage,
  trunk: EvolutionStage[],
) {
  return (
    [...trunk].reverse().find((candidate) => candidate.ageMa >= stage.ageMa) ??
    trunk[trunk.length - 1]
  );
}

function stageToBranch(
  stage: EvolutionStage,
  parent: EvolutionStage,
): CladogramBranch {
  const branch = {
    id: stage.id,
    titleRu: stage.titleRu,
    latin: stage.latin,
    ageMa: stage.ageMa,
    descriptionRu: stage.summaryRu,
    image: livingStageImageOverrides[stage.id] ?? stage.image,
    kind: "stage",
    parent,
    stage,
  } satisfies Omit<
    CladogramBranch,
    "commonAncestor" | "isLivingComparison"
  >;

  return {
    ...branch,
    commonAncestor: getCommonAncestor(branch, parent),
    isLivingComparison: livingComparisonBranchIds.has(branch.id),
  };
}

function branchAge(branch: CladogramBranch) {
  return branch.ageMa ?? branch.parent.ageMa;
}

function getAncestorTitle(stage: EvolutionStage) {
  return ancestorTitleByStageId[stage.id] ?? stage.titleRu;
}

function getAncestorScope(stage: EvolutionStage) {
  return ancestorScopeByStageId[stage.id] ?? stage.titleRu.toLowerCase();
}

function getCommonAncestor(
  branch: Pick<CladogramBranch, "id" | "titleRu">,
  parent: EvolutionStage,
): CladogramCommonAncestor {
  const override = commonAncestorOverrides[branch.id];
  const titleRu = override?.titleRu ?? getAncestorTitle(parent);
  const ageMa = override?.ageMa ?? parent.ageMa;
  const scopeRu = override?.scopeRu ?? getAncestorScope(parent);
  const relationRu =
    override?.relationRu ??
    `общий предок с нами: ${titleRu}; отсюда расходится ветвь «${branch.titleRu}».`;

  return {
    titleRu,
    ageMa,
    scopeRu,
    relationRu,
  };
}

export function buildCladogram(stages: EvolutionStage[]): Cladogram {
  const trunk = oldestFirst(
    stages.filter(
      (stage) =>
        trunkRoles.has(stage.lineageRole) || extraTrunkStageIds.has(stage.id),
    ),
  );
  const trunkIds = new Set(trunk.map((stage) => stage.id));
  const branchStages = oldestFirst(
    stages.filter(
      (stage) => !trunkIds.has(stage.id) && branchRoles.has(stage.lineageRole),
    ),
  );
  const branches = branchStages
    .map((stage) => {
      const parent = findNearestOlderTrunkStage(stage, trunk);
      return parent ? stageToBranch(stage, parent) : null;
    })
    .filter((branch): branch is CladogramBranch => branch !== null);
  const branchesById = new Set(branches.map((branch) => branch.id));
  const trunkById = new Map(trunk.map((stage) => [stage.id, stage]));
  const explanatoryBranches = contextBranches.reduce<CladogramBranch[]>(
    (acc, branch) => {
      if (branchesById.has(branch.id)) {
        return acc;
      }

      const parent = trunkById.get(branch.parentId);

      if (!parent) {
        return acc;
      }

      const hydratedBranch = {
        id: branch.id,
        titleRu: branch.titleRu,
        latin: branch.latin,
        ageMa: branch.ageMa,
        descriptionRu: branch.descriptionRu,
        image: branch.image,
        kind: "context",
        parent,
      } satisfies Omit<
        CladogramBranch,
        "commonAncestor" | "isLivingComparison" | "stage"
      >;

      acc.push({
        ...hydratedBranch,
        commonAncestor: getCommonAncestor(hydratedBranch, parent),
        isLivingComparison: livingComparisonBranchIds.has(hydratedBranch.id),
      });

      return acc;
    },
    [],
  );
  const allBranches = [...branches, ...explanatoryBranches].sort(
    (a, b) =>
      branchAge(b) - branchAge(a) || a.titleRu.localeCompare(b.titleRu, "ru"),
  );

  return {
    root: cladogramRoot,
    trunk,
    branches: allBranches,
    livingBranches: allBranches.filter((branch) => branch.isLivingComparison),
  };
}
