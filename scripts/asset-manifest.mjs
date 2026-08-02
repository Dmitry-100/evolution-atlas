import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const RASTER_EXTENSIONS = new Set([".avif", ".jpg", ".jpeg", ".png"]);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function shouldFingerprint(publicPath) {
  return (
    RASTER_EXTENSIONS.has(extname(publicPath).toLowerCase()) &&
    !publicPath.startsWith("/assets/images/social/")
  );
}

export function createRasterAssetManifest(publicDirectory) {
  const assetsDirectory = join(publicDirectory, "assets");
  const manifest = {};

  for (const file of walk(assetsDirectory)) {
    const publicPath = `/${relative(publicDirectory, file).split(sep).join("/")}`;
    if (!shouldFingerprint(publicPath)) continue;

    const extension = extname(publicPath);
    const hash = createHash("sha256")
      .update(readFileSync(file))
      .digest("hex")
      .slice(0, 12);
    manifest[publicPath] =
      `${publicPath.slice(0, -extension.length)}.${hash}${extension}`;
  }

  return Object.fromEntries(
    Object.entries(manifest).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
}
