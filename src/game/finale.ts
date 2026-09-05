import { CRISIS_TURNS, EVENTS, REGIONS, TRAITS } from "./content";
import { count, createGame, total, traitCounts } from "./engine";
import type { GameState } from "./types";

/** Read-only expedition statistics; historical totals are not attributed to one cause. */
export function expeditionSummary(state: GameState) {
  const initial = createGame(state.seed);
  const points = [
    {
      turn: 0,
      population: total(initial),
      populations: initial.regions.map(count),
    },
    ...state.history.map((report) => ({
      turn: report.turn,
      population: report.after,
      populations: report.populations,
    })),
  ];
  const peak = points.reduce((best, point) =>
    point.population > best.population ? point : best,
  );
  const islands = REGIONS.map((region, i) => ({
    ...region,
    population: count(state.regions[i]),
    peak: Math.max(...points.map((point) => point.populations[i])),
  }));
  const crises = CRISIS_TURNS.map((turn) => {
    const event = state.events[turn - 1];
    const end = turn + EVENTS[event.kind].duration - 1;
    const reports = state.history.filter(
      (r) => r.turn >= turn && r.turn <= end,
    );
    const last = reports.at(-1);
    return {
      turn,
      end,
      event,
      title: EVENTS[event.kind].title,
      before: reports[0]?.before ?? null,
      after: last?.after ?? null,
      lastTurn: last?.turn ?? null,
      status: !last
        ? "unreached"
        : last.after === 0
          ? "lost"
          : last.turn === end
            ? "survived"
            : "ongoing",
    } as const;
  });
  const lastLiving = [...state.history]
    .reverse()
    .find((report) => report.after > 0);
  const composition = lastLiving?.traits ?? traitCounts(initial.regions);
  const compositionTotal = lastLiving?.after ?? total(initial);
  const initialTraits = traitCounts(initial.regions);
  const traitChanges = TRAITS.flatMap((trait, i) =>
    trait.values.map((value, j) => ({
      trait: trait.name,
      value,
      before: (initialTraits[i][j] / total(initial)) * 100,
      after: (composition[i][j] / compositionTotal) * 100,
    })),
  ).sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before));
  const biggestDrop = state.history.reduce<
    (typeof state.history)[number] | null
  >(
    (best, report) =>
      report.after - report.before < (best ? best.after - best.before : 0)
        ? report
        : best,
    null,
  );
  const last = state.history.at(-1);
  const previous = points.at(-2) ?? points[0];
  const lastIslands = REGIONS.filter((_, i) => previous.populations[i] > 0).map(
    (r) => r.name,
  );
  const occupied = islands.filter((island) => island.population > 0);
  return {
    points,
    peak,
    islands,
    crises,
    biggestDrop,
    last,
    population: total(state),
    initialPopulation: total(initial),
    colonies: occupied.length,
    peakColonies: Math.max(
      ...points.map((point) => point.populations.filter((n) => n > 0).length),
    ),
    survivedCrises: crises.filter((crisis) => crisis.status === "survived")
      .length,
    migrations: state.history.reduce((sum, r) => sum + r.migrations, 0),
    transitLosses: state.history.reduce((sum, r) => sum + r.transitLosses, 0),
    mutations: state.history.reduce((sum, r) => sum + r.mutations, 0),
    traitChange: traitChanges[0],
    compositionTurn: lastLiving?.turn ?? 0,
    observation:
      state.phase === "extinct"
        ? `На последнем ходу численность упала с ${last?.before ?? 0} до нуля. Перед ним жизнь сохранялась здесь: ${lastIslands.join(", ")}.`
        : occupied.length === 1
          ? `Линия сохранилась на острове «${occupied[0].name}». В финале вся популяция сосредоточена в одной колонии.`
          : `В финале обитаемыми остались ${occupied.length} острова из ${REGIONS.length}. Линия жизни сохранилась в нескольких колониях.`,
  };
}

export type ExpeditionSummary = ReturnType<typeof expeditionSummary>;
