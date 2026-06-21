# Mobile Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a purpose-built mobile web version of the main Atlas page at `/` while preserving the existing desktop Atlas above the mobile breakpoint.

**Architecture:** Keep one route, one data model, and one URL state system. `AtlasPage` remains the coordinator for `mode`, `stage`, URL parsing, accumulated traits, and keyboard movement; it branches its rendered experience by viewport: desktop uses the existing `DeepTimeAxis` / `PrimateAxis` / `StageDetailCard` layout, mobile uses a new vertical stage map component backed by the same `sortedStages`, `primateStages`, `ERAS`, `parseAtlasUrlState`, and `toAtlasSearchParams`.

**Tech Stack:** React 19, TypeScript 6, React Router 7, Radix Tabs, Vite 8, Vitest, Playwright mobile project.

---

## Current State As Of 2026-06-21

Working directory:

```bash
/Users/Sotnikov/Google Drive 100/10 - coding project/evolution-atlas
```

Current checked state:

```bash
git status --short --branch
# ## main...origin/main
```

Relevant current files:

- `src/pages/AtlasPage.tsx` currently renders the full desktop Atlas unconditionally.
- `src/lib/atlasUrlState.ts` already preserves shared `mode` / `stage` URL state.
- `src/lib/atlasUrlState.test.ts` already verifies shared links such as `/?mode=primates&stage=early-apes`.
- `src/components/atlas/DeepTimeAxis.tsx`, `PrimateAxis.tsx`, `EraNavigation.tsx`, `StageDetailCard.tsx`, `TraitAccumulator.tsx`, and `JourneyControls.tsx` are the current desktop Atlas pieces.
- `e2e/evolution-atlas.spec.ts` already has desktop and mobile Playwright projects through `playwright.config.ts`.
- `src/App.tsx` already has the newer topbar/nav structure; do not include general mobile header work in this plan.

Important product decision:

- This is not a native iOS/Android app.
- This is not a separate route or separate deploy.
- `/` remains the Atlas entry point.
- Desktop behavior above `720px` must remain visually unchanged.
- Mobile gets a separate Atlas UX under `720px`.

## File Structure

Create:

- `src/hooks/useMediaQuery.ts`: shared browser-safe media-query hook.
- `src/hooks/useMediaQuery.test.ts`: unit tests for the media-query hook.
- `src/components/atlas/mobile/MobileAtlas.tsx`: mobile Atlas coordinator/view.
- `src/components/atlas/mobile/MobileStageMap.tsx`: grouped vertical stage list.
- `src/components/atlas/mobile/MobileStageDetail.tsx`: inline active-stage detail card.

Modify:

- `src/pages/AtlasPage.tsx`: branch between desktop and mobile Atlas rendering while keeping URL state, mode changes, stage changes, and keyboard movement in one place.
- `src/index.css`: add mobile Atlas layout styles and keep desktop selectors untouched above `720px`.
- `e2e/evolution-atlas.spec.ts`: add mobile-specific assertions without weakening desktop assertions.

Do not modify:

- Public routes.
- Stage data schema.
- Image asset paths.
- `parseAtlasUrlState` / `toAtlasSearchParams` behavior except if a test proves a bug.
- Desktop `DeepTimeAxis` / `PrimateAxis` behavior.

## Task 0: Pre-Flight Snapshot

**Files:**
- Read: `src/pages/AtlasPage.tsx`
- Read: `e2e/evolution-atlas.spec.ts`
- Read: `src/index.css`

- [ ] **Step 1: Confirm clean or understood worktree**

Run:

```bash
cd "/Users/Sotnikov/Google Drive 100/10 - coding project/evolution-atlas"
git status --short --branch
```

Expected now:

```text
## main...origin/main
```

If files are dirty, inspect them and do not revert user work.

- [ ] **Step 2: Confirm baseline checks**

Run:

```bash
corepack pnpm check
```

Expected: lint, unit tests, and build pass before mobile Atlas work begins.

## Task 1: Media Query Hook

**Files:**
- Create: `src/hooks/useMediaQuery.ts`
- Create: `src/hooks/useMediaQuery.test.ts`

- [ ] **Step 1: Write the hook tests**

