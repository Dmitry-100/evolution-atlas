import { describe, expect, it } from "vitest";

import cladogramPanelCopy from "../components/atlas/CladogramPanel.tsx?raw";
import deepTimeAxisCopy from "../components/atlas/DeepTimeAxis.tsx?raw";
import eraNavigationCopy from "../components/atlas/EraNavigation.tsx?raw";
import journeyControlsCopy from "../components/atlas/JourneyControls.tsx?raw";
import quizPanelCopy from "../components/atlas/QuizPanel.tsx?raw";
import stageDetailCardCopy from "../components/atlas/StageDetailCard.tsx?raw";
import traitAccumulatorCopy from "../components/atlas/TraitAccumulator.tsx?raw";
import mobileStageDetailCopy from "../components/atlas/mobile/MobileStageDetail.tsx?raw";
import atlasPageCopy from "../pages/AtlasPage.tsx?raw";
import bodyMapPageCopy from "../pages/BodyMapPage.tsx?raw";
import cladogramPageCopy from "../pages/CladogramPage.tsx?raw";
import dinosaursPageCopy from "../pages/DinosaursPage.tsx?raw";
import extinctionsPageCopy from "../pages/ExtinctionsPage.tsx?raw";
import geneticsPageCopy from "../pages/GeneticsPage.tsx?raw";
import materialsPageCopy from "../pages/MaterialsPage.tsx?raw";
import originOfLifePageCopy from "../pages/OriginOfLifePage.tsx?raw";
import primatesPageCopy from "../pages/PrimatesPage.tsx?raw";
import quizPageCopy from "../pages/QuizPage.tsx?raw";
import sourcesPageCopy from "../pages/SourcesPage.tsx?raw";
import theoryPageCopy from "../pages/TheoryPage.tsx?raw";
import curiosityFactsComponentCopy from "../components/education/CuriosityFacts.tsx?raw";
import molecularScarsCopy from "../components/education/MolecularScars.tsx?raw";
import extinctionsCopy from "./extinctions.ts?raw";
import geneticsCopy from "./genetics.ts?raw";
import lineageCopy from "./lineage.ts?raw";
import materialsCopy from "./materials.ts?raw";
import quizCopy from "./quiz.ts?raw";
import curiosityFactsCopy from "./curiosityFacts.ts?raw";
import humanOriginsCopy from "./humanOrigins.ts?raw";
import lucaCopy from "./luca.ts?raw";
import guidedTourCopy from "./guidedTour.ts?raw";
import cladogramCopy from "../lib/cladogram.ts?raw";
import buildTourRouteCopy from "../lib/buildTourRoute.ts?raw";

function readActiveCopy() {
  return [
    cladogramPanelCopy,
    deepTimeAxisCopy,
    eraNavigationCopy,
    journeyControlsCopy,
    quizPanelCopy,
    stageDetailCardCopy,
    traitAccumulatorCopy,
    mobileStageDetailCopy,
    extinctionsCopy,
    geneticsCopy,
    lineageCopy,
    materialsCopy,
    quizCopy,
    curiosityFactsCopy,
    humanOriginsCopy,
    lucaCopy,
    guidedTourCopy,
    cladogramCopy,
    buildTourRouteCopy,
    atlasPageCopy,
    bodyMapPageCopy,
    cladogramPageCopy,
    curiosityFactsComponentCopy,
    dinosaursPageCopy,
    extinctionsPageCopy,
    geneticsPageCopy,
    materialsPageCopy,
    molecularScarsCopy,
    originOfLifePageCopy,
    primatesPageCopy,
    quizPageCopy,
    sourcesPageCopy,
    theoryPageCopy,
  ].join("\n");
}

