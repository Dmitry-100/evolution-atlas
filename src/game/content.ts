import type { CardKind, EventKind, Profile, RegionDefinition } from "./types";

export const TURNS = 18;
export const GENERATIONS = 20;
export const MUTATION_RATE = 0.007;
export const REGIONS: RegionDefinition[] = [
  {
    name: "Зелёная колыбель",
    biome: "Лесная низина",
    temperature: 0.1,
    foodA: 105,
    foodB: 45,
    predators: 0.6,
    capacity: 200,
    x: 20,
    y: 30,
    color: "#a8cf85",
  },
  {
    name: "Ветровая равнина",
    biome: "Открытые луга",
    temperature: 0.45,
    foodA: 45,
    foodB: 110,
    predators: 1.1,
    capacity: 180,
    x: 50,
    y: 28,
    color: "#ddc283",
  },
  {
    name: "Холодный хребет",
    biome: "Горное плато",
    temperature: -0.8,
    foodA: 55,
    foodB: 70,
    predators: 0.3,
    capacity: 150,
    x: 80,
    y: 30,
    color: "#b0cbd7",
  },
  {
    name: "Тихая бухта",
    biome: "Тёплое побережье",
    temperature: 0.9,
    foodA: 75,
    foodB: 60,
    predators: 0.4,
    capacity: 170,
    x: 20,
    y: 72,
    color: "#edcc91",
  },
  {
    name: "Папоротниковый край",
    biome: "Влажные заросли",
    temperature: 0.25,
    foodA: 120,
    foodB: 30,
    predators: 0.8,
    capacity: 190,
    x: 50,
    y: 70,
    color: "#79c0ae",
  },
  {
    name: "Пепельный берег",
    biome: "Вулканический остров",
    temperature: 0.5,
    foodA: 45,
    foodB: 100,
    predators: 0.2,
    capacity: 160,
    x: 80,
    y: 72,
    color: "#d8a291",
  },
];
export const EDGES = [
  { a: 0, b: 1, open: true },
  { a: 1, b: 2, open: true },
  { a: 0, b: 3, open: false },
  { a: 1, b: 4, open: false },
  { a: 2, b: 5, open: false },
  { a: 3, b: 4, open: false },
  { a: 4, b: 5, open: true },
];
export const PROFILES: Profile[] = Array.from({ length: 81 }, (_, i) => [
  Math.floor(i / 27),
  Math.floor(i / 9) % 3,
  Math.floor(i / 3) % 3,
  i % 3,
]);
export function profileIndex(p: readonly number[]) {
  return p[0] * 27 + p[1] * 9 + p[2] * 3 + p[3];
}
export const TRAITS = [
  {
    name: "Размер",
    values: ["Малые", "Средние", "Крупные"],
    hint: "Крупные реже становятся добычей, но им нужно больше пищи.",
  },
  {
    name: "Теплоизоляция",
    values: ["Слабая", "Средняя", "Сильная"],
    hint: "Сильная помогает в холоде, но мешает отдавать тепло в жару.",
  },
  {
    name: "Питание",
    values: ["Побеги", "Смешанное", "Семена"],
    hint: "Специалист эффективнее использует свою пищу; смешанный рацион даёт больше вариантов.",
  },
  {
    name: "Расселение",
    values: ["Низкое", "Среднее", "Высокое"],
    hint: "Способность к расселению помогает пережить переход, но требует энергии.",
  },
];
export const CARDS: Record<
  CardKind,
  {
    title: string;
    cost: number;
    description: string;
    tradeoff: string;
    duration: number;
    target: "region" | "edge" | "migration";
  }
