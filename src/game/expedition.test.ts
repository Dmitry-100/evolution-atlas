import { describe, expect, it } from "vitest";
import {
  CARD_KINDS,
  CARDS,
  DEFAULT_SETTINGS,
  PROFILES,
  cardKind,
  profileIndex,
} from "./content";
import { CARD_NOTES } from "./cardNotes";
import {
  actionError,
  addAction,
  count,
  createExpedition,
  createGame,
  environment,
  keepCard,
  nextTurn,
  previewState,
  relocate,
  resolveTurn,
  swapCard,
  total,
} from "./engine";
import {
  comparisonRun,
  expeditionLink,
  foodBudget,
  missionStatus,
  scouting,
  sharedExpedition,
  visualProfiles,
} from "./expedition";
import { parseGame } from "./storage";
import type { GameState, RunRecord } from "./types";

function withCard(id: number, turn = 1) {
  let state = createExpedition(123);
  while (state.turn < turn) state = nextTurn(resolveTurn(state));
  state.hand = [
    id,
    ...[0, 2, 3, 5, 16]
      .filter((other) => cardKind(other) !== cardKind(id))
      .slice(0, 3),
  ];
  state.deck = Array.from({ length: 22 }, (_, i) => i).filter(
    (i) => !state.hand.includes(i),
  );
  state.discard = [];
  state.kept = [];
  return state;
}

