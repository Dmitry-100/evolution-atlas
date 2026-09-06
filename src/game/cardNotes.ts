import type { CardKind } from "./types";

type CardNote = {
  topic: string;
  title: string;
  text: string;
  source: string;
  sourceTitle: string;
  atlas: string;
};
const selection = {
  source:
    "https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/natural-selection/",
  sourceTitle: "Беркли · Естественный отбор",
  atlas: "/theory",
};
const resources = {
  source:
    "https://openstax.org/books/biology-2e/pages/45-3-environmental-limits-to-population-growth",
  sourceTitle: "OpenStax · Рост популяций",
  atlas: "/theory",
};
const flow = {
  source:
    "https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/gene-flow/",
  sourceTitle: "Беркли · Поток генов",
  atlas: "/genetics",
};
const rafting = {
  source: "https://www.darwinfoundation.org/en/documents/113/Galapagos.pdf",
  sourceTitle: "Фонд Дарвина · Заселение островов",
  atlas: "/theory",
};

export const CARD_NOTES: Record<CardKind, CardNote> = {
  bridge: {
    topic: "Морские пути",
    title: "Океан тоже соединяет",
    text: "Течения переносят плавучие ветви и их пассажиров между берегами. Морской коридор в игре — условное окно для такого путешествия.",
    ...rafting,
  },
  divide: {
    topic: "Изоляция",
    title: "Когда пути расходятся",
    text: "Если животные реже переходят между колониями, наследуемые варианты реже смешиваются. Различия между берегами могут накапливаться.",
    ...flow,
  },
  migrate: {
    topic: "Основатели",
    title: "Немногие начинают новую историю",
    text: "Первая маленькая колония несёт лишь часть разнообразия своих предков. Случайный состав переселенцев может повлиять на её дальнейшую историю.",
    source:
      "https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/genetic-drift/",
    sourceTitle: "Беркли · Генетический дрейф",
    atlas: "/genetics",
  },
  refuge: {
    topic: "Выживание",
    title: "Пережить трудное время",
    text: "Условия меняют шансы выжить и оставить потомков. Убежище помогает пережить кризис, но само по себе не создаёт новых наследуемых признаков.",
    ...selection,
  },
  shade: {
    topic: "Гаруа",
    title: "Туман, который питает остров",
    text: "В прохладный сезон на Галапагосах бывает гаруа — морось и туман. Карта напоминает о том, как влага меняет условия жизни.",
    source: "https://galapagosconservation.org.uk/what-to-see-in-november/",
    sourceTitle: "Galapagos Conservation Trust · Гаруа",
    atlas: "/theory",
  },
  food: {
    topic: "Конкуренция",
    title: "Еды не бывает бесконечно много",
    text: "Когда колония растёт, пищи на каждого становится меньше. Дополнительные побеги временно ослабляют эту конкуренцию.",
    ...resources,
  },
  mosaic: {
    topic: "Разные рационы",
    title: "Одна среда — разные возможности",
    text: "Разным едокам нужны разные ресурсы. В игре сочетание побегов и семян помогает поддержать несколько рационов одновременно.",
    ...resources,
  },
  cover: {
    topic: "Естественный отбор",
    title: "Хищники меняют шансы",
    text: "Наследуемые особенности, помогающие избежать хищника, могут чаще передаваться потомкам. Укрытия меняют условия, в которых идёт этот отбор.",
    ...selection,
  },
  seedbank: {
    topic: "Пища и отбор",
    title: "Преимущество зависит от меню",
    text: "Когда доступная пища меняется, преимущество могут получить другие едоки. В этой модели больше семян — больше возможностей для семеноядных.",
    ...selection,
  },
  raft: {
    topic: "Заселение островов",
    title: "Пассажиры на ветвях",
    text: "Скопления плавучей растительности могут переносить семена и мелких животных. Такой плот — один из способов объяснить появление жизни на далёких островах.",
    ...rafting,
  },
  stores: {
    topic: "Сезоны",
    title: "Изобилие сменяется нехваткой",
    text: "Количество пищи меняется, а вместе с ним — численность животных. В игре запасы позволяют перенести часть ресурсов на трудные ходы.",
    ...resources,
  },
  territory: {
    topic: "Предел роста",
    title: "У каждого берега есть предел",
    text: "Популяция не может расти бесконечно: нужны пища и пространство. Новая территория даёт место, но не гарантирует, что всем хватит еды.",
    ...resources,
  },
  scout: {
    topic: "Наблюдения Дарвина",
    title: "Сначала заметить различия",
    text: "В 1835 году Дарвин наблюдал обитателей Галапагосов. Сравнение островов помогло ему поставить вопросы, из которых позже выросла теория.",
    source:
      "https://www.darwinproject.ac.uk/letters/darwins-life-letters/darwin-letters-1821-1836-childhood-beagle-voyage",
    sourceTitle: "Darwin Correspondence Project · Путешествие",
    atlas: "/theory",
  },
  exchange: {
    topic: "Поток генов",
    title: "Признаки путешествуют вместе с жителями",
    text: "Переселенцы приносят свои наследуемые варианты в другую популяцию. Если они оставляют потомков, эти варианты могут войти в её состав.",
    ...flow,
  },
};
