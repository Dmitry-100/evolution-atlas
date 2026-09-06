import { describe, expect, it } from "vitest";
import { CARDS, EDGES, PROFILES, cardDefinition } from "./content";
import {
  connected,
  createExpedition,
  createGame,
  environment,
  nextTurn,
  previewState,
  resolveTurn,
  spent,
  total,
} from "./engine";
import {
  branchDifference,
  comparisonProfiles,
  discoveryHistory,
  evolutionMoment,
  isolatedTurns,
  largestTraitChange,
} from "./observations";
import { expeditionLink, sharedExpedition } from "./expedition";
import { parseGame } from "./storage";
import { islandConditions, sceneEffects } from "../components/game/sceneState";

describe("expedition observations and new events", () => {
  it("keeps old event schedules and shares the exact rule version", () => {
    for (const version of [1, 2, 3] as const) {
      const s = createGame(123, "compat", undefined, version);
      expect(parseGame(JSON.stringify(s))).toEqual(s);
      const next = resolveTurn(s);
      expect(parseGame(JSON.stringify(next))).toEqual(next);
      if (version < 3)
        expect(
          s.events.some((e) => e.kind === "passage" || e.kind === "reprieve"),
        ).toBe(false);
      if (version >= 2)
        expect(
          sharedExpedition(
            new URL(expeditionLink(s, "https://example.org")).search,
          )?.version,
        ).toBe(version);
    }
    expect(sharedExpedition("?expedition=7b")?.version).toBe(2);
  });
  it("opens only the event route for one turn, and allows a card to close it", () => {
    const s = createExpedition(1);
    s.turn = 4;
    s.events[3] = { kind: "passage", region: 0, destination: 3 };
    expect(EDGES.find((e) => e.a === 0 && e.b === 3)?.open).toBe(false);
    expect(connected(s, 0, 3)).toBe(true);
    expect(connected(s, 1, 4)).toBe(false);
    const response = previewState({
      ...s,
      draft: [{ card: 1, region: 0, destination: 3 }],
    });
    expect(connected(response, 0, 3)).toBe(false);
    const next = nextTurn(resolveTurn(s));
    expect(connected(next, 0, 3)).toBe(false);
    expect(
      sceneEffects(s).some((e) => e.kind === "passage" && e.destination === 3),
    ).toBe(true);
  });
  it("removes predation for two turns without inventing food or extra space", () => {
    const s = createExpedition(7);
    s.turn = 4;
    s.events[3] = { kind: "reprieve", region: 0 };
    const plain = {
      ...s,
      events: s.events.map((e, i) =>
        i === 3 ? { kind: "calm" as const, region: 0 } : e,
      ),
    };
    const a = environment(s, 0),
      b = environment(plain, 0);
    expect(a.predators).toBe(0);
    expect(a.foodA).toBe(b.foodA);
    expect(a.capacity).toBe(b.capacity);
    const report = resolveTurn(s);
    const next = nextTurn(report);
    expect(environment(next, 0).predators).toBe(0);
    const later = nextTurn(resolveTurn(next));
    expect(environment(later, 0).predators).toBeGreaterThan(0);
    expect(islandConditions(sceneEffects(s), 0).reprieve).toBe(true);
  });
  it("requires three consecutive closed-route reports before recording isolation", () => {
    let s = createExpedition(12);
    s.regions[3].counts = s.regions[0].counts;
    s.regions[0].counts = Array(81).fill(0);
    s.effects = [
      { kind: "divide", region: 3, destination: 0, until: 3 },
      { kind: "divide", region: 3, destination: 4, until: 3 },
    ];
    for (let i = 1; i <= 3; i++) {
      s = resolveTurn(s);
      expect(s.history.at(-1)?.isolated?.[3]).toBe(true);
      expect(isolatedTurns(s, 3)).toBe(i);
      expect(discoveryHistory(s).some((d) => d.id === "isolation-3")).toBe(
        i === 3,
      );
      if (i < 3) s = nextTurn(s);
    }
    const restored = parseGame(JSON.stringify(s));
    expect(restored).toEqual(s);
    expect(discoveryHistory(restored!)).toEqual(discoveryHistory(s));
    s.history.at(-1)!.isolated![3] = false;
    expect(isolatedTurns(s, 3)).toBe(0);
  });
  it("records actual arrivals and rejects corrupted observation metadata", () => {
    let s = createExpedition(123);
    while (s.phase === "planning") {
      s = resolveTurn(s);
      const r = s.history.at(-1)!;
      expect(r.regionalArrivals!.reduce((a, b) => a + b, 0)).toBe(r.migrations);
      expect(parseGame(JSON.stringify(s))).toEqual(s);
      const corrupt = structuredClone(s);
      corrupt.history.at(-1)!.regionalArrivals![0]++;
      expect(parseGame(JSON.stringify(corrupt))).toBeNull();
      const falsePortrait = structuredClone(s);
      const counts = falsePortrait.history
        .at(-1)!
        .regionalCounts!.find((c) => c.some((n) => n > 0))!;
      const occupied = counts.findIndex((n) => n > 0);
      counts[occupied]--;
      counts[(occupied + 1) % 81]++;
      expect(parseGame(JSON.stringify(falsePortrait))).toBeNull();
      if (s.phase === "report") s = nextTurn(s);
    }
  });
  it("shows occupied profiles across the changed trait rather than an invented average animal", () => {
    const counts = Array(81).fill(0) as number[];
    const profiles = [
      [2, 0, 0, 1],
      [0, 1, 2, 0],
      [1, 2, 1, 2],
    ];
    profiles.forEach((profile, i) => {
      counts[PROFILES.findIndex((p) => p.every((v, t) => v === profile[t]))] =
        10 * (i + 1);
    });
    expect(comparisonProfiles(counts, 1)).toEqual(profiles);
    expect(comparisonProfiles(Array(81).fill(0), 1)).toEqual([]);
    const only = Array(81).fill(0);
    only[7] = 1;
    expect(comparisonProfiles(only, 1)).toEqual([PROFILES[7]]);
  });
  it("keeps the previous raft price and stored food in legacy expeditions", () => {
    for (const version of [2, 3] as const) {
      const s = createGame(123, "balance", undefined, version);
      s.draft = [{ card: 17, region: 0, destination: 3, fraction: 0.25 }];
      expect(spent(s)).toBe(version === 2 ? 1 : 2);
      expect(cardDefinition(version, "raft").cost).toBe(spent(s));
      s.draft = [];
      s.events = s.events.map(() => ({ kind: "calm", region: 0 }));
      s.turn = 3;
      const base = environment(s, 0);
      s.effects = [{ kind: "stores", region: 0, until: 4, starts: 2 }];
      expect(environment(s, 0).foodA - base.foodA).toBe(
        version === 2 ? 40 : 25,
      );
    }
  });
  it("keeps the first discovery instead of replacing it every turn", () => {
    let s = resolveTurn(createExpedition(123));
    const first = discoveryHistory(s);
    expect(first.length).toBeGreaterThan(0);
    for (let i = 0; i < 3 && s.phase === "report"; i++)
      s = resolveTurn(nextTurn(s));
    const all = discoveryHistory(s);
    for (const note of first)
      expect(all.find((d) => d.id === note.id)).toEqual(note);
    expect(new Set(all.map((d) => d.id)).size).toBe(all.length);
  });
  it("highlights a real trait shift without treating a new or empty colony as a transformation", () => {
    const s = resolveTurn(createExpedition(123));
    const moment = evolutionMoment(s);
    expect(moment).not.toBeNull();
    expect(
      Math.abs(moment!.change.after - moment!.change.before),
    ).toBeGreaterThanOrEqual(0.2);
    expect(moment!.island).toBe(0);
    const empty = structuredClone(s);
    empty.regions.forEach((r) => r.counts.fill(0));
    expect(evolutionMoment(empty)).toBeNull();
    expect(total(s)).toBeGreaterThan(0);
    const same = [
      [1, 2, 3],
      [2, 3, 1],
      [3, 2, 1],
      [2, 1, 3],
    ];
    const c = largestTraitChange(same, same);
    expect(c.after - c.before).toBe(0);
  });
  it("compares parent and child at the same living report, even after one colony disappears", () => {
    let s = resolveTurn(createExpedition(123));
    while (!s.lineages?.some((o) => o.parent !== null) && s.phase === "report")
      s = resolveTurn(nextTurn(s));
    const branch = s.lineages!.find((o) => o.parent !== null)!;
    expect(branch).toBeDefined();
    const diff = branchDifference(s, branch.island, branch.parent);
    expect(diff).not.toBeNull();
    expect(diff!.after).toEqual(
      s.history[diff!.turn - 1].regionalTraits![branch.island],
    );
    expect(diff!.before).toEqual(
      s.history[diff!.turn - 1].regionalTraits![branch.parent!],
    );
  });
  it("draws new event kinds and keeps all valid card costs within the turn budget", () => {
    const events = new Set(
      Array.from({ length: 40 }, (_, seed) => createExpedition(seed).events)
        .flat()
        .map((e) => e.kind),
    );
    expect(events.has("reprieve")).toBe(true);
    expect(events.has("passage")).toBe(true);
    expect(
      Object.values(CARDS).every((c) => c.cost === 1 || c.cost === 2),
    ).toBe(true);
  });
});
