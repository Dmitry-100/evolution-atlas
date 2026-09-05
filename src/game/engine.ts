import {
  CARDS,
  CARD_KINDS,
  CHAPTERS,
  CRISIS_TURNS,
  EDGES,
  EVENTS,
  GENERATIONS,
  MUTATION_RATE,
  PROFILES,
  REGIONS,
  TRAITS,
  TURNS,
  cardKind,
  profileIndex,
} from "./content";
import type {
  Effect,
  Environment,
  GameAction,
  GameState,
  Region,
  TurnReport,
  WorldEvent,
} from "./types";

// Mulberry32. Biology and cards use separate streams; rendering never consumes either.
export function randomStep(seed: number): [number, number] {
  const next = (seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(next ^ (next >>> 15), next | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}
function stream(state: GameState, name: "biology" | "cards") {
  return () => {
    const [value, seed] = randomStep(state.random[name]);
    state.random[name] = seed;
    return value;
  };
}
export function binomial(n: number, p: number, random: () => number) {
  let result = 0;
  for (let i = 0; i < n; i++) if (random() < p) result++;
  return result;
}
function shuffle<T>(items: T[], random: () => number) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
export function count(region: Region) {
  return region.counts.reduce((a, b) => a + b, 0);
}
export function total(state: GameState) {
  return state.regions.reduce((sum, region) => sum + count(region), 0);
}
export function chapter(turn: number) {
  return CHAPTERS[Math.min(2, Math.floor((turn - 1) / 6))];
}
export function traitCounts(regions: Region[]) {
  const traits = Array.from({ length: 4 }, () => [0, 0, 0]);
  for (const region of regions)
    region.counts.forEach((n, index) =>
      PROFILES[index].forEach((v, trait) => {
        traits[trait][v] += n;
      }),
    );
  return traits;
}
export function createGame(
  seed: number,
  runId = `expedition-${seed}`,
): GameState {
  const state: GameState = {
    version: 1,
    seed: seed >>> 0,
    runId,
    turn: 1,
    phase: "planning",
    random: { biology: seed >>> 0, cards: (seed ^ 0x91ab42d3) >>> 0 },
    regions: REGIONS.map(() => ({ counts: Array<number>(81).fill(0) })),
    effects: [],
    events: [],
    hand: [],
    deck: [],
    discard: [],
    draft: [],
    swapped: false,
    history: [],
  };
  const random = stream(state, "biology");
  for (let i = 0; i < 80; i++) {
    const p = [
      Math.floor(random() * 3),
      Math.floor(random() * 3),
      Math.floor(random() * 3),
      Math.floor(random() * 3),
    ];
    state.regions[0].counts[profileIndex(p)]++;
  }
  let eventSeed = (seed ^ 0x70ae3299) >>> 0;
  const eventRandom = () => {
    const [value, next] = randomStep(eventSeed);
    eventSeed = next;
    return value;
  };
  const ordinary = [
    "calm",
    "rain",
    "heat",
    "chill",
    "shoots",
    "seeds",
    "predators",
    "flood",
  ] as const;
  for (let turn = 1; turn <= TURNS; turn++) {
    const kind =
      turn === 5
        ? "drought"
        : turn === 11
          ? "cold"
          : turn === 17
            ? "eruption"
            : turn <= 3
              ? turn === 2
                ? "rain"
                : "calm"
              : ordinary[Math.floor(eventRandom() * ordinary.length)];
    state.events.push({
      kind,
      region:
        kind === "eruption" ? 5 : Math.floor(eventRandom() * REGIONS.length),
    });
  }
  // Reliable opening: a real choice between migration, a bridge, food and refuge.
  state.hand = [2, 0, 5, 3];
  state.deck = shuffle(
    Array.from({ length: CARD_KINDS.length * 2 }, (_, i) => i).filter(
      (i) => !state.hand.includes(i),
    ),
    stream(state, "cards"),
  );
  return state;
}
export function currentEvent(state: GameState) {
  return state.events[state.turn - 1];
}
export function forecast(state: GameState) {
  const turn = CRISIS_TURNS.find((t) => t >= state.turn);
  return turn ? { turn, event: state.events[turn - 1] } : null;
}
function activeEffects(state: GameState) {
  return state.effects.filter((e) => e.until >= state.turn);
}
export function environment(state: GameState, region: number): Environment {
  const base = REGIONS[region];
  const env: Environment = {
    temperature: base.temperature,
    foodA: base.foodA,
    foodB: base.foodB,
    predators: base.predators,
    capacity: base.capacity,
    refuge: false,
  };
  for (const effect of activeEffects(state)) {
    if (effect.region !== region && effect.region !== -1) continue;
    switch (effect.kind) {
      case "refuge":
        env.refuge = true;
        break;
      case "shade":
        env.temperature -= 0.5;
        env.foodB *= 0.8;
        break;
      case "food":
        env.foodA += 55;
        break;
      case "mosaic":
        env.foodA = env.foodB = (env.foodA + env.foodB) / 2;
        break;
      case "cover":
        env.predators *= 0.2;
        env.capacity *= 0.8;
        break;
      case "rain":
        env.foodA *= 1.3;
        env.temperature -= 0.2;
        break;
      case "heat":
        env.temperature += 2 / 3;
        env.foodA *= 0.8;
        break;
      case "chill":
        env.temperature -= 7 / 12;
        break;
      case "shoots":
        env.foodA += 40;
        break;
      case "seeds":
        env.foodB += 40;
        break;
      case "predators":
        env.predators *= 1.6;
        break;
      case "flood":
        env.capacity *= 0.85;
        break;
      case "drought":
        env.foodA *= 0.38;
        env.foodB *= 0.55;
        break;
      case "cold":
        env.temperature -= 28 / 12;
        env.foodA *= 0.8;
        env.foodB *= 0.8;
        break;
      case "eruption":
        env.foodA *= 0.45;
        env.foodB *= 0.45;
        break;
    }
  }
  env.capacity = Math.floor(env.capacity);
  return env;
}
export function connected(state: GameState, a: number, b: number) {
  const edge = EDGES.find(
    (e) => (e.a === a && e.b === b) || (e.a === b && e.b === a),
  );
  if (!edge) return false;
  let open = edge.open;
  for (const e of activeEffects(state)) {
    if (e.kind === "flood" && (e.region === a || e.region === b)) open = false;
    if (
      (e.kind === "bridge" || e.kind === "divide") &&
      ((e.region === a && e.destination === b) ||
        (e.region === b && e.destination === a))
    )
      open = e.kind === "bridge";
  }
  return open;
}
export function neighbors(region: number) {
  return EDGES.flatMap((e) =>
    e.a === region ? [e.b] : e.b === region ? [e.a] : [],
  );
}
export function spent(state: GameState) {
  return state.draft.reduce(
    (sum, action) => sum + CARDS[cardKind(action.card)].cost,
    0,
  );
}
export function actionError(
  state: GameState,
  action: GameAction,
): string | null {
  if (state.phase !== "planning") return "Сначала завершите разбор хода.";
  if (
    !Number.isInteger(action.card) ||
    !state.hand.includes(action.card) ||
    state.draft.some((a) => a.card === action.card)
  )
    return "Эта карта уже выбрана или отсутствует в руке.";
  if (!Number.isInteger(action.region) || !REGIONS[action.region])
    return "Выберите остров.";
  const kind = cardKind(action.card),
    card = CARDS[kind];
  if (state.draft.length >= 2 || spent(state) + card.cost > 2)
    return "На этом ходу не хватает очков вмешательства.";
  if (card.target !== "region") {
    if (
      !Number.isInteger(action.destination) ||
      !neighbors(action.region).includes(action.destination!)
    )
      return "Выберите соседний остров.";
    const preview = previewState(state);
    if (kind === "migrate") {
      if (action.fraction !== 0.1 && action.fraction !== 0.25)
        return "Выберите долю: 10% или 25%.";
      const remaining = state.draft.reduce(
        (n, previous) =>
          cardKind(previous.card) === "migrate" &&
          previous.region === action.region
            ? n - Math.floor(n * previous.fraction!)
            : n,
        count(state.regions[action.region]),
      );
      if (Math.floor(remaining * action.fraction) < 1)
        return "Популяция слишком мала для выбранного расселения.";
      if (!connected(preview, action.region, action.destination!))
        return "Между островами сейчас нет открытого пути.";
    }
    if (
      kind === "bridge" &&
      connected(preview, action.region, action.destination!)
    )
      return "Этот путь уже открыт.";
    if (
      kind === "divide" &&
      !connected(preview, action.region, action.destination!)
    )
      return "Этот путь уже закрыт.";
  }
  return null;
}
export function addAction(state: GameState, action: GameAction) {
  const error = actionError(state, action);
  if (error) throw new Error(error);
  return { ...state, draft: [...state.draft, action] };
}
function addEffect(state: GameState, effect: Effect) {
  state.effects = state.effects.filter(
    (e) =>
      !(
        e.kind === effect.kind &&
        e.region === effect.region &&
        e.destination === effect.destination
      ),
  );
  state.effects.push(effect);
}
export function previewState(state: GameState): GameState {
  const preview = { ...state, effects: [...state.effects] };
  for (const action of state.draft) {
    const kind = cardKind(action.card);
    if (kind !== "migrate")
      addEffect(preview, {
        kind,
        region: action.region,
        destination: action.destination,
        until: state.turn + CARDS[kind].duration - 1,
      });
  }
  return preview;
}
function draw(state: GameState) {
  if (!state.deck.length) {
    state.deck = shuffle(state.discard, stream(state, "cards"));
    state.discard = [];
  }
  const next = state.deck.pop();
  if (next !== undefined) state.hand.push(next);
}
export function swapCard(state: GameState, id: number): GameState {
  if (
    state.phase !== "planning" ||
    state.swapped ||
    !state.hand.includes(id) ||
    state.draft.some((a) => a.card === id)
  )
    throw new Error("Заменить эту карту сейчас нельзя.");
  const next = structuredClone(state);
  next.hand = next.hand.filter((card) => card !== id);
  // Draw first so the discarded card cannot be immediately redrawn.
  draw(next);
  next.discard.push(id);
  next.swapped = true;
  return next;
}
function sampleWithoutReplacement(
  counts: number[],
  size: number,
  random: () => number,
) {
  let remaining = counts.reduce((a, b) => a + b, 0),
    slots = Math.min(size, remaining);
  return counts.map((n) => {
    let selected = 0;
    for (let i = 0; i < n; i++) {
      if (slots > 0 && random() < slots / remaining) {
        selected++;
        slots--;
      }
      remaining--;
    }
    return selected;
  });
}
export function relocate(
  state: GameState,
  a: number,
  b: number,
  fraction: number,
  random: () => number,
  report: TurnReport,
) {
  const source = state.regions[a],
    target = state.regions[b];
  const selected = sampleWithoutReplacement(
    source.counts,
    Math.floor(count(source) * fraction),
    random,
  );
  selected.forEach((n, p) => {
    source.counts[p] -= n;
    const survived = binomial(n, 0.65 + PROFILES[p][3] * 0.15, random);
    target.counts[p] += survived;
    report.migrations += survived;
    report.transitLosses += n - survived;
  });
}
function naturalMigration(
  state: GameState,
  random: () => number,
  report: TurnReport,
) {
  const delta = state.regions.map(() => Array<number>(81).fill(0));
  state.regions.forEach((region, a) => {
    const destinations = neighbors(a).filter((b) => connected(state, a, b));
    if (!destinations.length) return;
    region.counts.forEach((n, p) => {
      const mobility = PROFILES[p][3];
      const migrants = binomial(n, [0.0004, 0.001, 0.002][mobility], random);
      delta[a][p] -= migrants;
      for (let i = 0; i < migrants; i++) {
        const b = destinations[Math.floor(random() * destinations.length)];
        if (random() < 0.65 + mobility * 0.15) {
          delta[b][p]++;
          report.migrations++;
        } else report.transitLosses++;
      }
    });
  });
  state.regions.forEach((region, i) =>
    region.counts.forEach((_, p) => {
      region.counts[p] += delta[i][p];
    }),
  );
}
export function generation(
  counts: number[],
  env: Environment,
  random: () => number,
  mutationRate = MUTATION_RATE,
) {
  const demand = [0, 0];
  counts.forEach((n, p) => {
    const [size, , diet, mobility] = PROFILES[p];
    const energy = [0.8, 1, 1.28][size] * [1, 1.04, 1.09][mobility];
    const a = [1, 0.5, 0][diet];
    demand[0] += n * energy * a;
    demand[1] += n * energy * (1 - a);
  });
  const availability = [
    Math.min(1.3, env.foodA / Math.max(1, demand[0])),
    Math.min(1.3, env.foodB / Math.max(1, demand[1])),
  ];
  const offspring = Array<number>(81).fill(0);
  let mutations = 0;
  counts.forEach((n, p) => {
    if (!n) return;
    const [size, insulation, diet] = PROFILES[p];
    const optimum = [0.95, 0, -0.95][insulation];
    const suitability = Math.exp(-0.38 * (env.temperature - optimum) ** 2);
    const thermal = env.refuge
      ? (suitability + Math.max(0.85, suitability)) / 2
      : suitability;
    const a = [1, 0.5, 0][diet];
    const food =
      (a * availability[0] + (1 - a) * availability[1]) *
      (diet === 1 ? 0.9 : 1.1);
    const predation = Math.exp(-env.predators * [0.22, 0.13, 0.07][size]);
    const reproductiveSuccess = 1.48 * thermal * food * predation;
    // Two potential offspring per parent, sampled independently: bounded finite-population drift.
    const births = binomial(
      n * 2,
      Math.min(0.96, reproductiveSuccess / 2),
      random,
    );
    for (let i = 0; i < births; i++) {
      if (random() < mutationRate) {
        const profile = [...PROFILES[p]],
          trait = Math.floor(random() * 4),
          step = random() < 0.5 ? -1 : 1;
        const value = profile[trait] + step;
        // Rejected steps stay put, avoiding directional mutation bias at the boundaries.
        if (value >= 0 && value <= 2) {
          profile[trait] = value;
          mutations++;
        }
        offspring[profileIndex(profile)]++;
      } else offspring[p]++;
    }
  });
  return {
    counts:
      offspring.reduce((a, b) => a + b, 0) > env.capacity
        ? sampleWithoutReplacement(offspring, env.capacity, random)
        : offspring,
    mutations,
  };
}
export function resolveTurn(state: GameState): GameState {
  if (state.phase !== "planning") throw new Error("Этот ход уже рассчитан.");
  // Revalidate the entire command sequence at the domain boundary.
  let checked = { ...state, draft: [] as GameAction[] };
  for (const action of state.draft) checked = addAction(checked, action);
  const next = structuredClone(state),
    random = stream(next, "biology");
  const event = currentEvent(next),
    beforeTraits = traitCounts(next.regions);
  const beforeCounts = next.regions.map(count);
  const report: TurnReport = {
    turn: next.turn,
    before: total(next),
    after: 0,
    populations: [],
    traits: [],
    notes: [],
    migrations: 0,
    transitLosses: 0,
    mutations: 0,
    event,
  };
  for (const action of next.draft) {
    const kind = cardKind(action.card);
    if (kind === "migrate")
      relocate(
        next,
        action.region,
        action.destination!,
        action.fraction!,
        random,
        report,
      );
    else
      addEffect(next, {
        kind,
        region: action.region,
        destination: action.destination,
        until: next.turn + CARDS[kind].duration - 1,
      });
    next.hand = next.hand.filter((card) => card !== action.card);
    next.discard.push(action.card);
  }
  const global = CRISIS_TURNS.includes(next.turn);
  addEffect(next, {
    kind: event.kind,
    region: global ? -1 : event.region,
    until: next.turn + EVENTS[event.kind].duration - 1,
  });
  if (event.kind === "eruption") {
    const protectedRegion = environment(next, event.region).refuge;
    const before = count(next.regions[event.region]);
    next.regions[event.region].counts = next.regions[event.region].counts.map(
      (n) => binomial(n, protectedRegion ? 0.5 : 0.12, random),
    );
    report.notes.push(
      `Извержение: на Пепельном берегу погибло ${before - count(next.regions[event.region])} существ.`,
    );
  }
  for (let g = 0; g < GENERATIONS && total(next) > 0; g++) {
    naturalMigration(next, random, report);
    next.regions.forEach((region, i) => {
      const result = generation(region.counts, environment(next, i), random);
      region.counts = result.counts;
      report.mutations += result.mutations;
    });
  }
  report.after = total(next);
  report.populations = next.regions.map(count);
  report.traits = traitCounts(next.regions);
  report.populations.forEach((n, i) => {
    if (n && !beforeCounts[i])
      report.notes.push(`Новая колония: ${REGIONS[i].name}.`);
    if (!n && beforeCounts[i])
      report.notes.push(`Популяция исчезла: ${REGIONS[i].name}.`);
  });
  if (report.before && report.after) {
    let best = { difference: 0, trait: 0, value: 0 };
    report.traits.forEach((values, trait) =>
      values.forEach((n, value) => {
        const difference =
          n / report.after - beforeTraits[trait][value] / report.before;
        if (Math.abs(difference) > Math.abs(best.difference))
          best = { difference, trait, value };
      }),
    );
    if (Math.abs(best.difference) >= 0.02) {
      const { trait, value } = best;
      report.notes.push(
        `${TRAITS[trait].name} · ${TRAITS[trait].values[value].toLowerCase()}: ${Math.round((beforeTraits[trait][value] / report.before) * 100)}% → ${Math.round((report.traits[trait][value] / report.after) * 100)}%. Частоты изменились через размножение, отбор, миграцию и случайность.`,
      );
    }
  }
  if (!report.notes.length)
    report.notes.push(
      "Популяции продолжают жить в прежних местах. Их состав меняется от поколения к поколению.",
    );
  next.history.push(report);
  next.draft = [];
  next.phase =
    report.after === 0 ? "extinct" : next.turn === TURNS ? "won" : "report";
  return next;
}
export function nextTurn(state: GameState): GameState {
  if (state.phase !== "report" || state.turn >= TURNS)
    throw new Error("Следующий ход сейчас недоступен.");
  const next = structuredClone(state);
  next.turn++;
  next.phase = "planning";
  next.swapped = false;
  next.effects = next.effects.filter((e) => e.until >= next.turn);
  while (next.hand.length < 4) draw(next);
  return next;
}
export function isCrisis(event: WorldEvent) {
  return ["drought", "cold", "eruption"].includes(event.kind);
}
