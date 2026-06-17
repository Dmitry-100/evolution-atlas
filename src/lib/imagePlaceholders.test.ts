import { describe, expect, it } from "vitest";
import { getImagePlaceholder } from "./imagePlaceholders";

describe("image placeholders", () => {
  it("returns stable gradient placeholders by image kind", () => {
    expect(getImagePlaceholder("source-backed")).toContain("radial-gradient");
    expect(getImagePlaceholder("generated-reconstruction")).toContain("rgba");
    expect(getImagePlaceholder("local-plate")).not.toBe(getImagePlaceholder("source-backed"));
  });
});
