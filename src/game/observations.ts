import { PROFILES, REGIONS, TRAITS } from "./content";
import { count, createGame, traitCounts } from "./engine";
import type { GameState } from "./types";

export function comparisonProfiles(
  counts: number[],
  focusTrait: number,
  slots = 3,
) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return [];
  const sorted = counts
    .map((n, i) => ({ n, profile: PROFILES[i] }))
    .filter((p) => p.n > 0)
    .sort((a, b) => a.profile[focusTrait] - b.profile[focusTrait]);
  return Array.from({ length: Math.min(slots, total) }, (_, i) => {
    const rank = ((i + 0.5) * total) / Math.min(slots, total);
    let cumulative = 0;
    return sorted.find((p) => (cumulative += p.n) >= rank)!.profile;
  });
}

export function largestTraitChange(before: number[][], after: number[][]) {
  return TRAITS.flatMap((trait, t) =>
    trait.values.map((value, v) => {
      const a = before[t].reduce((x, y) => x + y, 0),
        b = after[t].reduce((x, y) => x + y, 0);
      return {
        trait: t,
        variant: v,
        name: trait.name,
        value,
        before: a ? before[t][v] / a : 0,
        after: b ? after[t][v] / b : 0,
      };
    }),
  ).sort(
    (a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before),
  )[0];
}
export function firstTraits(state: GameState, island: number) {
  if (island === 0)
    return {
      turn: 0,
      traits: traitCounts([createGame(state.seed).regions[0]]),
      counts: createGame(state.seed).regions[0].counts,
    };
  const first = state.history.find(
    (r) => r.populations[island] > 0 && r.regionalTraits,
  );
  return first?.regionalTraits
    ? {
        turn: first.turn,
        traits: first.regionalTraits[island],
        counts: first.regionalCounts?.[island],
      }
    : null;
}
export function evolutionMoment(state: GameState) {
  const last = state.history.at(-1),
    previous = state.history.at(-2);
  if (!last?.regionalTraits) return null;
  const candidates = state.regions.flatMap((r, island) => {
    if (!count(r)) return [];
    const first = firstTraits(state, island);
    const before = previous?.populations[island]
      ? previous.regionalTraits?.[island]
      : island === 0 && !previous
        ? first?.traits
        : null;
    if (!before || !first) return [];
    const change = largestTraitChange(before, last.regionalTraits![island]);
    return Math.abs(change.after - change.before) >= 0.2
      ? [{ island, first, now: last.regionalTraits![island], change }]
      : [];
  });
  return (
    candidates.sort(
      (a, b) =>
        Math.abs(b.change.after - b.change.before) -
        Math.abs(a.change.after - a.change.before),
    )[0] ?? null
  );
}
export function isolatedTurns(
  state: GameState,
  island: number,
  through = state.history.length,
) {
  let turns = 0;
  for (let i = through - 1; i >= 0 && state.history[i]?.isolated?.[island]; i--)
    turns++;
  return turns;
}
export function branchDifference(
  state: GameState,
  island: number,
  parent: number | null,
) {
  const row = state.history.findLast(
    (r) =>
      r.populations[island] > 0 &&
      (parent === null || r.populations[parent] > 0) &&
      r.regionalTraits,
  );
  const baseline = firstTraits(state, island);
  if (!row?.regionalTraits || !baseline) return null;
  const before = parent === null ? baseline.traits : row.regionalTraits[parent];
  const after = row.regionalTraits[island];
  return {
    before,
    after,
    turn: row.turn,
    change: largestTraitChange(before, after),
    label:
      parent === null
        ? "От начала колонии"
        : `Сравнение с ${REGIONS[parent].name} · ход ${row.turn}`,
  };
}

export type Discovery = {
  id: string;
  turn: number;
  island?: number;
  title: string;
  text: string;
  href: string;
  label: string;
  art: string;
  alt: string;
  source: string;
};
const SOURCE = "https://evolution.berkeley.edu/evolution-101/";
/** The first observed occurrence is retained, so discoveries form a real expedition log. */
export function discoveryHistory(state: GameState): Discovery[] {
  const found = new Map<string, Discovery>();
  const add = (note: Discovery) => {
    if (!found.has(note.id)) found.set(note.id, note);
  };
  for (const [i, report] of state.history.entries()) {
    if (report.migrations)
      add({
        id: "migration",
        turn: report.turn,
        title: "Различия пересекают океан",
        text: `Успешные переходы за ход: ${report.migrations}. Переселенцы перенесли уже существовавшие наследуемые варианты.`,
        href: "/genetics",
        label: "Наследование и изменчивость",
        art: "migration",
        alt: "Разные животные прибывают на новый берег на плавучих ветвях",
        source: SOURCE + "mechanisms-the-processes-of-evolution/gene-flow/",
      });
    if (report.after < report.before * 0.6)
      add({
        id: "bottleneck",
        turn: report.turn,
        title: "Через узкое горлышко",
        text: `Численность упала с ${report.before} до ${report.after}. При резком сокращении могут исчезнуть редкие варианты; спад сам по себе не доказывает, какие именно были потеряны.`,
        href: "/extinctions",
        label: "Кризисы и разнообразие",
        art: "bottleneck",
        alt: "Немногочисленные животные возле уцелевшей зелени после засухи",
        source: SOURCE + "mechanisms-the-processes-of-evolution/genetic-drift/",
      });
    for (let island = 0; island < 6; island++) {
      if (isolatedTurns(state, island, i + 1) >= 3)
        add({
          id: `isolation-${island}`,
          turn: report.turn,
          island,
          title: `${REGIONS[island].name}: отдельная история`,
          text: "Три хода подряд морские пути были закрыты и переселенцев не прибывало. Колония менялась отдельно; это ещё не означает появления нового вида.",
          href: "/cladogram",
          label: "Общий предок и разные ветви",
          art: "isolation",
          alt: "Родственные животные на двух разделённых морем берегах",
          source: SOURCE + "speciation/reproductive-isolation/",
        });
    }
    if (report.mutations)
      add({
        id: "variation",
        turn: report.turn,
        title: "Новые варианты — без плана",
        text: `Случайные изменения признаков за ход: ${report.mutations}. Они не возникают специально под нужды острова; не все сохранятся у потомков.`,
        href: "/genetics",
        label: "Откуда берутся различия",
        art: "variation",
        alt: "Семейная группа животных с разными размерами и шерстью",
        source: SOURCE + "mechanisms-the-processes-of-evolution/mutation/",
      });
  }
  return [...found.values()].sort(
    (a, b) => b.turn - a.turn || a.id.localeCompare(b.id),
  );
}
