import { expect, test } from "@playwright/test";

for (let index = 0; index < 10; index += 1) {
  test(`origin illustration ${index + 1} opens whole and returns to its card`, async ({ page }, testInfo) => {
    await page.goto("/origin-of-life");
    const triggers = page.locator(".origin-image-zoom");
    await expect(triggers).toHaveCount(10);
    const trigger = triggers.nth(index);
    const src = await trigger.locator("img").getAttribute("src");
    const dialog = page.getByRole("dialog", { name: "Иллюстрация происхождения жизни" });
    await trigger.scrollIntoViewIfNeeded();
    if (testInfo.project.name === "desktop") {
      await trigger.focus();
      await page.keyboard.press("Enter");
    } else {
      await trigger.tap();
    }
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toHaveAttribute("src", src!);
    await expect.poll(() => dialog.locator("img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(1000);
    await expect(dialog.locator("img")).toHaveCSS("object-fit", "contain");
    await expect(dialog.locator("p")).not.toBeEmpty();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    const close = dialog.getByRole("button", { name: "Закрыть увеличенное изображение" });
    await expect(close).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(close).toBeFocused();

    if (index === 4) {
      await page.screenshot({ path: testInfo.outputPath("origin-image-expanded.png"), animations: "disabled" });
    }
    if (index % 3 === 0) await page.keyboard.press("Escape");
    else if (index % 3 === 1) await close.click();
    else await dialog.click({ position: { x: 2, y: 2 } });

    await expect(dialog).not.toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(trigger).toBeFocused();
    await expect(trigger).toBeInViewport();
  });
}

test("origin hypothesis previews keep their aspect ratio without overflow", async ({ page }, testInfo) => {
  await page.goto("/origin-of-life");
  const firstHypothesis = page.locator(".origin-hypothesis-card").first();
  await firstHypothesis.scrollIntoViewIfNeeded();
  const preview = firstHypothesis.locator("img");
  await expect(preview).toHaveCSS("object-fit", "contain");
  const bounds = await preview.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width / bounds!.height).toBeCloseTo(1.5, 1);
  if (testInfo.project.name === "desktop") expect(bounds!.height).toBeGreaterThan(350);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("origin-larger-previews.png"), animations: "disabled" });
});
