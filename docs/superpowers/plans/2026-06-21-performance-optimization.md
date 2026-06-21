# Evolution Atlas Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Speed up the first screen and route navigation without changing the visual character of Evolution Atlas.

**Architecture:** Keep the atlas route visually intact, but stop non-home pages from entering the initial bundle, serve local raster images through AVIF `<picture>` fallbacks, and reduce continuous render work in scroll/WebGL helpers. The first pass is intentionally conservative: route-level splitting, optimized image plumbing, critical AVIF generation, and lighter animation plumbing.

**Tech Stack:** React 19, Vite 8, TypeScript 6, React Router 7, Vitest, Playwright, local `sips` image conversion through `scripts/optimize-images.mjs`.

---

## Current State As Of 2026-06-21

Working directory:

```bash
/Users/Sotnikov/Google Drive 100/10 - coding project/evolution-atlas
```

Current working tree is not clean. Existing uncommitted files include topbar work, editorial copy work, and e2e updates:

```text
M e2e/evolution-atlas.spec.ts
M src/App.tsx
M src/components/atlas/CladogramPanel.tsx
M src/data/extinctions.ts
M src/data/genetics.ts
M src/data/lineage.ts
M src/data/materials.ts
M src/data/quiz.ts
M src/index.css
M src/lib/cladogram.ts
M src/pages/AtlasPage.tsx
M src/pages/CladogramPage.tsx
M src/pages/OriginOfLifePage.tsx
?? src/data/editorialCopy.test.ts
```

Do not revert these changes. If implementing this plan in the same worktree, inspect each touched file first and preserve existing edits.

Fresh build metric from the current tree:

```text
dist/assets/index-Csna-Nwv.js   609.18 kB minified / 182.13 kB gzip
Vite warning: some chunks are larger than 500 kB after minification.
```

Current image facts:

```text
217 raster files under public/assets/images and public/assets/brand
102 AVIF files already exist
public/assets/images/timeline-river-evolution-21-9.png: 2.0M
public/assets/images/timelines/primates-timeline-21-9.png: 2.1M
public/assets/images/dinosaurs/dinosaur-timeline-river.png: 2.1M
public/assets/brand/portal-logo-mark.png: 84K
```

Important drift from the old performance plan:

- `src/App.tsx` already has the new topbar structure and `navItems`, but page routes are still eagerly imported.
- `src/components/atlas/StageDetailCard.tsx` still renders plain `<img>` elements and does not use `getOptimizedImageSrc`.
- `src/lib/imagePlaceholders.ts` maps `/assets/images/*.jpg|png` to `.avif`, but does not support `/assets/brand`.
- `scripts/optimize-images.mjs` walks only `public/assets/images`; it does not include `public/assets/brand` and does not accept targeted file arguments.
- `e2e/evolution-atlas.spec.ts` currently expects `.stage-plate-media source[type='image/avif']` to have count `0`; this must change when `OptimizedImage` lands.
- `ScrollProgress` uses React state on every scroll update.
- `EtherealInk` respects `prefers-reduced-motion`, but still mounts the shader immediately and does not pause on `document.visibilityState === "hidden"`.

## File Structure

Modify:

- `src/App.tsx`: keep `AtlasPage` eager, lazy-load non-home routes, add route preloading from nav hover/focus, wrap routes in `Suspense`.
- `src/index.css`: add `.route-loading` and `.stage-plate-picture` CSS; preserve current topbar changes.
- `src/lib/imagePlaceholders.ts`: extend optimized source mapping to `/assets/brand`.
- `src/lib/imagePlaceholders.test.ts`: add brand and non-raster coverage.
- `src/components/ui/optimized-image.tsx`: new internal image component that renders AVIF `<source>` for local raster assets and plain `<img>` otherwise.
- `src/components/atlas/StageDetailCard.tsx`: use `OptimizedImage` for current and previous stage images.
- `src/components/atlas/DeepTimeAxis.tsx`: use `OptimizedImage` for the main timeline river.
- `src/components/atlas/PrimateAxis.tsx`: use `OptimizedImage` for the primate timeline river.
- `src/pages/DinosaursPage.tsx`: use `OptimizedImage` for the dinosaur timeline river.
- `src/components/ui/scroll-progress.tsx`: use a ref and direct transform writes instead of React state.
- `src/components/ui/ethereal-ink.tsx`: defer shader mount and pause animation while the document is hidden.
- `scripts/optimize-images.mjs`: include `public/assets/brand` and support targeted file arguments.
- `e2e/evolution-atlas.spec.ts`: update image expectations from “no AVIF source” to “AVIF source exists”.

