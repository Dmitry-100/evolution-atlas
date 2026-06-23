import { describe, expect, it } from "vitest";
import { AFRICA_ORIGIN_NOTE, HUMAN_MIGRATION_ROUTES, HUMAN_ORIGIN_SITES } from "./humanOrigins";

describe("human origins map data", () => {
  it("frames Africa as a connected origin region, not a single point", () => {
    expect(AFRICA_ORIGIN_NOTE).toContain("Африка");
    expect(AFRICA_ORIGIN_NOTE).toContain("не один сад Эдема");
    expect(AFRICA_ORIGIN_NOTE).toContain("связанных популяциях");
  });

  it("contains four reader-facing African evidence sites", () => {
    expect(HUMAN_ORIGIN_SITES.map((site) => site.id)).toEqual(["jebel-irhoud", "omo-kibish", "herto", "blombos"]);

    for (const site of HUMAN_ORIGIN_SITES) {
      expect(site.titleRu.length).toBeGreaterThan(3);
      expect(site.regionRu.length).toBeGreaterThan(5);
      expect(site.ageRu).toMatch(/тыс|лет/i);
      expect(site.longitude).toBeGreaterThanOrEqual(-180);
      expect(site.longitude).toBeLessThanOrEqual(180);
      expect(site.latitude).toBeGreaterThanOrEqual(-90);
      expect(site.latitude).toBeLessThanOrEqual(90);
      expect(site.confidence).toMatch(/solid|likely|debated/);
      expect(site.source.url).toMatch(/^https?:\/\//);
    }
  });

  it("adds approximate Homo sapiens dispersal routes and dates", () => {
    expect(HUMAN_MIGRATION_ROUTES.length).toBeGreaterThanOrEqual(5);
    expect(HUMAN_MIGRATION_ROUTES.map((route) => route.id)).toEqual(
      expect.arrayContaining(["african-mosaic", "levant-arabia", "southern-asia-sahul", "europe", "americas"]),
    );

    for (const route of HUMAN_MIGRATION_ROUTES) {
      expect(route.dateRu).toMatch(/около|примерно|~|тыс/i);
      expect(route.points.length).toBeGreaterThanOrEqual(2);
      expect(route.confidence).toMatch(/solid|likely|debated/);
      expect(route.source.url).toMatch(/^https?:\/\//);
    }
  });
});
