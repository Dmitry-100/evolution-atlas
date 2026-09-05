import { expect, test } from "@playwright/test";

for (const width of [1920, 1280, 1100, 820, 391, 320]) {
  test(`dinosaurs layout and selection at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Explicit responsive viewports.",
    );
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dinosaurs");
    await expect(
      page.locator(".dinosaur-hero-image img").first(),
    ).toHaveJSProperty("complete", true);
    await page.screenshot({
      path: testInfo.outputPath(`${width}-intro.png`),
      animations: "disabled",
    });
    await page.getByRole("link", { name: "Шкала", exact: true }).click();
    const timeline = page.locator("#dinosaur-timeline");
    await expect(timeline).toBeInViewport();
    const heading = await timeline.locator("h2").first().boundingBox();
    const header = await page.locator(".topbar").boundingBox();
    expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height);

    if (width > 720) {
      const route = page.getByRole("navigation", {
        name: "Маршрут динозавровой ветви",
      });
      const dinosaurs = route.getByRole("button", { name: /^Динозавры,/ });
      await dinosaurs.click();
      await expect(dinosaurs).toHaveAttribute("aria-current", "step");
      await expect(page.locator(".dinosaur-detail-copy h2")).toHaveText(
        "Ранние динозавры",
      );
      await expect(page.locator(".dinosaur-detail-visual img")).toHaveAttribute(
        "src",
        /early-dinosaurs-v2/,
      );
      const axis = page.locator(".dinosaur-deep-axis");
      await axis.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.locator(".dinosaur-detail-copy h2")).toHaveText(
        "Тероподы",
      );
      await expect(page.locator(".dinosaur-axis-current span")).toContainText(
        "13 из 18",
      );
      const popup = page.locator(".deep-active-card");
      const popupBox = await popup.boundingBox();
      const textBox = await popup.locator("small").boundingBox();
      expect(textBox!.y + textBox!.height).toBeLessThan(
        popupBox!.y + popupBox!.height,
      );
      if (width > 1200) {
        const grid = await page.locator(".dinosaur-atlas-grid").boundingBox();
        const detail = await page
          .locator(".dinosaur-detail-card")
          .boundingBox();
        expect(detail!.width / grid!.width).toBeGreaterThan(0.4);
        expect(detail!.width / grid!.width).toBeLessThan(0.5);
      }
    } else {
      const row = page.locator('[data-stage-id="early-dinosaurs"]');
      await row.locator(":scope > button").click();
      await expect(row).toHaveClass(/is-active/);
      await expect(page.locator(".mobile-dinosaur-stage-detail")).toHaveCount(
        1,
      );
      const rowBox = await row.boundingBox();
      expect(rowBox!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    }
    const detail = page.locator(
      width > 720 ? ".dinosaur-detail-card" : ".mobile-dinosaur-stage-detail",
    );
    const zoom = detail.getByRole("button", {
      name: /^Увеличить изображение:/,
    });
    await expect(zoom).toHaveCSS("cursor", "zoom-in");
    await expect(zoom.locator("img")).toHaveCSS("object-fit", "contain");
    await expect(zoom.locator("img")).toHaveJSProperty("complete", true);
    await expect(zoom.locator("img")).not.toHaveJSProperty("naturalWidth", 0);
    await zoom.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`${width}-selected.png`),
      animations: "disabled",
    });
    await zoom.click();
    const dialog = page.getByRole("dialog", {
      name: "Увеличенное изображение вида",
    });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(zoom).toBeFocused();
    await detail.locator(".dinosaur-evidence summary").click();
    await expect(detail.locator(".dinosaur-sources a").first()).toBeVisible();

    await page.getByRole("link", { name: "Общий предок", exact: true }).click();
    const ancestor = page.locator("#dinosaur-common-ancestor");
    await expect(ancestor).toBeInViewport();
    const ancestorZoom = ancestor.getByRole("button", {
      name: /^Увеличить изображение:/,
    });
    await ancestorZoom.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`${width}-ancestor.png`),
      animations: "disabled",
    });
    await ancestorZoom.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(ancestorZoom).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}
