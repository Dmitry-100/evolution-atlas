import { describe, expect, it } from "vitest";
import { getImagePlaceholder, getOptimizedImageSrc } from "./imagePlaceholders";

describe("image placeholders", () => {
  it("returns stable gradient placeholders by image kind", () => {
    expect(getImagePlaceholder("source-backed")).toContain("radial-gradient");
    expect(getImagePlaceholder("generated-reconstruction")).toContain("rgba");
    expect(getImagePlaceholder("local-plate")).not.toBe(
      getImagePlaceholder("source-backed"),
    );
  });

  it("maps local raster assets to neighboring AVIF variants", () => {
    expect(
      getOptimizedImageSrc("/assets/images/source-backed/protocells.jpg"),
    ).toBe("/assets/images/source-backed/protocells.avif");
    expect(
      getOptimizedImageSrc(
        "/assets/images/source-backed/generated-neanderthal.png",
      ),
    ).toBe("/assets/images/source-backed/generated-neanderthal.avif");
    expect(getOptimizedImageSrc("/assets/brand/portal-logo-mark.png")).toBe(
      "/assets/brand/portal-logo-mark.avif",
    );
    expect(
      getOptimizedImageSrc(
        "/assets/images/source-backed/denisovan-reconstruction.webp",
      ),
    ).toBe("/assets/images/source-backed/denisovan-reconstruction.avif");
    expect(getOptimizedImageSrc("/assets/brand/icon.svg")).toBeNull();
    expect(getOptimizedImageSrc("/assets/materials/example-cover.jpg")).toBe(
      "/assets/materials/example-cover.avif",
    );
    expect(getOptimizedImageSrc("https://example.com/specimen.jpg")).toBeNull();
  });
});
