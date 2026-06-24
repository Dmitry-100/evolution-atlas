import { describe, expect, it } from "vitest";
import {
  PORTAL_MATERIALS,
  READING_RECOMMENDATIONS,
  WATCH_RECOMMENDATIONS,
} from "./materials";

describe("portal materials", () => {
  it("keeps downloadable files away from the /materials SPA route", () => {
    const materialUrls = PORTAL_MATERIALS.flatMap((material) => [
      material.coverSrc,
      material.pdfHref,
    ]);

    for (const url of materialUrls) {
      expect(url).toMatch(/^\/assets\/materials\//);
      expect(url).not.toMatch(/^\/materials(?:\/|$)/);
    }

    for (const material of PORTAL_MATERIALS) {
      expect(Object.keys(material)).not.toContain("pptxHref");
      expect(Object.keys(material)).not.toContain("portalUseRu");
      expect(material.highlightsRu).toHaveLength(3);
      expect(material.highlightsRu.join(" ")).not.toMatch(/портал|карточк/i);
    }
  });

  it("adds curated reading and viewing recommendations", () => {
    expect(READING_RECOMMENDATIONS.length).toBeGreaterThanOrEqual(10);
    expect(WATCH_RECOMMENDATIONS.length).toBe(3);
    expect(
      READING_RECOMMENDATIONS.some((book) =>
        book.titleRu.includes("Достающее звено"),
      ),
    ).toBe(true);
    expect(READING_RECOMMENDATIONS.map((book) => book.id)).toEqual(
      expect.arrayContaining(["darwin-origin-species", "darwin-descent-man"]),
    );

    for (const book of READING_RECOMMENDATIONS) {
      if (book.coverSrc) {
        expect(book.coverSrc).toMatch(/^\/assets\/images\/books\/.+\.jpg$/);
        expect(book.coverAltRu).toMatch(/Обложка/i);
      }
      expect(book.publisherHref).toMatch(/^https?:\/\//);
    }

    expect(
      WATCH_RECOMMENDATIONS.map((item) => item.id),
    ).toEqual(["photon-2017", "nick-lane-dwarkesh", "drobyshevsky-lectures"]);

    for (const item of WATCH_RECOMMENDATIONS) {
      expect(item.href).toMatch(/^https?:\/\//);
      expect(item.descriptionRu.length).toBeGreaterThan(80);
    }
  });
});