Create:

- `src/components/ui/optimized-image.test.tsx` only if a DOM test environment is added. Do not add this in the first pass because the current Vitest config has no jsdom.
- `src/performance/appBundlePolicy.test.ts`: raw-source guard against eager non-home route imports.
- `src/components/ui/renderingPerformance.test.ts`: raw-source guard for `ScrollProgress` and `EtherealInk` performance plumbing.

Generated assets:

- `public/assets/images/timeline-river-evolution-21-9.avif`
- `public/assets/images/timelines/primates-timeline-21-9.avif`
- `public/assets/images/dinosaurs/dinosaur-timeline-river.avif`
- `public/assets/brand/portal-logo-mark.avif`

## Task 0: Pre-Flight Guardrails

**Files:**
- Read: `git status --short --branch`
- Read: `src/App.tsx`
- Read: `e2e/evolution-atlas.spec.ts`

- [ ] **Step 1: Record current uncommitted work**

Run:

```bash
cd "/Users/Sotnikov/Google Drive 100/10 - coding project/evolution-atlas"
git status --short --branch
git diff --stat
```

Expected: status shows the existing topbar/editorial changes listed in the Current State section. Do not revert them.

- [ ] **Step 2: Confirm baseline build metric**

Run:

```bash
corepack pnpm build
```

Expected before optimization: one main JS asset around `609 kB` minified and a Vite `>500 kB` chunk warning.

## Task 1: Route-Level Code Splitting Without Slowing The Home Route

**Files:**
- Create: `src/performance/appBundlePolicy.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Write failing bundle policy test**

Create `src/performance/appBundlePolicy.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import appSource from "../App.tsx?raw";

