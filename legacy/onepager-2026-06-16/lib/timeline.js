export const DEFAULT_SCALE = Object.freeze({
  minMa: 0.01,
  maxMa: 4000
});

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sortStagesOldestFirst(stages) {
  return [...stages].sort((a, b) => b.ageMa - a.ageMa);
}

export function ageMaToPosition(ageMa, scale = DEFAULT_SCALE) {
  const minLog = Math.log10(scale.minMa);
  const maxLog = Math.log10(scale.maxMa);
  const valueLog = Math.log10(clamp(ageMa, scale.minMa, scale.maxMa));
  return 1 - (valueLog - minLog) / (maxLog - minLog);
}

export function positionToAgeMa(position, scale = DEFAULT_SCALE) {
  const minLog = Math.log10(scale.minMa);
  const maxLog = Math.log10(scale.maxMa);
  const clampedPosition = clamp(position, 0, 1);
  const valueLog = maxLog - clampedPosition * (maxLog - minLog);
  return 10 ** valueLog;
}

export function findNearestStage(stages, position, scale = DEFAULT_SCALE) {
  const ordered = sortStagesOldestFirst(stages);
  const target = clamp(position, 0, 1);
  return ordered.reduce((nearest, stage) => {
    const stagePosition = ageMaToPosition(stage.ageMa, scale);
    const distance = Math.abs(stagePosition - target);
    if (!nearest || distance < nearest.distance) {
      return { stage, distance };
    }
    return nearest;
  }, null)?.stage;
}

export function formatAgeRu(ageMa) {
  if (ageMa >= 1000) {
    return `${Number((ageMa / 1000).toFixed(1)).toLocaleString("ru-RU")} млрд лет назад`;
  }
  if (ageMa >= 1) {
    const digits = ageMa < 10 && !Number.isInteger(ageMa) ? 1 : 0;
    return `${Number(ageMa.toFixed(digits)).toLocaleString("ru-RU")} млн лет назад`;
  }
  return `${Math.round(ageMa * 1000).toLocaleString("ru-RU")} тыс. лет назад`;
}
