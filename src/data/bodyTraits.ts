import type { ConfidenceLevel } from "./confidence";
import type { EvolutionStage } from "./lineage";

export type BodyTraitLayerId =
  | "cells-energy"
  | "body-plan"
  | "movement"
  | "senses"
  | "brain-social";

export type BodyTraitAnchor = {
  x: number;
  y: number;
};

export type BodyTraitLayer = {
  id: BodyTraitLayerId;
  titleRu: string;
  shortTitleRu: string;
  descriptionRu: string;
  image: {
    src: string;
    altRu: string;
  };
};

export type BodyTrait = {
  id: string;
  layerId: BodyTraitLayerId;
  stageId: EvolutionStage["id"];
  traitRu: string;
  titleRu: string;
  noteRu: string;
  anchor: BodyTraitAnchor;
  confidence: ConfidenceLevel;
};

export const BODY_TRAIT_LAYERS: BodyTraitLayer[] = [
  {
    id: "cells-energy",
    titleRu: "Клетки и энергия",
    shortTitleRu: "Клетка",
    descriptionRu:
      "Древнейшие клеточные решения: мембраны, обмен веществ, наследование, ядро и митохондрии.",
    image: {
      src: "/assets/images/traits/cell-energy.png",
      altRu:
        "Музейная схема эукариотической клетки с ядром, митохондриями и внутренними структурами.",
    },
  },
  {
    id: "body-plan",
    titleRu: "План тела",
    shortTitleRu: "Тело",
    descriptionRu:
      "Ось тела, череп, позвоночник, челюсти, конечности и защищенное развитие на суше.",
    image: {
      src: "/assets/images/traits/body-plan.png",
      altRu:
        "Музейная схема человеческого скелета и общего плана тела на темном фоне.",
    },
  },
  {
    id: "movement",
    titleRu: "Движение",
    shortTitleRu: "Движение",
    descriptionRu:
      "От парных придатков и пальцев к плечу, тазу, стопе, двуногости и выносливой ходьбе.",
    image: {
      src: "/assets/images/traits/movement.png",
      altRu:
        "Музейная схема человеческой походки с выделенным скелетом и траекториями движения.",
    },
  },
  {
    id: "senses",
    titleRu: "Органы чувств",
    shortTitleRu: "Чувства",
    descriptionRu:
      "Черты, которые усилили ориентацию в мире: органы чувств, слух, зрение и мозговая обработка сигналов.",
    image: {
      src: "/assets/images/traits/senses.png",
      altRu:
        "Музейная схема головы человека с глазами, ухом, мозгом и нервными связями.",
    },
  },
  {
    id: "brain-social",
    titleRu: "Мозг и социальность",
    shortTitleRu: "Мозг",
    descriptionRu:
      "Поздние человеческие усилители: обучение, орудия, забота, язык, символы и культура.",
    image: {
      src: "/assets/images/traits/brain-social.png",
      altRu:
        "Музейная схема головы и мозга с социальными сценами, орудиями и символами культуры.",
    },
  },
];

