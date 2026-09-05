import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import {
  BODY_TRAIT_LAYERS,
  getBodyTraitsByLayer,
} from "../src/data/bodyTraits";
import { getStageById } from "../src/data/lineage";
import { CONFIDENCE_LABELS } from "../src/data/confidence";

test.describe.configure({ mode: "parallel" });

for (const width of [1440, 1100, 960, 820, 391, 320]) {
  test(`body map layers, coordinates and details at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Explicit responsive viewports.",
    );
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 860 });
    await page.goto("/body-map");
    await expect(page.locator(".body-map-canvas img")).toBeVisible();
    const screenshots = testInfo.outputPath("screenshots");
    await mkdir(screenshots, { recursive: true });
    const initial = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      tabRows: new Set(
        [...document.querySelectorAll('[role="tab"]')].map((el) =>
          Math.round(el.getBoundingClientRect().top),
        ),
      ).size,
      mapTop: document
        .querySelector(".body-map-canvas")!
        .getBoundingClientRect().top,
    }));
    expect(initial.overflow).toBe(false);
    expect(initial.tabRows).toBe(1);
    if (width >= 391) expect(initial.mapTop).toBeLessThan(600);
    await page.screenshot({ path: `${screenshots}/${width}-intro.png` });

    for (const layer of BODY_TRAIT_LAYERS) {
      await page
        .getByRole("tab", { name: layer.shortTitleRu, exact: true })
        .click();
      const traits = getBodyTraitsByLayer(layer.id);
      const selectedTrait = traits.at(-1)!;
      const stage = getStageById(selectedTrait.stageId)!;
      const image = page.locator(".body-map-canvas img");
      await expect
        .poll(() =>
          image.evaluate(
            (node) =>
              (node as HTMLImageElement).complete &&
              (node as HTMLImageElement).naturalWidth > 0,
          ),
        )
        .toBe(true);
      await expect(page.locator(".body-trait-pin")).toHaveCount(traits.length);
      await expect(page.locator(".body-trait-list button")).toHaveCount(
        traits.length,
      );
      const geometry = await page.evaluate(() => {
        const img = document.querySelector<HTMLImageElement>(
          ".body-map-canvas img",
        )!;
        const rect = img.getBoundingClientRect();
        const errors = [
          ...document.querySelectorAll<HTMLElement>(".body-trait-pin"),
        ].map((pin) => {
          const p = pin.getBoundingClientRect();
          const css = getComputedStyle(pin);
          const x = parseFloat(css.getPropertyValue("--trait-x"));
          const y = parseFloat(css.getPropertyValue("--trait-y"));
          return Math.max(
            Math.abs(
              ((p.left + p.width / 2 - rect.left) / rect.width) * 100 - x,
            ),
            Math.abs(
              ((p.top + p.height / 2 - rect.top) / rect.height) * 100 - y,
            ),
          );
        });
        return {
          ratio: rect.width / rect.height,
          naturalRatio: img.naturalWidth / img.naturalHeight,
          coordinateError: Math.max(...errors),
          numbers: [...document.querySelectorAll(".body-trait-pin span")].map(
            (span) => span.textContent,
          ),
          listNumbers: [
            ...document.querySelectorAll(".body-trait-list .body-trait-number"),
          ].map((span) => span.textContent),
          zoomCursor: getComputedStyle(img.closest("button")!).cursor,
        };
      });
      expect(geometry.ratio).toBeCloseTo(geometry.naturalRatio, 3);
      expect(geometry.coordinateError).toBeLessThan(0.1);
      expect(geometry.numbers).toEqual(
        traits.map((_, i) => String(i + 1).padStart(2, "0")),
      );
      expect(geometry.numbers).toEqual(geometry.listNumbers);
      expect(geometry.zoomCursor).toBe("zoom-in");
      const pin = page.locator(".body-trait-pin").nth(traits.length - 1);
      await pin.click();
      const scrollPosition = await page.evaluate(() => scrollY);
      const inspector = page.locator(".body-trait-inspector");
      await expect(inspector.getByRole("heading", { level: 2 })).toHaveText(
        selectedTrait.titleRu,
      );
      await expect(
        inspector.getByRole("heading", { level: 2 }),
      ).toBeInViewport();
      await expect(inspector.locator(".body-trait-note")).toHaveText(
        selectedTrait.noteRu,
      );
      await expect(inspector.locator(".confidence-badge")).toHaveText(
        CONFIDENCE_LABELS[selectedTrait.confidence],
      );
      await expect(
        inspector.getByRole("link", { name: "Открыть этап в Атласе" }),
      ).toHaveAttribute("href", new RegExp(`stage=${stage.slug}$`));
      await expect
        .poll(() =>
          inspector
            .locator(".body-trait-stage img")
            .evaluate(
              (node) =>
                (node as HTMLImageElement).complete &&
                (node as HTMLImageElement).naturalWidth > 0,
            ),
        )
        .toBe(true);
      if (width >= 960) {
        const sticky = await inspector.evaluate((el) => ({
          top: el.getBoundingClientRect().top,
          header: document.querySelector(".topbar")!.getBoundingClientRect()
            .bottom,
        }));
        expect(sticky.top).toBeGreaterThan(sticky.header);
      }
      if ([1440, 391].includes(width))
        await page.screenshot({
          path: `${screenshots}/${width}-${layer.id}-details.png`,
        });
      if (layer.id === "cells-energy") {
        await inspector
          .getByRole("button", {
            name: `Увеличить изображение: ${stage.titleRu}`,
            exact: true,
          })
          .click();
        const large = page.getByRole("dialog", {
          name: "Изображение предкового узла крупно",
          exact: true,
        });
        await expect(large).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(
          large.getByRole("button", {
            name: "Закрыть увеличенное изображение",
          }),
        ).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(large).toHaveCount(0);
        if (width < 960)
          await expect(page.locator("dialog.body-trait-dialog")).toBeVisible();
      }
      if (width < 960) {
        await page
          .getByRole("button", { name: "Вернуться к карте", exact: true })
          .click();
        await expect(pin).toBeFocused();
        expect(await page.evaluate(() => scrollY)).toBe(scrollPosition);
      }
      await expect(page.locator(".body-map-selected")).toContainText(
        selectedTrait.titleRu,
      );
      const listButton = page.locator(".body-trait-list button").first();
      await listButton.click();
      await expect(page.locator(".body-trait-inspector h2")).toHaveText(
        traits[0].titleRu,
      );
      if (width < 960) {
        await page.keyboard.press("Escape");
        await expect(listButton).toBeFocused();
      }
    }
    const zoom = page.getByRole("button", {
      name: "Увеличить карту: Мозг и социальность",
      exact: true,
    });
    await zoom.click({ position: { x: 14, y: 25 } });
    await expect(
      page.getByRole("dialog", { name: "Карта признаков крупно", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".image-lightbox-panel img")).toHaveAttribute(
      "src",
      /brain-social\.png/,
    );
    await page.screenshot({ path: `${screenshots}/${width}-map-zoom.png` });
    await page.keyboard.press("Escape");
    await expect(zoom).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}

test("body map keyboard tabs and nested viewer survive resize", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Explicit responsive viewports.",
  );
  await page.setViewportSize({ width: 320, height: 860 });
  await page.goto("/body-map");
  await page.getByRole("tab", { name: "Клетка", exact: true }).focus();
  await page.keyboard.press("End");
  const brain = page.getByRole("tab", { name: "Мозг", exact: true });
  await expect(brain).toBeFocused();
  await expect(brain).toHaveAttribute("aria-selected", "true");
  await expect(brain).toBeInViewport();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Клетка", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(brain).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "Клетка", exact: true }),
  ).toBeFocused();
  await page.locator(".body-trait-pin").first().click();
  await page.locator(".body-trait-stage-media button").click();
  await expect(page.locator(".image-lightbox")).toBeVisible();
  await page.setViewportSize({ width: 1100, height: 620 });
  await expect(page.locator("dialog.body-trait-dialog")).toHaveCount(0);
  await expect(page.locator(".image-lightbox")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
  await page.locator(".body-trait-pin").last().click();
  const inspector = page.locator(".body-trait-inspector");
  await expect
    .poll(() =>
      inspector.evaluate((el) =>
        Math.round(
          el.getBoundingClientRect().top -
            document.querySelector(".topbar")!.getBoundingClientRect().bottom,
        ),
      ),
    )
    .toBe(16);
  const box = (await inspector.boundingBox())!;
  const scrollPosition = await page.evaluate(() => scrollY);
  await page.mouse.move(box.x + box.width - 15, box.y + 80);
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => inspector.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(50);
  expect(await page.evaluate(() => scrollY)).toBe(scrollPosition);
  await page.locator(".body-trait-pin").first().click();
  await expect.poll(() => inspector.evaluate((el) => el.scrollTop)).toBe(0);
});
