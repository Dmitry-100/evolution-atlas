import { primateStages, sortedStages, type EvolutionStage } from "../data/lineage";

export type AtlasUrlMode = "all" | "primates";

export type AtlasUrlState = {
  mode: AtlasUrlMode;
  stageId: string;
};

export type StageUrlState = {
  stageId: string;
};

const DEFAULT_STAGE_ID = "early-primates";

function normalizeSearchParams(search: URLSearchParams | string) {
  return typeof search === "string" ? new URLSearchParams(search) : search;
}

function findStageBySlugOrId(stages: EvolutionStage[], slugOrId: string | null) {
  if (!slugOrId) {
    return null;
  }
  return stages.find((stage) => stage.slug === slugOrId || stage.id === slugOrId) ?? null;
}

export function getDefaultAtlasStage(stages: EvolutionStage[] = sortedStages) {
  return stages.find((stage) => stage.id === DEFAULT_STAGE_ID) ?? stages[0];
}

export function parseAtlasUrlState(
  search: URLSearchParams | string,
  allStages: EvolutionStage[] = sortedStages,
  zoomStages: EvolutionStage[] = primateStages,
): AtlasUrlState {
  const params = normalizeSearchParams(search);
  const mode: AtlasUrlMode = params.get("mode") === "primates" ? "primates" : "all";
  const visibleStages = mode === "primates" ? zoomStages : allStages;
  const requestedStage = findStageBySlugOrId(visibleStages, params.get("stage"));
  const fallbackStage = getDefaultAtlasStage(visibleStages) ?? getDefaultAtlasStage(allStages);

  return {
    mode,
    stageId: requestedStage?.id ?? fallbackStage.id,
  };
}

export function parsePrimateUrlState(
  search: URLSearchParams | string,
  stages: EvolutionStage[] = primateStages,
): StageUrlState {
  const params = normalizeSearchParams(search);
  const requestedStage = findStageBySlugOrId(stages, params.get("stage"));
  const fallbackStage = getDefaultAtlasStage(stages) ?? getDefaultAtlasStage(sortedStages);

  return {
    stageId: requestedStage?.id ?? fallbackStage.id,
  };
}

export function toAtlasSearchParams({ mode, stage }: { mode: AtlasUrlMode; stage: EvolutionStage }) {
  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("stage", stage.slug);
  return params;
}

export function toStageSearchParams(stage: EvolutionStage) {
  const params = new URLSearchParams();
  params.set("stage", stage.slug);
  return params;
}

export function getStageHref(stage: EvolutionStage) {
  if (stage.isPrimateFocus) {
    return `/primates?${toStageSearchParams(stage).toString()}`;
  }

  return `/?${toAtlasSearchParams({ mode: "all", stage }).toString()}`;
}
