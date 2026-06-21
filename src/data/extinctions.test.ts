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
  });
});
