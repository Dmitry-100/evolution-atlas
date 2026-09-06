import { describe, expect, it } from "vitest";
import {
  CARDS,
  GENERATIONS,
  PROFILES,
  REGIONS,
  cardKind,
  profileIndex,
} from "./content";
import {
  actionError,
  addAction,
  connected,
  count,
  createGame,
  environment,
  generation,
  nextTurn,
  randomStep,
  relocate,
  resolveTurn,
  swapCard,
  total,
} from "./engine";
import { loadGame, parseGame, saveGame } from "./storage";

describe("island evolution", () => {
  it("conserves individuals during relocation and accounts for transit deaths", () => {
    for (const survives of [true, false]) {
      const state = createGame(73);
      const report = {
        ...resolveTurn(state).history[0],
        migrations: 0,
        transitLosses: 0,
      };
      relocate(state, 0, 1, 0.25, () => (survives ? 0 : 0.999999), report);
      expect(count(state.regions[0])).toBe(60);
      expect(count(state.regions[1])).toBe(survives ? 20 : 0);
      expect(total(state) + report.transitLosses).toBe(80);
      expect(report.migrations + report.transitLosses).toBe(20);
    }
  });
  it("does not allow a second migration to spend individuals already leaving", () => {
    const state = createGame(9);
    state.regions[0].counts.fill(0);
    state.regions[0].counts[0] = 4;
    state.hand = [2, 10, 3, 5];
    const queued = addAction(state, {
      card: 2,
      region: 0,
      destination: 1,
      fraction: 0.25,
    });
    expect(
      actionError(queued, {
        card: 10,
        region: 0,
        destination: 1,
        fraction: 0.25,
      }),
    ).toContain("слишком мала");
  });
  it("has stronger relative drift in small neutral populations without directional bias", () => {
    const results: number[][] = [[], []];
    [20, 200].forEach((size, group) => {
      for (let run = 1; run <= 300; run++) {
        let seed = run;
        const random = () => {
          const [v, next] = randomStep(seed);
          seed = next;
          return v;
        };
        const counts = Array<number>(81).fill(0),
          a = profileIndex([1, 1, 0, 0]),
          b = profileIndex([1, 1, 2, 0]);
        counts[a] = counts[b] = size / 2;
        const env = {
          ...environment(createGame(1), 0),
          foodA: size,
          foodB: size,
          capacity: size,
          temperature: 0,
          predators: 0,
        };
        const offspring = generation(counts, env, random, 0).counts;
        results[group].push(offspring[a] / (offspring[a] + offspring[b]));
      }
    });
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const variance = (xs: number[]) => mean(xs.map((x) => (x - 0.5) ** 2));
    expect(Math.abs(mean(results[0]) - 0.5)).toBeLessThan(0.06);
    expect(Math.abs(mean(results[1]) - 0.5)).toBeLessThan(0.06);
    expect(variance(results[0])).toBeGreaterThan(variance(results[1]) * 3);
  });
  it("replays a whole campaign exactly, including saved reports and card swaps", () => {
    let a = createGame(146),
      b = createGame(146);
    for (let i = 0; i < 18; i++) {
      a = swapCard(a, a.hand[0]);
      b = swapCard(b, b.hand[0]);
      a = resolveTurn(a);
      b = resolveTurn(b);
      expect(a).toEqual(b);
      expect(parseGame(JSON.stringify(a))).toEqual(a);
      if (a.phase !== "report") break;
      a = nextTurn(a);
      b = nextTurn(parseGame(JSON.stringify(b))!);
    }
    expect(["won", "extinct"]).toContain(a.phase);
  });
  it("keeps all counts bounded, preserves cards and finishes within 18 turns", () => {
    for (let seed = 0; seed < 12; seed++) {
      let s = createGame(seed);
      for (let turn = 1; turn <= 18; turn++) {
        s = resolveTurn(s);
        expect(s.history.at(-1)!.before).toBe(
          turn === 1 ? 80 : s.history.at(-2)!.after,
        );
        for (const region of s.regions) {
          expect(
            region.counts.every((n) => Number.isInteger(n) && n >= 0),
          ).toBe(true);
          expect(count(region)).toBeLessThanOrEqual(200);
        }
        const cards = [...s.hand, ...s.deck, ...s.discard];
        expect(new Set(cards).size).toBe(16);
        expect(cards).toHaveLength(16);
        expect(parseGame(JSON.stringify(s))).not.toBeNull();
        if (s.phase !== "report") break;
        s = nextTurn(s);
      }
      expect(["won", "extinct"]).toContain(s.phase);
    }
  });
  it("does not mutate the input, cannot run a report again, and cannot resurrect an extinct lineage", () => {
    const s = createGame(23),
      original = structuredClone(s);
    const report = resolveTurn(s);
    expect(s).toEqual(original);
    expect(() => resolveTurn(report)).toThrow();
    s.regions.forEach((r) => r.counts.fill(0));
    const dead = resolveTurn(s);
    expect(dead.phase).toBe("extinct");
    expect(total(dead)).toBe(0);
    expect(() => nextTurn(dead)).toThrow();
  });
  it("validates costs, duplicate cards and physically possible migration", () => {
    const s = createGame(1);
    expect(
      actionError(s, { card: 2, region: 0, destination: 5, fraction: 0.25 }),
    ).toBeTruthy();
    expect(
      actionError(s, { card: 2, region: 4, destination: 5, fraction: 0.25 }),
    ).toBeTruthy();
    const queued = addAction(s, { card: 3, region: 0 });
    expect(actionError(queued, { card: 5, region: 0 })).toContain("очков");
    expect(actionError(queued, { card: 3, region: 0 })).toBeTruthy();
    expect(() =>
      resolveTurn({ ...s, draft: [{ card: 123, region: 0 }] }),
    ).toThrow();
  });
  it("moves real individuals, does not duplicate the source, and can found a colony", () => {
    const s = createGame(28);
    // Isolate the model after the explicit movement to inspect its conservation law.
    const action = {
      card: 2,
      region: 0,
      destination: 1,
      fraction: 0.25 as const,
    };
    const a = resolveTurn(addAction(s, action));
    const b = resolveTurn(s);
    expect(
      a.history[0].migrations + a.history[0].transitLosses,
    ).toBeGreaterThanOrEqual(20);
    expect(count(a.regions[1])).toBeGreaterThan(0);
    expect(a).not.toEqual(b);
    expect(s.regions[3].counts.every((n) => n === 0)).toBe(true);
  });
  it("keeps card randomness independent of biological randomness", () => {
    const s = createGame(991);
    const swapped = swapCard(s, s.hand[0]);
    expect(swapped.random.biology).toBe(s.random.biology);
    expect(resolveTurn(swapped).regions).toEqual(resolveTurn(s).regions);
    expect(() => swapCard(swapped, swapped.hand[0])).toThrow();
  });
  it("expires bridge and shelter effects after their stated duration", () => {
    let s = createGame(12);
    s = resolveTurn(addAction(s, { card: 0, region: 1, destination: 4 }));
    expect(connected(s, 1, 4)).toBe(true);
    s = nextTurn(s);
    expect(connected(s, 1, 4)).toBe(true);
    s = nextTurn(resolveTurn(s));
    expect(connected(s, 1, 4)).toBe(false);
  });
  it("uses mutually exclusive crisis events and announces them before they happen", () => {
    const s = createGame(123);
    expect(
      s.events
        .filter((e) => ["drought", "cold", "eruption"].includes(e.kind))
        .map((e) => e.kind),
    ).toEqual(["drought", "cold", "eruption"]);
    expect(s.events[4].kind).toBe("drought");
    expect(s.events[10].kind).toBe("cold");
    expect(s.events[16].kind).toBe("eruption");
  });
  it("keeps mutation independent of an environmental need and creates no profiles when it is off", () => {
    let seed = 18;
    const random = () => {
      const [v, s] = randomStep(seed);
      seed = s;
      return v;
    };
    const counts = Array<number>(81).fill(0),
      p = profileIndex([0, 0, 0, 0]);
    counts[p] = 80;
    const env = { ...environment(createGame(1), 0), capacity: 200 };
    const result = generation(counts, env, random, 0);
    expect(result.counts.filter((n, i) => i !== p && n > 0)).toEqual([]);
    expect(result.mutations).toBe(0);
    const mutating = generation(counts, env, random, 1);
    expect(mutating.mutations).toBeGreaterThan(0);
    mutating.counts.forEach((n, i) => {
      if (n)
        expect(PROFILES[i].reduce((sum, v) => sum + v, 0)).toBeLessThanOrEqual(
          1,
        );
    });
  });
  it("favors different insulation in cold and warm environments over many samples", () => {
    const coldProfile = profileIndex([1, 2, 1, 1]),
      warmProfile = profileIndex([1, 0, 1, 1]);
    const sums = { coldInCold: 0, warmInCold: 0, coldInWarm: 0, warmInWarm: 0 };
    for (let seed = 1; seed <= 50; seed++) {
      let rng = seed;
      const random = () => {
        const [v, s] = randomStep(rng);
        rng = s;
        return v;
      };
      const counts = Array<number>(81).fill(0);
      counts[coldProfile] = counts[warmProfile] = 40;
      const env = {
        ...environment(createGame(1), 0),
        foodA: 120,
        foodB: 120,
        capacity: 200,
      };
      const cold = generation(counts, { ...env, temperature: -1 }, random, 0);
      const warm = generation(counts, { ...env, temperature: 1 }, random, 0);
      sums.coldInCold += cold.counts[coldProfile];
      sums.warmInCold += cold.counts[warmProfile];
      sums.coldInWarm += warm.counts[coldProfile];
      sums.warmInWarm += warm.counts[warmProfile];
    }
    expect(sums.coldInCold).toBeGreaterThan(sums.warmInCold * 2);
    expect(sums.warmInWarm).toBeGreaterThan(sums.coldInWarm * 2);
  });
  it("has no universally free upgrade or unreachable card content", () => {
    expect(GENERATIONS).toBe(20);
    expect(Object.keys(CARDS)).toHaveLength(14);
    for (let id = 0; id < 22; id++)
      expect(CARDS[cardKind(id)].tradeoff.length).toBeGreaterThan(20);
    expect(REGIONS).toHaveLength(6);
  });
});

