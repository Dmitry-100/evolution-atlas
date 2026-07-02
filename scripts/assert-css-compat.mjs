import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const cssDir = join(process.cwd(), "dist", "assets");
const rangeMediaQueryPattern = /@media\s*\([^)]*width\s*[<>]=/;
const customPropertyDefinitionPattern = /--[a-z0-9-]+(?=\s*:)/gi;
const customPropertyUsagePattern = /var\(\s*(--[a-z0-9-]+)(\s*,)?/gi;

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
const undefinedVariablesByFile = new Map();
const cssByFile = new Map();
const globallyDefinedVariables = new Set();

for (const fileName of cssFiles) {
  const filePath = join(cssDir, fileName);
  const css = await readFile(filePath, "utf8");
  cssByFile.set(fileName, css);

  for (const match of css.matchAll(customPropertyDefinitionPattern)) {
    globallyDefinedVariables.add(match[0]);
  }
}

for (const [fileName, css] of cssByFile.entries()) {
  if (rangeMediaQueryPattern.test(css)) {
    incompatibleFiles.push(fileName);
  }

  const undefinedVariables = [
    ...new Set(
      [...css.matchAll(customPropertyUsagePattern)]
        .filter((match) => !match[2])
        .map((match) => match[1])
        .filter((variable) => !globallyDefinedVariables.has(variable)),
    ),
  ].sort();

  if (undefinedVariables.length > 0) {
    undefinedVariablesByFile.set(fileName, undefinedVariables);
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

if (undefinedVariablesByFile.size > 0) {
  console.error("Production CSS references undefined custom properties.");
  for (const [fileName, variables] of undefinedVariablesByFile.entries()) {
    console.error(`${fileName}: ${variables.join(", ")}`);
  }
  process.exit(1);
}
