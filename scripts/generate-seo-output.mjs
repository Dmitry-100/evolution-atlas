import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const distDirectory = join(repoRoot, "dist");
const routeConfigPath = join(repoRoot, "config/public-routes.json");
const siteOrigin = "https://atlas.aidms.ru";
const siteName = "Достающее звено";
const socialImageUrl = `${siteOrigin}/assets/images/social/evolution-atlas-preview-v2.jpg`;

const routes = JSON.parse(await readFile(routeConfigPath, "utf8"));
const baseHtml = await readFile(join(distDirectory, "index.html"), "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceMarkedAttribute(html, marker, attribute, value) {
  const markerToken = `data-seo="${marker}"`;
  const markerIndex = html.indexOf(markerToken);
  if (markerIndex < 0) throw new Error(`Missing SEO marker: ${marker}`);
  const tagStart = html.lastIndexOf("<", markerIndex);
  const tagEnd = html.indexOf(">", markerIndex);
  const tag = html.slice(tagStart, tagEnd + 1);
  const attributePattern = new RegExp(`(${attribute}=")[^"]*(")`);
  if (!attributePattern.test(tag)) {
    throw new Error(`Missing ${attribute} on SEO marker: ${marker}`);
  }
  const nextTag = tag.replace(
    attributePattern,
    `$1${escapeHtml(value)}$2`,
  );
  return `${html.slice(0, tagStart)}${nextTag}${html.slice(tagEnd + 1)}`;
}

function buildStructuredData(route) {
  const url = new URL(route.path, siteOrigin).href;
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${siteOrigin}/#website`,
      url: `${siteOrigin}/`,
      name: siteName,
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
      isPartOf: { "@id": `${siteOrigin}/#website` },
      educationalUse: "самообразование",
      learningResourceType: "интерактивный образовательный материал",
      image: socialImageUrl,
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
          item: `${siteOrigin}/`,
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

function buildPrerenderContent(route) {
  const routeLinks = routes
    .filter((item) => item.path !== route.path)
    .map(
      (item) =>
        `<a href="${escapeHtml(item.path)}">${escapeHtml(item.labelRu)}</a>`,
    )
    .join(" · ");

  return `<section class="document-page seo-prerender" data-seo-prerender="true">
      <header class="page-header">
       <div class="page-header-copy">
        <p class="page-header-eyebrow">${escapeHtml(siteName)}</p>
        <h1>${escapeHtml(route.seoHeading)}</h1>
        <p class="page-header-description">${escapeHtml(route.seoDescription)}</p>
       </div>
      </header>
      <nav aria-label="Разделы атласа">${routeLinks}</nav>
    </section>`;
}

function injectVerificationMeta(html) {
  const verificationTags = [
    ["yandex-verification", process.env.SEO_YANDEX_VERIFICATION],
    ["google-site-verification", process.env.SEO_GOOGLE_VERIFICATION],
  ]
    .filter(([, value]) => value?.trim())
    .map(
      ([name, value]) =>
        `    <meta name="${name}" content="${escapeHtml(value.trim())}" />`,
    )
    .join("\n");

  return verificationTags
    ? html.replace("  </head>", `${verificationTags}\n  </head>`)
    : html;
}

function htmlForRoute(route) {
  const url = new URL(route.path, siteOrigin).href;
  let html = baseHtml.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(route.seoTitle)}</title>`,
  );
  html = replaceMarkedAttribute(
    html,
    "description",
    "content",
    route.seoDescription,
  );
  html = replaceMarkedAttribute(html, "canonical", "href", url);
  html = replaceMarkedAttribute(html, "og-url", "content", url);
  html = replaceMarkedAttribute(html, "og-title", "content", route.seoTitle);
  html = replaceMarkedAttribute(
    html,
    "og-description",
    "content",
    route.seoDescription,
  );
  html = replaceMarkedAttribute(
    html,
    "twitter-title",
    "content",
    route.seoTitle,
  );
  html = replaceMarkedAttribute(
    html,
    "twitter-description",
    "content",
    route.seoDescription,
  );
  html = html.replace(
    /(<script id="seo-structured-data" type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
    `$1${JSON.stringify(buildStructuredData(route))}$2`,
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${buildPrerenderContent(route)}</div>`,
  );
  return injectVerificationMeta(html);
}

for (const route of routes) {
  for (const field of ["path", "labelRu", "seoTitle", "seoDescription", "seoHeading"]) {
    if (!route[field]) throw new Error(`Route ${route.key} is missing ${field}`);
  }

  const outputPath =
    route.path === "/"
      ? join(distDirectory, "index.html")
      : join(distDirectory, route.path.slice(1), "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, htmlForRoute(route));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) =>
      `  <url><loc>${escapeHtml(new URL(route.path, siteOrigin).href)}</loc></url>`,
  )
  .join("\n")}
</urlset>
`;
const robots = `User-agent: *
Allow: /

Host: atlas.aidms.ru
Sitemap: ${siteOrigin}/sitemap.xml
`;

await writeFile(join(distDirectory, "sitemap.xml"), sitemap);
await writeFile(join(distDirectory, "robots.txt"), robots);

console.log(`Generated SEO output for ${routes.length} public routes.`);
