import { build } from "esbuild";
import { writeFile, mkdir } from "node:fs/promises";
const built = await build({
  stdin: {
    contents:
      'export * from "./src/game/engine.ts";export {CARD_KINDS,CARDS,cardKind,DEFAULT_SETTINGS} from "./src/game/content.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const E = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`
);
const samples = Number(process.argv[2] ?? 40);
const ids = E.CARD_KINDS.map((_, i) => (i < 8 ? i : i + 8));
const kinds = (s) => s.hand.map(E.cardKind);
function options(s) {
  const result = [];
  for (const card of s.hand) {
    if ((E.CARDS[E.cardKind(card)].unlock ?? 1) > s.turn) continue;
    for (let region = 0; region < 6; region++) {
      const target = E.CARDS[E.cardKind(card)].target;
      for (const destination of target === "region"
        ? [undefined]
        : E.neighbors(region)) {
        const a = {
          card,
          region,
          ...(destination === undefined ? {} : { destination }),
          ...(target === "migration" ? { fraction: 0.25 } : {}),
        };
        if (!E.actionError(s, a)) result.push(a);
      }
    }
  }
  return result;
}
function choose(s, policy, exclude) {
  const candidates = options(s).filter((a) => E.cardKind(a.card) !== exclude);
  const pop = s.regions.map(E.count),
    largest = pop.indexOf(Math.max(...pop));
  const score = (a) => {
    const k = E.cardKind(a.card),
      env = E.environment(E.previewState(s), a.region);
    if (policy === 0)
      return (
        (a.region === largest ? 10 : 0) +
        (["refuge", "food", "seedbank", "stores"].includes(k) ? 4 : 0)
      );
    if (policy === 1)
      return (
        (["migrate", "raft"].includes(k) && !pop[a.destination] ? 30 : 0) +
        (k === "bridge" ? 15 : 0) +
        (a.region === largest ? 3 : 0)
      );
    return (
      (k === "refuge" && [10, 11, 16, 17].includes(s.turn) ? 40 : 0) +
      (k === "food" && env.foodA < 100 ? 15 : 0) +
      (k === "seedbank" && env.foodB < 65 ? 15 : 0) +
      (["migrate", "raft"].includes(k) && !pop[a.destination] ? 25 : 0) +
      (a.region === largest ? 3 : 0)
    );
  };
  return candidates.sort((a, b) => score(b) - score(a))[0];
}
function play(s, policy, exclude) {
  for (let j = 0; j < 2; j++) {
    const a = choose(s, policy, exclude);
    if (!a) break;
    s = E.addAction(s, a);
  }
  return E.resolveTurn(s);
}
function horizon(s, actions) {
  let next = s;
  for (const a of actions) next = E.addAction(next, a);
  for (let n = 0; n < 3; n++) {
    next = E.resolveTurn(next);
    if (next.phase !== "report" || n === 2) break;
    next = E.nextTurn(next);
  }
  return {
    population: E.total(next),
    colonies: next.regions.filter((r) => E.count(r) > 0).length,
    alive: E.total(next) > 0,
  };
}
const average = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const stages = {
  1: "settlement",
  4: "before_drought",
  7: "recovery",
  10: "before_cold",
  16: "before_eruption",
};
const single = [],
  pairs = [],
  ablation = [];
const started = Date.now();
for (let seed = 1; seed <= samples; seed++) {
  let s = E.createExpedition(seed);
  const snapshots = [];
  while (s.phase === "planning") {
    if (stages[s.turn]) snapshots.push(structuredClone(s));
    s = play(s, seed % 3);
    if (s.phase === "report") s = E.nextTurn(s);
  }
  for (const original of snapshots) {
    // Controlled access to every unlocked card removes luck of the draw from this comparison.
    const available = ids.filter(
      (id) => (E.CARDS[E.cardKind(id)].unlock ?? 1) <= original.turn,
    );
    const state = {
      ...original,
      hand: available,
      deck: Array.from({ length: 22 }, (_, i) => i).filter(
        (i) => !available.includes(i),
      ),
      discard: [],
      kept: [],
      draft: [],
    };
    const baseline = horizon(state, []);
    const choices = options(state);
    const best = new Map();
    for (const id of available) {
      const results = choices
        .filter((a) => a.card === id)
        .map((a) => ({ a, result: horizon(state, [a]) }));
      if (!results.length) continue;
      results.sort(
        (a, b) =>
          b.result.population - a.result.population ||
          b.result.colonies - a.result.colonies,
      );
      best.set(id, results[0]);
      single.push({
        seed,
        stage: stages[state.turn],
        kind: E.cardKind(id),
        n: results.length,
        delta: results[0].result.population - baseline.population,
        colonies: results[0].result.colonies - baseline.colonies,
        meanTargetDelta: average(
          results.map((x) => x.result.population - baseline.population),
        ),
        helped: Number(results[0].result.population > baseline.population),
        hurt: Number(results[0].result.population < baseline.population),
      });
    }
    // Ordered two-card plans, re-enumerating legal second actions after the first.
    for (const [id, first] of best) {
      if (E.CARDS[E.cardKind(id)].cost !== 1) continue;
      const withFirst = E.addAction(state, first.a);
      for (const other of available.filter(
        (b) => b !== id && E.CARDS[E.cardKind(b)].cost === 1,
      )) {
        const second = options(withFirst)
          .filter((a) => a.card === other)
          .map((a) => ({ a, result: horizon(state, [first.a, a]) }))
          .sort((a, b) => b.result.population - a.result.population);
        if (!second.length) continue;
        const result = second[0].result;
        pairs.push({
          seed,
          stage: stages[state.turn],
          pair: `${E.cardKind(id)} + ${E.cardKind(other)}`,
          delta: result.population - baseline.population,
          extra:
            result.population -
            Math.max(
              first.result.population,
              best.get(other)?.result.population ?? baseline.population,
            ),
          positive: Number(result.population > baseline.population),
        });
      }
    }
  }
  if (seed % 10 === 0) console.log(`Worlds audited: ${seed}/${samples}`);
}
for (let seed = 1; seed <= samples; seed++) {
  const outcomes = new Map();
  for (const excluded of [null, ...E.CARD_KINDS]) {
    let s = E.createExpedition(seed);
    while (s.phase === "planning") {
      s = play(s, seed % 3, excluded);
      if (s.phase === "report") s = E.nextTurn(s);
    }
    outcomes.set(excluded, {
      won: Number(s.phase === "won"),
      population: E.total(s),
    });
  }
  for (const k of E.CARD_KINDS)
    ablation.push({
      seed,
      kind: k,
      winDifference: outcomes.get(null).won - outcomes.get(k).won,
      populationDifference:
        outcomes.get(null).population - outcomes.get(k).population,
    });
}
function group(rows, key, fields) {
  const keys = [...new Set(rows.map(key))];
  return keys.map((k) => {
    const group = rows.filter((r) => key(r) === k);
    return {
      key: k,
      samples: group.length,
      ...Object.fromEntries(
        fields.map((f) => [
          f,
          Number(average(group.map((r) => r[f])).toFixed(3)),
        ]),
      ),
    };
  });
}
const report = {
  version: 3,
  worlds: samples,
  horizonTurns: 3,
  elapsedSeconds: Math.round((Date.now() - started) / 1000),
  method:
    "Same starting states and event schedules; identical starting RNG, which can diverge after actions. Best valid target for each card. Two-card search fixes the best first action then searches the second (not a global optimum). Population and colony outcomes over three turns; scouting informational value is not measured by this score. Campaign ablation uses fixed heuristics, not human-optimal play.",
  byCard: group(single, (r) => r.kind, [
    "delta",
    "colonies",
    "meanTargetDelta",
    "helped",
    "hurt",
  ]),
  byStage: group(single, (r) => `${r.stage}/${r.kind}`, [
    "delta",
    "colonies",
    "helped",
    "hurt",
  ]),
  pairs: group(pairs, (r) => r.pair, ["delta", "extra", "positive"]).sort(
    (a, b) => b.delta - a.delta,
  ),
  ablation: group(ablation, (r) => r.kind, [
    "winDifference",
    "populationDifference",
  ]),
};
await mkdir("docs", { recursive: true });
await writeFile(
  "docs/game-card-balance-v5.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report.byCard, null, 2));
console.log("Top pairs", JSON.stringify(report.pairs.slice(0, 8), null, 2));
console.log("Campaign ablation", JSON.stringify(report.ablation, null, 2));
