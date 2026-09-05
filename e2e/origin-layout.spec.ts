import { expect, test } from "@playwright/test";

for (const width of [1440, 820, 391]) {
  test(`origin comparison and LUCA selection at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Explicit responsive viewports.");
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/origin-of-life");
    await expect(page.locator(".origin-story-grid > li")).toHaveCount(4);
    await expect(page.locator(".origin-story-card img")).toHaveCount(4);
    await expect(page.locator(".origin-story-note")).toContainText("порядок ранних процессов пока обсуждается");

    const layout = await page.evaluate(() => {
      const steps = [...document.querySelectorAll(".origin-story-card")];
      const hypotheses = [...document.querySelectorAll(".origin-hypothesis-card")];
      const aligned = (cards: Element[], selectors: string[]) => cards.every((card, index) => cards.slice(index + 1).every((other) => {
        if (Math.abs(card.getBoundingClientRect().top - other.getBoundingClientRect().top) > 1) return true;
        return selectors.every((selector) => Math.abs(card.querySelector(selector)!.getBoundingClientRect().top - other.querySelector(selector)!.getBoundingClientRect().top) < 1);
      }));
      return {
        stepsAligned: aligned(steps, ["img", "h3", "p"]),
        comparisonsAligned: aligned(hypotheses, ["img", "figcaption", "h3", ".origin-hypothesis-status", ":scope > p", "dl > div:nth-child(1)", "dl > div:nth-child(2)", "dl > div:nth-child(3)"]),
        hypothesisColumns: hypotheses.filter((card) => Math.abs(card.getBoundingClientRect().top - hypotheses[0].getBoundingClientRect().top) < 1).length,
        firstImageTop: steps[0].querySelector("img")!.getBoundingClientRect().top,
        imageOffsetFromIntro: steps[0].querySelector("img")!.getBoundingClientRect().top - document.querySelector(".page-header")!.getBoundingClientRect().bottom,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    expect(layout.stepsAligned).toBe(true);
    expect(layout.comparisonsAligned).toBe(true);
    expect(layout.hypothesisColumns).toBe(width > 720 ? 2 : 1);
    expect(layout.overflow).toBe(false);
    expect(layout.firstImageTop).toBeLessThan(720);
    expect(layout.imageOffsetFromIntro).toBeLessThan(260);

    await expect.poll(() => page.locator(".origin-story-card img").first().evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`origin-top-${width}.png`), animations: "disabled" });

    const exhibit = page.locator(".luca-exhibit");
    const detail = page.locator(".luca-detail");
    await expect(exhibit.locator(".luca-age-note")).toContainText("4,2 млрд лет");
    await expect(exhibit.locator(".luca-age-note .confidence-badge")).toHaveText("обсуждается");
    for (const name of ["Bacteria", "Archaea", "Eukaryotes", "LUCA"]) {
      const button = exhibit.getByRole("button", { name: new RegExp(`^${name} `) });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(detail.locator("h3")).toHaveText(name);
      await expect(exhibit.locator("button[aria-pressed=true]")).toHaveCount(1);
    }
    await exhibit.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`origin-luca-${width}.png`), animations: "disabled" });

    const firstPair = page.locator(".origin-hypothesis-card").first();
    await firstPair.scrollIntoViewIfNeeded();
    await expect.poll(() => firstPair.locator("img").evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`origin-hypotheses-${width}.png`), animations: "disabled" });
  });
}
