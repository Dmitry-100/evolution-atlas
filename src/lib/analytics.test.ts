import { describe, expect, it } from "vitest";
import {
  isAnalyticsOriginAllowed,
  parseMetrikaCounterId,
} from "./analytics";

describe("Yandex Metrica configuration", () => {
  it("accepts only a positive numeric public counter ID", () => {
    expect(parseMetrikaCounterId("12345678")).toBe(12345678);
    expect(parseMetrikaCounterId(undefined)).toBeUndefined();
    expect(parseMetrikaCounterId("")).toBeUndefined();
    expect(parseMetrikaCounterId("counter-1")).toBeUndefined();
    expect(parseMetrikaCounterId("0")).toBeUndefined();
  });

  it("does not pollute production analytics from local previews", () => {
    expect(isAnalyticsOriginAllowed("https://atlas.aidms.ru")).toBe(true);
    expect(isAnalyticsOriginAllowed("http://localhost:4173")).toBe(false);
    expect(isAnalyticsOriginAllowed("http://localhost:4173", true)).toBe(true);
  });
});
