import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const distDirectory = join(repoRoot, "dist");
const routeConfigPath = join(repoRoot, "config/public-routes.json");
const siteOrigin = "https://atlas.aidms.ru";
const siteName = "Достающее звено";
const socialImageUrl = `${siteOrigin}/assets/images/social/evolution-atlas-preview-v2.jpg`;

const routes = JSON.parse(await readFile(routeConfigPath, "utf8"));
const baseHtml = await readFile(join(distDirectory, "index.html"), "utf8");
if (!baseHtml.includes('<div id="root"></div>')) {
  throw new Error(
    "Expected a fresh Vite build with an empty root. Run pnpm build.",
  );
}
const buildManifest = JSON.parse(
  await readFile(join(distDirectory, ".vite/manifest.json"), "utf8"),
);
const assetManifest = JSON.parse(
  await readFile(join(distDirectory, "asset-manifest.json"), "utf8"),
);

// Keep Node-only render code outside dist so it can never be deployed publicly.
await mkdir(join(repoRoot, ".deploy"), { recursive: true });
const renderDirectory = await mkdtemp(join(repoRoot, ".deploy/prerender-"));
const renderEntry = join(renderDirectory, "render.mjs");

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
  const nextTag = tag.replace(attributePattern, `$1${escapeHtml(value)}$2`);
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

function routeStyles(route) {
  const pageName = `${route.key[0].toUpperCase()}${route.key.slice(1)}Page`;
  const entry = route.path === "/" ? "index.html" : `src/pages/${pageName}.tsx`;
  const styles = new Set();
  const visited = new Set();
  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = buildManifest[key];
    if (!chunk) throw new Error(`Missing build manifest entry: ${key}`);
    for (const dependency of chunk.imports ?? []) visit(dependency);
    for (const css of chunk.css ?? []) styles.add(css);
  }
  visit(entry);
  return [...styles]
    .filter((css) => !baseHtml.includes(`href="/${css}"`))
    .map(
      (css) =>
        `<link rel="stylesheet" crossorigin href="/${escapeHtml(css)}" />`,
    )
    .join("\n");
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

function htmlForRoute(route, content) {
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
    () => `<div id="root">${content}</div>`,
  );
  html = html.replace("  </head>", `${routeStyles(route)}\n  </head>`);
  return injectVerificationMeta(html);
}

try {
  await build({
    absWorkingDir: repoRoot,
    entryPoints: ["src/prerender.tsx"],
    outfile: renderEntry,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    jsx: "automatic",
    loader: { ".css": "empty" },
    define: {
      __ASSET_MANIFEST__: JSON.stringify(assetManifest),
      "import.meta.env": JSON.stringify({ SSR: true, PROD: true, DEV: false }),
      "process.env.NODE_ENV": '"production"',
    },
  });
  const { renderPage } = await import(pathToFileURL(renderEntry).href);
  for (const route of routes) {
    for (const field of [
      "path",
      "labelRu",
      "seoTitle",
      "seoDescription",
      "seoHeading",
    ]) {
      if (!route[field])
        throw new Error(`Route ${route.key} is missing ${field}`);
    }

    const outputPath =
      route.path === "/"
        ? join(distDirectory, "index.html")
        : join(distDirectory, route.path.slice(1), "index.html");
    await mkdir(dirname(outputPath), { recursive: true });
    const content = await renderPage(route.path);
    if (
      !content.includes("<h1") ||
      content.includes("<!--$?-->") ||
      content.includes("Загружаем раздел...")
    ) {
      throw new Error(`Incomplete prerender for ${route.path}`);
    }
    await writeFile(outputPath, htmlForRoute(route, content));
    console.log(
      `Prerendered ${route.path}: ${Buffer.byteLength(content)} bytes.`,
    );
  }
} finally {
  await rm(renderDirectory, { recursive: true, force: true });
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
