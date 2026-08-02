import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES } from "./publicRoutes";
import {
  SITE_ORIGIN,
  buildStructuredData,
  canonicalUrl,
} from "./seo";

describe("SEO metadata", () => {
  it("builds canonical URLs without query or tour state", () => {
    expect(canonicalUrl("/genetics")).toBe(`${SITE_ORIGIN}/genetics`);
    expect(canonicalUrl("/materials/legacy.pdf")).toBe(
      `${SITE_ORIGIN}/materials`,
    );
  });

  it("emits WebSite, LearningResource and breadcrumb structured data", () => {
    const route = PUBLIC_ROUTES.find((item) => item.path === "/genetics");
    expect(route).toBeDefined();

    const data = buildStructuredData(route!);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ "@type": "WebSite" }),
        expect.objectContaining({
          "@type": ["WebPage", "LearningResource"],
          url: `${SITE_ORIGIN}/genetics`,
        }),
        expect.objectContaining({ "@type": "BreadcrumbList" }),
      ]),
    );
  });
});
