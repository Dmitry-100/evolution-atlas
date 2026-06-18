import type { EvolutionStage } from "../data/lineage";

export type CladogramBranch = {
  id: string;
  titleRu: string;
  latin?: string;
  ageMa?: number;
  descriptionRu: string;
  kind: "stage" | "context";
  parent: EvolutionStage;
  stage?: EvolutionStage;
};

export type Cladogram = {
  trunk: EvolutionStage[];
  branches: CladogramBranch[];
};

type ContextBranchSeed = Omit<CladogramBranch, "kind" | "parent" | "stage"> & {
  parentId: string;
};

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

const contextBranches: ContextBranchSeed[] = [
  {
    id: "branch-plants-algae",
    parentId: "eukaryotes",
    titleRu: "Растения и водоросли",
    latin: "Archaeplastida",
    ageMa: 1600,
    descriptionRu:
      "Другая крупная эукариотическая ветвь пошла к фотосинтезу, водорослям и растениям, а не к животным.",
  },
  {
    id: "branch-fungi",
    parentId: "eukaryotes",
    titleRu: "Грибы",
    latin: "Fungi",
    ageMa: 1000,
    descriptionRu:
      "Грибы ближе к животным, чем растения, но это отдельная сестринская ветвь эукариот.",
  },
  {
    id: "branch-sponges",
    parentId: "early-animals",
    titleRu: "Губки и гребневики",
    latin: "Porifera / Ctenophora",
    ageMa: 560,
    descriptionRu:
      "Ранние животные быстро разошлись на несколько планов тела; часть линий не пошла к двусторонней симметрии.",
  },
  {
    id: "branch-arthropods",
    parentId: "bilaterians",
    titleRu: "Членистоногие",
    latin: "Arthropoda",
    ageMa: 520,
    descriptionRu:
      "Насекомые, пауки и ракообразные показывают, что двусторонние животные дали огромную боковую радиацию.",
  },
  {
    id: "branch-mollusks-worms",
    parentId: "bilaterians",
    titleRu: "Моллюски и черви",
    latin: "Lophotrochozoa",
    ageMa: 520,
    descriptionRu:
      "Еще одна большая ветвь двусторонних животных: от осьминогов и улиток до кольчатых червей.",
  },
  {
    id: "branch-tunicates-lancelets",
    parentId: "chordates",
    titleRu: "Оболочники и ланцетники",
    latin: "Tunicates / Cephalochordata",
    ageMa: 515,
    descriptionRu:
      "Хордовые не сразу стали позвоночными: рядом остались морские родственники с хордой, но без позвоночника.",
  },
  {
    id: "branch-jawless-fish",
    parentId: "vertebrates",
    titleRu: "Бесчелюстные рыбы",
    latin: "Agnatha",
    ageMa: 500,
    descriptionRu:
      "Миноги и миксины напоминают о позвоночных до появления челюстей.",
  },
  {
    id: "branch-cartilaginous-fish",
    parentId: "jawed-fish",
    titleRu: "Хрящевые рыбы",
    latin: "Chondrichthyes",
    ageMa: 420,
    descriptionRu:
      "Акулы, скаты и химеры ушли по собственной линии челюстных позвоночных.",
  },
  {
    id: "branch-ray-finned-fish",
    parentId: "jawed-fish",
    titleRu: "Лучеперые рыбы",
    latin: "Actinopterygii",
    ageMa: 420,
    descriptionRu:
      "Большинство современных рыб относится к лучеперым; наша линия выбрала другую ветвь - лопастеперых.",
  },
  {
    id: "branch-living-sarcopterygians",
    parentId: "lobe-finned",
    titleRu: "Целаканты и двоякодышащие",
    latin: "Coelacanths / Lungfish",
    ageMa: 390,
    descriptionRu:
      "Живые родственники лопастеперых помогают увидеть, что конечности выросли из рыбьей архитектуры.",
  },
  {
    id: "branch-amphibians",
    parentId: "tetrapods",
    titleRu: "Земноводные",
    latin: "Amphibia",
    ageMa: 360,
    descriptionRu:
      "Часть четвероногих осталась тесно связана с водой, а наша линия пошла через амниот.",
  },
  {
    id: "branch-diapsids",
    parentId: "amniotes",
    titleRu: "Диапсиды: ящерицы, крокодилы, динозавры и птицы",
    latin: "Diapsida",
    ageMa: 310,
    descriptionRu:
      "От амниот вправо уходит линия рептилий, динозавров и птиц; наша линия здесь идет через синапсид.",
  },
  {
    id: "branch-monotremes",
    parentId: "mammals",
    titleRu: "Однопроходные",
    latin: "Monotremata",
    ageMa: 170,
    descriptionRu:
      "Утконос и ехидны показывают древнюю боковую ветвь млекопитающих, сохранившую яйцекладность.",
  },
  {
    id: "branch-marsupials",
    parentId: "mammals",
    titleRu: "Сумчатые",
    latin: "Marsupialia",
    ageMa: 160,
    descriptionRu:
      "Кенгуру, коалы и опоссумы развили собственную стратегию раннего рождения и донашивания детенышей.",
  },
  {
    id: "branch-laurasiatheria",
    parentId: "placentals",
    titleRu: "Киты, копытные, летучие мыши и хищные",
    latin: "Laurasiatheria",
    ageMa: 95,
    descriptionRu:
      "Плацентарные млекопитающие дали множество ветвей; приматы - только одна из них.",
  },
  {
    id: "branch-rodents",
    parentId: "placentals",
    titleRu: "Грызуны и зайцеобразные",
    latin: "Glires",
    ageMa: 85,
    descriptionRu:
      "Еще одна мощная плацентарная ветвь: мыши, белки, бобры, зайцы и их родственники.",
  },
  {
    id: "branch-lemurs-lorises",
    parentId: "early-primates",
    titleRu: "Лемуры и лори",
    latin: "Strepsirrhini",
    ageMa: 55,
    descriptionRu:
      "Одна из ранних ветвей приматов сохранила собственный путь в сторону мокроносых приматов.",
  },
  {
    id: "branch-tarsiers",
    parentId: "anthropoids",
    titleRu: "Долгопяты",
    latin: "Tarsiiformes",
    ageMa: 45,
    descriptionRu:
      "Долгопяты - близкие родственники обезьян и человекообразных, но не часть нашей прямой линии.",
  },
  {
    id: "branch-gibbons",
    parentId: "early-apes",
    titleRu: "Гиббоны",
    latin: "Hylobatidae",
    ageMa: 17,
    descriptionRu:
      "Малые человекообразные отделились раньше больших человекообразных и стали виртуозами движения в кронах.",
  },
  {
    id: "branch-orangutans",
    parentId: "great-apes",
    titleRu: "Орангутаны",
    latin: "Pongo",
    ageMa: 12,
    descriptionRu:
      "Орангутаны - боковая ветвь больших человекообразных, а не ступень перед человеком.",
  },
  {
    id: "branch-gorillas",
    parentId: "great-apes",
    titleRu: "Гориллы",
    latin: "Gorilla",
    ageMa: 9,
    descriptionRu:
      "Гориллы отделились после орангутанов, но до расхождения линий человека и шимпанзе.",
  },
  {
    id: "branch-chimpanzees",
    parentId: "hominins",
    titleRu: "Шимпанзе и бонобо",
    latin: "Pan",
    ageMa: 7,
    descriptionRu:
      "Это ближайшая живая сестринская ветвь людей: у нас был общий предок, но современные шимпанзе не являются нашими предками.",
  },
  {
    id: "branch-denisovans",
    parentId: "heidelbergensis",
    titleRu: "Денисовцы",
    latin: "Denisovans",
    ageMa: 0.3,
    descriptionRu:
      "Поздняя человеческая боковая ветвь известна прежде всего по ДНК и показывает, что рядом с Homo sapiens жили другие люди.",
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
  return {
    id: stage.id,
    titleRu: stage.titleRu,
    latin: stage.latin,
    ageMa: stage.ageMa,
    descriptionRu: stage.summaryRu,
    kind: "stage",
    parent,
    stage,
  };
}

function branchAge(branch: CladogramBranch) {
  return branch.ageMa ?? branch.parent.ageMa;
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

      acc.push({
        id: branch.id,
        titleRu: branch.titleRu,
        latin: branch.latin,
        ageMa: branch.ageMa,
        descriptionRu: branch.descriptionRu,
        kind: "context",
        parent,
      });

      return acc;
    },
    [],
  );

  return {
    trunk,
    branches: [...branches, ...explanatoryBranches].sort(
      (a, b) =>
        branchAge(b) - branchAge(a) || a.titleRu.localeCompare(b.titleRu, "ru"),
    ),
  };
}
