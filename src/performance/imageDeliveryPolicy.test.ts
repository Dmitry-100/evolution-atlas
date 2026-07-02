/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";

import appSource from "../App.tsx?raw";
import cladogramPanelSource from "../components/atlas/CladogramPanel.tsx?raw";
import deepTimeAxisSource from "../components/atlas/DeepTimeAxis.tsx?raw";
import mobileStageDetailSource from "../components/atlas/mobile/MobileStageDetail.tsx?raw";
import primateAxisSource from "../components/atlas/PrimateAxis.tsx?raw";
import stageDetailCardSource from "../components/atlas/StageDetailCard.tsx?raw";
import bodyMapPageSource from "../pages/BodyMapPage.tsx?raw";
import cladogramPageSource from "../pages/CladogramPage.tsx?raw";
import dinosaursPageSource from "../pages/DinosaursPage.tsx?raw";
import extinctionsPageSource from "../pages/ExtinctionsPage.tsx?raw";
import geneticsPageSource from "../pages/GeneticsPage.tsx?raw";
import materialsPageSource from "../pages/MaterialsPage.tsx?raw";
import originOfLifePageSource from "../pages/OriginOfLifePage.tsx?raw";
import primatesPageSource from "../pages/PrimatesPage.tsx?raw";
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
  ["src/pages/BodyMapPage.tsx", bodyMapPageSource],
  ["src/pages/CladogramPage.tsx", cladogramPageSource],
  ["src/pages/DinosaursPage.tsx", dinosaursPageSource],
  ["src/pages/ExtinctionsPage.tsx", extinctionsPageSource],
  ["src/pages/GeneticsPage.tsx", geneticsPageSource],
  ["src/pages/MaterialsPage.tsx", materialsPageSource],
  ["src/pages/OriginOfLifePage.tsx", originOfLifePageSource],
  ["src/pages/PrimatesPage.tsx", primatesPageSource],
  ["src/pages/SourcesPage.tsx", sourcesPageSource],
  ["src/pages/TheoryPage.tsx", theoryPageSource],
];

const requiredAvifAssets = [
  "/assets/images/cladogram/tree-of-life-poster.avif",
  "/assets/images/source-backed/denisovan-reconstruction.avif",
  "/assets/images/social/evolution-atlas-preview.avif",
];

describe("image delivery policy", () => {
  it("routes page and atlas images through OptimizedImage", () => {
    const plainImageFiles = sourceFiles
      .filter(([, source]) => source.includes("<img"))
      .map(([file]) => file);

    expect(plainImageFiles).toEqual([]);
  });

  it("does not rely on per-call preferOptimized flags", () => {
    const manualOptimizedFiles = sourceFiles
      .filter(([, source]) => source.includes("preferOptimized"))
      .map(([file]) => file);

    expect(manualOptimizedFiles).toEqual([]);
  });

  it("requires OptimizedImage calls to pass an explicit alt value", () => {
    const implicitAltFiles = sourceFiles
      .filter(([, source]) => /<OptimizedImage(?![^>]*\salt=)/s.test(source))
      .map(([file]) => file);

    expect(implicitAltFiles).toEqual([]);
  });

  it("keeps AVIF companions for large and webp-backed content images", () => {
    const missingAvifAssets = requiredAvifAssets.filter(
      (assetPath) =>
        !existsSync(new URL(`../../public${assetPath}`, import.meta.url)),
    );

    expect(missingAvifAssets).toEqual([]);
  });
});
