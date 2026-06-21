import { describe, expect, it } from "vitest";

import cladogramPanelCopy from "../components/atlas/CladogramPanel.tsx?raw";
import atlasPageCopy from "../pages/AtlasPage.tsx?raw";
import cladogramPageCopy from "../pages/CladogramPage.tsx?raw";
import originOfLifePageCopy from "../pages/OriginOfLifePage.tsx?raw";
import extinctionsCopy from "./extinctions.ts?raw";
import geneticsCopy from "./genetics.ts?raw";
import lineageCopy from "./lineage.ts?raw";
import materialsCopy from "./materials.ts?raw";
import quizCopy from "./quiz.ts?raw";
import cladogramCopy from "../lib/cladogram.ts?raw";

function readActiveCopy() {
  return [
    cladogramPanelCopy,
    extinctionsCopy,
    geneticsCopy,
    lineageCopy,
    materialsCopy,
    quizCopy,
    cladogramCopy,
    atlasPageCopy,
    cladogramPageCopy,
    originOfLifePageCopy,
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

    expect(copy).toContain("примерно 99,6-99,9%");
    expect(copy).toContain("напрямую сравнимых участках ДНК");
    expect(copy).toContain("Надежные микрофоссилии и строматолиты");
    expect(copy).toContain("шельфовым и рифовым морским сообществам");
    expect(copy).toContain("Ранние родственники приматов");
    expect(copy).toContain("Один из главных кандидатов");
    expect(copy).toContain("Выбранный маршрут показывает ветвь");
    expect(copy).toContain("Почти общий язык кодонов");
  });
});
