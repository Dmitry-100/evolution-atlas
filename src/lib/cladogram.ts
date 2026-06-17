import type { EvolutionStage } from "../data/lineage";

export type CladogramBranch = {
  stage: EvolutionStage;
  parent: EvolutionStage;
};

export type Cladogram = {
  trunk: EvolutionStage[];
  branches: CladogramBranch[];
};

const branchRoles = new Set<EvolutionStage["lineageRole"]>(["side-branch", "close-relative"]);

function oldestFirst(stages: EvolutionStage[]) {
  return [...stages].sort((a, b) => b.ageMa - a.ageMa);
}

function findNearestOlderTrunkStage(stage: EvolutionStage, trunk: EvolutionStage[]) {
  return [...trunk].reverse().find((candidate) => candidate.ageMa >= stage.ageMa) ?? trunk[trunk.length - 1];
}

export function buildCladogram(stages: EvolutionStage[]): Cladogram {
  const trunk = oldestFirst(stages.filter((stage) => stage.lineageRole === "direct-lineage"));
  const branchStages = oldestFirst(stages.filter((stage) => branchRoles.has(stage.lineageRole)));
  const branches = branchStages
    .map((stage) => {
      const parent = findNearestOlderTrunkStage(stage, trunk);
      return parent ? { stage, parent } : null;
    })
    .filter((branch): branch is CladogramBranch => branch !== null);

  return { trunk, branches };
}
