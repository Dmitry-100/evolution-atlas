import { firstTraits } from "./observations";
import {
  CARDS,
  DEFAULT_SETTINGS,
  EVENTS,
  PROFILES,
  REGIONS,
  TRAITS,
  cardKind,
} from "./content";
import { count, environment, total, traitCounts } from "./engine";
import type {
  ExpeditionSettings,
  GameState,
  RunRecord,
  WorldEvent,
} from "./types";

export const GALAPAGOS_INTRO =
  "В 1835 году Чарлз Дарвин побывал на Галапагосах во время путешествия на «Бигле». Различия между обитателями островов стали одной из подсказок к его теории. Идею естественного отбора он сформулировал позже, в 1838 году, уже после возвращения в Англию.";
export const MODEL_NOTE =
  "Реальные названия, условный мир: расположение и пути схематичны, животные вымышлены, климатические кризисы усилены для эксперимента. Это не реконструкция Галапагосов 1835 года.";
export const FIELD_SOURCES = [
  {
    title: "Дарвин: путешествие и наблюдения",
    url: "https://www.darwinproject.ac.uk/letters/darwins-life-letters/darwin-letters-1821-1836-childhood-beagle-voyage",
  },
  {
    title: "Как возникла идея естественного отбора",
    url: "https://www.darwinproject.ac.uk/commentary/evolution/natural-selection",
  },
  {
    title: "Острова Галапагосского архипелага",
    url: "https://galapagosconservation.org.uk/about-galapagos/islands/",
  },
  {
    title: "Заселение островов и перенос по океану",
    url: "https://www.darwinfoundation.org/en/documents/113/Galapagos.pdf",
  },
  {
    title: "Фонд Дарвина: последствия Эль-Ниньо",
    url: "https://www.darwinfoundation.org/es/documents/371/NG_41_1985.pdf",
  },
  {
    title: "Galapagos Conservation Trust · Гаруа",
    url: "https://galapagosconservation.org.uk/what-to-see-in-november/",
  },
];
export const FIELD_NOTES = {
  raft: {
    title: "Как жизнь пересекает океан?",
    text: "Плавучие скопления ветвей и растительности могут переносить семена и мелких животных. В игре плот означает такой случайный перенос: многие путешественники не добираются до берега.",
    source: 3,
  },
  bridge: {
    title: "Почему здесь морской коридор?",
    text: "Между островами лежит океан. Течения и плавучая растительность помогают объяснить расселение; открытая линия на карте — условное окно для перехода, а не настоящий сухопутный мост.",
    source: 3,
  },
  garua: {
    title: "Влага, которую почти не видно",
    text: "Гаруа — мелкая морось и туман прохладного сезона Галапагосов. В нашем наземном сценарии дополнительная влага поддерживает растительность. Эффект на один остров — игровое упрощение.",
    source: 5,
  },
  elnino: {
    title: "Одно событие — разные последствия",
    text: "Эль-Ниньо меняет океанические и погодные условия. Здесь показан только условный эффект тёплых дождей на наземную пищу. Состояние морских экосистем эта игра не рассчитывает.",
    source: 4,
  },
  castaways: {
    title: "Новая колония начинается с немногих",
    text: "Небольшая группа может перенести на другой берег лишь часть разнообразия исходной колонии. В игре переселенцы выбираются случайно; нужные для острова признаки не выдаются им заранее.",
    source: 3,
  },
  passage: {
    title: "Окно в океане",
    text: "Течения могут помогать переносу живых организмов. В игре такой путь открыт один ход: воспользуйтесь расселением или оставьте переход естественной миграции.",
    source: 3,
  },
  reprieve: {
    title: "Передышка не отменяет голод",
    text: "Хищники временно перестают влиять на выживание. Пищи больше не стало: следите за её запасами, пока колония растёт.",
    source: 2,
  },
};
export const MISSIONS = {
  survive: {
    title: "Сохранить линию",
    description: "Завершить 18 ходов хотя бы с одной живой колонией.",
  },
  colonies: {
    title: "Три живых берега",
    description: "Пережить 18 ходов и сохранить не менее трёх колоний.",
  },
  diversity: {
    title: "Три способа питаться",
    description:
      "В финале сохранить все три рациона: доля каждого не меньше 10% общей популяции.",
  },
};
export function missionStatus(state: GameState) {
  const key = state.settings?.mission ?? "survive";
  const colonies = state.regions.filter((r) => count(r) > 0).length;
  const n = total(state);
  const diets = traitCounts(state.regions)[2].filter(
    (v) => n > 0 && v / n >= 0.1,
  ).length;
  return {
    ...MISSIONS[key],
    achieved:
      state.phase === "won" &&
      (key === "survive" || (key === "colonies" ? colonies >= 3 : diets === 3)),
    progress:
      key === "survive"
        ? `${state.history.length} / 18 ходов`
        : key === "colonies"
          ? `${colonies} / 3 колонии`
          : `${diets} / 3 рациона с долей от 10%`,
  };
}
export function foodBudget(state: GameState, island: number) {
  const demand = [0, 0];
  state.regions[island].counts.forEach((n, i) => {
    const [size, , diet, mobility] = PROFILES[i];
    const energy = n * [0.8, 1, 1.28][size] * [1, 1.04, 1.09][mobility];
    demand[0] += energy * [1, 0.5, 0][diet];
    demand[1] += energy * [0, 0.5, 1][diet];
  });
  const env = environment(state, island);
  return demand.map((need, i) => ({
    need,
    available: i ? env.foodB : env.foodA,
    shortage: need > (i ? env.foodB : env.foodA),
  }));
}
export function visualProfiles(counts: number[], slots = 24) {
  const n = counts.reduce((a, b) => a + b, 0);
  if (!n) return [];
  const amount = Math.min(slots, Math.ceil(n / 9));
  return Array.from({ length: amount }, (_, i) => {
    const rank = ((i + 0.5) * n) / amount;
    let cumulative = 0;
    const index = counts.findIndex((v) => (cumulative += v) >= rank);
    return PROFILES[Math.max(0, index)];
  });
}
export function traitComparison(state: GameState, island: number) {
  const first = firstTraits(state, island);
  const now = traitCounts([state.regions[island]]);
  return {
    first,
    now,
    changes: first
      ? TRAITS.map((trait, i) => {
          const before = first.traits[i].reduce((a, b) => a + b, 0);
          const after = count(state.regions[island]);
          const delta = trait.values
            .map((value, j) => ({
              value,
              before: before ? first.traits[i][j] / before : 0,
              after: after ? now[i][j] / after : 0,
            }))
            .sort(
              (a, b) =>
                Math.abs(b.after - b.before) - Math.abs(a.after - a.before),
            )[0];
          return { name: trait.name, ...delta };
        })
      : [],
  };
}
export function expeditionLink(state: GameState, origin: string) {
  const settings = state.settings ?? DEFAULT_SETTINGS;
  const url = new URL("/game", origin);
  url.searchParams.set("expedition", state.seed.toString(16));
  url.searchParams.set("mission", settings.mission);
  url.searchParams.set("rules", String(state.version));
  if (settings.mode === "sandbox") {
    url.searchParams.set("mode", "sandbox");
    url.searchParams.set("mutation", settings.mutation);
    url.searchParams.set("migration", settings.migration);
  }
  return url.toString();
}
export function sharedExpedition(
  search: string,
): { seed: number; settings: ExpeditionSettings; version: 2 | 3 } | null {
  const p = new URLSearchParams(search),
    seed = p.get("expedition");
  if (!seed || !/^[a-f\d]{1,8}$/i.test(seed)) return null;
  const level = (v: string | null) =>
    v === "low" || v === "high" ? v : "normal";
  const sandbox = p.get("mode") === "sandbox";
  const mission = p.get("mission");
  return {
    seed: parseInt(seed, 16),
    version: p.get("rules") === "3" ? 3 : 2,
    settings: {
      mission:
        mission === "colonies" || mission === "diversity" ? mission : "survive",
      mode: sandbox ? "sandbox" : "expedition",
      mutation: sandbox ? level(p.get("mutation")) : "normal",
      migration: sandbox ? level(p.get("migration")) : "normal",
    },
  };
}
export function comparisonRun(state: GameState, records: RunRecord[]) {
  return records.find(
    (r) =>
      r.runId !== state.runId &&
      r.seed === state.seed &&
      r.version === state.version &&
      (["mission", "mode", "mutation", "migration"] as const).every(
        (key) => r.settings?.[key] === state.settings?.[key],
      ) &&
      r.points,
  );
}
export function cardImpact(
  state: GameState,
  preview: GameState,
  island: number,
) {
  const a = environment(state, island),
    b = environment(preview, island);
  return [
    ["Побеги", a.foodA, b.foodA],
    ["Семена", a.foodB, b.foodB],
    ["Температура", 18 + a.temperature * 12, 18 + b.temperature * 12],
    ["Места", a.capacity, b.capacity],
  ] as const;
}
export function scouting(state: GameState) {
  const until = Math.max(
    0,
    ...state.effects
      .filter((e) => e.kind === "scout" && e.until >= state.turn)
      .map((e) => e.until),
  );
  return state.events
    .map((event, i) => ({ event, turn: i + 1 }))
    .filter((e) => e.turn > state.turn && e.turn <= until);
}
export function actionSummary(state: GameState) {
  return (
    state.history
      .at(-1)
      ?.actions?.map(
        (a) => `${CARDS[cardKind(a.card)].title} · ${REGIONS[a.region].name}`,
      ) ?? []
  );
}
export function eventDescription(
  state: GameState,
  event: WorldEvent = state.events[state.turn - 1],
) {
  if (event.kind === "passage" && event.destination !== undefined)
    return `${REGIONS[event.region].name} → ${REGIONS[event.destination].name}. ${EVENTS.passage.description}`;
  return event.kind === "cold" && state.version >= 2
    ? "Все острова остынут на 24°, пищи станет на 20% меньше на два хода. Это усиленный игровой климатический эксперимент, а не обычная погода Галапагосов."
    : EVENTS[event.kind].description;
}
