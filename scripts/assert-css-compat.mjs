import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const cssDir = join(process.cwd(), "dist", "assets");
const rangeMediaQueryPattern = /@media\s*\([^)]*width\s*[<>]=/;

let cssFiles;

try {
  cssFiles = (await readdir(cssDir)).filter((fileName) =>
    fileName.endsWith(".css"),
  );
} catch {
  console.error("dist/assets is missing. Run the production build first.");
  process.exit(1);
}

const incompatibleFiles = [];

for (const fileName of cssFiles) {
  const filePath = join(cssDir, fileName);
  const css = await readFile(filePath, "utf8");

  if (rangeMediaQueryPattern.test(css)) {
    incompatibleFiles.push(fileName);
  }
}

if (incompatibleFiles.length > 0) {
  console.error(
    [
      "Production CSS contains range media queries such as @media (width<=720px).",
      "Older iOS Safari builds ignore that syntax and fall back to desktop layout.",
      `Files: ${incompatibleFiles.join(", ")}`,
    ].join("\n"),
  );
  process.exit(1);
}
