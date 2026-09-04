import { expect, test } from "@playwright/test";

for (const width of [1280, 820, 721]) {
  test(`atlas labels stay separate at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Desktop and tablet timeline.");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".deep-time-selection")).toContainText("Ранние родственники приматов");

    const layout = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const intersects = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const labels = Array.from(document.querySelectorAll(".deep-time-region-label, .extinction-legend-item"));
      const collisions = labels.flatMap((label, index) => labels.slice(index + 1)
        .filter((other) => intersects(label.getBoundingClientRect(), other.getBoundingClientRect()))
        .map((other) => `${label.textContent} / ${other.textContent}`));
      return {
        collisions,
        selectionAboveImage: rect(".deep-time-selection").bottom <= rect(".deep-time-axis").top,
        eventsBelowImage: rect(".extinction-legend").top >= rect(".deep-time-axis").bottom,
        imageTop: rect(".deep-time-axis").top,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });
    expect(layout.collisions).toEqual([]);
    expect(layout.selectionAboveImage).toBe(true);
    expect(layout.eventsBelowImage).toBe(true);
    expect(layout.overflow).toBe(false);
    if (width === 1280) expect(layout.imageTop).toBeLessThan(550);

    await page.getByLabel("Выбрать массовое вымирание")
      .getByRole("button", { name: /Пермское вымирание/ }).click();
    await expect(page).toHaveURL(/event=permian-triassic/);
    await expect(page.locator(".deep-time-selection")).toContainText("Пермское");
    await expect(page.locator(".extinction-detail-panel h2")).toHaveText("Пермское вымирание");
    await expect(page.locator(".extinction-legend-item[aria-pressed=true]")).toHaveCount(1);

    await page.locator(".deep-time-panel .axis-step-controls")
      .getByRole("button", { name: "Следующий этап" }).click();
    await expect(page.locator(".deep-time-selection")).toContainText("Цинодонты");
    await expect(page.locator(".stage-copy h2")).toHaveText("Цинодонты");
    await expect(page.locator(".extinction-legend-item[aria-pressed=true]")).toHaveCount(0);
  });
}
