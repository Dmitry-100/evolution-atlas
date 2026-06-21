import type { EvolutionStage } from "../data/lineage";

export type TraitCategoryId = "cells-energy" | "body" | "movement" | "senses" | "brain-social";

export type TraitCategory = {
  id: TraitCategoryId;
  titleRu: string;
  keywords: string[];
};

export type AccumulatedTraitGroup = {
  id: TraitCategoryId;
  titleRu: string;
  traits: string[];
};

export const TRAIT_CATEGORIES: TraitCategory[] = [
  {
    id: "cells-energy",
    titleRu: "Клетки и энергия",
    keywords: ["мембран", "обмен", "днк", "рнк", "рибос", "митохонд", "кислород", "энерг", "ядро", "клет"],
  },
  {
    id: "body",
    titleRu: "План тела",
    keywords: ["многоклет", "ткан", "эмбри", "хорд", "череп", "позвоноч", "челюст", "зуб", "плацент", "репродук"],
  },
  {
    id: "movement",
    titleRu: "Движение",
    keywords: ["движ", "конеч", "пальц", "плавник", "опор", "ног", "плеч", "хват", "лаз", "ход", "переход", "вынослив"],
  },
  {
    id: "senses",
    titleRu: "Органы чувств",
    keywords: ["зрен", "слух", "чувств", "цвет", "бинокуляр"],
  },
  {
    id: "brain-social",
    titleRu: "Мозг и социальность",
    keywords: ["мозг", "социаль", "культур", "язык", "символ", "обуч", "оруд", "забот", "охот", "детство", "коллектив"],
  },
];

function canContributeToPersonalLine(stage: EvolutionStage, activeStage: EvolutionStage) {
  if (stage.id === activeStage.id) {
    return true;
  }

  return stage.lineageRole !== "side-branch" && stage.lineageRole !== "close-relative";
}

function categorizeTrait(trait: string) {
  const normalized = trait.toLocaleLowerCase("ru-RU");
  return TRAIT_CATEGORIES.find((category) => category.keywords.some((keyword) => normalized.includes(keyword))) ?? TRAIT_CATEGORIES[1];
}

export function getAccumulatedTraitGroups(stages: EvolutionStage[], activeStage: EvolutionStage): AccumulatedTraitGroup[] {
  const groups = new Map<TraitCategoryId, AccumulatedTraitGroup>();
  const seen = new Set<string>();

  for (const category of TRAIT_CATEGORIES) {
    groups.set(category.id, { id: category.id, titleRu: category.titleRu, traits: [] });
  }

  for (const stage of stages) {
    if (stage.ageMa < activeStage.ageMa || !canContributeToPersonalLine(stage, activeStage)) {
      continue;
    }

    for (const trait of stage.inherited) {
      const normalized = trait.toLocaleLowerCase("ru-RU");
      if (seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      const category = categorizeTrait(trait);
      groups.get(category.id)?.traits.push(trait);
    }
  }

  return [...groups.values()].filter((group) => group.traits.length > 0);
}
