import { describe, expect, it } from "vitest";

import appSource from "../App.tsx?raw";
import cladogramPanelSource from "../components/atlas/CladogramPanel.tsx?raw";
import deepTimeAxisSource from "../components/atlas/DeepTimeAxis.tsx?raw";
import mobileStageDetailSource from "../components/atlas/mobile/MobileStageDetail.tsx?raw";
import primateAxisSource from "../components/atlas/PrimateAxis.tsx?raw";
import stageDetailCardSource from "../components/atlas/StageDetailCard.tsx?raw";
import cladogramPageSource from "../pages/CladogramPage.tsx?raw";
import dinosaursPageSource from "../pages/DinosaursPage.tsx?raw";
import extinctionsPageSource from "../pages/ExtinctionsPage.tsx?raw";
import geneticsPageSource from "../pages/GeneticsPage.tsx?raw";
import materialsPageSource from "../pages/MaterialsPage.tsx?raw";
import originOfLifePageSource from "../pages/OriginOfLifePage.tsx?raw";
import sourcesPageSource from "../pages/SourcesPage.tsx?raw";
import theoryPageSource from "../pages/TheoryPage.tsx?raw";

const sourceFiles = [
  ["src/App.tsx", appSource],
  ["src/components/atlas/CladogramPanel.tsx", cladogramPanelSource],
  ["src/components/atlas/DeepTimeAxis.tsx", deepTimeAxisSource],
  [
    "src/components/atlas/mobile/MobileStageDetail.tsx",
    mobileStageDetailSource,
  ],
  ["src/components/atlas/PrimateAxis.tsx", primateAxisSource],
  ["src/components/atlas/StageDetailCard.tsx", stageDetailCardSource],
  ["src/pages/CladogramPage.tsx", cladogramPageSource],
  ["src/pages/DinosaursPage.tsx", dinosaursPageSource],
  ["src/pages/ExtinctionsPage.tsx", extinctionsPageSource],
  ["src/pages/GeneticsPage.tsx", geneticsPageSource],
  ["src/pages/MaterialsPage.tsx", materialsPageSource],
  ["src/pages/OriginOfLifePage.tsx", originOfLifePageSource],
  ["src/pages/SourcesPage.tsx", sourcesPageSource],
  ["src/pages/TheoryPage.tsx", theoryPageSource],
];

describe("image delivery policy", () => {
  it("routes page and atlas images through OptimizedImage", () => {
    const plainImageFiles = sourceFiles
      .filter(([, source]) => source.includes("<img"))
      .map(([file]) => file);

    expect(plainImageFiles).toEqual([]);
  });

  it("does not force optimized raster sources from app surfaces", () => {
    const forcedOptimizedFiles = sourceFiles
      .filter(([, source]) => source.includes("preferOptimized"))
      .map(([file]) => file);

    expect(forcedOptimizedFiles).toEqual([]);
  });
});