Create `src/hooks/useMediaQuery.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getInitialMediaQueryMatch } from "./useMediaQuery";

describe("useMediaQuery helpers", () => {
  it("returns false when matchMedia is unavailable", () => {
    expect(getInitialMediaQueryMatch("(max-width: 720px)", undefined)).toBe(false);
  });

  it("uses matchMedia when available", () => {
    const matchMedia = (query: string) =>
      ({
        matches: query === "(max-width: 720px)",
      }) as MediaQueryList;

    expect(getInitialMediaQueryMatch("(max-width: 720px)", matchMedia)).toBe(true);
    expect(getInitialMediaQueryMatch("(min-width: 721px)", matchMedia)).toBe(false);
  });
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
corepack pnpm test src/hooks/useMediaQuery.test.ts
```

Expected: FAIL because `src/hooks/useMediaQuery.ts` does not exist yet.

- [ ] **Step 3: Add `useMediaQuery`**

Create `src/hooks/useMediaQuery.ts`:

```ts
import { useEffect, useState } from "react";

type MatchMediaLike = Window["matchMedia"] | undefined;

export function getInitialMediaQueryMatch(
  query: string,
  matchMedia: MatchMediaLike =
    typeof window === "undefined" ? undefined : window.matchMedia,
) {
  return matchMedia?.(query).matches ?? false;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getInitialMediaQueryMatch(query));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
corepack pnpm test src/hooks/useMediaQuery.test.ts
```

Expected: PASS.

## Task 2: Mobile Atlas Components

**Files:**
- Create: `src/components/atlas/mobile/MobileStageDetail.tsx`
- Create: `src/components/atlas/mobile/MobileStageMap.tsx`
- Create: `src/components/atlas/mobile/MobileAtlas.tsx`

- [ ] **Step 1: Create `MobileStageDetail`**

Create `src/components/atlas/mobile/MobileStageDetail.tsx`:

```tsx
import type { EvolutionStage } from "../../../data/lineage";
import { formatAgeRu } from "../../../lib/timeline";

type MobileStageDetailProps = {
  stage: EvolutionStage;
};

export function MobileStageDetail({ stage }: MobileStageDetailProps) {
  const featuredTraits = stage.inherited.slice(0, 4);

  return (
    <div className="mobile-stage-detail">
      <img
        src={stage.image.src}
        alt={stage.image.altRu}
        loading="lazy"
        decoding="async"
      />
      <div className="mobile-stage-detail-copy">
        <span>{formatAgeRu(stage.ageMa)}</span>
        <h3>{stage.titleRu}</h3>
        <p className="latin">{stage.latin}</p>
        <p>{stage.summaryRu}</p>
        <div className="mobile-stage-traits" aria-label="Унаследованные признаки">
          {featuredTraits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <p className="mobile-stage-why">{stage.whyMattersRu}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `MobileStageMap`**

Create `src/components/atlas/mobile/MobileStageMap.tsx`:

```tsx
import type { Era, EvolutionStage } from "../../../data/lineage";
import { formatAgeRu } from "../../../lib/timeline";
import { MobileStageDetail } from "./MobileStageDetail";

