import { describe, expect, it } from "vitest";
import {
  addAction,
  createGame,
  nextTurn,
  resolveTurn,
} from "../../game/engine";
import {
  islandConditions,
  populationChanges,
  sceneEffects,
} from "./sceneState";

describe("visual world follows game state", () => {
  it("previews and cancels a card without mutating the population or random streams", () => {
    const state = createGame(146),
      original = structuredClone(state);
    const planned = addAction(state, {
      card: 2,
      region: 0,
      destination: 1,
      fraction: 0.25,
    });
    expect(sceneEffects(planned)).toContainEqual(
      expect.objectContaining({
        kind: "migrate",
        region: 0,
        destination: 1,
        planned: true,
      }),
    );
    expect(planned.regions).toEqual(original.regions);
    expect(planned.random).toEqual(original.random);
    expect(
      sceneEffects({ ...planned, draft: [] }).some(
        (effect) => effect.kind === "migrate",
      ),
    ).toBe(false);
    expect(state).toEqual(original);
  });
  it("distinguishes a translucent preview from a persistent applied object", () => {
    const state = createGame(146);
    const planned = addAction(state, { card: 3, region: 0 });
    expect(
      sceneEffects(planned).find((e) => e.kind === "refuge")?.planned,
    ).toBe(true);
    const resolved = resolveTurn(planned);
    expect(
      sceneEffects(resolved).find((e) => e.kind === "refuge")?.planned,
    ).toBe(false);
    const following = nextTurn(resolved);
    expect(islandConditions(sceneEffects(following), 0).refuge).toBe(true);
    const expired = nextTurn(resolveTurn(following));
    expect(islandConditions(sceneEffects(expired), 0).refuge).toBe(false);
  });
  it("keeps global weather through its second turn and clears it on expiry", () => {
    let state = createGame(123);
    while (state.turn < 5) state = nextTurn(resolveTurn(state));
    for (let i = 0; i < 6; i++)
      expect(islandConditions(sceneEffects(state), i).dry).toBe(true);
    state = nextTurn(resolveTurn(state));
    expect(
      sceneEffects(state).some((effect) => effect.kind === "drought"),
    ).toBe(true);
    state = nextTurn(resolveTurn(state));
    expect(
      sceneEffects(state).some((effect) => effect.kind === "drought"),
    ).toBe(false);
  });
  it("does not spread a local weather event to other islands or show future crises", () => {
    const state = createGame(146);
    state.events[0] = { kind: "rain", region: 2 };
    const effects = sceneEffects(state);
    expect(islandConditions(effects, 2).rain).toBe(true);
    expect(islandConditions(effects, 0).rain).toBe(false);
    expect(
      effects.some(
        (effect) => effect.kind === "eruption" || effect.kind === "cold",
      ),
    ).toBe(false);
  });
  it("derives island changes from consecutive reports, including after a reload", () => {
    const first = resolveTurn(createGame(123));
    const second = resolveTurn(nextTurn(first));
    const changes = populationChanges(JSON.parse(JSON.stringify(second)));
    expect(changes.reduce((a, b) => a + b, 0)).toBe(
      second.history[1].after - second.history[1].before,
    );
    expect(changes).toEqual(
      second.history[1].populations.map(
        (n, i) => n - first.history[0].populations[i],
      ),
    );
    expect(populationChanges(nextTurn(second))).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
