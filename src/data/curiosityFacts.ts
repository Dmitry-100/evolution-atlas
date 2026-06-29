import type { ConfidenceLevel } from "./confidence";
import type { SourceRef } from "./lineage";

export type CuriosityFact = {
  id: string;
  titleRu: string;
  shortRu: string;
  detailRu: string;
  sectionHref: string;
  confidence: ConfidenceLevel;
  source: SourceRef;
};

export const CURIOSITY_FACT_PAGE_GROUPS = {
  origin: ["oxygen-waste"],
  genetics: [
    "mitochondria-bacteria",
    "chromosome-2",
    "viral-fossils",
    "mitochondrial-eve",
    "y-chromosomal-adam",
  ],
  cladogram: ["jaw-to-ear", "walking-whales"],
  dinosaurs: ["feathers-before-flight"],
  theory: ["sapiens-last-seconds"],
} as const;

export const CURIOSITY_FACTS: CuriosityFact[] = [
  {
    id: "oxygen-waste",
    titleRu: "Кислород начинался как микробный побочный продукт",
    shortRu: "Цианобактерии изменили атмосферу, и газ, который стал нашим топливом, сначала был планетарным стрессом.",
    detailRu:
      "Кислородный фотосинтез постепенно насытил океаны и атмосферу кислородом. Этот сдвиг часто называют кислородной катастрофой: для многих древних анаэробных систем кислород был токсичным давлением, а для будущей сложной жизни — энергетическим шансом.",
    sectionHref: "/?mode=all&stage=cyanobacteria",
    confidence: "solid",
    source: {
      label: "ASM: Great Oxidation Event",
      url: "https://asm.org/articles/2022/february/the-great-oxidation-event-how-cyanobacteria-change",
    },
  },
  {
    id: "mitochondria-bacteria",
    titleRu: "Митохондрии похожи на бывших бактерий",
    shortRu: "Сложная клетка выросла не только через конкуренцию, но и через древний симбиоз.",
    detailRu:
      "Эндосимбиотическая теория объясняет происхождение митохондрий от бактериальных партнеров внутри ранних эукариотических клеток. Едва ли не главный поворот в истории сложной жизни.",
    sectionHref: "/?mode=all&stage=eukaryotes",
    confidence: "solid",
    source: {
      label: "Nature Scitable: origin of mitochondria",
      url: "https://www.nature.com/scitable/topicpage/the-origin-of-mitochondria-14232356/",
    },
  },
  {
    id: "jaw-to-ear",
    titleRu: "Часть древней челюсти стала слухом",
    shortRu: "У предков млекопитающих элементы задней челюсти постепенно вошли в среднее ухо.",
    detailRu:
      "Эволюция часто перестраивает старые детали под новые функции. У предков млекопитающих это видно по тому, как кости челюсти перешли в среднее ухо.",
    sectionHref: "/?mode=all&stage=cynodonts",
    confidence: "solid",
    source: {
      label: "Understanding Evolution: mammalian ear",
      url: "https://evolution.berkeley.edu/what-are-evograms/the-evolution-of-the-mammalian-ear/",
    },
  },
  {
    id: "chromosome-2",
    titleRu: "Хромосома 2 несет след древнего слияния",
    shortRu: "У человека 23 пары хромосом, а у других больших человекообразных 24; это не разрушает родство, а объясняется событием слияния.",
    detailRu:
      "В человеческой хромосоме 2 обнаруживают признаки, ожидаемые при слиянии двух предковых хромосом. Это работает как молекулярная метка после расхождения ветвей.",
    sectionHref: "/genetics",
    confidence: "solid",
    source: {
      label: "PNAS: origin of human chromosome 2",
      url: "https://www.pnas.org/doi/abs/10.1073/pnas.88.20.9051",
    },
  },
  {
    id: "viral-fossils",
    titleRu: "В геноме есть древние вирусные вставки",
    shortRu: "Некоторые вирусные следы стали наследуемыми метками и помогают сравнивать родственные линии.",
    detailRu:
      "Эндогенные ретровирусы — это древние вставки, которые попали в наследуемую линию и передавались потомкам. Совпадения таких редких вставок полезны для реконструкции родства.",
    sectionHref: "/genetics",
    confidence: "solid",
    source: {
      label: "NCBI Bookshelf: endogenous retroviruses",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK6235/",
    },
  },
  {
    id: "mitochondrial-eve",
    titleRu: "Митохондриальная Ева — не первая женщина",
    shortRu:
      "Это последняя женщина, от которой все современные люди получили митохондриальную ДНК по непрерывной материнской линии.",
    detailRu:
      "Митохондриальная Ева — реконструируемый общий предок только для материнской линии мтДНК. Она жила среди многих людей и не единственная женщина своего времени; просто остальные материнские линии со временем прервались.",
    sectionHref: "/genetics",
    confidence: "likely",
    source: {
      label: "Stanford Medicine: common genetic ancestors",
      url: "https://med.stanford.edu/news/all-news/2013/08/common-genetic-ancestors-lived-during-roughly-same-time-period-scientists-find.html",
    },
  },
  {
    id: "y-chromosomal-adam",
    titleRu: "Y-хромосомный Адам — не пара Евы",
    shortRu:
      "Это последняя непрерывная отцовская линия Y-хромосомы у современных мужчин, а не единственный мужчина прошлого.",
    detailRu:
      "Y-хромосомный Адам — реконструируемый общий предок для мужской отцовской линии Y-хромосомы. Он не был единственным мужчиной, не обязан быть современником митохондриальной Евы и не пара ей: обе метки описывают разные линии наследования.",
    sectionHref: "/genetics",
    confidence: "likely",
    source: {
      label: "Stanford Medicine: common genetic ancestors",
      url: "https://med.stanford.edu/news/all-news/2013/08/common-genetic-ancestors-lived-during-roughly-same-time-period-scientists-find.html",
    },
  },
  {
    id: "walking-whales",
    titleRu: "Киты произошли от наземных млекопитающих",
    shortRu: "Линия наземных зверей вернулась в воду — и сохранила следы прежней жизни на суше.",
    detailRu:
      "Ископаемые вроде Pakicetus и Ambulocetus показывают последовательность переходов от наземных парнокопытных родственников к водной жизни современных китов.",
    sectionHref: "/cladogram",
    confidence: "solid",
    source: {
      label: "Understanding Evolution: whale evolution",
      url: "https://evolution.berkeley.edu/what-are-evograms/the-evolution-of-whales/",
    },
  },
  {
    id: "feathers-before-flight",
    titleRu: "Перья появились раньше полноценного полета",
    shortRu: "Перья могли работать как теплоизоляция, сигнал и элемент поведения до того, как стали частью крыла.",
    detailRu:
      "Пернатые нептичьи динозавры показывают, что признаки птиц собирались постепенно. Полет не был первой и единственной функцией перьев.",
    sectionHref: "/dinosaurs",
    confidence: "solid",
    source: {
      label: "Natural History Museum: dinosaurs to birds",
      url: "https://www.nhm.ac.uk/discover/how-dinosaurs-evolved-into-birds.html",
    },
  },
  {
    id: "sapiens-last-seconds",
    titleRu: "Наш вид появляется в последние секунды",
    shortRu: "Если 4 млрд лет жизни сжать в одни сутки, наш вид появляется почти у самой полуночи.",
    detailRu:
      "На 4-миллиардной шкале 300 тысяч лет — это примерно последние 6–7 секунд суток. Такой масштаб помогает почувствовать, насколько молод Homo sapiens.",
    sectionHref: "/primates?stage=homo-sapiens",
    confidence: "solid",
    source: {
      label: "Smithsonian: Homo sapiens",
      url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
    },
  },
];