describe("editorial science copy", () => {
  it("uses cautious, non-teleological wording for audited science text", () => {
    const copy = readActiveCopy();

    expect(copy).not.toContain("верхушке");
    expect(copy).not.toContain("наша линия выбрала другую ветвь");
    expect(copy).not.toContain("толстый ствол ведет к Homo sapiens");
    expect(copy).not.toContain("Главный ствол к человеку");
    expect(copy).not.toContain("ствол к человеку");
    expect(copy).not.toContain("ископаемым предкам человека");
    expect(copy).not.toContain("Единый язык кодонов");
    expect(copy).not.toContain("Ранние приматы");
    expect(copy).not.toContain("Вероятный общий фон");
    expect(copy).not.toContain("единственный сад Эдема");
    expect(copy).not.toContain("один сад Эдема, где возник Homo sapiens");

    expect(copy).toContain("примерно 99,6-99,9%");
    expect(copy).toContain("напрямую сравнимых участках ДНК");
    expect(copy).toContain("Надежные микрофоссилии и строматолиты");
    expect(copy).toContain("шельфовым и рифовым морским сообществам");
    expect(copy).toContain("Ранние родственники приматов");
    expect(copy).toContain("Один из главных кандидатов");
    expect(copy).toContain("Homo sapiens находится на выделенной ветви");
    expect(copy).toContain("Почти общий язык кодонов");
    expect(copy).toContain("не первый организм");
    expect(copy).toContain("не один сад Эдема");
  });

  it("does not bring back audited repetitive portal phrasing", () => {
    const copy = readActiveCopy();
    const retiredPhrases = [
      "Это напоминание, что шкала показывает",
      "Это ближе к вопросу об обезьянах",
      "У нас не один современный предок среди обезьян",
      "Самый близкий к атласу материал",
      "Хорошо продолжает Атлас:",
      "Хороший мост между Атласом",
      "Хорошо продолжает раздел РНК/ДНК",
      "Лучший московский офлайн-мост",
      "Корректнее представлять LUCA не как одного персонажа",
      "Органика или даже микробы могли попасть на Землю из космоса, но это не решает вопрос",
      "Органика и даже микробы могли попасть на Землю из космоса, но это не решает вопрос",
      "Не лестница прогресса, а дерево родства",
      "Эволюция идет не ровной линией",
      "Вымирание - не «конец жизни»",
      "Вымирание - не “конец жизни”",
      "После кризиса меняется сцена",
      "Здесь собрана поздняя ветвь маршрута",
      "Поздняя ветвь маршрута",
      "Выбранный маршрут показывает ветвь",
      "Эта ось показывает молодую часть дерева родства",
      "Современные обезьяны не являются нашими предками",
      "Это поздняя ветвь маршрута",
      "Последние 66 млн лет вынесены в отдельный раздел",
      "орангутаны не предки человека",
      "современные шимпанзе не являются нашими предками",
      "Отдельная ось приматов показывает молодую сеть",
      "Раздел приматов работает как крупный план",
      "самая молодая часть большой семейной ветки",
      "современные обезьяны не были нашими мамами и папами",
      "Современные обезьяны - не наши родители",
      "Пять музейных слоев показывают",
      "Здесь собраны изображения",
      "Здесь собраны обзорные",
      "Не просто сходство, а следы событий",
      "Короткие факты, которые показывают эволюцию как сеть",
      "Книги, которые хорошо продолжают портал",
      "Музеи, которые продолжают маршрут",
      "Видео и лекции для следующего шага",
      "Фактологическая база по разделам",
      "Один и тот же принцип перевода",
      "Молекулярные сюрпризы",
      "Геном хранит не только сходство, но и историю",
      "Почему это делает эволюцию очевиднее",
      "Неожиданные переходы",
      "Неожиданный поворот",
      "Неожиданный признак",
      "Глобальные вымирания: когда жизнь меняла направление",
      "После кризиса ниши перераспределяются",
      "Не один скачок, а цепочка переходов",
      "Не догадка, а объяснительная система",
      "Мини-квиз",
      "Перья раньше полёта",
      "Перья старше полноценного полета",
      "Геном хранит старые события",
      "Почему это сильное доказательство",
      "Источники по разделам",
      "Куда сходить в Москве",
      "раскрывает те же шесть кризисов",
      "Что почитать дальше",
      "Последние 66 млн лет крупно",
      "Приматы и человек крупно",
      "Молекулы крупно",
      "Мини-лаборатория",
      "Активный слой",
      "Научный слой",
      "Одна ось",
      "Главная мысль",
      "Связанная презентация",
      "Независимая проверка",
      "Почему это сильный довод",
      "От находок к маршрутам",
      "осторожными маршрутами",
      "второй слой атласа",
      "второй слой портала",
      "меняли сцену жизни",
      "где взять сильный пример",
      "где портал осторожничает",
      "работает как рабочий стол",
      "честной формулировки",
      "Здесь удобно объяснить",
      "Отдельная кладограмма показывает",
      "Осторожность:",
      "осторожность в процентах сходства",
      "осторожного объяснения",
      "осторожной датировки",
      "осторожной пан-африканской формулировки",
      "где честнее сказать",
      "честно отделять",
      "увеличение масштаба",
      "плотную научную тропу",
      "Материалы портала можно использовать как второй слой",
      "с которых удобно начать",
      "честный ответ",
      "работает как редкая метка",
      "работает как молекулярная метка",
      "честные границы знания",
    ];

    const foundRetiredPhrases = retiredPhrases.filter((phrase) =>
      copy.includes(phrase),
    );

    expect(foundRetiredPhrases).toEqual([]);
  });

  it("keeps atlas microcopy on the route-era and trait-map vocabulary", () => {
    const copy = readActiveCopy();
    const retiredAtlasPhrases = [
      "Млекопит.",
      "Хордовые и рыбы",
      "Суша и амниоты",
      "Приматы и Homo",
      "Линия млекопитающих",
      "Запустить эволюцию",
      "Поставить эволюцию",
      "Продолжить эволюцию",
      "Накопитель признаков",
      "Унаследованные признаки",
      "Что дошло до нас",
      "Вау-факты",
      "термин:",
    ];

    const foundRetiredPhrases = retiredAtlasPhrases.filter((phrase) =>
      copy.includes(phrase),
    );

    expect(foundRetiredPhrases).toEqual([]);
    expect(copy).toContain("Прокрутка по времени");
    expect(copy).toContain("Карта признаков");
    expect(copy).toContain("Синапсиды");
  });
});
