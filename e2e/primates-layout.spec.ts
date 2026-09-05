import { expect, test } from "@playwright/test";

for (const width of [1440, 1280, 820, 721, 391]) {
  test(`primates navigation and layout at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Explicit desktop and mobile viewport coverage.");
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/primates?stage=early-apes");
    const context = page.locator(".primate-context-note");
    await expect(context.locator("p")).not.toBeVisible();
    await context.locator("summary").click();
    await expect(context.locator("p")).toContainText("7 млн лет назад");
    await context.locator("summary").click();

    if (width > 720) {
      await expect(page.locator(".deep-time-selection")).toContainText("Ранние человекообразные");
      await page.getByRole("button", { name: "Гоминины", exact: true }).click();
      await expect(page).toHaveURL(/stage=hominins/);
      await expect(page.locator(".deep-time-selection")).toContainText("Ранние гоминины");
      await page.locator(".primate-deep-axis").focus();
      await page.keyboard.press("ArrowRight");
      await expect(page).toHaveURL(/stage=ardipithecus/);
      await expect(page.locator(".deep-time-selection")).toContainText("Ардипитеки");
    } else {
      await expect(page.locator(".mobile-era-group")).toHaveCount(3);
      await expect(page.locator(".mobile-stage-row")).toHaveCount(17);
      await expect(page.locator(".mobile-selection-age")).toHaveText("20 млн лет назад");
    }

    const navigation = page.getByRole("navigation", { name: "На этой странице" });
    await navigation.getByRole("link", { name: "Развилки", exact: true }).click();
    await expect(page).toHaveURL(/stage=.+#primate-branches$/);
    await expect(page.locator("#primate-branches")).toBeInViewport();
    const cards = page.locator(".primate-branch-milestone");
    await expect(cards).toHaveCount(6);
    const layout = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".primate-branch-milestone")];
      const misaligned = cards.flatMap((card, index) => cards.slice(index + 1).filter((other) => {
        if (Math.abs(card.getBoundingClientRect().top - other.getBoundingClientRect().top) > 1) return false;
        return ["span", "strong", "small"].some((selector) =>
          Math.abs(card.querySelector(selector)!.getBoundingClientRect().top - other.querySelector(selector)!.getBoundingClientRect().top) > 1);
      }));
      const selection = document.querySelector(".deep-time-selection")?.getBoundingClientRect();
      const panorama = document.querySelector(".primate-deep-axis")?.getBoundingClientRect();
      return {
        misaligned: misaligned.length,
        selectionAboveImage: !selection || !panorama || selection.bottom <= panorama.top,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    expect(layout).toEqual({ misaligned: 0, selectionAboveImage: true, overflow: false });
    await page.screenshot({ path: testInfo.outputPath(`primates-branches-${width}.png`) });
    await cards.filter({ hasText: "Homo sapiens" }).click();
    await expect(page).toHaveURL(/stage=homo-sapiens/);
    await expect(cards.filter({ hasText: "Homo sapiens" })).toHaveAttribute("aria-current", "true");
    if (width <= 720) {
      await expect(page.locator(".mobile-stage-row.is-active")).toBeInViewport();
    }

    await navigation.getByRole("link", { name: "Африка", exact: true }).click();
    await expect(page).toHaveURL(/stage=homo-sapiens#africa-origin-title$/);
    await expect(page.locator("#africa-origin-title")).toBeInViewport();
    await navigation.getByRole("link", { name: "Шкала", exact: true }).click();
    await expect(page.locator("#primate-timeline")).toBeInViewport();
    await page.goto("/primates");
    await expect(page.locator(".primate-context-note")).toBeVisible();
    await expect.poll(() => page.locator(width > 720
      ? ".primate-timeline-river-image, .stage-plate img"
      : ".mobile-stage-detail img").evaluateAll((images) =>
      images.length > 0 && images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)
    )).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`primates-top-${width}.png`), animations: "disabled" });
  });
}