type MobileStageMapProps = {
  eras: Era[];
  stages: EvolutionStage[];
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

export function MobileStageMap({
  eras,
  stages,
  activeStage,
  onActivate,
}: MobileStageMapProps) {
  return (
    <div className="mobile-stage-map" aria-label="Вертикальная карта этапов">
      {eras.map((era) => {
        const eraStages = stages.filter((stage) => stage.eraId === era.id);
        if (eraStages.length === 0) return null;

        return (
          <section
            key={era.id}
            className="mobile-era-group"
            style={{ "--mobile-era-color": era.color }}
          >
            <div className="mobile-era-heading">
              <span>{era.labelRu}</span>
              <small>{era.rangeRu}</small>
            </div>

            <div className="mobile-era-stages">
              {eraStages.map((stage) => {
                const isActive = stage.id === activeStage.id;

                return (
                  <article
                    key={stage.id}
                    className={
                      isActive
                        ? "mobile-stage-row is-active"
                        : "mobile-stage-row"
                    }
                  >
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => onActivate(stage)}
                    >
                      <span>{formatAgeRu(stage.ageMa)}</span>
                      <strong>{stage.titleRu}</strong>
                    </button>
                    {isActive ? <MobileStageDetail stage={stage} /> : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create `MobileAtlas`**

Create `src/components/atlas/mobile/MobileAtlas.tsx`:

```tsx
import { ChevronLeft, ChevronRight, Compass, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import type { Era, EvolutionStage } from "../../../data/lineage";
import type { AccumulatedTraitGroup } from "../../../lib/accumulatedTraits";
import type { AtlasUrlMode } from "../../../lib/atlasUrlState";
import { MobileStageMap } from "./MobileStageMap";
import { TraitAccumulator } from "../TraitAccumulator";

type MobileAtlasProps = {
  mode: AtlasUrlMode;
  stages: EvolutionStage[];
  eras: Era[];
  activeStage: EvolutionStage;
  activeIndex: number;
  canStepPrevious: boolean;
  canStepNext: boolean;
  accumulatedTraitGroups: AccumulatedTraitGroup[];
  onActivateMode: (mode: AtlasUrlMode) => void;
  onActivateStage: (stage: EvolutionStage) => void;
  onStep: (delta: number) => void;
};

export function MobileAtlas({
  mode,
  stages,
  eras,
  activeStage,
  activeIndex,
  canStepPrevious,
  canStepNext,
  accumulatedTraitGroups,
  onActivateMode,
  onActivateStage,
  onStep,
}: MobileAtlasProps) {
  return (
    <section className="mobile-atlas" aria-label="Мобильный атлас эволюции">
      <div className="mobile-atlas-hero">
        <p className="eyebrow">Атлас эволюции</p>
        <h1>Путь к человеку как вертикальная карта</h1>
        <p>
          Выберите масштаб, двигайтесь по этапам и раскрывайте активную карточку
          прямо внутри карты.
        </p>
      </div>

      <Tabs value={mode} onValueChange={(value) => onActivateMode(value as AtlasUrlMode)}>
        <TabsList className="mobile-atlas-tabs">
          <TabsTrigger value="all">
            <Compass aria-hidden="true" size={18} />
            Весь путь
          </TabsTrigger>
          <TabsTrigger value="primates">
            <Search aria-hidden="true" size={18} />
            Приматы → человек
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mobile-atlas-stepper" aria-label="Переключение этапов">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={!canStepPrevious}
          aria-label="Предыдущий этап"
        >
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <span aria-live="polite">
          {activeIndex + 1} из {stages.length}: {activeStage.titleRu}
        </span>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={!canStepNext}
          aria-label="Следующий этап"
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      </div>

      <MobileStageMap
        eras={eras}
        stages={stages}
        activeStage={activeStage}
        onActivate={onActivateStage}
      />

      <TraitAccumulator groups={accumulatedTraitGroups} />
    </section>
  );
}
```

- [ ] **Step 4: Run TypeScript expectation**

Run:

```bash
corepack pnpm build
```

Expected at this step: build may fail because `Era` or `AccumulatedTraitGroup` export names differ. If so, inspect actual exports and adjust import types only. Do not change runtime behavior yet.

## Task 3: Branch `AtlasPage` By Viewport

**Files:**
- Modify: `src/pages/AtlasPage.tsx`

- [ ] **Step 1: Import hook and mobile component**

Add:

```tsx
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MobileAtlas } from "../components/atlas/mobile/MobileAtlas";
```

- [ ] **Step 2: Add mobile breakpoint state**

Inside `AtlasPage`, after `atlasRef`:

```tsx
const isMobileAtlas = useMediaQuery("(max-width: 720px)");
```

- [ ] **Step 3: Branch mobile rendering after shared calculations**

After `moveActive`, before the current desktop `return`, add:

```tsx
if (isMobileAtlas) {
  return (
    <div
      className="atlas atlas-mobile-shell"
      ref={atlasRef}
      tabIndex={0}
      style={{ "--active-era-color": activeEra?.color ?? "#d0a35b" } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveActive(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveActive(-1);
        }
      }}
    >
      <p className="sr-only" aria-live="polite">
        Выбран этап {activeStage.titleRu}, {formatAgeRu(activeStage.ageMa)}
      </p>
      <MobileAtlas
        mode={mode}
        stages={visibleStages}
        eras={visibleEras}
        activeStage={activeStage}
        activeIndex={activeIndex}
        canStepPrevious={canStepPrevious}
        canStepNext={canStepNext}
        accumulatedTraitGroups={accumulatedTraitGroups}
        onActivateMode={activateMode}
        onActivateStage={activateStage}
        onStep={moveActive}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify desktop still builds**

Run:

```bash
corepack pnpm build
```

Expected: build passes.

## Task 4: Mobile Atlas CSS

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add mobile Atlas styles**

Append near the Atlas CSS section:

```css
.atlas-mobile-shell {
  padding: 1rem;
}

.mobile-atlas {
  display: grid;
  gap: 1rem;
}

.mobile-atlas-hero {
  display: grid;
  gap: 0.55rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.035);
}

.mobile-atlas-hero h1 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.65rem, 9vw, 2.25rem);
  line-height: 1.05;
}

.mobile-atlas-hero p {
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.5;
}

.mobile-atlas-tabs {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.45rem;
}

.mobile-atlas-tabs .tabs-trigger {
  min-height: 44px;
  justify-content: center;
}

.mobile-atlas-stepper {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(10, 10, 10, 0.72);
}

.mobile-atlas-stepper button {
  min-width: 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--amber);
  background: rgba(255, 255, 255, 0.04);
}

.mobile-atlas-stepper button:disabled {
  opacity: 0.38;
}

.mobile-atlas-stepper span {
  min-width: 0;
  color: var(--text);
  font-weight: 700;
  text-align: center;
}

.mobile-stage-map {
  display: grid;
  gap: 0.85rem;
}

.mobile-era-group {
  border-left: 3px solid var(--mobile-era-color, var(--amber));
  padding-left: 0.75rem;
}

.mobile-era-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.mobile-era-heading span {
  color: var(--text);
  font-weight: 800;
}

.mobile-era-heading small {
  color: var(--muted);
}

.mobile-era-stages {
  display: grid;
  gap: 0.45rem;
}

.mobile-stage-row {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.025);
}

.mobile-stage-row.is-active {
  border-color: var(--mobile-era-color, var(--amber));
  background: rgba(217, 173, 97, 0.08);
}

.mobile-stage-row > button {
  width: 100%;
  min-height: 56px;
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 0;
  color: inherit;
  text-align: left;
  background: transparent;
}

.mobile-stage-row > button span {
  color: var(--muted);
  font-size: 0.88rem;
}

.mobile-stage-row > button strong {
  min-width: 0;
  color: var(--text);
  font-size: 1rem;
}

.mobile-stage-detail {
  display: grid;
  gap: 0.85rem;
  padding: 0 0.75rem 0.85rem;
}

.mobile-stage-detail img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 8px;
}

.mobile-stage-detail-copy {
  display: grid;
  gap: 0.45rem;
}

.mobile-stage-detail-copy h3,
.mobile-stage-detail-copy p {
  margin: 0;
}

.mobile-stage-detail-copy > span,
.mobile-stage-detail-copy .latin {
  color: var(--muted);
  font-size: 0.9rem;
}

.mobile-stage-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.mobile-stage-traits span {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.28rem 0.55rem;
  color: var(--amber);
  font-size: 0.85rem;
}

.mobile-stage-why {
  color: var(--muted);
}

@media (min-width: 721px) {
  .atlas-mobile-shell,
  .mobile-atlas {
    display: none;
  }
}
```

- [ ] **Step 2: Check text fitting on 320px**

Run mobile e2e after Task 5. If long Russian labels overflow, adjust only mobile selectors; do not reduce font below readable sizes.

## Task 5: Mobile E2E Tests

**Files:**
- Modify: `e2e/evolution-atlas.spec.ts`

- [ ] **Step 1: Add mobile-only Atlas test**

Add this test to `test.describe("Evolution Atlas", ...)`:

```ts
test("mobile renders a vertical atlas instead of the desktop timeline", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

  await page.goto("/");
  await expect(page.locator(".mobile-atlas")).toBeVisible();
  await expect(page.locator(".deep-time-axis")).toHaveCount(0);
  await expect(page.locator(".stage-panel")).toHaveCount(0);
  await expect(
    page.getByRole("tab", { name: /Весь путь/i }),
  ).toHaveAttribute("aria-selected", "true");

  await expect(page.locator(".mobile-stage-row").first()).toBeVisible();
  await expect(page.locator(".mobile-stage-detail")).toHaveCount(1);

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
});
```

- [ ] **Step 2: Add mobile mode/stage URL test**

Add:

```ts
test("mobile mode and stage interactions preserve shared atlas URL state", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

  await page.goto("/");

  await page.getByRole("tab", { name: /Приматы.*человек/i }).click();
  await expect(page).toHaveURL(/mode=primates/);
  await expect(page.locator(".mobile-stage-row")).toHaveCount(16);

  await page
    .locator(".mobile-stage-row")
    .filter({ hasText: "Ранние человекообразные" })
    .getByRole("button")
    .click();
  await expect(page).toHaveURL(/mode=primates&stage=early-apes/);
  await expect(
    page.locator(".mobile-stage-detail").getByRole("heading", {
      name: "Ранние человекообразные",
    }),
  ).toBeVisible();
});
```

- [ ] **Step 3: Add mobile touch target test**

Add:

```ts
test("mobile atlas controls and rows meet touch target height", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

  await page.goto("/");

  const targetHeights = await page
    .locator(
      ".mobile-atlas-tabs button, .mobile-atlas-stepper button, .mobile-stage-row > button",
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => Math.round(node.getBoundingClientRect().height)),
    );

  expect(targetHeights.length).toBeGreaterThan(10);
  for (const height of targetHeights) {
    expect(height).toBeGreaterThanOrEqual(44);
  }
});
```

- [ ] **Step 4: Verify RED before implementation if tests were written first**

If this task is run before Tasks 2-4, run:

```bash
corepack pnpm e2e -- --project=mobile -g "mobile renders a vertical atlas"
```

Expected: FAIL because `.mobile-atlas` does not exist yet.

- [ ] **Step 5: Verify GREEN after implementation**

Run:

```bash
corepack pnpm e2e -- --project=mobile -g "mobile"
```

Expected: mobile tests pass.

## Task 6: Full Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Unit/build check**

Run:

```bash
corepack pnpm check
```

Expected: lint, unit tests, and build pass.

- [ ] **Step 2: Desktop e2e**

Run:

```bash
corepack pnpm e2e -- --project=desktop
```

Expected:

- Existing desktop Atlas layout still renders `.deep-time-axis` and `.stage-panel`.
- Desktop topbar/nav tests still pass.
- Desktop hover-only extinction callout test still passes.

- [ ] **Step 3: Mobile e2e**

Run:

```bash
corepack pnpm e2e -- --project=mobile
```

Expected:

- `/` renders `.mobile-atlas`, not `.deep-time-axis`.
- Shared URL state works for `mode=primates&stage=early-apes`.
- No document-level horizontal overflow.
- Mobile controls and rows meet 44px touch height.

- [ ] **Step 4: Manual browser check**

Start dev server:

```bash
corepack pnpm dev --host 127.0.0.1 --port 4173
```

Open:

```text
http://127.0.0.1:4173/
```

Check:

- At desktop width, the current Atlas layout is unchanged.
- At iPhone width, the mobile vertical Atlas appears.
- Switching tabs updates URL and content.
- Tapping a row expands the active detail inline.
- Browser Back/Forward restore selected stage.

## Self-Review

Spec coverage:

- Same URL, no separate app: Task 3 branches inside `AtlasPage`.
- Shared data and URL state: `AtlasPage` still owns `mode`, `stage`, `visibleStages`, `visibleEras`, `activeStage`, and `toAtlasSearchParams`.
- Compact vertical map: Tasks 2 and 4.
- 44px controls: Tasks 2, 4, and 5.
- Desktop unchanged: Task 6 desktop e2e.
- Mobile no horizontal overflow: Task 5 and Task 6.

Placeholder scan:

- No `TBD`, no “implement later”, no route or file left unnamed.

Type consistency:

- `MobileAtlas` receives `EvolutionStage[]`, `Era[]`, `AtlasUrlMode`, and `AccumulatedTraitGroup[]`.
- `MobileStageMap` and `MobileStageDetail` only need existing `EvolutionStage` fields.
- `useMediaQuery` is browser-safe and returns `false` without `matchMedia`, so initial render defaults to desktop.

Execution note:

- If implementation happens in this clean worktree, commit after full verification or after each task if the user explicitly asks for incremental commits.
