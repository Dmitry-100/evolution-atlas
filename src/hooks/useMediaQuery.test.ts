import { describe, expect, it } from "vitest";
import { getInitialMediaQueryMatch } from "./useMediaQuery";

describe("useMediaQuery helpers", () => {
  it("returns false when matchMedia is unavailable", () => {
    expect(getInitialMediaQueryMatch("(max-width: 640px)", undefined)).toBe(false);
  });

  it("uses matchMedia when available", () => {
    const matchMedia = (query: string) =>
      ({
        matches: query === "(max-width: 640px)",
      }) as MediaQueryList;

    expect(getInitialMediaQueryMatch("(max-width: 640px)", matchMedia)).toBe(true);
    expect(getInitialMediaQueryMatch("(min-width: 768px)", matchMedia)).toBe(false);
  });
});
