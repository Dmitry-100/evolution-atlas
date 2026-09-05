import { CARDS, EDGES, EVENTS, REGIONS, TURNS } from "./content";
import { addAction, count, createGame, total } from "./engine";
import type { GameAction, GameState, RunRecord } from "./types";

export const SAVE_KEY = "evolution-atlas.islands.v1";
export const RECORDS_KEY = "evolution-atlas.islands.records.v1";
const MAX_BYTES = 250_000;
type StorageLike = Pick<Storage, "getItem" | "setItem">;
type ObjectValue = Record<string, unknown>;
const object = (v: unknown): v is ObjectValue =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number): v is number =>
  Number.isInteger(v) && Number(v) >= min && Number(v) <= max;
const vector = (v: unknown, size: number, max: number): v is number[] =>
  Array.isArray(v) && v.length === size && v.every((n) => integer(n, 0, max));
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.length <= max;

export function parseGame(raw: string): GameState | null {
  if (raw.length > MAX_BYTES) return null;
  try {
    const s: unknown = JSON.parse(raw);
    if (
      !object(s) ||
      s.version !== 1 ||
      !integer(s.seed, 0, 0xffffffff) ||
      !text(s.runId, 80) ||
      !s.runId ||
      !integer(s.turn, 1, TURNS)
    )
      return null;
    if (!["planning", "report", "won", "extinct"].includes(String(s.phase)))
      return null;
    const turn = s.turn;
    if (
      !object(s.random) ||
      !integer(s.random.biology, 0, 0xffffffff) ||
      !integer(s.random.cards, 0, 0xffffffff)
    )
      return null;
    if (
      !Array.isArray(s.regions) ||
      s.regions.length !== REGIONS.length ||
      !s.regions.every(
        (r) =>
          object(r) &&
          vector(r.counts, 81, 200) &&
          (r.counts as number[]).reduce((a, b) => a + b, 0) <= 200,
      )
    )
      return null;
    const expectedEvents = createGame(s.seed).events;
    if (
      !Array.isArray(s.events) ||
      s.events.length !== TURNS ||
      !s.events.every(
        (e, i) =>
          object(e) &&
          e.kind === expectedEvents[i].kind &&
          e.region === expectedEvents[i].region,
      )
    )
      return null;
    if (
      !Array.isArray(s.effects) ||
      s.effects.length > 50 ||
      !s.effects.every((e) => {
        if (
          !object(e) ||
          !text(e.kind, 20) ||
          !(Object.hasOwn(CARDS, e.kind) || Object.hasOwn(EVENTS, e.kind)) ||
          !integer(e.region, -1, 5) ||
          !integer(e.until, turn, TURNS + 2)
        )
          return false;
        if (e.kind === "bridge" || e.kind === "divide")
          return EDGES.some(
            (edge) =>
              (edge.a === e.region && edge.b === e.destination) ||
              (edge.b === e.region && edge.a === e.destination),
          );
        return e.destination === undefined;
      })
    )
      return null;
    const piles = [s.hand, s.deck, s.discard];
    if (
      !piles.every(
        (p) =>
          Array.isArray(p) &&
          p.length <= 16 &&
          p.every((n) => integer(n, 0, 15)),
      )
    )
      return null;
    const all = piles.flat() as number[];
    if (
      all.length !== 16 ||
      new Set(all).size !== 16 ||
      (s.hand as number[]).length > 4
    )
      return null;
    if (
      typeof s.swapped !== "boolean" ||
      !Array.isArray(s.draft) ||
      s.draft.length > 2 ||
      !s.draft.every(
        (a) =>
          object(a) &&
          integer(a.card, 0, 15) &&
          integer(a.region, 0, 5) &&
          (a.destination === undefined || integer(a.destination, 0, 5)) &&
          (a.fraction === undefined ||
            a.fraction === 0.1 ||
            a.fraction === 0.25),
      )
    )
      return null;
    if (
      !Array.isArray(s.history) ||
      s.history.length !== (s.phase === "planning" ? s.turn - 1 : s.turn)
    )
      return null;
    if (
      !s.history.every(
        (r, i) =>
          object(r) &&
          r.turn === i + 1 &&
          integer(r.before, 0, 1200) &&
          integer(r.after, 0, 1200) &&
          vector(r.populations, 6, 200) &&
          r.populations.reduce((a, b) => a + b, 0) === r.after &&
          Array.isArray(r.traits) &&
          r.traits.length === 4 &&
          r.traits.every(
            (t) =>
              vector(t, 3, 1200) && t.reduce((a, b) => a + b, 0) === r.after,
          ) &&
          Array.isArray(r.notes) &&
          r.notes.length <= 12 &&
          r.notes.every((n) => text(n, 600)) &&
          integer(r.migrations, 0, 100000) &&
          integer(r.transitLosses, 0, 100000) &&
          integer(r.mutations, 0, 100000) &&
          object(r.event) &&
          r.event.kind === expectedEvents[i].kind &&
          r.event.region === expectedEvents[i].region,
      )
    )
      return null;
    const state = s as unknown as GameState;
    const population = total(state);
    if (
      (state.phase === "extinct") !== (population === 0) ||
      (state.phase === "won" && state.turn !== TURNS) ||
      (state.phase === "report" && state.turn === TURNS)
    )
      return null;
    if (state.phase !== "planning" && state.draft.length) return null;
    if (state.history.length && state.history.at(-1)!.after !== population)
      return null;
    if (
      state.history.some(
        (r, i) => r.before !== (i === 0 ? 80 : state.history[i - 1].after),
      )
    )
      return null;
    let checked: GameState = { ...state, draft: [] };
    for (const action of state.draft as GameAction[])
      checked = addAction(checked, action);
    return state;
  } catch {
    return null;
  }
}