describe("Galapagos expeditions", () => {
  it("preserves legacy rules and saves while explicitly creating new expeditions", () => {
    expect(createGame(123).version).toBe(1);
    expect(createExpedition(123).version).toBe(3);
    for (const create of [createGame, createExpedition]) {
      let state = create(123);
      while (state.phase === "planning") {
        state = resolveTurn(state);
        expect(parseGame(JSON.stringify(state))).toEqual(state);
        if (state.phase === "report") state = nextTurn(state);
      }
      expect(["won", "extinct"]).toContain(state.phase);
    }
  });
  it("replays sandbox settings, decisions and saved drafts deterministically", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      mode: "sandbox" as const,
      mutation: "high" as const,
      migration: "low" as const,
    };
    let a = createExpedition(91, "run", settings),
      b = createExpedition(91, "run", settings);
    for (let turn = 1; turn <= 18; turn++) {
      a = keepCard(swapCard(a, a.hand[0]), a.hand[1]);
      b = keepCard(swapCard(b, b.hand[0]), b.hand[1]);
      expect(parseGame(JSON.stringify(a))).toEqual(a);
      a = resolveTurn(a);
      b = resolveTurn(parseGame(JSON.stringify(b))!);
      expect(a).toEqual(b);
      expect(parseGame(JSON.stringify(a))).toEqual(a);
      if (a.phase !== "report") break;
      a = nextTurn(a);
      b = nextTurn(b);
    }
  });
  it("keeps at most two cards and refreshes the others without duplicate types", () => {
    const start = createExpedition(52);
    const pinned = keepCard(keepCard(start, 0), 3);
    expect(() => keepCard(pinned, 2)).toThrow("двух");
    const next = nextTurn(resolveTurn(pinned));
    expect(next.hand).toEqual(expect.arrayContaining([0, 3]));
    expect(next.hand).not.toContain(2);
    expect(next.hand).not.toContain(5);
    expect(next.kept).toEqual([]);
    expect(new Set(next.hand.map(cardKind)).size).toBe(4);
    expect(start.kept).toEqual([]);
    expect(addAction(pinned, { card: 3, region: 0 }).kept).toEqual([0]);
  });
  it("draws only unlocked cards, eventually exposes every type and conserves the deck", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      let s = createExpedition(seed);
      while (s.phase === "planning") {
        const piles = [...s.hand, ...s.deck, ...s.discard];
        expect(piles).toHaveLength(22);
        expect(new Set(piles).size).toBe(22);
        expect(new Set(s.hand.map(cardKind)).size).toBe(4);
        s.hand.forEach((id) => {
          seen.add(cardKind(id));
          expect(CARDS[cardKind(id)].unlock ?? 1).toBeLessThanOrEqual(s.turn);
        });
        s = resolveTurn(s);
        if (s.phase === "report") s = nextTurn(s);
      }
    }
    expect([...seen].sort()).toEqual([...CARD_KINDS].sort());
  });
  it("lets a raft cross a closed channel while regular migration requires an open route", () => {
    const state = withCard(17);
    expect(
      actionError(state, {
        card: 17,
        region: 0,
        destination: 3,
        fraction: 0.25,
      }),
    ).toBeNull();
    expect(
      actionError(state, {
        card: 2,
        region: 0,
        destination: 3,
        fraction: 0.25,
      }),
    ).toContain("пути");
    const result = resolveTurn(
      addAction(state, { card: 17, region: 0, destination: 3, fraction: 0.25 }),
    );
    expect(result.history[0].actions?.[0].card).toBe(17);
    expect(result.lineages?.some((o) => o.island === 3 && o.parent === 0)).toBe(
      true,
    );
    expect(parseGame(JSON.stringify(result))).toEqual(result);
  });
  it("accounts for raft losses without inventing survivors or changing their traits", () => {
    const s = withCard(17),
      report = resolveTurn(s).history[0];
    report.migrations = report.transitLosses = 0;
    relocate(s, 0, 3, 0.25, () => 0.99, report, 0.4);
    expect(total(s) + report.transitLosses).toBe(80);
    expect(report.transitLosses).toBe(20);
    expect(count(s.regions[3])).toBe(0);
  });
  it("requires two inhabited colonies for exchange", () => {
    const s = withCard(21, 7);
    s.regions[1].counts.fill(0);
    expect(
      actionError(s, { card: 21, region: 0, destination: 1, fraction: 0.25 }),
    ).toContain("две живые");
    s.regions[1].counts[0] = 20;
    expect(
      actionError(s, { card: 21, region: 0, destination: 1, fraction: 0.25 }),
    ).toBeNull();
  });
  it("stores cost food now and release it during the next two turns, after weather", () => {
    const state = withCard(18, 4),
      base = environment(state, 0);
    const preview = previewState(addAction(state, { card: 18, region: 0 }));
    expect(environment(preview, 0).foodA).toBeCloseTo(base.foodA * 0.75);
    const later: GameState = {
      ...preview,
      turn: 5,
      effects: [...preview.effects, { kind: "drought", region: -1, until: 6 }],
    };
    expect(environment(later, 0).foodA).toBeCloseTo(base.foodA * 0.38 + 25);
    expect(environment({ ...later, turn: 7 }, 0).foodA).toBe(base.foodA);
  });
  it("seed gardens and territory have real tradeoffs and scouting reveals exactly two future turns", () => {
    const seeds = withCard(16),
      base = environment(seeds, 0);
    const garden = environment(
      previewState(addAction(seeds, { card: 16, region: 0 })),
      0,
    );
    expect(garden.foodB).toBe(base.foodB + 65);
    expect(garden.foodA).toBe(base.foodA - 20);
    const territory = withCard(19, 4),
      env = environment(territory, 1);
    const expanded = environment(
      previewState(addAction(territory, { card: 19, region: 1 })),
      1,
    );
    expect(expanded.capacity).toBe(Math.min(200, env.capacity + 40));
    expect(expanded.predators).toBeCloseTo(env.predators * 1.25);
    const scout = withCard(20);
    expect(scouting(scout)).toEqual([]);
    expect(
      scouting(previewState(addAction(scout, { card: 20, region: 0 }))).map(
        (e) => e.turn,
      ),
    ).toEqual([2, 3]);
  });
  it("rejects corrupt v2 settings, pins and trait records", () => {
    const state = resolveTurn(createExpedition(56));
    const change = (edit: (s: GameState) => void) => {
      const s = structuredClone(state);
      edit(s);
      return parseGame(JSON.stringify(s));
    };
    expect(
      change((s) => {
        s.kept = [0, 2, 3];
      }),
    ).toBeNull();
    expect(
      change((s) => {
        s.settings!.mutation = "high";
      }),
    ).toBeNull();
    expect(
      change((s) => {
        s.history[0].regionalTraits![0][0][0]++;
      }),
    ).toBeNull();
  });
  it("uses actual inherited profiles for render representatives and handles empty islands", () => {
    const counts = Array<number>(81).fill(0),
      p = profileIndex([2, 2, 1, 0]);
    counts[p] = 60;
    expect(visualProfiles(counts)).toEqual(Array(7).fill(PROFILES[p]));
    expect(visualProfiles(Array(81).fill(0))).toEqual([]);
    const state = createExpedition(77),
      before = structuredClone(state);
    visualProfiles(state.regions[0].counts);
    expect(state).toEqual(before);
  });
  it("compares both food resources and mission goals independently", () => {
    const s = createExpedition(1);
    s.regions[0].counts.fill(0);
    s.regions[0].counts[profileIndex([1, 0, 2, 0])] = 60;
    expect(foodBudget(s, 0)[0].need).toBe(0);
    expect(foodBudget(s, 0)[1].shortage).toBe(true);
    s.phase = "won";
    s.settings = { ...DEFAULT_SETTINGS, mission: "colonies" };
    expect(missionStatus(s).achieved).toBe(false);
    s.regions[1].counts[0] = 1;
    s.regions[2].counts[0] = 1;
    expect(missionStatus(s).achieved).toBe(true);
    s.settings.mission = "diversity";
    expect(missionStatus(s).achieved).toBe(false);
  });
  it("shares only the world and settings, validates codes, and excludes mismatched attempts", () => {
    const s = createExpedition(0xabc, "new", {
      ...DEFAULT_SETTINGS,
      mode: "sandbox",
      mutation: "low",
      migration: "high",
    });
    const link = expeditionLink(s, "https://atlas.aidms.ru");
    expect(sharedExpedition(new URL(link).search)).toEqual({
      seed: s.seed,
      settings: s.settings,
      version: 3,
    });
    expect(link).not.toContain(s.runId);
    expect(sharedExpedition("?expedition=not-a-code")).toBeNull();
    const previous: RunRecord = {
      version: 3,
      settings: {
        migration: "high",
        mutation: "low",
        mode: "sandbox",
        mission: "survive",
      },
      points: [80, 20],
      runId: "old",
      seed: s.seed,
      outcome: "extinct",
      turns: 1,
      population: 20,
      crises: 0,
    };
    expect(comparisonRun(s, [previous])).toBe(previous);
    expect(comparisonRun(s, [{ ...previous, version: 1 }])).toBeUndefined();
  });
  it("gives every card a concise, sourced naturalist story", () => {
    expect(Object.keys(CARD_NOTES).sort()).toEqual([...CARD_KINDS].sort());
    Object.values(CARD_NOTES).forEach((n) => {
      expect(n.text.length).toBeGreaterThan(70);
      expect(n.text.length).toBeLessThan(240);
      expect(n.source).toMatch(/^https:\/\//);
    });
  });
});
