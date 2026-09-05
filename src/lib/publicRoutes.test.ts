import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES, publicRoutePath } from "./publicRoutes";

describe("public route configuration", () => {
  it("contains unique direct SPA routes and the complete public surface", () => {
    const paths = PUBLIC_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual([
      "/",
      "/primates",
      "/theory",
      "/origin-of-life",
      "/genetics",
      "/cladogram",
      "/body-map",
      "/extinctions",
      "/dinosaurs",
      "/materials",
      "/sources",
      "/about",
      "/game",
      "/quiz",
    ]);
    expect(publicRoutePath("genetics")).toBe("/genetics");
  });

  it("defines unique search metadata for every indexable route", () => {
    const titles = PUBLIC_ROUTES.map((route) => route.seoTitle);
    const descriptions = PUBLIC_ROUTES.map((route) => route.seoDescription);

    expect(new Set(titles).size).toBe(PUBLIC_ROUTES.length);
    expect(new Set(descriptions).size).toBe(PUBLIC_ROUTES.length);
    for (const route of PUBLIC_ROUTES) {
      expect(route.seoTitle.length).toBeGreaterThan(20);
      expect(route.seoDescription.length).toBeGreaterThan(80);
      expect(route.seoHeading.length).toBeGreaterThan(3);
    }
  });
});
