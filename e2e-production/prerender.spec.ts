import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { PublicRoute } from "../src/lib/publicRoutes";

const PUBLIC_ROUTES: PublicRoute[] = JSON.parse(
  readFileSync(new URL("../config/public-routes.json", import.meta.url), "utf8"),
);

test.describe("Built pages without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} has readable HTML and correct metadata`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      const html = await response!.text();
      expect(html).not.toContain("<!--$?-->");
      expect(html).not.toContain("Загружаем раздел...");
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page).toHaveTitle(route.seoTitle);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://atlas.aidms.ru${route.path}`,
      );
      await expect(page.locator(".prerender-navigation a")).toHaveCount(
        PUBLIC_ROUTES.length,
      );
      // Styles for lazy pages must be present before any client code executes.
      for (const href of await page
        .locator('link[rel="stylesheet"]')
        .evaluateAll((links) =>
          links.map((link) => (link as HTMLLinkElement).href),
        )) {
        expect((await page.request.get(href)).status()).toBe(200);
      }
    });
  }

  test("genetics evidence, sources and navigation work without scripts", async ({
    page,
  }) => {
    await page.goto("/genetics");
    await expect(page.locator(".genetics-flow > li")).toHaveCount(5);
    await expect(page.locator(".genetics-evidence-card")).toHaveCount(6);
    await expect(
      page.getByRole("heading", { name: "Геном хранит ещё и историю" }),
    ).toBeVisible();
    expect(
      await page
        .locator('.genetics-evidence-sources a[href^="https://"]')
        .count(),
    ).toBeGreaterThanOrEqual(6);
    await expect(page.locator(".genetics-evidence-grid")).toHaveCSS(
      "display",
      "grid",
    );
    const image = page.locator(".genetics-evidence-card img").first();
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page
      .locator('.prerender-navigation a[href="/origin-of-life"]')
      .click();
    await expect(page.locator(".origin-hypothesis-card")).toHaveCount(6);
    await expect(page.locator(".origin-story-grid > li")).toHaveCount(4);
    await expect(
      page.getByRole("heading", {
        name: "Основные гипотезы происхождения жизни",
      }),
    ).toBeVisible();
    await expect(page.locator(".origin-story-grid")).toHaveCSS(
      "display",
      "grid",
    );
    expect(
      await page.locator('main a[href^="https://"]').count(),
    ).toBeGreaterThan(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
});

test("the static pages become interactive and preserve SPA navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/origin-of-life");
  await expect(page.locator("[data-seo-prerender]")).toHaveCount(0);
  const bacteria = page
    .locator(".luca-exhibit")
    .getByRole("button", { name: /^Bacteria / });
  await bacteria.click();
  await expect(page.locator(".luca-detail h3")).toHaveText("Bacteria");
  const menu = page.getByRole("button", { name: "Открыть меню", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.locator('#primary-navigation a[href="/genetics"]').click();
  await expect(page).toHaveURL(/\/genetics$/);
  await expect(page.locator(".genetics-evidence-card")).toHaveCount(6);
  await page.locator(".genetics-image-zoom").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(errors).toEqual([]);
});
