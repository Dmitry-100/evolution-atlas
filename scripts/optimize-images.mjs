import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultRoots = [
  fileURLToPath(new URL("../public/assets/images", import.meta.url)),
  fileURLToPath(new URL("../public/assets/brand", import.meta.url)),
  fileURLToPath(new URL("../public/assets/materials", import.meta.url)),
];
const maxDimension = 1400;
const rasterExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function isRaster(path) {
  return rasterExtensions.has(extname(path).toLowerCase());
}

function avifPathFor(path) {
  return path.replace(/\.(jpe?g|png|webp)$/i, ".avif");
}

function isFresh(source, target) {
  return (
    existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs
  );
}

function resolveRequestedPath(arg) {
  return isAbsolute(arg) ? arg : resolve(repoRoot, arg);
}

const requestedSources = process.argv.slice(2).map(resolveRequestedPath);
const sources =
  requestedSources.length > 0
    ? requestedSources.filter(isRaster)
    : defaultRoots.flatMap(walk).filter(isRaster);

let converted = 0;
let skipped = 0;

for (const source of sources) {
  const target = avifPathFor(source);
  if (isFresh(source, target)) {
    skipped += 1;
    continue;
  }

  execFileSync(
    "sips",
    [
      "-Z",
      String(maxDimension),
      "-s",
      "format",
      "avif",
      source,
      "--out",
      target,
    ],
    {
      stdio: "ignore",
    },
  );
  converted += 1;
}

console.log(
  `Optimized images: ${converted} converted, ${skipped} already fresh.`,
);