export const BODY_TRAITS: BodyTrait[] = [
  {
    id: "cells-membranes",
    layerId: "cells-energy",
    stageId: "cell-lines",
    traitRu: "мембраны",
    titleRu: "Мембраны",
    noteRu:
      "Предковый узел ранней клеточной жизни дал границу между внутренней химией и внешней средой.",
    anchor: { x: 83, y: 42 },
    confidence: "solid",
  },
  {
    id: "cells-metabolism",
    layerId: "cells-energy",
    stageId: "cell-lines",
    traitRu: "обмен веществ",
    titleRu: "Обмен веществ",
    noteRu:
      "Клеточные линии закрепили поток реакций, который превращает энергию и вещества в поддержание жизни.",
    anchor: { x: 35, y: 67 },
    confidence: "solid",
  },
  {
    id: "cells-heritable-information",
    layerId: "cells-energy",
    stageId: "cell-lines",
    traitRu: "наследуемая информация",
    titleRu: "Наследуемая информация",
    noteRu:
      "С этого узла удачные варианты могли копироваться и становиться материалом для естественного отбора.",
    anchor: { x: 39, y: 55 },
    confidence: "solid",
  },
  {
    id: "cells-dna-rna",
    layerId: "cells-energy",
    stageId: "prokaryotes",
    traitRu: "ДНК/РНК-механизмы",
    titleRu: "ДНК/РНК-механизмы",
    noteRu:
      "Прокариотический уровень показывает древний молекулярный язык копирования и чтения наследственной информации.",
    anchor: { x: 58, y: 36 },
    confidence: "solid",
  },
  {
    id: "cells-ribosomes",
    layerId: "cells-energy",
    stageId: "prokaryotes",
    traitRu: "рибосомы",
    titleRu: "Рибосомы",
    noteRu:
      "Рибосомы связывают наследственную запись с белками и остаются одной из самых древних машин клетки.",
    anchor: { x: 66, y: 27 },
    confidence: "solid",
  },
  {
    id: "cells-oxygen",
    layerId: "cells-energy",
    stageId: "cyanobacteria",
    traitRu: "кислородная атмосфера",
    titleRu: "Кислородная атмосфера",
    noteRu:
      "Цианобактериальный узел изменил планету: кислород позже сделал возможной энергозатратную сложную жизнь.",
    anchor: { x: 23, y: 46 },
    confidence: "solid",
  },
  {
    id: "cells-nucleus",
    layerId: "cells-energy",
    stageId: "eukaryotes",
    traitRu: "ядро",
    titleRu: "Ядро",
    noteRu:
      "Эукариотическая клетка отделила хранение наследственной инструкции от остальной внутренней работы клетки.",
    anchor: { x: 52, y: 50 },
    confidence: "solid",
  },
  {
    id: "cells-mitochondria",
    layerId: "cells-energy",
    stageId: "eukaryotes",
    traitRu: "митохондрии",
    titleRu: "Митохондрии",
    noteRu:
      "Митохондрии дали эукариотам энергетический запас для будущих крупных тел, тканей и активного поведения.",
    anchor: { x: 74, y: 68 },
    confidence: "solid",
  },
  {
    id: "body-bilateral-symmetry",
    layerId: "body-plan",
    stageId: "bilaterians",
    traitRu: "двусторонняя симметрия",
    titleRu: "Двусторонняя симметрия",
    noteRu:
      "У двусторонних животных закрепилась логика левой и правой сторон, переда и зада будущего тела.",
    anchor: { x: 39, y: 55 },
    confidence: "solid",
  },
  {
    id: "body-anterior",
    layerId: "body-plan",
    stageId: "bilaterians",
    traitRu: "передний отдел тела",
    titleRu: "Передний отдел тела",
    noteRu:
      "Предковый узел Bilateria усилил направление движения и концентрацию органов чувств спереди.",
    anchor: { x: 41, y: 13 },
    confidence: "solid",
  },
  {
    id: "body-notochord",
    layerId: "body-plan",
    stageId: "chordates",
    traitRu: "хорда",
    titleRu: "Хорда",
    noteRu:
      "Ранние хордовые дали внутреннюю ось тела, на которой позже строились позвоночник и мускулатура.",
    anchor: { x: 50, y: 48 },
    confidence: "solid",
  },
  {
    id: "body-neural-tube",
    layerId: "body-plan",
    stageId: "chordates",
    traitRu: "нервная трубка",
    titleRu: "Нервная трубка",
    noteRu:
      "У хордовых нервная система получила дорсальную трубчатую организацию, важную для позвоночного плана.",
    anchor: { x: 45, y: 25 },
    confidence: "solid",
  },
  {
    id: "body-skull",
    layerId: "body-plan",
    stageId: "vertebrates",
    traitRu: "череп",
    titleRu: "Череп",
    noteRu:
      "Позвоночные закрепили защиту переднего отдела нервной системы и органов чувств в черепе.",
    anchor: { x: 55, y: 9 },
    confidence: "solid",
  },
  {
    id: "body-vertebral-axis",
    layerId: "body-plan",
    stageId: "vertebrates",
    traitRu: "позвоночная ось",
    titleRu: "Позвоночная ось",
    noteRu:
      "Позвоночная ось стала прочной внутренней опорой, вокруг которой перестраивалось движение тела.",
    anchor: { x: 61, y: 40 },
    confidence: "solid",
  },
  {
    id: "body-jaws",
    layerId: "body-plan",
    stageId: "jawed-fish",
    traitRu: "челюсти",
    titleRu: "Челюсти",
    noteRu:
      "Челюстные рыбы закрепили новый способ питания, а вместе с ним будущую архитектуру лица и зубов.",
    anchor: { x: 65, y: 19 },
    confidence: "solid",
  },
  {
    id: "body-four-limbs",
    layerId: "body-plan",
    stageId: "tetrapods",
    traitRu: "четыре конечности",
    titleRu: "Четыре конечности",
    noteRu:
      "У четвероногих парные придатки превратились в план конечностей, узнаваемый в руках и ногах человека.",
    anchor: { x: 38, y: 43 },
    confidence: "solid",
  },
  {
    id: "body-lungs",
    layerId: "body-plan",
    stageId: "tetrapods",
    traitRu: "легочное дыхание",
    titleRu: "Легочное дыхание",
    noteRu:
      "Переход к наземной жизни сделал дыхание воздухом частью наследия нашей позвоночной линии.",
    anchor: { x: 58, y: 28 },
    confidence: "solid",
  },
  {
    id: "body-embryonic-membranes",
    layerId: "body-plan",
    stageId: "amniotes",
    traitRu: "эмбриональные оболочки",
    titleRu: "Эмбриональные оболочки",
    noteRu:
      "Амниоты сделали развитие эмбриона более защищенным и менее зависимым от внешней воды.",
    anchor: { x: 50, y: 62 },
    confidence: "solid",
  },
  {
    id: "move-paired-appendages",
    layerId: "movement",
    stageId: "jawed-fish",
    traitRu: "парные придатки",
    titleRu: "Парные придатки",
    noteRu:
      "Челюстные рыбы уже имели парные придатки, из которых глубоко позже перестраивались конечности.",
    anchor: { x: 52, y: 43 },
    confidence: "solid",
  },
  {
    id: "move-shoulder-girdle",
    layerId: "movement",
    stageId: "lobe-finned",
    traitRu: "плечевой пояс",
    titleRu: "Плечевой пояс",
    noteRu:
      "У лопастеперых усиливалась внутренняя опора плавников, предвосхищающая механику плеча.",
    anchor: { x: 48, y: 31 },
    confidence: "solid",
  },
  {
    id: "move-elbow-pattern",
    layerId: "movement",
    stageId: "lobe-finned",
    traitRu: "локтевая схема",
    titleRu: "Локтевая схема",
    noteRu:
      "Кости мясистого плавника дают далекий прообраз того, что в конечности станет плечом и локтем.",
    anchor: { x: 38, y: 45 },
    confidence: "solid",
  },
  {
    id: "move-wrist-buds",
    layerId: "movement",
    stageId: "lobe-finned",
    traitRu: "зачатки запястья",
    titleRu: "Зачатки запястья",
    noteRu:
      "Дистальные элементы плавника показывают, что кисть собиралась путем перестройки старой конструкции.",
    anchor: { x: 28, y: 51 },
    confidence: "solid",
  },
  {
    id: "move-neck",
    layerId: "movement",
    stageId: "tiktaalik",
    traitRu: "подвижная шея",
    titleRu: "Подвижная шея",
    noteRu:
      "Формы вроде Tiktaalik показывают отделение головы от плечевого пояса и новую механику движения.",
    anchor: { x: 55, y: 20 },
    confidence: "solid",
  },
  {
    id: "move-fingers",
    layerId: "movement",
    stageId: "tetrapods",
    traitRu: "пальцы",
    titleRu: "Пальцы",
    noteRu:
      "У четвероногих пальцы стали частью нового способа опоры и перемещения на мелководьях и суше.",
    anchor: { x: 39, y: 60 },
    confidence: "solid",
  },
  {
    id: "move-pelvis",
    layerId: "movement",
    stageId: "hominins",
    traitRu: "изменения таза",
    titleRu: "Изменения таза",
    noteRu:
      "Ранние гоминины начали перестраивать таз под новую походку после расхождения с соседними ветвями.",
    anchor: { x: 50, y: 55 },
    confidence: "likely",
  },
  {
    id: "move-bipedalism",
    layerId: "movement",
    stageId: "australopithecus",
    traitRu: "двуногая походка",
    titleRu: "Двуногая походка",
    noteRu:
      "У австралопитеков прямохождение уже стало устойчивой частью тела, раньше резкого роста мозга.",
    anchor: { x: 51, y: 77 },
    confidence: "solid",
  },
  {
    id: "move-foot",
    layerId: "movement",
    stageId: "australopithecus",
    traitRu: "измененная стопа",
    titleRu: "Измененная стопа",
    noteRu:
      "Стопа перестраивалась под регулярную двуногую ходьбу, сохраняя следы более древней истории конечностей.",
    anchor: { x: 59, y: 91 },
    confidence: "solid",
  },
  {
    id: "move-endurance",
    layerId: "movement",
    stageId: "erectus",
    traitRu: "выносливость",
    titleRu: "Выносливость",
    noteRu:
      "Homo erectus показывает человеческое тело как машину дальних переходов и жизни в разных ландшафтах.",
    anchor: { x: 56, y: 65 },
    confidence: "likely",
  },
  {
    id: "senses-complex-organs",
    layerId: "senses",
    stageId: "vertebrates",
    traitRu: "сложные органы чувств",
    titleRu: "Сложные органы чувств",
    noteRu:
      "У позвоночных органы чувств и передний отдел нервной системы стали сильнее связаны с активным движением.",
    anchor: { x: 46, y: 24 },
    confidence: "solid",
  },
  {
    id: "senses-ear-bones",
    layerId: "senses",
    stageId: "mammals",
    traitRu: "слуховые косточки",
    titleRu: "Слуховые косточки",
    noteRu:
      "Млекопитающие превратили элементы древней челюстной системы в тонкий механизм среднего уха.",
    anchor: { x: 68, y: 38 },
    confidence: "solid",
  },
  {
    id: "senses-daytime",
    layerId: "senses",
    stageId: "anthropoids",
    traitRu: "дневная активность",
    titleRu: "Дневная активность",
    noteRu:
      "Антропоидная ветвь усилила дневной образ жизни, где зрение и социальные сигналы стали особенно важны.",
    anchor: { x: 26, y: 43 },
    confidence: "likely",
  },
  {
    id: "senses-social-vision",
    layerId: "senses",
    stageId: "anthropoids",
    traitRu: "социальное зрение",
    titleRu: "Социальное зрение",
    noteRu:
      "У антропоидов зрение обслуживало не только поиск пищи, но и чтение сложной социальной среды.",
    anchor: { x: 38, y: 35 },
    confidence: "likely",
  },
  {
    id: "senses-larger-brain",
    layerId: "senses",
    stageId: "anthropoids",
    traitRu: "крупнее мозг",
    titleRu: "Крупнее мозг",
    noteRu:
      "Рост мозга в антропоидной линии связан с обработкой зрения, поведения и более сложных задач.",
    anchor: { x: 58, y: 22 },
    confidence: "likely",
  },
  {
    id: "brain-brain-growth",
    layerId: "brain-social",
    stageId: "early-homo",
    traitRu: "рост мозга",
    titleRu: "Рост мозга",
    noteRu:
      "Ранний Homo усиливает мозговую часть истории, хотя современное человеческое мышление еще впереди.",
    anchor: { x: 48, y: 35 },
    confidence: "likely",
  },
  {
    id: "brain-stone-tools",
    layerId: "brain-social",
    stageId: "early-homo",
    traitRu: "каменные орудия",
    titleRu: "Каменные орудия",
    noteRu:
      "Орудия показывают связь руки, мозга и обучения: поведение начинает становиться культурной силой.",
    anchor: { x: 24, y: 55 },
    confidence: "solid",
  },
  {
    id: "brain-long-childhood",
    layerId: "brain-social",
    stageId: "early-apes",
    traitRu: "длительное детство",
    titleRu: "Длительное детство",
    noteRu:
      "У человекообразных больше времени уходит на рост и обучение, что повышает цену социальной среды.",
    anchor: { x: 78, y: 17 },
    confidence: "likely",
  },
  {
    id: "brain-long-learning",
    layerId: "brain-social",
    stageId: "great-apes",
    traitRu: "длительное обучение",
    titleRu: "Длительное обучение",
    noteRu:
      "Большие человекообразные делают обучение в группе важной частью взросления и поведения.",
    anchor: { x: 57, y: 13 },
    confidence: "likely",
  },
  {
    id: "brain-complex-sociality",
    layerId: "brain-social",
    stageId: "great-apes",
    traitRu: "сложная социальность",
    titleRu: "Сложная социальность",
    noteRu:
      "Семейство больших человекообразных показывает, что социальная сложность старше нашего вида.",
    anchor: { x: 40, y: 15 },
    confidence: "likely",
  },
  {
    id: "brain-social-complexity",
    layerId: "brain-social",
    stageId: "catarrhini",
    traitRu: "социальная сложность",
    titleRu: "Социальная сложность",
    noteRu:
      "Узконосые обезьяны и человекообразные наследуют социальные задачи, которые продолжают усложняться.",
    anchor: { x: 66, y: 84 },
    confidence: "likely",
  },
  {
    id: "brain-collective-hunting",
    layerId: "brain-social",
    stageId: "heidelbergensis",
    traitRu: "коллективная охота",
    titleRu: "Коллективная охота",
    noteRu:
      "Поздние человеческие линии показывают координацию, планирование и совместную добычу крупной пищи.",
    anchor: { x: 50, y: 82 },
    confidence: "likely",
  },
  {
    id: "brain-care",
    layerId: "brain-social",
    stageId: "heidelbergensis",
    traitRu: "забота о слабых",
    titleRu: "Забота о слабых",
    noteRu:
      "Забота внутри группы показывает, что социальность стала частью выживания, а не украшением поведения.",
    anchor: { x: 60, y: 75 },
    confidence: "likely",
  },
  {
    id: "brain-language",
    layerId: "brain-social",
    stageId: "sapiens",
    traitRu: "язык",
    titleRu: "Язык",
    noteRu:
      "У Homo sapiens речь стала мощным способом передавать опыт быстрее, чем меняются гены.",
    anchor: { x: 61, y: 42 },
    confidence: "solid",
  },
  {
    id: "brain-symbols",
    layerId: "brain-social",
    stageId: "sapiens",
    traitRu: "символическое мышление",
    titleRu: "Символическое мышление",
    noteRu:
      "Символы позволяют связывать людей вокруг образов, правил и историй, которых нет прямо перед глазами.",
    anchor: { x: 72, y: 58 },
    confidence: "solid",
  },
  {
    id: "brain-collective-learning",
    layerId: "brain-social",
    stageId: "sapiens",
    traitRu: "коллективное обучение",
    titleRu: "Коллективное обучение",
    noteRu:
      "Коллективное обучение делает культуру накопителем опыта, который переживает отдельные поколения.",
    anchor: { x: 51, y: 24 },
    confidence: "solid",
  },
];

export function getBodyTraitLayer(layerId: BodyTraitLayerId) {
  return BODY_TRAIT_LAYERS.find((layer) => layer.id === layerId);
}

export function getBodyTraitsByLayer(layerId: BodyTraitLayerId) {
  return BODY_TRAITS.filter((trait) => trait.layerId === layerId);
}
