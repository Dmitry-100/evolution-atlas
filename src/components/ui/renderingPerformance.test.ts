import { describe, expect, it } from "vitest";

import etherealInkSource from "./ethereal-ink.tsx?raw";
import scrollProgressSource from "./scroll-progress.tsx?raw";

describe("rendering performance helpers", () => {
  it("keeps scroll progress out of React state", () => {
    expect(scrollProgressSource).not.toContain("useState");
    expect(scrollProgressSource).toContain("useRef");
    expect(scrollProgressSource).toContain("style.transform");
    expect(scrollProgressSource).toContain("{ passive: true }");
  });

  it("defers and pauses the WebGL background", () => {
    expect(etherealInkSource).toContain("requestIdleCallback");
    expect(etherealInkSource).toContain("visibilitychange");
    expect(etherealInkSource).toContain("document.visibilityState");
  });
});
