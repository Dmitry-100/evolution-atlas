import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

for (const width of [1440, 1100, 960, 820, 391, 320]) {
  test(`cladogram selection, photo and scroll at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Explicit responsive viewports.",
    );
    await page.setViewportSize({ width, height: 860 });
    await page.goto("/cladogram");
    const screenshots = testInfo.outputPath("screenshots");
    await mkdir(screenshots, { recursive: true });
    await expect(
      page.getByRole("heading", { name: "Дерево родства", exact: true }),
    ).toHaveCount(1);
    await expect(page.locator(".cladogram-branch-count")).toHaveText(
      "Соседних ветвей: 29",
    );
    await expect(page.locator(".cladogram-map")).toBeVisible();
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      treeFirst:
        document.querySelector(".cladogram-page-grid")!.getBoundingClientRect()
          .bottom <=
        document.querySelector(".tree-of-life-poster")!.getBoundingClientRect()
          .top,
    }));
    expect(layout).toEqual({ overflow: false, treeFirst: true });
    await page.screenshot({ path: `${screenshots}/${width}-intro.png` });
    await page
      .getByRole("button", { name: "Живущие сегодня", exact: true })
      .click();
    await expect(page.locator(".cladogram-branch-count")).toHaveText(
      "Соседних ветвей: 27",
    );
    await page.getByRole("button", { name: "Все ветви", exact: true }).click();
    const squirrel = page
      .locator(".cladogram-branch")
      .filter({ hasText: "Грызуны и зайцеобразные" });
    await squirrel.click();
    const inspector = page.locator(".cladogram-inspector");
    const title = inspector.getByRole("heading", { level: 2 });
    const image = inspector.locator(".cladogram-inspector-media img");
    await expect(title).toHaveText("Грызуны и зайцеобразные");
    await expect(title).toBeInViewport();
    await expect
      .poll(() => image.evaluate((i) => (i as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(inspector.locator(".stage-plate-zoom-indicator")).toHaveCount(
      0,
    );
    const photoLayout = await inspector.evaluate((el) => {
      const img = el.querySelector("img")!;
      const rect = img.getBoundingClientRect();
      return {
        ratio: rect.width / rect.height,
        naturalRatio: img.naturalWidth / img.naturalHeight,
        titleBeforePhoto:
          el.querySelector("h2")!.getBoundingClientRect().bottom <= rect.top,
        detailsBelowPhoto:
          el.querySelector(".cladogram-inspector-note")!.getBoundingClientRect()
            .top >= rect.bottom,
        cursor: getComputedStyle(img.closest("button")!).cursor,
        top: el.getBoundingClientRect().top,
        headerBottom: document.querySelector(".topbar")!.getBoundingClientRect()
          .bottom,
      };
    });
    expect(photoLayout.ratio).toBeCloseTo(photoLayout.naturalRatio, 2);
    expect(photoLayout.titleBeforePhoto).toBe(true);
    expect(photoLayout.detailsBelowPhoto).toBe(true);
    expect(photoLayout.cursor).toBe("zoom-in");
    if (width >= 960)
      expect(photoLayout.top).toBeGreaterThan(photoLayout.headerBottom);
    const treePosition = await page.evaluate(() => scrollY);
    const cardBox = (await inspector.boundingBox())!;
    await page.mouse.move(cardBox.x + cardBox.width - 20, cardBox.y + 100);
    await page.mouse.wheel(0, 350);
    await expect
      .poll(() => inspector.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(100);
    expect(await page.evaluate(() => scrollY)).toBe(treePosition);
    await image.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${screenshots}/${width}-photo-scroll.png` });
    await inspector
      .getByRole("button", {
        name: "Увеличить изображение: Грызуны и зайцеобразные",
        exact: true,
      })
      .click();
    const lightbox = page.getByRole("dialog", {
      name: "Увеличенное изображение ветви",
      exact: true,
    });
    await expect(lightbox).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(
      lightbox.getByRole("button", { name: "Закрыть увеличенное изображение" }),
    ).toBeFocused();
    await page.screenshot({ path: `${screenshots}/${width}-lightbox.png` });
    await page.keyboard.press("Escape");
    await expect(lightbox).toHaveCount(0);
    if (width < 960) {
      await expect(page.locator("dialog.cladogram-mobile-panel")).toBeVisible();
      await expect(
        inspector.locator(".cladogram-inspector-image-zoom"),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog.cladogram-mobile-panel")).toHaveCount(
        0,
      );
      await expect(squirrel).toBeFocused();
      expect(await page.evaluate(() => scrollY)).toBe(treePosition);
      await squirrel.click();
      await page
        .getByRole("button", { name: "Вернуться к дереву", exact: true })
        .click();
      await expect(squirrel).toBeFocused();
    } else {
      // Wheel at the bottom of the card must continue scrolling the page.
      await inspector.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.mouse.move(cardBox.x + cardBox.width - 20, cardBox.y + 100);
      await page.mouse.wheel(0, 450);
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeGreaterThan(treePosition);
      await page
        .locator(".cladogram-branch")
        .filter({ hasText: "Лемуры и лори" })
        .click();
      await expect(inspector.getByRole("heading", { level: 2 })).toHaveText(
        "Лемуры и лори",
      );
      await expect.poll(() => inspector.evaluate((el) => el.scrollTop)).toBe(0);
      await expect(
        inspector.getByRole("heading", { level: 2 }),
      ).toBeInViewport();
      await page.screenshot({ path: `${screenshots}/${width}-selected.png` });
    }
    await page
      .getByRole("button", { name: "К выбранному узлу", exact: true })
      .click();
    await expect(
      page.locator('.cladogram-map button[aria-current="true"]'),
    ).toBeFocused();
    await expect(
      page.locator('.cladogram-map button[aria-current="true"]'),
    ).toBeInViewport();
    const poster = page.getByRole("button", {
      name: "Рассмотреть постер дерева жизни крупно",
      exact: true,
    });
    await poster.click();
    await expect(
      page.getByRole("dialog", {
        name: "Постер дерева жизни крупно",
        exact: true,
      }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(poster).toBeFocused();
  });
}

test("cladogram dialogs release scroll when resized during image viewing", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Explicit responsive viewports.",
  );
  await page.setViewportSize({ width: 391, height: 860 });
  await page.goto("/cladogram?stage=bilaterians");
  await page.locator(".cladogram-inspector-image-zoom").click();
  await expect(page.locator(".image-lightbox")).toBeVisible();
  await page.setViewportSize({ width: 1100, height: 620 });
  await expect(page.locator("dialog.cladogram-mobile-panel")).toHaveCount(0);
  await expect(page.locator(".image-lightbox")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
  const selected = page.locator('.cladogram-map button[aria-current="true"]');
  await selected.click();
  const inspector = page.locator(".cladogram-inspector");
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
  await page.setViewportSize({ width: 1440, height: 620 });
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
  await inspector
    .getByRole("link", { name: "Открыть в Атласе" })
    .scrollIntoViewIfNeeded();
  await expect(
    inspector.getByRole("link", { name: "Открыть в Атласе" }),
  ).toBeInViewport();
});
