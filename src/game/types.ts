export type CardKind =
  | "bridge"
  | "divide"
  | "migrate"
  | "refuge"
  | "shade"
  | "food"
  | "mosaic"
  | "cover";
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
  | "eruption";
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
};
export type WorldEvent = { kind: EventKind; region: number };
export type Region = { counts: number[] };
export type RegionDefinition = {
  name: string;
  biome: string;
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
};
export type GameState = {
  version: 1;
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
export type RunRecord = {
  runId: string;
  seed: number;
  outcome: "won" | "extinct";
  turns: number;
  population: number;
  crises: number;
};