describe("browser saves", () => {
  it("preserves an unfinished plan and refuses malformed or incompatible data", () => {
    const state = addAction(createGame(64), { card: 5, region: 0 });
    expect(parseGame(JSON.stringify(state))).toEqual(state);
    expect(parseGame("{")).toBeNull();
    expect(parseGame(JSON.stringify({ ...state, version: 2 }))).toBeNull();
    expect(parseGame(JSON.stringify({ ...state, regions: [] }))).toBeNull();
    expect(
      parseGame(JSON.stringify({ ...state, hand: [5, 5, 5, 5] })),
    ).toBeNull();
    expect(parseGame(" ".repeat(250001))).toBeNull();
    const bad = structuredClone(state);
    bad.regions[0].counts[0] = -2;
    expect(parseGame(JSON.stringify(bad))).toBeNull();
  });
  it("gracefully handles denied storage and leaves invalid data untouched", () => {
    let writes = 0;
    const broken = {
      getItem() {
        throw new Error("disabled");
      },
      setItem() {
        throw new Error("quota");
      },
    };
    expect(loadGame(broken).issue).toBe("unavailable");
    expect(saveGame(createGame(1), broken)).toBe(false);
    expect(
      loadGame({
        getItem: () => "{bad",
        setItem() {
          writes++;
        },
      }).issue,
    ).toBe("invalid");
    expect(writes).toBe(0);
  });
});
