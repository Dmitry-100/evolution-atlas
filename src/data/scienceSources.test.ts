import { describe, expect, it } from "vitest";
import { SCIENCE_SOURCE_GROUPS, SCIENCE_SOURCE_KIND_LABELS } from "./scienceSources";

const requiredGroupIds = [
  "luca",
  "origin",
  "geologic-time",
  "lineage",
  "human-origins",
  "genetics",
  "cladogram",
  "dinosaurs",
  "extinctions",
];

describe("science source groups", () => {
  it("groups fact-checking sources by portal section", () => {
    expect(SCIENCE_SOURCE_GROUPS.map((group) => group.id)).toEqual(requiredGroupIds);

    for (const group of SCIENCE_SOURCE_GROUPS) {
      expect(group.titleRu.length).toBeGreaterThan(5);
      expect(group.noteRu.length).toBeGreaterThan(35);
      expect(group.routeHref).toMatch(/^\//);
      expect(group.sources.length).toBeGreaterThanOrEqual(2);

      for (const source of group.sources) {
        expect(source.id.length).toBeGreaterThan(3);
        expect(source.label.length).toBeGreaterThan(6);
        expect(source.noteRu.length).toBeGreaterThan(25);
        expect(source.url).toMatch(/^https?:\/\//);
        expect(SCIENCE_SOURCE_KIND_LABELS[source.kind]).toBeTruthy();
      }
    }
  });

  it("includes primary anchors for LUCA, Africa, genetics, and extinctions", () => {
    const urls = SCIENCE_SOURCE_GROUPS.flatMap((group) => group.sources.map((source) => source.url));

    expect(urls).toContain("https://www.nature.com/articles/s41559-024-02461-1");
    expect(urls).toContain("https://humanorigins.si.edu/research/whats-hot-human-origins/our-species-arose-least-300000-years-ago");
    expect(urls).toContain("https://www.pnas.org/doi/abs/10.1073/pnas.88.20.9051");
    expect(urls).toContain("https://www.ipbes.net/global-assessment");
  });

  it("assigns human origins sources to the primates section", () => {
    expect(SCIENCE_SOURCE_GROUPS.find((group) => group.id === "human-origins")).toMatchObject({
      routeHref: "/primates",
    });
  });
});
