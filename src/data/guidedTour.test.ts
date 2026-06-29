import { describe, expect, it } from "vitest";
import {
  GUIDED_TOUR_BROWSE_LINKS,
  GUIDED_TOUR_INTENTS,
  GUIDED_TOUR_STOPS,
  getTourStopById,
} from "./guidedTour";

describe("guided tour catalog", () => {
  it("defines Darwin-first intents with reader-facing labels", () => {
    expect(GUIDED_TOUR_INTENTS.map((intent) => intent.id)).toEqual([
      "overview",
      "skeptical",
      "ancestors",
      "child",
      "origin",
      "dinosaurs",
      "presenter",
      "browse",
      "custom",
    ]);
    expect(GUIDED_TOUR_INTENTS[0].labelRu).toMatch(/быстро понять портал/i);
  });

  it("builds stops only with local site links", () => {
    expect(GUIDED_TOUR_STOPS.length).toBeGreaterThan(20);
    expect(GUIDED_TOUR_STOPS.every((stop) => stop.href.startsWith("/"))).toBe(
      true,
    );
    expect(getTourStopById("page-theory")).toMatchObject({
      titleRu: "Теория эволюции",
      href: "/theory",
    });
    expect(getTourStopById("page-body-map")).toMatchObject({
      titleRu: "Карта признаков",
      href: "/body-map",
    });
  });

  it("includes service page stops for presenter and source-aware tours", () => {
    expect(getTourStopById("page-materials")).toMatchObject({
      titleRu: "Дополнительные материалы",
      href: "/materials",
    });
    expect(getTourStopById("page-about")).toMatchObject({
      titleRu: "О проекте",
      href: "/about",
    });
    expect(getTourStopById("page-sources")).toMatchObject({
      titleRu: "Источники",
      href: "/sources",
    });
  });

  it("routes primate stage stops and browse links to the dedicated primates page", () => {
    expect(getTourStopById("stage-sapiens")).toMatchObject({
      href: "/primates?stage=homo-sapiens",
    });
    expect(getTourStopById("stage-tiktaalik")).toMatchObject({
      href: "/?mode=all&stage=tiktaalik",
    });
    expect(GUIDED_TOUR_BROWSE_LINKS).toContainEqual(
      expect.objectContaining({
        labelRu: "Приматы → человек",
        href: "/primates",
      }),
    );
  });
});
