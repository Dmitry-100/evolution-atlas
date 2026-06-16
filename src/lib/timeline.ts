export type TimelineStageLike = {
  id: string;
  ageMa: number;
};

export type TimelineScale = {
  minMa: number;
  maxMa: number;
};

export const DEFAULT_TIMELINE_SCALE: TimelineScale = Object.freeze({
  minMa: 0.01,
  maxMa: 4000,
});

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function sortStagesOldestFirst<T extends TimelineStageLike>(stages: readonly T[]) {
  return [...stages].sort((a, b) => b.ageMa - a.ageMa);
}

export function ageMaToPosition(ageMa: number, scale = DEFAULT_TIMELINE_SCALE) {
  const minLog = Math.log10(scale.minMa);
  const maxLog = Math.log10(scale.maxMa);
  const valueLog = Math.log10(clamp(ageMa, scale.minMa, scale.maxMa));
  return 1 - (valueLog - minLog) / (maxLog - minLog);
}

export function positionToAgeMa(position: number, scale = DEFAULT_TIMELINE_SCALE) {
  const minLog = Math.log10(scale.minMa);
  const maxLog = Math.log10(scale.maxMa);
  const valueLog = maxLog - clamp(position, 0, 1) * (maxLog - minLog);
  return 10 ** valueLog;
}

export function getPrePrimateShare({
  originMa,
  primatesMa,
}: {
  originMa: number;
  primatesMa: number;
}) {
  if (originMa <= 0) return 0;
  return clamp((originMa - primatesMa) / originMa, 0, 1);
}

export function findNearestStage<T extends TimelineStageLike>(
  stages: readonly T[],
  position: number,
  scale = DEFAULT_TIMELINE_SCALE,
) {
  const target = clamp(position, 0, 1);
  return sortStagesOldestFirst(stages).reduce<{ stage: T; distance: number } | null>(
    (nearest, stage) => {
      const distance = Math.abs(ageMaToPosition(stage.ageMa, scale) - target);
      if (!nearest || distance < nearest.distance) return { stage, distance };
      return nearest;
    },
    null,
  )?.stage;
}

export function formatAgeRu(ageMa: number) {
  if (ageMa >= 1000) {
    const value = Number((ageMa / 1000).toFixed(1));
    return `${value.toLocaleString("ru-RU")} млрд лет назад`;
  }

  if (ageMa >= 1) {
    const digits = ageMa < 10 && !Number.isInteger(ageMa) ? 1 : 0;
    return `${Number(ageMa.toFixed(digits)).toLocaleString("ru-RU")} млн лет назад`;
  }

  return `${Math.round(ageMa * 1000).toLocaleString("ru-RU")} тыс. лет назад`;
}
