import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_REQUESTS = [
  ["protocells", "Hydrothermal vent Mid-Cayman Rise"],
  ["prokaryotes", "bacteria micrograph"],
  ["cyanobacteria", "stromatolites cyanobacteria"],
  ["eukaryotes", "Paramecium micrograph"],
  ["choanoflagellates", "choanoflagellate micrograph"],
  ["ediacaran", "Dickinsonia fossil"],
  ["bilaterians", "Kimberella fossil"],
  ["early-chordates", "Pikaia reconstruction"],
  ["early-vertebrates", "Haikouichthys reconstruction"],
  ["jawed-fish", "Dunkleosteus skull fossil"],
  ["lobe-finned", "coelacanth"],
  ["tiktaalik", "Tiktaalik fossil restoration"],
  ["early-tetrapods", "Ichthyostega fossil"],
  ["amniotes", "Hylonomus fossil"],
  ["synapsids", "Dimetrodon skeleton"],
  ["therapsids", "Lycaenops skeleton"],
  ["cynodonts", "Thrinaxodon fossil"],
  ["early-mammals", "Morganucodon"],
  ["placentals", "Eomaia scansoria fossil"],
  ["after-kpg", "Purgatorius fossil"],
  ["early-primates", "Plesiadapis skeleton"],
  ["anthropoids", "Aegyptopithecus skull"],
  ["new-world-monkeys", "White-headed Capuchin 28175852037"],
  ["old-world-monkeys", "macaque portrait"],
  ["early-apes", "Proconsul africanus skull"],
  ["great-apes", "chimpanzee portrait"],
  ["early-hominins", "Sahelanthropus tchadensis skull"],
  ["ardipithecus", "Ardipithecus ramidus skull"],
  ["australopithecus", "Lucy Australopithecus skeleton"],
  ["early-homo", "Homo habilis skull"],
  ["homo-erectus", "Homo erectus skull"],
  ["heidelbergensis", "Homo heidelbergensis skull"],
  ["neanderthals", "Neanderthal skull"],
  ["early-sapiens", "Jebel Irhoud skull"],
];

const outDir = path.resolve("public/assets/images/source-backed");
const tsOut = path.resolve("src/data/sourceImages.ts");
const requestHeaders = {
  "User-Agent": "EvolutionAtlas/1.0 (https://github.com/Dmitry-100/evolution-atlas)",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function stripHtml(value = "") {
  return value
    .replace(new RegExp("<style[\\s\\S]*?</style>", "gi"), "")
    .replace(new RegExp("<script[\\s\\S]*?</script>", "gi"), "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extensionFromUrl(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.includes(".png")) return "png";
  if (pathname.includes(".webp")) return "webp";
  return "jpg";
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1400",
    format: "json",
    origin: "*",
  });

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: requestHeaders });
      if (!response.ok) throw new Error(`Commons search failed for ${query}: ${response.status}`);
      const json = await response.json();
      const pages = Object.values(json.query?.pages ?? {}).sort((a, b) => a.index - b.index);
      const page = pages.find((candidate) => {
        const title = candidate.title.toLowerCase();
        const hasImage = candidate.imageinfo?.[0]?.thumburl || candidate.imageinfo?.[0]?.url;
        return hasImage && !title.endsWith(".pdf") && !title.endsWith(".ogg") && !title.endsWith(".webm");
      });
      if (!page) throw new Error(`No image found for ${query}`);
      return page;
    } catch (error) {
      if (attempt === 4) throw error;
      await wait(1500 * attempt);
    }
  }

  throw new Error(`No image found for ${query}`);
}

async function download(url, filePath) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, { headers: requestHeaders });
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, bytes);
      return;
    }
    if (response.status !== 429 || attempt === 4) {
      throw new Error(`Download failed ${url}: ${response.status}`);
    }
    await wait(1200 * attempt);
  }
}

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

const records = {};
const report = [];

for (const [key, query] of IMAGE_REQUESTS) {
  const page = await commonsSearch(query);
  const info = page.imageinfo[0];
  const url = info.thumburl ?? info.url;
  const extension = extensionFromUrl(url);
  const filename = `${key}.${extension}`;
  const meta = info.extmetadata ?? {};

  await download(url, path.join(outDir, filename));
  await wait(300);

  const artist = stripHtml(meta.Artist?.value);
  const credit = stripHtml(meta.Credit?.value) || artist || "Wikimedia Commons";
  const license = stripHtml(meta.LicenseShortName?.value || meta.UsageTerms?.value || meta.Permission?.value) || "see source";
  const description = stripHtml(meta.ImageDescription?.value || page.title.replace(/^File:/, ""));

  records[key] = {
    src: `/assets/images/source-backed/${filename}`,
    sourceUrl: info.descriptionurl,
    credit: artist ? `${artist} / Wikimedia Commons` : `${credit} / Wikimedia Commons`,
    license,
    commonsTitle: page.title,
    description,
  };

  report.push(`${key}: ${page.title} -> ${filename}`);
}

const ts = `export type SourceImageRecord = {
  src: string;
  sourceUrl: string;
  credit: string;
  license: string;
  commonsTitle: string;
  description: string;
};

export const SOURCE_IMAGES: Record<string, SourceImageRecord> = ${JSON.stringify(records, null, 2)};
`;

await fs.writeFile(tsOut, ts);
console.log(report.join("\n"));