> = {
  bridge: {
    title: "Сухопутный мост",
    cost: 2,
    description: "Открывает путь между соседними островами на 2 хода.",
    tradeoff:
      "По мосту существа расселяются сами. Популяции снова обмениваются наследуемыми вариантами.",
    duration: 2,
    target: "edge",
  },
  divide: {
    title: "Разделить берега",
    cost: 1,
    description: "Закрывает один путь на 2 хода.",
    tradeoff: "Изоляция остановит и возможное спасительное расселение.",
    duration: 2,
    target: "edge",
  },
  migrate: {
    title: "Расселение",
    cost: 1,
    description: "Перемещает 10% или 25% популяции на соседний остров.",
    tradeoff:
      "Переход возможен по открытому пути. Часть существ может погибнуть.",
    duration: 0,
    target: "migration",
  },
  refuge: {
    title: "Убежище",
    cost: 2,
    description: "Смягчает температурный стресс и удар извержения на 2 хода.",
    tradeoff:
      "Помогает примерно половине популяции. Запасов пищи не добавляет.",
    duration: 2,
    target: "region",
  },
  shade: {
    title: "Тень и влага",
    cost: 1,
    description: "Понижает температуру на 6° на 2 хода.",
    tradeoff: "Семян становится на 20% меньше. В холоде тень может навредить.",
    duration: 2,
    target: "region",
  },
  food: {
    title: "Новые побеги",
    cost: 1,
    description: "Добавляет 55 единиц побегов на 2 хода.",
    tradeoff: "Прежде всего помогает тем, кто питается побегами.",
    duration: 2,
    target: "region",
  },
  mosaic: {
    title: "Мозаика жизни",
    cost: 1,
    description: "Выравнивает запасы побегов и семян на 3 хода.",
    tradeoff:
      "Общий запас пищи не меняется: часть одного ресурса заменяется другим.",
    duration: 3,
    target: "region",
  },
  cover: {
    title: "Укрытия",
    cost: 2,
    description: "Уменьшает давление хищников на 80% на 2 хода.",
    tradeoff: "Укрытия занимают место: вместимость острова уменьшается на 20%.",
    duration: 2,
    target: "region",
  },
};
export const CARD_KINDS = Object.keys(CARDS) as CardKind[];
export function cardKind(id: number): CardKind {
  return CARD_KINDS[id % CARD_KINDS.length];
}
export const EVENTS: Record<
  EventKind,
  { title: string; description: string; icon: string; duration: number }
> = {
  calm: {
    title: "Время расти",
    description: "Условия стабильны. Можно подготовиться к будущим переменам.",
    icon: "sun",
    duration: 1,
  },
  rain: {
    title: "Дожди возвращаются",
    description:
      "Побегов на выбранном острове станет на 30% больше. Температура немного снизится.",
    icon: "rain",
    duration: 1,
  },
  heat: {
    title: "Жаркий сезон",
    description:
      "На выбранном острове потеплеет на 8°, запас побегов уменьшится на 20%.",
    icon: "sun",
    duration: 1,
  },
  chill: {
    title: "Прохладный сезон",
    description: "На выбранном острове температура снизится на 7°.",
    icon: "snow",
    duration: 1,
  },
  shoots: {
    title: "Молодая зелень",
    description:
      "На выбранном острове появится 40 дополнительных единиц побегов.",
    icon: "leaf",
    duration: 1,
  },
  seeds: {
    title: "Семенной год",
    description:
      "На выбранном острове появится 40 дополнительных единиц семян.",
    icon: "leaf",
    duration: 1,
  },
  predators: {
    title: "Хищник рядом",
    description: "Давление хищников на выбранном острове возрастёт на 60%.",
    icon: "paw",
    duration: 1,
  },
  flood: {
    title: "Высокая вода",
    description:
      "На один ход вода закроет пути к выбранному острову. Вместимость уменьшится на 15%.",
    icon: "wave",
    duration: 1,
  },
  drought: {
    title: "Великая засуха",
    description:
      "На всех островах останется 38% побегов и 55% семян. Засуха продлится 2 хода.",
    icon: "sun",
    duration: 2,
  },
  cold: {
    title: "Долгая зима",
    description:
      "Все острова остынут на 28°, пищи станет на 20% меньше. Холод продлится 2 хода. Тёплые берега и убежища могут сохранить популяции.",
    icon: "snow",
    duration: 2,
  },
  eruption: {
    title: "Небо в пепле",
    description:
      "Извержение ударит по Пепельному берегу. На всех островах запас пищи упадёт до 45% на 2 хода.",
    icon: "volcano",
    duration: 2,
  },
};
export const CRISIS_TURNS = [5, 11, 17];
export const CHAPTERS = ["Расселение", "Разделение", "Сохранение линии"];
export const LESSONS = [
  {
    title: "Среда меняется. Преимущество — тоже.",
    href: "/theory",
    label: "Как работает отбор",
  },
  {
    title: "Следующее поколение наследует различия.",
    href: "/genetics",
    label: "Откуда берутся варианты",
  },
  {
    title: "Катастрофа меняет судьбы целых ветвей.",
    href: "/extinctions",
    label: "Вымирания в истории Земли",
  },
];
