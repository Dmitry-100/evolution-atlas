export type ExtinctionSource = {
  label: string;
  url: string;
};

export type MassExtinctionEvent = {
  id: string;
  titleRu: string;
  ageMa: number;
  windowRu: string;
  lossRu: string;
  color: string;
  likelyCausesRu: string[];
  afterRu: string;
  relationRu: string;
  sources: ExtinctionSource[];
};

const source = (label: string, url: string): ExtinctionSource => ({ label, url });

export const MASS_EXTINCTIONS: MassExtinctionEvent[] = [
  {
    id: "ordovician-silurian",
    titleRu: "Ордовикско-силурийское",
    ageMa: 444,
    windowRu: "примерно 444 млн лет назад",
    lossRu: "Исчезла большая часть морских видов; суша тогда еще почти не была заселена животными.",
    color: "#82b7b3",
    likelyCausesRu: ["оледенение", "падение уровня моря", "изменение химии океанов"],
    afterRu: "Морские экосистемы постепенно перестроились, а позвоночные продолжили путь к будущему разнообразию.",
    relationRu: "Наша линия тогда была далека от приматов: речь идет о ранних хордовых и позвоночных в океане.",
    sources: [
      source("Britannica: mass extinction", "https://www.britannica.com/science/mass-extinction"),
      source("Wikipedia: Ordovician-Silurian extinction events", "https://en.wikipedia.org/wiki/Ordovician%E2%80%93Silurian_extinction_events"),
    ],
  },
  {
    id: "late-devonian",
    titleRu: "Позднедевонское",
    ageMa: 372,
    windowRu: "несколько волн около 372-359 млн лет назад",
    lossRu: "Сильно пострадали рифы, морские беспозвоночные и многие группы рыб.",
    color: "#83a8bf",
    likelyCausesRu: ["дефицит кислорода в океане", "климатические колебания", "перестройка наземных экосистем"],
    afterRu: "После кризиса меняется состав рыб и усиливается значение форм, связанных с будущим выходом позвоночных на сушу.",
    relationRu: "Это фон эпохи, в которой появляются переходные формы вроде Tiktaalik и ранние четвероногие.",
    sources: [
      source("Natural History Museum: mass extinctions", "https://www.nhm.ac.uk/discover/what-is-mass-extinction-and-are-we-facing-a-sixth-one.html"),
      source("Wikipedia: Late Devonian extinction", "https://en.wikipedia.org/wiki/Late_Devonian_extinction"),
    ],
  },
  {
    id: "permian-triassic",
    titleRu: "Пермское",
    ageMa: 252,
    windowRu: "примерно 252 млн лет назад",
    lossRu: "Крупнейший известный кризис: исчезла основная часть морских видов и множество наземных групп.",
    color: "#d0a35b",
    likelyCausesRu: ["масштабный вулканизм", "резкое потепление", "закисление и обескислороживание океанов"],
    afterRu: "Мир фактически пересобрался: выжившие линии заняли освободившиеся экологические роли.",
    relationRu: "Линия млекопитающих прошла через этот кризис в составе древних синапсид, задолго до настоящих млекопитающих.",
    sources: [
      source("Smithsonian: End-Permian extinction", "https://naturalhistory.si.edu/education/teaching-resources/paleontology/extinction-over-time/end-permian-extinction"),
      source("Wikipedia: Permian-Triassic extinction event", "https://en.wikipedia.org/wiki/Permian%E2%80%93Triassic_extinction_event"),
    ],
  },
  {
    id: "triassic-jurassic",
    titleRu: "Триасово-юрское",
    ageMa: 201,
    windowRu: "примерно 201 млн лет назад",
    lossRu: "Исчезли многие крупные амфибии, морские рептилии и конкуренты ранних динозавров.",
    color: "#b47d56",
    likelyCausesRu: ["вулканизм Центрально-Атлантической магматической провинции", "парниковый эффект", "изменения океана"],
    afterRu: "Динозавры получили больше пространства, а ранние млекопитающие продолжили существовать небольшими ночными формами.",
    relationRu: "Для нашей линии это важный фильтр выживания: млекопитающие не стали главными сразу, но сохранились.",
    sources: [
      source("National Geographic: mass extinctions", "https://education.nationalgeographic.org/resource/mass-extinction/"),
      source("Wikipedia: Triassic-Jurassic extinction event", "https://en.wikipedia.org/wiki/Triassic%E2%80%93Jurassic_extinction_event"),
    ],
  },
  {
    id: "cretaceous-paleogene",
    titleRu: "Мел-палеогеновое",
    ageMa: 66,
    windowRu: "66 млн лет назад",
    lossRu: "Исчезли нептичьи динозавры и множество морских и наземных видов.",
    color: "#91a96a",
    likelyCausesRu: ["удар астероида", "глобальная пыль и пожары", "дополнительный стресс от вулканизма"],
    afterRu: "Освободились экологические ниши, и млекопитающим стало легче быстро разнообразиться.",
    relationRu: "Именно после этого кризиса начинается тот мир, где приматы получают шанс стать заметной ветвью.",
    sources: [
      source("NASA: Chicxulub impact", "https://science.nasa.gov/solar-system/asteroids/chicxulub-impact-event/"),
      source("Wikipedia: Cretaceous-Paleogene extinction event", "https://en.wikipedia.org/wiki/Cretaceous%E2%80%93Paleogene_extinction_event"),
    ],
  },
];
