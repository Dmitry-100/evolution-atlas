import { describe, expect, it } from "vitest";
import { createRasterAssetManifest } from "../../scripts/asset-manifest.mjs";

describe("build-time raster manifest", () => {
  it("versions app rasters while leaving social previews stable", () => {
    const manifest = createRasterAssetManifest("public");

    expect(
      manifest["/assets/images/cladogram/tree-of-life-poster.avif"],
    ).toMatch(/tree-of-life-poster\.[a-f0-9]{12}\.avif$/);
    expect(
      manifest["/assets/images/cladogram/tree-of-life-poster.png"],
    ).toMatch(/tree-of-life-poster\.[a-f0-9]{12}\.png$/);
    expect(
      manifest["/assets/images/social/evolution-atlas-preview-v2.jpg"],
    ).toBeUndefined();
  });
});
