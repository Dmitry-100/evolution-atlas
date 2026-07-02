/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import bodyMapPageSource from "../pages/BodyMapPage.tsx?raw";

type CssFile = {
  path: string;
  source: string;
};

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectCssFiles(dir: string): CssFile[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectCssFiles(entryPath);
    }

    if (!entry.isFile() || !entry.name.endsWith(".css")) {
      return [];
    }

    return [
      {
        path: relative(srcRoot, entryPath),
        source: readFileSync(entryPath, "utf8"),
      },
    ];
  });
}

const cssFiles = collectCssFiles(srcRoot);
const cssByPath = new Map(cssFiles.map((file) => [file.path, file.source]));
const cssSource = cssByPath.get("index.css") ?? "";

function rootVariables(css: string) {
  return new Set(
    [...css.matchAll(/--[a-z0-9-]+(?=\s*:)/gi)].map((match) => match[0]),
  );
}

function usedVariables(css: string) {
  return [...css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((match) => match[1]);
}

describe("CSS design token policy", () => {
  it("defines every CSS custom property it references without a fallback", () => {
    const defined = new Set(cssFiles.flatMap((file) => [...rootVariables(file.source)]));
    const undefinedVariables = cssFiles.flatMap((file) =>
      usedVariables(file.source)
        .filter((variable) => !defined.has(variable))
        .map((variable) => `${file.path}: ${variable}`),
    );

    expect([...new Set(undefinedVariables)].sort()).toEqual([]);
  });

  it("keeps the critical audit tokens in the root token set", () => {
    const defined = rootVariables(cssSource);

    expect([...defined]).toEqual(
      expect.arrayContaining([
        "--transition",
        "--cyan",
        "--text-soft",
        "--node-y",
      ]),
    );
  });

  it("uses the shared breakpoint scale", () => {
    const allowedBreakpoints = new Set(["640", "768", "1024", "1280"]);
    const breakpoints = cssFiles.flatMap((file) =>
      [...file.source.matchAll(/@media[^{]+(?:min|max)-width:\s*(\d+)px/g)].map(
        (match) => match[1],
      ),
    );

    expect([...new Set(breakpoints)].sort()).toEqual(
      expect.arrayContaining([...allowedBreakpoints]),
    );
    expect(breakpoints.filter((value) => !allowedBreakpoints.has(value))).toEqual([]);
  });

  it("keeps display typography and container radius behind design tokens", () => {
    const directDisplayFonts = cssFiles.flatMap((file) =>
      [...file.source.matchAll(/font-family:\s*Georgia/gi)].map(
        () => file.path,
      ),
    );
    const fixedContainerRadii = cssFiles.flatMap((file) =>
      [...file.source.matchAll(/border-radius:\s*(?:1[0-9]|2[0-9])px/gi)].map(
        (match) => `${file.path}: ${match[0]}`,
      ),
    );

    expect(directDisplayFonts).toEqual([]);
    expect(fixedContainerRadii).toEqual([]);
  });

  it("uses tokens for the most repeated surface, line, and accent colors", () => {
    const rawTokenizedColors = [
      "rgba(255, 255, 255, 0.035)",
      "rgba(255, 255, 255, 0.04)",
      "rgba(218, 185, 126, 0.16)",
      "rgba(218, 185, 126, 0.15)",
      "rgba(218, 185, 126, 0.14)",
      "rgba(218, 185, 126, 0.13)",
      "rgba(218, 185, 126, 0.12)",
      "rgba(218, 185, 126, 0.18)",
      "rgba(240, 201, 120, 0.12)",
      "rgba(240, 201, 120, 0.08)",
      "rgba(240, 201, 120, 0.18)",
      "rgba(240, 201, 120, 0.16)",
      "rgba(240, 201, 120, 0.1)",
      "rgba(130, 183, 179, 0.12)",
      "rgba(130, 183, 179, 0.1)",
      "rgba(130, 183, 179, 0.08)",
      "rgba(8, 11, 11, 0.42)",
    ];
    const cssOutsideRootTokens = cssFiles
      .map((file) => ({
        ...file,
        source: file.source.replace(/:root\s*{[\s\S]*?}\s*/m, ""),
      }))
      .flatMap((file) =>
        rawTokenizedColors
          .filter((color) => file.source.includes(color))
          .map((color) => `${file.path}: ${color}`),
      );

    expect(cssOutsideRootTokens).toEqual([]);
  });

  it("keeps body map route styles in a lazy route CSS partial", () => {
    const bodyMapCss = cssByPath.get("pages/BodyMapPage.css") ?? "";

    expect(bodyMapPageSource).toContain('import "./BodyMapPage.css"');
    expect(bodyMapCss).toContain("@layer pages");
    expect(bodyMapCss).toContain(".body-map-page");
    expect(cssSource).not.toContain(".body-map-page");
    expect(cssSource).not.toContain(".body-trait-pin");
  });
});
