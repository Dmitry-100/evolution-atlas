import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OptimizedImage } from "./optimized-image";

describe("OptimizedImage", () => {
  it("emits AVIF first with a raster fallback", () => {
    const html = renderToStaticMarkup(
      createElement(OptimizedImage, {
        src: "/assets/images/source-backed/generated-atlas/early-animals.jpg",
        alt: "Early animals",
      }),
    );

    expect(html).toContain('type="image/avif"');
    expect(html).toContain("early-animals.avif");
    expect(html).toContain("early-animals.jpg");
  });
});
