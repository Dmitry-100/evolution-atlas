import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { build } from "esbuild";

const execFileAsync = promisify(execFile);

const outDir = ".deploy/ask-darwin";
const outFile = `${outDir}/index.js`;
const zipFile = "../ask-darwin.zip";

await rm(".deploy/ask-darwin", { recursive: true, force: true });
await rm(".deploy/ask-darwin.zip", { force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: ["cloud-functions/ask-darwin/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  outfile: outFile,
  sourcemap: false,
  legalComments: "none",
});

await execFileAsync("zip", ["-q", zipFile, "index.js"], { cwd: outDir });

console.log("Created .deploy/ask-darwin.zip");
