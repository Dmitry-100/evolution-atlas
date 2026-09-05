import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { MASS_EXTINCTIONS } from "../src/data/extinctions";

test.describe.configure({ mode: "parallel" });

for (const width of [1440, 1100, 820, 391, 320]) {
  test(`extinctions navigation, summaries and details at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Explicit responsive viewports.",
    );
    await page.setViewportSize({ width, height: 860 });
    await page.goto("/extinctions");

    const screenshots = testInfo.outputPath("screenshots");
    await mkdir(screenshots, { recursive: true });
    const nav = page.getByRole("navigation", {
      name: "Переходы по шести кризисам",
    });
    const cards = page.locator(".extinction-card");
    await expect(nav.getByRole("button")).toHaveCount(MASS_EXTINCTIONS.length);
    await expect(nav.getByRole("button").first()).toHaveAttribute(
      "aria-current",
      "step",
    );
    await expect(cards).toHaveCount(MASS_EXTINCTIONS.length);
    await expect(page.locator(".extinction-details:not([hidden])")).toHaveCount(
      1,
    );
    await expect(
      page.locator(".extinction-details-toggle[aria-expanded=true]"),
    ).toHaveCount(1);
    await expect(
      page.locator(".extinction-live-badge", { hasText: "Продолжается" }),
    ).toHaveCount(1);

    const initialLayout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      navRows: new Set(
        [...document.querySelectorAll(".extinction-event-nav button")].map(
          (button) => Math.round(button.getBoundingClientRect().top),
        ),
      ).size,
      headerBeforeImage:
        document
          .querySelector(".extinction-card-header")!
          .getBoundingClientRect().bottom <=
        document
          .querySelector(".extinction-image-zoom")!
          .getBoundingClientRect().top,
      imageFit: getComputedStyle(
        document.querySelector(".extinction-image-zoom img")!,
      ).objectFit,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    expect(initialLayout.overflow).toBe(false);
    expect(initialLayout.navRows).toBe(1);
    expect(initialLayout.headerBeforeImage).toBe(true);
    expect(initialLayout.imageFit).toBe("contain");
    const maxScrollHeight = width >= 1000 ? 6500 : width >= 720 ? 8500 : 11000;
    expect(initialLayout.scrollHeight).toBeLessThan(maxScrollHeight);
    await page.screenshot({
      path: `${screenshots}/${width}-intro.png`,
      animations: "disabled",
    });

    const kpg = nav.getByRole("button", { name: /Мел-палеогеновое/ });
    await kpg.click();
    const kpgCard = page.locator("#extinction-cretaceous-paleogene");
    await expect(kpg).toHaveAttribute("aria-current", "step");
    await expect(kpgCard.locator(".extinction-details")).toBeVisible();
    await expect(kpgCard).toBeInViewport();
    await expect(
      kpgCard.getByRole("button", { name: "Скрыть подробности" }),
    ).toHaveAttribute("aria-expanded", "true");

    const zoom = kpgCard.getByRole("button", {
      name: /Увеличить изображение/,
    });
    await expect(zoom).toHaveCSS("cursor", "zoom-in");
    await zoom.click();
    const lightbox = page.getByRole("dialog", {
      name: "Иллюстрация массового вымирания крупно",
    });
    await expect(lightbox).toBeVisible();
    await expect(lightbox.locator("img")).toHaveCSS("object-fit", "contain");
    await page.keyboard.press("Escape");
    await expect(lightbox).toHaveCount(0);
    await expect(zoom).toBeFocused();

    await kpgCard.getByRole("button", { name: "Скрыть подробности" }).click();
    await expect(kpgCard.locator(".extinction-details")).toBeHidden();
    await expect(
      kpgCard.getByRole("button", { name: /^Подробнее/ }),
    ).toHaveAttribute("aria-expanded", "false");
    await page.screenshot({
      path: `${screenshots}/${width}-kpg.png`,
      animations: "disabled",
    });
  });
}
