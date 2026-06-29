import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { build } from "esbuild";

const execFileAsync = promisify(execFile);

const outDir = ".deploy/plan-tour";
const outFile = `${outDir}/index.js`;
const zipFile = "../plan-tour.zip";

await rm(".deploy/plan-tour", { recursive: true, force: true });
await rm(".deploy/plan-tour.zip", { force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: ["cloud-functions/plan-tour/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: outFile,
  sourcemap: false,
  legalComments: "none",
});

await execFileAsync("zip", ["-q", zipFile, "index.js"], { cwd: outDir });

console.log("Created .deploy/plan-tour.zip");
