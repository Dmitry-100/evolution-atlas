import { CARDS, EVENTS, cardKind } from "../../game/content";
import { count, currentEvent, isCrisis } from "../../game/engine";
import type { Effect, GameState } from "../../game/types";

// An uneven chain, with open water between the northern and southern islands.
export const ISLAND_CENTERS = [
  [-7.8, -2.0],
  [-1.0, -5.2],
  [6.5, -3.6],
  [-4.3, 5.4],
  [1.0, 1.5],
  [7.2, 4.7],
] as const;

export type VisualEffect = Effect & { planned: boolean };
export function effectKey(
  effect: Pick<Effect, "kind" | "region" | "destination">,
) {
  return `${effect.kind}:${effect.region}:${effect.destination ?? ""}`;
}

export function sceneEffects(state: GameState): VisualEffect[] {
  const effects = new Map<string, VisualEffect>();
  for (const effect of state.effects) {
    if (effect.until >= state.turn)
      effects.set(effectKey(effect), { ...effect, planned: false });
  }
  // The current season is visible while planning; population results still
  // belong exclusively to resolveTurn. A forecast for a later turn is not shown.
  const event = currentEvent(state);
  const weather = {
    ...event,
    region: isCrisis(event) ? -1 : event.region,
    until: state.turn + EVENTS[event.kind].duration - 1,
    planned: false,
  };
  effects.set(effectKey(weather), weather);
  if (state.phase === "planning") {
    for (const action of state.draft) {
      const kind = cardKind(action.card);
      const effect = {
        kind,
        region: action.region,
        destination: action.destination,
        until: state.turn + CARDS[kind].duration - 1,
        planned: true,
      };
      effects.set(effectKey(effect), effect);
    }
  }
  return [...effects.values()];
}

export function islandConditions(effects: VisualEffect[], island: number) {
  const local = effects.filter(
    (effect) => effect.region === island || effect.region === -1,
  );
  const has = (kind: Effect["kind"]) =>
    local.some((effect) => effect.kind === kind);
  return {
    dry: has("drought") || has("heat"),
    snow: has("cold") || has("chill"),
    ash: has("eruption"),
    rain: has("rain") || has("shade") || has("garua") || has("elnino"),
    flood: has("flood"),
    refuge: has("refuge"),
    food: has("food") || has("shoots"),
    mosaic: has("mosaic") || has("seeds") || has("seedbank"),
    cover: has("cover"),
    shade: has("shade"),
  };
}

export function populationChanges(state: GameState) {
  if (state.phase === "planning") return state.regions.map(() => 0);
  const before = state.history.at(-2)?.populations;
  return state.regions.map(
    (region, index) =>
      count(region) -
      (before?.[index] ?? (index === 0 ? (state.history[0]?.before ?? 0) : 0)),
  );
}
