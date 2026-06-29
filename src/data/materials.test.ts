import { describe, expect, it } from "vitest";
import {
  MUSEUM_RECOMMENDATIONS,
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
    expect(READING_RECOMMENDATIONS.map((book) => book.id)).toEqual(
      expect.arrayContaining([
        "mukherjee-gene",
        "kleshchenko-dna-person",
        "heyer-gene-odyssey",
        "aleksenko-sex-with-scientists",
      ]),
    );

    for (const book of READING_RECOMMENDATIONS) {
      if (book.coverSrc) {
        expect(book.coverSrc).toMatch(/^\/assets\/images\/books\/.+\.jpg$/);
        expect(book.coverAltRu).toMatch(/Обложка|Титульная страница/i);
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

  it("varies recommendation hooks instead of repeating ranking-style leads", () => {
    const recommendationCopy = [
      ...PORTAL_MATERIALS.map((material) => material.summaryRu),
      ...READING_RECOMMENDATIONS.map((book) => book.whyReadRu),
      ...WATCH_RECOMMENDATIONS.map((item) => item.whyWatchRu),
      ...MUSEUM_RECOMMENDATIONS.map((museum) => museum.whyVisitRu),
    ];
    const templatedLeads = recommendationCopy.filter((text) =>
      /^(Хорошо|Хороший|Хорошая|Самый|Самая|Самое|Лучший|Лучшее|Отлично|Отличный|Отличная)(\s|:|$)/.test(
        text,
      ),
    );

    expect(templatedLeads).toHaveLength(0);
  });

  it("adds Moscow museums that extend the portal offline", () => {
    expect(MUSEUM_RECOMMENDATIONS.map((museum) => museum.id)).toEqual([
      "darwin-museum",
      "orlov-paleontological-museum",
      "timiryazev-biological-museum",
      "msu-zoological-museum",
      "vernadsky-geological-museum",
    ]);

    for (const museum of MUSEUM_RECOMMENDATIONS) {
      expect(museum.href).toMatch(/^https:\/\//);
      expect(museum.addressRu).toMatch(/Москва|Вавилова|Профсоюзная/i);
      expect(museum.descriptionRu.length).toBeGreaterThan(80);
      expect(museum.whyVisitRu.length).toBeGreaterThan(80);
    }
  });
});
