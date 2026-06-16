# Time Scale Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the atlas UI around a dramatic two-scale timeline, source-backed images, and an evidence explanation section.

**Architecture:** Keep Vite/React/TypeScript. Add data helpers for time proportions and evidence modules, then replace the timeline rendering with two specialized axis components: one for all life and one for primates. Keep images local under `public/assets/images/source-backed/`.

**Tech Stack:** Vite, React, TypeScript, Radix primitives, lucide-react, Vitest, Playwright.

---

### Task 1: Data Contracts

**Files:**
- Modify: `src/data/lineage.test.ts`
- Modify: `src/lib/timeline.test.ts`
- Create: `src/data/evidence.test.ts`
- Create: `src/data/evidence.ts`
- Modify: `src/lib/timeline.ts`

- [ ] Add failing tests for pre-primate proportion, local image paths, and evidence modules.
- [ ] Implement `getPrePrimateShare()` and evidence data.
- [ ] Run `npm run test`.

### Task 2: Image Upgrade

**Files:**
- Modify: `src/data/lineage.ts`
- Add assets: `public/assets/images/source-backed/*.jpg`

- [ ] Fetch Wikimedia Commons/source-backed images for every stage where possible.
- [ ] Store images locally and update `StageImage` metadata.
- [ ] Keep source URLs and licenses visible on `/sources`.
- [ ] Run data tests.

### Task 3: Two-Scale UI

**Files:**
- Create: `src/components/atlas/DeepTimeAxis.tsx`
- Create: `src/components/atlas/PrimateAxis.tsx`
- Modify: `src/components/atlas/TimelineRiver.tsx`
- Modify: `src/pages/AtlasPage.tsx`
- Modify: `src/index.css`

- [ ] Replace the current single river with a whole-life axis that emphasizes the long pre-primate span.
- [ ] Add primate-only image-node axis for zoom mode.
- [ ] Update headline and mode copy.
- [ ] Preserve keyboard, click, hover, and slider behavior.

### Task 4: Evidence Section

**Files:**
- Create: `src/components/atlas/EvidenceSection.tsx`
- Modify: `src/pages/AtlasPage.tsx`
- Modify: `src/pages/AboutPage.tsx`
- Modify: `src/index.css`

- [ ] Add “Почему это теория и почему ей доверяют”.
- [ ] Explain scientific theory clearly.
- [ ] Render six evidence modules.

### Task 5: Verification and Publish

**Files:**
- Modify: `e2e/evolution-atlas.spec.ts`
- Modify: `README.md`
- Modify: `DESIGN.md`

- [ ] Update e2e expectations.
- [ ] Run `npm run check`.
- [ ] Run `npm run e2e`.
- [ ] Capture desktop/mobile screenshots and compare with the concept image.
- [ ] Commit, push, and verify GitHub Actions.
