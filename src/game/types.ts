export type CardKind =
  | "bridge"
  | "divide"
  | "migrate"
  | "refuge"
  | "shade"
  | "food"
  | "mosaic"
  | "cover"
  | "seedbank"
  | "raft"
  | "stores"
  | "territory"
  | "scout"
  | "exchange";
export type EventKind =
  | "calm"
  | "rain"
  | "heat"
  | "chill"
  | "shoots"
  | "seeds"
  | "predators"
  | "flood"
  | "drought"
  | "cold"
  | "eruption"
  | "garua"
  | "elnino"
  | "castaways";
export type Phase = "planning" | "report" | "won" | "extinct";
export type Profile = readonly [number, number, number, number];
export type GameAction = {
  card: number;
  region: number;
  destination?: number;
  fraction?: 0.1 | 0.25;
};
export type Effect = {
  kind: CardKind | EventKind;
  region: number;
  destination?: number;
  until: number;
  starts?: number;
};
export type WorldEvent = { kind: EventKind; region: number };
export type Region = { counts: number[] };
export type RegionDefinition = {
  name: string;
  biome: string;
  subtitle?: string;
  temperature: number;
  foodA: number;
  foodB: number;
  predators: number;
  capacity: number;
  x: number;
  y: number;
  color: string;
};
export type Environment = Pick<
  RegionDefinition,
  "temperature" | "foodA" | "foodB" | "predators" | "capacity"
> & { refuge: boolean };
export type TurnReport = {
  turn: number;
  before: number;
  after: number;
  populations: number[];
  traits: number[][];
  notes: string[];
  migrations: number;
  transitLosses: number;
  mutations: number;
  event: WorldEvent;
  regionalTraits?: number[][][];
  actions?: GameAction[];
};
export type GameState = {
  version: 1 | 2;
  settings?: ExpeditionSettings;
  kept?: number[];
  lineages?: ColonyOrigin[];
  seed: number;
  runId: string;
  turn: number;
  phase: Phase;
  random: { biology: number; cards: number };
  regions: Region[];
  effects: Effect[];
  events: WorldEvent[];
  hand: number[];
  deck: number[];
  discard: number[];
  draft: GameAction[];
  swapped: boolean;
  history: TurnReport[];
};
export type ExpeditionSettings = {
  mission: "survive" | "colonies" | "diversity";
  mode: "expedition" | "sandbox";
  mutation: "low" | "normal" | "high";
  migration: "low" | "normal" | "high";
};
export type ColonyOrigin = { island: number; parent: number | null; turn: number };
export type RunRecord = {
  version?: 1 | 2;
  settings?: ExpeditionSettings;
  points?: number[];
  actions?: string[][];
  runId: string;
  seed: number;
  outcome: "won" | "extinct";
  turns: number;
  population: number;
  crises: number;
};
