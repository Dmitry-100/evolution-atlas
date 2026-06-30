import {
  formatExtinctionTitleRu,
  type MassExtinctionEvent,
} from "../data/extinctions";
import type { EvolutionStage } from "../data/lineage";

export type TimelineStageItem = {
  kind: "stage";
  id: string;
  ageMa: number;
  titleRu: string;
  stage: EvolutionStage;
};

export type TimelineExtinctionItem = {
  kind: "extinction";
  id: string;
  ageMa: number;
  titleRu: string;
  event: MassExtinctionEvent;
};

export type TimelineItem = TimelineStageItem | TimelineExtinctionItem;

export function toStageTimelineItem(stage: EvolutionStage): TimelineStageItem {
  return {
    kind: "stage",
    id: stage.id,
    ageMa: stage.ageMa,
    titleRu: stage.titleRu,
    stage,
  };
}

export function toExtinctionTimelineItem(
  event: MassExtinctionEvent,
): TimelineExtinctionItem {
  return {
    kind: "extinction",
    id: `extinction-${event.id}`,
    ageMa: event.ageMa,
    titleRu: formatExtinctionTitleRu(event.titleRu),
    event,
  };
}

export function buildTimelineItems(
  stages: EvolutionStage[],
  extinctions: MassExtinctionEvent[] = [],
): TimelineItem[] {
  return [
    ...stages.map(toStageTimelineItem),
    ...extinctions
      .filter((event) => event.ageMa > 0)
      .map(toExtinctionTimelineItem),
  ].sort((first, second) => {
    if (first.ageMa !== second.ageMa) {
      return second.ageMa - first.ageMa;
    }

    if (first.kind !== second.kind) {
      return first.kind === "extinction" ? -1 : 1;
    }

    return 0;
  });
}

export function getNearestStageForTimelineItem(
  stages: EvolutionStage[],
  item: TimelineItem,
) {
  if (item.kind === "stage") {
    return item.stage;
  }

  return stages.reduce<{
    stage: EvolutionStage;
    distance: number;
  } | null>((nearest, stage) => {
    const distance = Math.abs(stage.ageMa - item.ageMa);
    if (!nearest || distance < nearest.distance) {
      return { stage, distance };
    }

    return nearest;
  }, null)?.stage;
}
