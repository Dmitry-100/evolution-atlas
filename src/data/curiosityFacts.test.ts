import { describe, expect, it } from "vitest";
import { CURIOSITY_FACT_PAGE_GROUPS, CURIOSITY_FACTS } from "./curiosityFacts";

describe("curiosity facts", () => {
  it("covers eight unusual evolution hooks with sources and confidence", () => {
    expect(CURIOSITY_FACTS.map((fact) => fact.id)).toEqual([
      "oxygen-waste",
      "mitochondria-bacteria",
      "jaw-to-ear",
      "chromosome-2",
      "viral-fossils",
      "walking-whales",
      "feathers-before-flight",
      "sapiens-last-seconds",
    ]);

    for (const fact of CURIOSITY_FACTS) {
      expect(fact.titleRu.length).toBeGreaterThan(8);
      expect(fact.shortRu.length).toBeGreaterThan(30);
      expect(fact.detailRu.length).toBeGreaterThan(60);
      expect(fact.sectionHref).toMatch(/^\//);
      expect(fact.confidence).toMatch(/solid|likely|debated/);
      expect(fact.source.url).toMatch(/^https?:\/\//);
    }
  });

  it("states that Homo sapiens appears in the final seconds of the compressed timeline", () => {
    const fact = CURIOSITY_FACTS.find((item) => item.id === "sapiens-last-seconds");

    expect(fact?.detailRu).toMatch(/последн/i);
    expect(fact?.detailRu).toMatch(/секунд/i);
  });

  it("distributes hooks across topical pages instead of one home-page block", () => {
    expect(Object.keys(CURIOSITY_FACT_PAGE_GROUPS)).not.toContain("home");

    const groupedIds = Object.values(CURIOSITY_FACT_PAGE_GROUPS).flat();
    const uniqueGroupedIds = new Set(groupedIds);

    expect(uniqueGroupedIds.size).toBe(CURIOSITY_FACTS.length);
    for (const group of Object.values(CURIOSITY_FACT_PAGE_GROUPS)) {
      expect(group.length).toBeGreaterThan(0);
      expect(group.length).toBeLessThanOrEqual(3);
    }
  });
});
