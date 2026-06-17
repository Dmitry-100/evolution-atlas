import type { EvolutionStage } from "../data/lineage";

export type StageComparison = {
  older: EvolutionStage;
  younger: EvolutionStage;
  ageGapMa: number;
  newTraits: string[];
};

function isPersonalLine(stage: EvolutionStage) {
  return stage.lineageRole !== "side-branch" && stage.lineageRole !== "close-relative";
}

export function compareStages(stages: EvolutionStage[], first: EvolutionStage, second: EvolutionStage): StageComparison {
  const [older, younger] = first.ageMa >= second.ageMa ? [first, second] : [second, first];
  const existingTraits = new Set(older.inherited.map((trait) => trait.toLocaleLowerCase("ru-RU")));
  const newTraits: string[] = [];

  for (const stage of stages) {
    if (!isPersonalLine(stage) || stage.ageMa >= older.ageMa || stage.ageMa < younger.ageMa) {
      continue;
    }

    for (const trait of stage.inherited) {
      const normalized = trait.toLocaleLowerCase("ru-RU");
      if (!existingTraits.has(normalized)) {
        existingTraits.add(normalized);
        newTraits.push(trait);
      }
    }
  }

  return {
    older,
    younger,
    ageGapMa: Math.abs(first.ageMa - second.ageMa),
    newTraits,
  };
}
