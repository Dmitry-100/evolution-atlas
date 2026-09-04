import { expect, test } from "@playwright/test";

for (const width of [1280, 820, 391]) {
  test(`theory reading flow and questions at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Explicit desktop, tablet and mobile viewports.");
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/theory");
    const evidence = page.locator(".evidence-section");
    const questions = page.locator(".evidence-faq-card");
    await expect(page.locator(".darwin-flow li")).toHaveCount(4);
    await expect(page.locator(".evidence-card")).toHaveCount(6);
    await expect(questions).toHaveCount(4);
    await expect(questions.first().locator("p")).toBeVisible();
    await expect(questions.nth(1).locator("p")).not.toBeVisible();

    const layout = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const intro = rect(".evidence-intro");
      const grid = rect(".evidence-grid");
      const cards = [...document.querySelectorAll(".evidence-card")].map((card) => card.getBoundingClientRect());
      const steps = [...document.querySelectorAll(".darwin-flow li")].map((step) => step.getBoundingClientRect());
      return {
        mechanismBeforeEvidence: rect(".theory-mechanism").bottom <= rect(".evidence-section").top,
        evidenceBeforeHistory: rect(".evidence-section").bottom <= rect(".darwin-spotlight").top,
        introAboveCards: intro.bottom <= grid.top,
        cardsUseSectionWidth: grid.width >= rect(".evidence-section").width - 40,
        columns: cards.filter((card) => Math.abs(card.top - cards[0].top) < 1).length,
        verticalSteps: steps.every((step, index) => index === 0 || step.top >= steps[index - 1].bottom),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    expect(layout).toEqual({
      mechanismBeforeEvidence: true,
      evidenceBeforeHistory: true,
      introAboveCards: true,
      cardsUseSectionWidth: true,
      columns: width > 1200 ? 3 : width > 720 ? 2 : 1,
      verticalSteps: width <= 720,
      overflow: false,
    });

    await page.screenshot({ path: testInfo.outputPath(`theory-top-${width}.png`), animations: "disabled" });
    await page.locator(".theory-mechanism").scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`theory-mechanism-${width}.png`), animations: "disabled" });
    await evidence.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`theory-evidence-${width}.png`), animations: "disabled" });
    const portrait = page.locator(".darwin-portrait img");
    await portrait.scrollIntoViewIfNeeded();
    await expect.poll(() => portrait.evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`theory-darwin-${width}.png`), animations: "disabled" });

    await questions.first().locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(questions.first().locator("p")).not.toBeVisible();
    await questions.nth(2).locator("summary").focus();
    await page.keyboard.press("Space");
    await expect(questions.nth(2).locator("p")).toBeVisible();
    await expect(questions.nth(2).locator("summary")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(questions.nth(2).locator("p")).not.toBeVisible();
    await questions.first().locator("summary").click();
    await expect(questions.first().locator("p")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`theory-questions-${width}.png`), animations: "disabled" });
  });
}