export type LoadResult = {
  state: GameState | null;
  issue: "unavailable" | "invalid" | null;
};
export function loadGame(storage?: StorageLike): LoadResult {
  try {
    const raw = (storage ?? window.localStorage).getItem(SAVE_KEY);
    if (!raw) return { state: null, issue: null };
    const state = parseGame(raw);
    return { state, issue: state ? null : "invalid" };
  } catch {
    return { state: null, issue: "unavailable" };
  }
}
export function saveGame(state: GameState, storage?: StorageLike): boolean {
  try {
    const raw = JSON.stringify(state);
    if (raw.length > MAX_BYTES) return false;
    (storage ?? window.localStorage).setItem(SAVE_KEY, raw);
    return true;
  } catch {
    return false;
  }
}
export function readRecords(storage?: StorageLike): RunRecord[] {
  try {
    const raw = (storage ?? window.localStorage).getItem(RECORDS_KEY);
    if (!raw || raw.length > 6000) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 5) return [];
    return value.filter(
      (r): r is RunRecord =>
        object(r) &&
        text(r.runId, 80) &&
        integer(r.seed, 0, 0xffffffff) &&
        ["won", "extinct"].includes(String(r.outcome)) &&
        integer(r.turns, 1, 18) &&
        integer(r.population, 0, 1200) &&
        integer(r.crises, 0, 3),
    );
  } catch {
    return [];
  }
}
export function saveRecord(state: GameState): RunRecord[] {
  const existing = readRecords();
  if (state.phase !== "won" && state.phase !== "extinct") return existing;
  const record: RunRecord = {
    runId: state.runId,
    seed: state.seed,
    outcome: state.phase,
    turns: state.turn,
    population: total(state),
    crises: state.history.filter(
      (r) => [6, 12, 18].includes(r.turn) && r.after > 0,
    ).length,
  };
  const records = [
    record,
    ...existing.filter((r) => r.runId !== state.runId),
  ].slice(0, 5);
  try {
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    /* The completed game remains usable in memory. */
  }
  return records;
}
export function occupied(state: GameState) {
  return state.regions.filter((r) => count(r) > 0).length;
}
