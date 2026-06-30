import { describe, expect, it } from "vitest";

import atlasPageSource from "./AtlasPage.tsx?raw";
import cladogramPageSource from "./CladogramPage.tsx?raw";
import materialsPageSource from "./MaterialsPage.tsx?raw";

describe("tree of life poster placement", () => {
  it("keeps the poster in cladogram and materials without adding it to the home page", () => {
    expect(cladogramPageSource).toContain("TREE_OF_LIFE_POSTER");
    expect(cladogramPageSource).toContain("Обзорная карта дерева жизни");
    expect(cladogramPageSource).toContain("Рассмотреть постер");
    expect(cladogramPageSource).toContain("tree-of-life-poster is-compact");

    expect(atlasPageSource).not.toContain("TREE_OF_LIFE_POSTER");
    expect(atlasPageSource).toContain("Открыть дерево");

    expect(materialsPageSource).toContain("TREE_OF_LIFE_POSTER");
    expect(materialsPageSource).toContain("poster-download-card is-compact");
    expect(materialsPageSource).toContain("Скачать постер");
    expect(materialsPageSource).toContain("download={TREE_OF_LIFE_POSTER.downloadName}");
  });
});
