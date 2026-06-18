import type { StageImageKind } from "../data/lineage";

const placeholders: Record<StageImageKind, string> = {
  "source-backed":
    "radial-gradient(circle at 28% 18%, rgba(240, 201, 120, 0.18), transparent 12rem), linear-gradient(135deg, rgba(38, 66, 62, 0.72), rgba(35, 27, 20, 0.84))",
  "generated-reconstruction":
    "radial-gradient(circle at 34% 18%, rgba(208, 163, 91, 0.22), transparent 13rem), linear-gradient(135deg, rgba(54, 38, 29, 0.86), rgba(17, 26, 25, 0.8))",
  "local-plate":
    "radial-gradient(circle at 62% 16%, rgba(130, 183, 179, 0.18), transparent 12rem), linear-gradient(135deg, rgba(18, 34, 32, 0.82), rgba(56, 42, 27, 0.76))",
};

export function getImagePlaceholder(kind: StageImageKind) {
  return placeholders[kind];
}

export function getOptimizedImageSrc(src: string) {
  if (!src.startsWith("/assets/images/")) {
    return null;
  }

  if (!/\.(jpe?g|png)$/i.test(src)) {
    return null;
  }

  return src.replace(/\.(jpe?g|png)$/i, ".avif");
}
