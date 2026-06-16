import { expect, test } from "@playwright/test";

test.describe("Evolution Atlas", () => {
  test("renders the atlas without console errors or horizontal overflow", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Путь к человеку/i })).toBeVisible();
    await expect(page.locator(".timeline-river")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ранние приматы/i })).toBeVisible();

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test("hover, click and primate mode update the active species card", async ({ page }, testInfo) => {
    await page.goto("/");

    const image = page.locator(".stage-plate img");
    const firstSrc = await image.getAttribute("src");

    await page.getByRole("button", { name: "Homo sapiens", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Homo sapiens", exact: true })).toBeVisible();
    await expect(image).not.toHaveAttribute("src", firstSrc ?? "");

    await page.getByRole("tab", { name: /Приматы крупно/i }).click();
    await expect(page.getByText(/масштаб: 65 млн лет/i)).toBeVisible();

    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: /Древние приматы, 55 млн лет назад/i }).click();
    } else {
      const river = page.locator(".timeline-river");
      await river.hover({ position: { x: 30, y: 240 } });
    }
    await expect(page.getByRole("heading", { name: /Древние приматы/i })).toBeVisible();
  });

  test("sources route exposes image metadata and source links", async ({ page }) => {
    await page.goto("/sources");
    await expect(page.getByRole("heading", { name: /Источники/i })).toBeVisible();
    await expect(page.getByText(/Visual Capitalist/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sourceUrl/i }).first()).toBeVisible();
  });
});
