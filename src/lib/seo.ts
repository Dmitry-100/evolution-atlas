import type { PublicRoute } from "./publicRoutes";
import { publicRouteForPath } from "./publicRoutes";

export const SITE_ORIGIN = "https://atlas.aidms.ru";
export const SITE_NAME = "Достающее звено";
export const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/assets/images/social/evolution-atlas-preview-v2.jpg`;

export function canonicalUrl(pathname: string) {
  const route = publicRouteForPath(pathname);
  return new URL(route?.path ?? "/", SITE_ORIGIN).href;
}

export function buildStructuredData(route: PublicRoute) {
  const url = new URL(route.path, SITE_ORIGIN).href;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: SITE_NAME,
      alternateName: "Evolution Atlas",
      description:
        "Интерактивный образовательный атлас эволюции на русском языке.",
      inLanguage: "ru-RU",
    },
    {
      "@type": ["WebPage", "LearningResource"],
      "@id": `${url}#webpage`,
      url,
      name: route.seoTitle,
      description: route.seoDescription,
      headline: route.seoHeading,
      inLanguage: "ru-RU",
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      educationalUse: "самообразование",
      learningResourceType: "интерактивный образовательный материал",
      image: SOCIAL_IMAGE_URL,
    },
  ];

  if (route.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Атлас",
          item: `${SITE_ORIGIN}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: route.labelRu,
          item: url,
        },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function updateContent(selector: string, value: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute(
    "content",
    value,
  );
}

export function applyRouteSeo(pathname: string) {
  const route = publicRouteForPath(pathname);
  if (!route) {
    updateContent('meta[data-seo="robots"]', "noindex, nofollow");
    return undefined;
  }

  const url = new URL(route.path, SITE_ORIGIN).href;
  document.title = route.seoTitle;
  document
    .querySelector<HTMLLinkElement>('link[data-seo="canonical"]')
    ?.setAttribute("href", url);
  updateContent('meta[data-seo="description"]', route.seoDescription);
  updateContent(
    'meta[data-seo="robots"]',
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  );
  updateContent('meta[data-seo="og-url"]', url);
  updateContent('meta[data-seo="og-title"]', route.seoTitle);
  updateContent('meta[data-seo="og-description"]', route.seoDescription);
  updateContent('meta[data-seo="twitter-title"]', route.seoTitle);
  updateContent(
    'meta[data-seo="twitter-description"]',
    route.seoDescription,
  );

  const structuredData = document.querySelector<HTMLScriptElement>(
    "#seo-structured-data",
  );
  if (structuredData) {
    structuredData.textContent = JSON.stringify(buildStructuredData(route));
  }

  return route;
}
