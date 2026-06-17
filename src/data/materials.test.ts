import { describe, expect, it } from "vitest";
import { PORTAL_MATERIALS } from "./materials";

describe("portal materials", () => {
  it("keeps downloadable files away from the /materials SPA route", () => {
    const materialUrls = PORTAL_MATERIALS.flatMap((material) => [
      material.coverSrc,
      material.pdfHref,
      material.pptxHref,
    ]);

    for (const url of materialUrls) {
      expect(url).toMatch(/^\/assets\/materials\//);
      expect(url).not.toMatch(/^\/materials(?:\/|$)/);
    }
  });
});
