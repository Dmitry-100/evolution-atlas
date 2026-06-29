export type GlossaryTerm = {
  id: string;
  titleRu: string;
  latin?: string;
  definitionRu: string;
  exampleRu: string;
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "chordates",
    titleRu: "Хордовые",
    latin: "Chordata",
    definitionRu: "Животные с внутренней опорной осью — хордой — и нервной трубкой хотя бы на одной стадии развития.",
    exampleRu: "К хордовой линии относятся позвоночные, включая рыб, амфибий, млекопитающих и человека.",
  },
  {
    id: "amniotes",
    titleRu: "Амниоты",
    latin: "Amniota",
    definitionRu: "Наземные позвоночные, чьи эмбрионы развиваются в защитных оболочках; это позволило меньше зависеть от воды.",
    exampleRu: "От амниот расходятся линии млекопитающих, рептилий и птиц.",
  },
  {
    id: "synapsids",
    titleRu: "Синапсиды",
    latin: "Synapsida",
    definitionRu: "Ветвь амниот с особым строением черепа, из которой в итоге возникли млекопитающие.",
    exampleRu: "Dimetrodon часто выглядит как 'рептилия', но его линия ближе к нам, чем к динозаврам.",
  },
  {
    id: "therapsids",
    titleRu: "Терапсиды",
    latin: "Therapsida",
    definitionRu: "Продвинутая группа синапсид, где усиливались черты будущих млекопитающих: зубы, поза, обмен веществ.",
    exampleRu: "Терапсиды показывают постепенный переход от древних синапсид к млекопитающим.",
  },
  {
    id: "cynodonts",
    titleRu: "Цинодонты",
    latin: "Cynodontia",
    definitionRu: "Группа терапсид с еще более млекопитающими признаками челюстей, зубов и, вероятно, поведения.",
    exampleRu: "Из цинодонтной области родства появляются ранние млекопитающие.",
  },
  {
    id: "primates",
    titleRu: "Приматы",
    latin: "Primates",
    definitionRu: "Отряд млекопитающих с хватательными конечностями, развитым зрением и обычно сложным социальным поведением.",
    exampleRu: "Лемуры, мартышки, человекообразные обезьяны и Homo sapiens — разные ветви приматов.",
  },
  {
    id: "anthropoids",
    titleRu: "Антропоиды",
    latin: "Anthropoidea",
    definitionRu: "Группа приматов, включающая обезьян Старого и Нового Света, человекообразных обезьян и людей.",
    exampleRu: "Ветвь приматов, где усиливаются зрение и социальность.",
  },
  {
    id: "hominins",
    titleRu: "Гоминины",
    latin: "Hominini",
    definitionRu: "Линия после расхождения с ближайшими родственниками шимпанзе, ведущая к австралопитекам и людям.",
    exampleRu: "Из всех человекообразных это наша узкая ветвь.",
  },
  {
    id: "cladogram",
    titleRu: "Кладограмма",
    definitionRu: "Схема родства, которая показывает ветвления общего происхождения, а не лестницу 'лучше-хуже'.",
    exampleRu: "На кладограмме человек не вершина, а одна из молодых ветвей большого дерева.",
  },
];

const STAGE_GLOSSARY: Record<string, string> = {
  chordates: "chordates",
  amniotes: "amniotes",
  synapsids: "synapsids",
  therapsids: "therapsids",
  cynodonts: "cynodonts",
  "early-primates": "primates",
  plesiadapis: "primates",
  anthropoids: "anthropoids",
  hominins: "hominins",
};

export function getGlossaryTerm(id: string) {
  return GLOSSARY_TERMS.find((term) => term.id === id);
}

export function getStageGlossaryTerm(stageId: string) {
  const termId = STAGE_GLOSSARY[stageId];
  return termId ? getGlossaryTerm(termId) : undefined;
}
