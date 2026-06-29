import { describe, expect, it } from "vitest";

import cladogramPanelCopy from "../components/atlas/CladogramPanel.tsx?raw";
import atlasPageCopy from "../pages/AtlasPage.tsx?raw";
import bodyMapPageCopy from "../pages/BodyMapPage.tsx?raw";
import cladogramPageCopy from "../pages/CladogramPage.tsx?raw";
import dinosaursPageCopy from "../pages/DinosaursPage.tsx?raw";
import extinctionsPageCopy from "../pages/ExtinctionsPage.tsx?raw";
import geneticsPageCopy from "../pages/GeneticsPage.tsx?raw";
import materialsPageCopy from "../pages/MaterialsPage.tsx?raw";
import originOfLifePageCopy from "../pages/OriginOfLifePage.tsx?raw";
import primatesPageCopy from "../pages/PrimatesPage.tsx?raw";
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
import cladogramCopy from "../lib/cladogram.ts?raw";

function readActiveCopy() {
  return [
    cladogramPanelCopy,
    extinctionsCopy,
    geneticsCopy,
    lineageCopy,
    materialsCopy,
    quizCopy,
    curiosityFactsCopy,
    humanOriginsCopy,
    lucaCopy,
    cladogramCopy,
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
    expect(copy).toContain("Выбранный маршрут показывает ветвь");
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
      "Пять музейных слоев показывают",
      "Здесь собраны изображения",
      "Здесь собраны обзорные",
      "Не просто сходство, а следы событий",
      "Короткие факты, которые показывают эволюцию как сеть",
    ];

    const foundRetiredPhrases = retiredPhrases.filter((phrase) =>
      copy.includes(phrase),
    );

    expect(foundRetiredPhrases).toEqual([]);
  });
});
