import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OptimizedImage } from "./optimized-image";

describe("OptimizedImage", () => {
  it("emits AVIF sources in the default delivery policy", () => {
    const html = renderToStaticMarkup(
      createElement(OptimizedImage, {
        src: "/assets/images/source-backed/generated-atlas/early-animals.jpg",
        alt: "Early animals",
      }),
    );

    expect(html).toContain(
      'src="/assets/images/source-backed/generated-atlas/early-animals.jpg"',
    );
    expect(html).toContain(
      'srcSet="/assets/images/source-backed/generated-atlas/early-animals.avif"',
    );
    expect(html).toContain('type="image/avif"');
  });
});
