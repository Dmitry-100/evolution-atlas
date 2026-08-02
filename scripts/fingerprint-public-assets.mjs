import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRasterAssetManifest } from "./asset-manifest.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const publicDirectory = join(repoRoot, "public");
const distDirectory = join(repoRoot, "dist");
const manifest = createRasterAssetManifest(publicDirectory);

for (const [source, target] of Object.entries(manifest)) {
  const sourcePath = join(distDirectory, source);
  const targetPath = join(distDirectory, target);
  await mkdir(dirname(targetPath), { recursive: true });
  await rm(targetPath, { force: true });
  await rename(sourcePath, targetPath);
}

await writeFile(
  join(distDirectory, "asset-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `Fingerprint manifest contains ${Object.keys(manifest).length} raster assets.`,
);
