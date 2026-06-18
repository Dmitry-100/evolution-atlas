import { Dna, Eye, FlaskConical, Globe2, Microscope, Shell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type EvidenceModule = {
  id: string;
  titleRu: string;
  summaryRu: string;
  exampleRu: string;
  source: {
    label: string;
    url: string;
  };
  icon: LucideIcon;
};

export const SCIENTIFIC_THEORY_EXPLAINER = {
  titleRu: "Почему это называется теорией",
  bodyRu:
    "В науке теория - это не бытовая догадка, а проверяемая объяснительная система, которая связывает много независимых фактов, делает предсказания и остается открытой для новых проверок. Эволюционная теория объясняет, как наследственные признаки меняются в популяциях и почему разные линии жизни образуют ветвящееся родство.",
  source: {
    label: "National Academies: Evolution Resources",
    url: "https://www.nationalacademies.org/evolution-resources",
  },
};

export const EVIDENCE_MODULES: EvidenceModule[] = [
  {
    id: "fossils",
    titleRu: "Ископаемые",
    summaryRu:
      "Слои пород сохраняют последовательность форм: рыбы появляются раньше четвероногих, ранние млекопитающие раньше приматов, а переходные формы занимают ожидаемые места.",
    exampleRu: "Tiktaalik показывает смесь рыбьих и четвероногих признаков в девонских слоях.",
    source: {
      label: "National Academies: Evidence Supporting Biological Evolution",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK230201/",
    },
    icon: Shell,
  },
  {
    id: "molecular",
    titleRu: "Молекулярные данные",
    summaryRu:
      "ДНК хранит историю родства: близкие виды имеют больше общих последовательностей, а независимые гены обычно дают согласующееся дерево происхождения.",
    exampleRu: "Геномы человека и других человекообразных обезьян совпадают настолько близко, как и предсказывает общее происхождение.",
    source: {
      label: "Understanding Evolution: Lines of Evidence",
      url: "https://evolution.berkeley.edu/lines-of-evidence/",
    },
    icon: Dna,
  },
  {
    id: "comparative-anatomy",
    titleRu: "Сравнительная анатомия",
    summaryRu:
      "Одни и те же планы строения повторяются в разных линиях: кости нашей руки соответствуют костям крыла, плавника или лапы, хотя функции различаются.",
    exampleRu: "Плечо, предплечье, запястье и пальцы у позвоночных менялись, но сохраняли общий план.",
    source: {
      label: "Understanding Evolution: Lines of Evidence",
      url: "https://evolution.berkeley.edu/lines-of-evidence/",
    },
    icon: Eye,
  },
  {
    id: "embryology",
    titleRu: "Эмбриология",
    summaryRu:
      "Раннее развитие показывает глубоко общие программы построения тела: родственные животные используют похожие гены и этапы, затем расходятся в деталях.",
    exampleRu: "У позвоночных в развитии повторяются дуги, сегментация и общие осевые структуры.",
    source: {
      label: "Understanding Evolution: Lines of Evidence",
      url: "https://evolution.berkeley.edu/lines-of-evidence/",
    },
    icon: FlaskConical,
  },
  {
    id: "biogeography",
    titleRu: "Биогеография",
    summaryRu:
      "Распределение видов по планете несет след истории материков, островов и расселения: близкие виды часто живут рядом или на связанных территориях.",
    exampleRu: "Островные фауны часто образуют локальные ветви, похожие на ближайших материковых родственников.",
    source: {
      label: "Understanding Evolution: Lines of Evidence",
      url: "https://evolution.berkeley.edu/lines-of-evidence/",
    },
    icon: Globe2,
  },
  {
    id: "observed-evolution",
    titleRu: "Наблюдаемая эволюция",
    summaryRu:
      "Изменения наследственных признаков можно наблюдать напрямую: у бактерий, вирусов, насекомых, лабораторных популяций и видов под сильным отбором.",
    exampleRu: "Устойчивость бактерий к антибиотикам показывает отбор наследственных вариантов в реальном времени.",
    source: {
      label: "National Academies: Evolution Resources",
      url: "https://www.nationalacademies.org/evolution-resources",
    },
    icon: Microscope,
  },
];
