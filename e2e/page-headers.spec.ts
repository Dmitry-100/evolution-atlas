import { expect, test } from "@playwright/test";

const routes = ["/", "/primates", "/theory", "/origin-of-life", "/genetics", "/dinosaurs", "/extinctions", "/cladogram", "/body-map", "/materials", "/quiz", "/sources", "/about"];

for (const width of [1440, 820, 391]) {
  test(`all route headers share typography and fit at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Explicit responsive viewports.");
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 960 });
    let reference: unknown;
    for (const route of routes) {
      await page.goto(route);
      const header = page.locator(".page-header");
      await expect(header, route).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 }), route).toHaveCount(1);
      await expect(header.locator(".page-header-description"), route).toBeVisible();
      const result = await header.evaluate((element) => {
        const typography = [".page-header-eyebrow", "h1", ".page-header-description"].map((selector) => {
          const style = getComputedStyle(element.querySelector(selector)!);
          return Object.fromEntries(["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "color", "marginTop", "marginBottom"].map((key) => [key, style[key as keyof CSSStyleDeclaration]]));
        });
        const box = element.getBoundingClientRect();
        const children = [...element.querySelectorAll(".page-header-copy > *")].map((child) => child.getBoundingClientRect());
        return {
          typography,
          overlap: children.some((child, index) => index > 0 && child.top < children[index - 1].bottom),
          clipped: children.some((child) => child.left < box.left - 1 || child.right > box.right + 1 || child.bottom > box.bottom + 1),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      reference ??= result.typography;
      expect(result.typography, route).toEqual(reference);
      expect(result.overlap, route).toBe(false);
      expect(result.clipped, route).toBe(false);
      expect(result.overflow, route).toBe(false);
      await header.screenshot({ path: testInfo.outputPath(`header-${route.slice(1) || "atlas"}-${width}.png`), animations: "disabled" });
    }
  });
}
