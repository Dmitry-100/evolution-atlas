import { primateStages, type EvolutionStage } from "./lineage";

// Reading sections of the chronology, not mutually exclusive biological clades.
export const PRIMATE_READING_GROUPS = [
  { id: "roots", titleRu: "Ранние приматы", color: "#82b7b3", fromId: "early-primates" },
  { id: "apes", titleRu: "Человекообразные", color: "#d0b477", fromId: "early-apes" },
  { id: "hominins", titleRu: "Гоминины", color: "#f0c978", fromId: "hominins" },
].map((group, index, groups) => {
  const start = primateStages.findIndex((stage) => stage.id === group.fromId);
  const next = groups[index + 1];
  const end = next ? primateStages.findIndex((stage) => stage.id === next.fromId) : primateStages.length;
  return { ...group, stages: primateStages.slice(start, end) };
});

export function getPrimateReadingGroup(stage: EvolutionStage) {
  return PRIMATE_READING_GROUPS.find((group) => group.stages.some((item) => item.id === stage.id));
}
