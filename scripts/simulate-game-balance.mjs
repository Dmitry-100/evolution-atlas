import { build } from "esbuild";
import { performance } from "node:perf_hooks";

const built = await build({
  stdin: {
    contents:
      'export * from "./src/game/engine.ts"; export {CARDS,cardKind} from "./src/game/content.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const engine = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`
);
const samples = Math.max(1, Number(process.argv[2] ?? 100));
const legacy = process.argv.includes("--legacy");
const policies = ["observe", "random", "largest", "disperse"];
for (const policy of policies) {
  let wins = 0,
    turns = 0,
    population = 0;
  const times = [];
  for (let seed = 1; seed <= samples; seed++) {
    let state = (legacy ? engine.createGame : engine.createExpedition)(seed),
      policySeed = seed;
    const random = () => {
      const [v, next] = engine.randomStep(policySeed);
      policySeed = next;
      return v;
    };
    while (state.phase === "planning") {
      if (policy !== "observe") {
        for (let move = 0; move < 2; move++) {
          const options = [];
          for (const card of state.hand)
            for (let region = 0; region < 6; region++) {
              const kind = engine.cardKind(card),
                target = engine.CARDS[kind].target;
              for (const destination of target !== "region"
                ? engine.neighbors(region)
                : [undefined]) {
                const action = {
                  card,
                  region,
                  ...(destination !== undefined ? { destination } : {}),
                  ...(target === "migration" ? { fraction: 0.25 } : {}),
                };
                if (!engine.actionError(state, action)) options.push(action);
              }
            }
          if (!options.length) break;
          const largest = state.regions
            .map(engine.count)
            .indexOf(Math.max(...state.regions.map(engine.count)));
          options.sort((a, b) => {
            const score = (action) =>
              policy === "largest"
                ? (action.region === largest ? 5 : 0) +
                  (["refuge", "food", "cover", "stores", "seedbank"].includes(
                    engine.cardKind(action.card),
                  )
                    ? 2
                    : 0)
                : policy === "disperse"
                  ? (["migrate", "raft", "exchange"].includes(
                      engine.cardKind(action.card),
                    ) && engine.count(state.regions[action.destination]) === 0
                      ? 10
                      : 0) + (engine.cardKind(action.card) === "bridge" ? 4 : 0)
                  : 0;
            return score(b) - score(a);
          });
          state = engine.addAction(
            state,
            policy === "random"
              ? options[Math.floor(random() * options.length)]
              : options[0],
          );
        }
      }
      const start = performance.now();
      state = engine.resolveTurn(state);
      times.push(performance.now() - start);
      if (state.phase === "report") state = engine.nextTurn(state);
    }
    wins += Number(state.phase === "won");
    turns += state.turn;
    population += engine.total(state);
  }
  times.sort((a, b) => a - b);
  console.log(
    JSON.stringify({
      version: legacy ? 1 : 2,
      policy,
      samples,
      wins,
      winRate: wins / samples,
      meanTurns: +(turns / samples).toFixed(2),
      meanPopulation: +(population / samples).toFixed(1),
      turnP95ms: +times[Math.floor(times.length * 0.95)].toFixed(2),
    }),
  );
}
