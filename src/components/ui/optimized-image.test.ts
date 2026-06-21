import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OptimizedImage } from "./optimized-image";

describe("OptimizedImage", () => {
  it("does not emit AVIF sources in the default delivery policy", () => {
    const html = renderToStaticMarkup(
      createElement(OptimizedImage, {
        src: "/assets/images/source-backed/generated-atlas/early-animals.jpg",
        alt: "Early animals",
        preferOptimized: true,
      }),
    );

    expect(html).toContain(
      'src="/assets/images/source-backed/generated-atlas/early-animals.jpg"',
    );
    expect(html).not.toContain('type="image/avif"');
  });
});
