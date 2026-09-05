import { describe, expect, it } from "vitest";
import { createGame, nextTurn, resolveTurn } from "./engine";
import { expeditionSummary } from "./finale";
import { parseGame } from "./storage";

function finish(seed: number) {
  let state = createGame(seed);
  while (state.phase === "planning" || state.phase === "report") {
    if (state.phase === "report") state = nextTurn(state);
    state = resolveTurn(state);
  }
  return state;
}

describe("expedition finale", () => {
  it("reconstructs a complete winning expedition without changing its state", () => {
    const state = finish(123);
    const saved = JSON.stringify(state);
    const result = expeditionSummary(state);
    expect(result.population).toBe(63);
    expect(result.peak.population).toBe(504);
    expect(result.points).toHaveLength(19);
    expect(result.points[0].population).toBe(80);
    expect(result.crises.map((crisis) => crisis.status)).toEqual([
      "survived",
      "survived",
      "survived",
    ]);
    expect(result.survivedCrises).toBe(3);
    expect(
      result.islands.reduce((sum, island) => sum + island.population, 0),
    ).toBe(63);
    expect(expeditionSummary(parseGame(saved)!)).toEqual(result);
    expect(JSON.stringify(state)).toBe(saved);
  });
  it("does not count a crisis as survived until its second turn ends", () => {
    let state = createGame(123);
    while (state.turn < 5) state = nextTurn(resolveTurn(state));
    const first = resolveTurn(state);
    const partial = expeditionSummary(first);
    expect(partial.crises[0].status).toBe("ongoing");
    expect(partial.survivedCrises).toBe(0);
    const second = resolveTurn(nextTurn(first));
    const complete = expeditionSummary(second);
    expect(complete.survivedCrises).toBe(1);
    expect(complete.crises[0].before).toBe(first.history[4].before);
    expect(complete.crises[0].after).toBe(second.history[5].after);
  });
  it("separates a fatal winter from a future crisis and uses the last living trait snapshot", () => {
    const state = finish(1);
    const summary = expeditionSummary(state);
    expect(state.turn).toBe(11);
    expect(summary.population).toBe(0);
    expect(summary.colonies).toBe(0);
    expect(summary.crises.map((crisis) => crisis.status)).toEqual([
      "survived",
      "lost",
      "unreached",
    ]);
    expect(summary.crises[2].before).toBeNull();
    expect(summary.compositionTurn).toBe(10);
    expect(Number.isFinite(summary.traitChange.after)).toBe(true);
    expect(summary.observation).toContain("до нуля");
    expect(summary.points.at(-1)?.population).toBe(0);
  });
  it("keeps the initial population in peaks even when a line dies immediately", () => {
    const state = resolveTurn(createGame(123));
    state.phase = "extinct";
    state.regions.forEach((region) => region.counts.fill(0));
    Object.assign(state.history[0], {
      after: 0,
      populations: [0, 0, 0, 0, 0, 0],
      traits: Array.from({ length: 4 }, () => [0, 0, 0]),
    });
    const summary = expeditionSummary(state);
    expect(summary.peak.population).toBe(80);
    expect(summary.compositionTurn).toBe(0);
    expect(summary.traitChange.before).toBe(summary.traitChange.after);
    expect(summary.survivedCrises).toBe(0);
    expect(summary.islands[0].peak).toBe(80);
  });
});
