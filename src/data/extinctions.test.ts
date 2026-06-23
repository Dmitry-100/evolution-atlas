import { describe, expect, it } from "vitest";
import { MASS_EXTINCTIONS } from "./extinctions";

describe("mass extinction data", () => {
  it("tracks six biodiversity crises and keeps the modern crisis sourced", () => {
    expect(MASS_EXTINCTIONS).toHaveLength(6);
    expect(MASS_EXTINCTIONS.at(-1)?.id).toBe("holocene-anthropocene");
    expect(MASS_EXTINCTIONS.at(-1)?.windowRu).toBe("сейчас");
    expect(MASS_EXTINCTIONS.at(-1)?.sources.length).toBeGreaterThanOrEqual(3);
    expect(MASS_EXTINCTIONS.at(-1)?.image.src).toMatch(
      /^\/assets\/images\/extinctions\//,
    );
    expect(MASS_EXTINCTIONS.at(-1)?.pageImage.src).toMatch(
      /^\/assets\/images\/extinctions\/portrait\//,
    );
    expect(MASS_EXTINCTIONS.every((event) => event.tempoRu.length > 40)).toBe(
      true,
    );
  });

  it("keeps vertical page art separate from shared extinction images", () => {
    for (const event of MASS_EXTINCTIONS) {
      expect(event.pageImage.src).toMatch(
        /^\/assets\/images\/extinctions\/portrait\/.+\.jpg$/,
      );
      expect(event.image.src).not.toContain("/portrait/");
      expect(event.pageImage.altRu).toContain("Вертикальная AI-реконструкция");
    }
  });

  it("marks the available replacement art as generated scene reconstructions", () => {
    const sceneReconstructionIds = [
      "ordovician-silurian",
      "cretaceous-paleogene",
    ];

    for (const id of sceneReconstructionIds) {
      const event = MASS_EXTINCTIONS.find((candidate) => candidate.id === id);

      expect(event?.image.altRu).toContain("AI-реконструкция");
      expect(event?.image.creditRu).toContain("AI-реконструкция");
      expect(event?.image.creditRu).not.toMatch(/слайд/i);
    }
  });
});