describe("app bundle policy", () => {
  it("keeps the home atlas eager but lazy-loads non-home pages", () => {
    expect(appSource).toContain('import { AtlasPage } from "./pages/AtlasPage"');
    expect(appSource).toContain("lazy(");
    expect(appSource).toContain("<Suspense");

    for (const pageName of [
      "AboutPage",
      "ExtinctionsPage",
      "MaterialsPage",
      "SourcesPage",
      "TheoryPage",
      "DinosaursPage",
      "QuizPage",
      "OriginOfLifePage",
      "CladogramPage",
      "GeneticsPage",
    ]) {
      expect(appSource).not.toMatch(
        new RegExp(`import \\\\{ ${pageName} \\\\} from "\\\\./pages/`),
      );
    }
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
corepack pnpm test src/performance/appBundlePolicy.test.ts
```

Expected: FAIL because `src/App.tsx` still has eager imports such as `import { TheoryPage } from "./pages/TheoryPage";`.

- [ ] **Step 3: Replace eager non-home imports with lazy route loaders**

In `src/App.tsx`, change the React import and page imports to this shape. Preserve existing `navItems`, `AppHeader`, keyboard navigation, and `LegacyMaterialRedirect`.

```tsx
import "./App.css";
import { Suspense, lazy, useEffect, type KeyboardEvent } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AtlasPage } from "./pages/AtlasPage";
import { EtherealInk } from "./components/ui/ethereal-ink";
import { ScrollProgress } from "./components/ui/scroll-progress";
import { TooltipProvider } from "./components/ui/tooltip";

const pageLoaders = {
  about: () =>
    import("./pages/AboutPage").then(({ AboutPage }) => ({
      default: AboutPage,
    })),
  extinctions: () =>
    import("./pages/ExtinctionsPage").then(({ ExtinctionsPage }) => ({
      default: ExtinctionsPage,
    })),
  materials: () =>
    import("./pages/MaterialsPage").then(({ MaterialsPage }) => ({
      default: MaterialsPage,
    })),
  sources: () =>
    import("./pages/SourcesPage").then(({ SourcesPage }) => ({
      default: SourcesPage,
    })),
  theory: () =>
    import("./pages/TheoryPage").then(({ TheoryPage }) => ({
      default: TheoryPage,
    })),
  dinosaurs: () =>
    import("./pages/DinosaursPage").then(({ DinosaursPage }) => ({
      default: DinosaursPage,
    })),
  quiz: () =>
    import("./pages/QuizPage").then(({ QuizPage }) => ({
      default: QuizPage,
    })),
  originOfLife: () =>
    import("./pages/OriginOfLifePage").then(({ OriginOfLifePage }) => ({
      default: OriginOfLifePage,
    })),
  cladogram: () =>
    import("./pages/CladogramPage").then(({ CladogramPage }) => ({
      default: CladogramPage,
    })),
  genetics: () =>
    import("./pages/GeneticsPage").then(({ GeneticsPage }) => ({
      default: GeneticsPage,
    })),
};

const AboutPage = lazy(pageLoaders.about);
const ExtinctionsPage = lazy(pageLoaders.extinctions);
const MaterialsPage = lazy(pageLoaders.materials);
const SourcesPage = lazy(pageLoaders.sources);
const TheoryPage = lazy(pageLoaders.theory);
const DinosaursPage = lazy(pageLoaders.dinosaurs);
const QuizPage = lazy(pageLoaders.quiz);
const OriginOfLifePage = lazy(pageLoaders.originOfLife);
const CladogramPage = lazy(pageLoaders.cladogram);
const GeneticsPage = lazy(pageLoaders.genetics);

const routePreloaders: Record<string, () => Promise<unknown>> = {
  "/theory": pageLoaders.theory,
  "/origin-of-life": pageLoaders.originOfLife,
  "/genetics": pageLoaders.genetics,
  "/cladogram": pageLoaders.cladogram,
  "/extinctions": pageLoaders.extinctions,
  "/dinosaurs": pageLoaders.dinosaurs,
  "/materials": pageLoaders.materials,
  "/about": pageLoaders.about,
  "/quiz": pageLoaders.quiz,
};

function preloadRoute(to: string) {
  void routePreloaders[to]?.();
}
```

Update nav links inside `AppHeader`:

```tsx
<NavLink
  key={item.to}
  to={item.to}
  onFocus={() => preloadRoute(item.to)}
  onMouseEnter={() => preloadRoute(item.to)}
>
  {item.label}
</NavLink>
```

Wrap `Routes` in `Suspense`:

```tsx
<Suspense
  fallback={
    <section className="route-loading" aria-live="polite">
      Загружаем раздел...
    </section>
  }
>
  <Routes>
    <Route path="/" element={<AtlasPage />} />
    <Route path="/theory" element={<TheoryPage />} />
    <Route path="/origin-of-life" element={<OriginOfLifePage />} />
    <Route path="/genetics" element={<GeneticsPage />} />
    <Route path="/cladogram" element={<CladogramPage />} />
    <Route path="/extinctions" element={<ExtinctionsPage />} />
    <Route path="/dinosaurs" element={<DinosaursPage />} />
    <Route path="/materials" element={<MaterialsPage />} />
    <Route path="/materials/:fileName" element={<LegacyMaterialRedirect />} />
    <Route
      path="/materials/covers/:fileName"
      element={<LegacyMaterialRedirect cover />}
    />
    <Route path="/sources" element={<SourcesPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/quiz" element={<QuizPage />} />
  </Routes>
</Suspense>
```

Add to `src/index.css`:

```css
.route-loading {
  min-height: 45vh;
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 0.95rem;
}
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
corepack pnpm test src/performance/appBundlePolicy.test.ts
corepack pnpm build
```

Expected: test passes. Build emits multiple route chunks and the main `index-*.js` chunk is materially smaller than the current `609.18 kB`.

## Task 2: Optimized Image Mapping And Targeted AVIF Generation

**Files:**
- Modify: `src/lib/imagePlaceholders.ts`
- Modify: `src/lib/imagePlaceholders.test.ts`
- Modify: `scripts/optimize-images.mjs`

- [ ] **Step 1: Extend failing image mapping tests**

Add these expectations to `src/lib/imagePlaceholders.test.ts` inside `maps local raster assets to neighboring AVIF variants`:

```ts
expect(getOptimizedImageSrc("/assets/brand/portal-logo-mark.png")).toBe(
  "/assets/brand/portal-logo-mark.avif",
);
expect(getOptimizedImageSrc("/assets/brand/icon.svg")).toBeNull();
expect(getOptimizedImageSrc("/assets/materials/example-cover.jpg")).toBeNull();
```

- [ ] **Step 2: Verify RED**

Run:

```bash
corepack pnpm test src/lib/imagePlaceholders.test.ts
```

Expected: FAIL because `/assets/brand/portal-logo-mark.png` currently returns `null`.

- [ ] **Step 3: Extend optimized image source mapping**

In `src/lib/imagePlaceholders.ts`, replace `getOptimizedImageSrc` with:

```ts
export function getOptimizedImageSrc(src: string) {
  if (!src.startsWith("/assets/images/") && !src.startsWith("/assets/brand/")) {
    return null;
  }

  if (!/\.(jpe?g|png)$/i.test(src)) {
    return null;
  }

  return src.replace(/\.(jpe?g|png)$/i, ".avif");
}
```

- [ ] **Step 4: Update image optimizer script**

Replace `scripts/optimize-images.mjs` with this targeted-capable version:

```js
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultRoots = [
  fileURLToPath(new URL("../public/assets/images", import.meta.url)),
  fileURLToPath(new URL("../public/assets/brand", import.meta.url)),
];
const maxDimension = 1400;
const rasterExtensions = new Set([".jpg", ".jpeg", ".png"]);

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
  return path.replace(/\.(jpe?g|png)$/i, ".avif");
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
```

- [ ] **Step 5: Verify GREEN**

Run:

```bash
corepack pnpm test src/lib/imagePlaceholders.test.ts
```

Expected: test passes.

- [ ] **Step 6: Generate critical AVIF files only**

Run:

```bash
corepack pnpm optimize:images -- \
  public/assets/images/timeline-river-evolution-21-9.png \
  public/assets/images/timelines/primates-timeline-21-9.png \
  public/assets/images/dinosaurs/dinosaur-timeline-river.png \
  public/assets/brand/portal-logo-mark.png
```

Expected: the four `.avif` files listed in Generated assets exist. Confirm:

```bash
ls -lh \
  public/assets/images/timeline-river-evolution-21-9.avif \
  public/assets/images/timelines/primates-timeline-21-9.avif \
  public/assets/images/dinosaurs/dinosaur-timeline-river.avif \
  public/assets/brand/portal-logo-mark.avif
```

## Task 3: Use `<picture>` For Stage And Timeline Images

**Files:**
- Create: `src/components/ui/optimized-image.tsx`
- Modify: `src/components/atlas/StageDetailCard.tsx`
- Modify: `src/components/atlas/DeepTimeAxis.tsx`
- Modify: `src/components/atlas/PrimateAxis.tsx`
- Modify: `src/pages/DinosaursPage.tsx`
- Modify: `src/index.css`
- Modify: `e2e/evolution-atlas.spec.ts`

- [ ] **Step 1: Update e2e expectation to fail first**

In `e2e/evolution-atlas.spec.ts`, replace:

```ts
await expect(
  page.locator(".stage-plate-media source[type='image/avif']"),
).toHaveCount(0);
```

with:

```ts
await expect(
  page.locator(".stage-plate-media source[type='image/avif']"),
).toHaveCount(1);
```

- [ ] **Step 2: Verify RED**

Run:

```bash
corepack pnpm e2e -- --project=desktop -g "click and primate mode"
```

Expected: FAIL because `StageDetailCard` still renders only `<img>`.

- [ ] **Step 3: Add optimized image component**

Create `src/components/ui/optimized-image.tsx`:

```tsx
import { forwardRef, type ImgHTMLAttributes } from "react";
import { getOptimizedImageSrc } from "../../lib/imagePlaceholders";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  pictureClassName?: string;
};

export const OptimizedImage = forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(function OptimizedImage(
  { pictureClassName, src, alt = "", ...imageProps },
  ref,
) {
  const optimizedSrc = src ? getOptimizedImageSrc(src) : null;

  if (!src || !optimizedSrc) {
    return <img ref={ref} src={src} alt={alt} {...imageProps} />;
  }

  return (
    <picture className={pictureClassName}>
      <source srcSet={optimizedSrc} type="image/avif" />
      <img ref={ref} src={src} alt={alt} {...imageProps} />
    </picture>
  );
});
```

- [ ] **Step 4: Use `OptimizedImage` in `StageDetailCard`**

In `src/components/atlas/StageDetailCard.tsx`, import:

```tsx
import { OptimizedImage } from "../ui/optimized-image";
```

Replace the previous image:

```tsx
<OptimizedImage
  pictureClassName="stage-plate-picture"
  className="stage-plate-main stage-plate-previous"
  src={previousImage.src}
  alt=""
  aria-hidden="true"
  decoding="async"
/>
```

Replace the current image:

```tsx
<OptimizedImage
  key={stage.image.src}
  ref={imageRef}
  pictureClassName="stage-plate-picture"
  className={
    isLoaded
      ? "stage-plate-main stage-plate-current is-loaded"
      : "stage-plate-main stage-plate-current"
  }
  src={stage.image.src}
  alt={stage.image.altRu}
  decoding="async"
  fetchPriority="high"
  onLoad={() => setIsLoaded(true)}
  onError={() => setIsLoaded(true)}
/>
```

Add to `src/index.css`:

```css
.stage-plate-picture {
  display: contents;
}
```

- [ ] **Step 5: Use `OptimizedImage` for timeline river images**

In `src/components/atlas/DeepTimeAxis.tsx`, replace the timeline `<img>` with:

```tsx
<OptimizedImage
  className="deep-time-river-image"
  src="/assets/images/timeline-river-evolution-21-9.png"
  alt=""
  aria-hidden="true"
  decoding="async"
  fetchPriority="high"
/>
```

In `src/components/atlas/PrimateAxis.tsx`, replace the timeline `<img>` with:

```tsx
<OptimizedImage
  className="primate-axis-river-image"
  src="/assets/images/timelines/primates-timeline-21-9.png"
  alt=""
  aria-hidden="true"
  decoding="async"
/>
```

In `src/pages/DinosaursPage.tsx`, replace the dinosaur river `<img>` with:

```tsx
<OptimizedImage
  className="dinosaur-timeline-river-image"
  src="/assets/images/dinosaurs/dinosaur-timeline-river.png"
  alt=""
  aria-hidden="true"
  loading="lazy"
  decoding="async"
/>
```

Add imports where needed:

```tsx
import { OptimizedImage } from "../ui/optimized-image";
```

or from pages:

```tsx
import { OptimizedImage } from "../components/ui/optimized-image";
```

- [ ] **Step 6: Verify GREEN**

Run:

```bash
corepack pnpm e2e -- --project=desktop -g "click and primate mode"
corepack pnpm build
```

Expected: e2e passes and build passes.

## Task 4: Reduce Scroll And WebGL Continuous Work

**Files:**
- Create: `src/components/ui/renderingPerformance.test.ts`
- Modify: `src/components/ui/scroll-progress.tsx`
- Modify: `src/components/ui/ethereal-ink.tsx`

- [ ] **Step 1: Write failing source-level performance test**

Create `src/components/ui/renderingPerformance.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import etherealInkSource from "./ethereal-ink.tsx?raw";
import scrollProgressSource from "./scroll-progress.tsx?raw";

describe("rendering performance helpers", () => {
  it("keeps scroll progress out of React state", () => {
    expect(scrollProgressSource).not.toContain("useState");
    expect(scrollProgressSource).toContain("useRef");
    expect(scrollProgressSource).toContain("style.transform");
    expect(scrollProgressSource).toContain("{ passive: true }");
  });

  it("defers and pauses the WebGL background", () => {
    expect(etherealInkSource).toContain("requestIdleCallback");
    expect(etherealInkSource).toContain("visibilitychange");
    expect(etherealInkSource).toContain("document.visibilityState");
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
corepack pnpm test src/components/ui/renderingPerformance.test.ts
```

Expected: FAIL because `ScrollProgress` currently imports `useState`, and `EtherealInk` does not use visibility/idle deferral.

- [ ] **Step 3: Rewrite `ScrollProgress` with a DOM ref**

Replace `src/components/ui/scroll-progress.tsx` with:

```tsx
import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const root = document.documentElement;
      const scrollableHeight = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollableHeight));

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
```

- [ ] **Step 4: Add visibility and idle hooks to `EtherealInk`**

Add these helpers near `usePrefersReducedMotion` in `src/components/ui/ethereal-ink.tsx`:

```tsx
function useDocumentVisible() {
  const [isVisible, setIsVisible] = useState(() =>
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return isVisible;
}

function useDeferredShaderReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const schedule =
      window.requestIdleCallback ??
      ((callback: IdleRequestCallback) =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 0,
            }),
          180,
        ));
    const cancel =
      window.cancelIdleCallback ??
      ((handle: number) => window.clearTimeout(handle));

    const handle = schedule(() => setIsReady(true), { timeout: 1200 });
    return () => cancel(handle);
  }, []);

  return isReady;
}
```

Update `EtherealInk` render:

```tsx
export const EtherealInk = memo(function EtherealInk({
  className,
  hue = 36,
  speed = 0.16,
  intensity = 0.72,
  complexity = 2.35,
  interactive = true,
}: EtherealInkProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isVisible = useDocumentVisible();
  const isShaderReady = useDeferredShaderReady();

  return (
    <div className={cn("ethereal-ink", className)} aria-hidden="true">
      {isShaderReady ? (
        <ShaderCanvas
          complexity={complexity}
          hue={hue}
          intensity={intensity}
          interactive={interactive}
          paused={reducedMotion || !isVisible}
          speed={speed}
        />
      ) : (
        <div className="ethereal-ink-fallback" />
      )}
      <div className="ethereal-ink-scrim" />
    </div>
  );
});
```

- [ ] **Step 5: Verify GREEN**

Run:

```bash
corepack pnpm test src/components/ui/renderingPerformance.test.ts
corepack pnpm build
```

Expected: tests pass and build passes.

## Task 5: Full Verification And Performance Acceptance

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run unit and build checks**

Run:

```bash
corepack pnpm check
```

Expected:

```text
eslint: exit 0
Vitest: all tests pass
Vite build: exit 0
```

- [ ] **Step 2: Run desktop e2e**

Run:

```bash
corepack pnpm e2e -- --project=desktop
```

Expected: desktop Playwright suite passes.

- [ ] **Step 3: Inspect build chunk output**

Run:

```bash
corepack pnpm build
```

Expected:

- More than one JS chunk is emitted.
- Main `index-*.js` is materially below the current `609.18 kB`.
- If the main chunk still exceeds `500 kB`, record the exact emitted sizes and continue with a second-pass plan for Atlas internals rather than hiding the warning.

- [ ] **Step 4: Browser QA**

Start or reuse the dev server:

```bash
corepack pnpm dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5178/
```

Verify:

- Atlas first screen is not blank.
- No framework overlay.
- Console has no app errors.
- `.stage-plate-media source[type='image/avif']` exists.
- The current stage image still has JPG/PNG fallback.
- Navigation to `/theory`, `/genetics`, `/dinosaurs`, `/materials`, `/quiz` still works.
- Scroll progress remains visible and moves during page scroll.
- Ethereal background appears after a short delay and pauses when tab is hidden.

## Self-Review

Spec coverage:

- Route code splitting: Task 1.
- AVIF source mapping and critical generation: Task 2.
- `<picture>` usage for stage/timeline images: Task 3.
- Scroll/WebGL lighter rendering: Task 4.
- Full verification and current metrics: Task 5.

Placeholder scan:

- No `TBD`, no “implement later”, no unspecified test command.
- The plan intentionally avoids adding jsdom because the current Vitest config is Node-oriented and existing tests use data/raw-source checks.

Type consistency:

- `OptimizedImage` exports a forwarded `HTMLImageElement` ref so `StageDetailCard` can keep its existing load-state logic.
- `getOptimizedImageSrc` remains nullable and handles local raster assets only.
- `pageLoaders` return `{ default: Component }`, which matches `React.lazy`.

Execution note:

- Because the current worktree is already dirty, do not commit mid-plan unless the user confirms commit scope first. If the user does ask for commits, use small commits after each task and stage only the files listed in that task.
