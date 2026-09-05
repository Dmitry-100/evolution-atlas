import { expect, test } from "@playwright/test";

test("dinosaurs shares the primates layout and typography", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop design comparison.");
  await page.setViewportSize({ width: 1440, height: 960 });
  const styles = async () =>
    page.evaluate(() => {
      const read = (selector: string, props: string[]) => {
        const element = document.querySelector(selector)!;
        const css = getComputedStyle(element);
        return Object.fromEntries(
          props.map((prop) => [prop, css.getPropertyValue(prop)]),
        );
      };
      return {
        hero: read(".page-header h1", [
          "font-family",
          "font-size",
          "font-weight",
          "line-height",
          "margin",
        ]),
        columns: read(".atlas-grid", ["grid-template-columns", "gap"]),
        card: read(".stage-panel", [
          "border",
          "background-color",
          "border-radius",
        ]),
        image: read(".stage-plate-media", ["aspect-ratio", "height"]),
        title: read(".stage-copy h2", [
          "font-family",
          "font-size",
          "font-weight",
          "line-height",
        ]),
        copy: read(".stage-copy", ["padding"]),
        date: read(".stage-copy .kicker", ["color", "font-size", "margin"]),
        latin: read(".stage-copy .latin", ["color", "font-size", "margin"]),
        summary: read(".stage-copy .lead", [
          "color",
          "font-size",
          "margin",
          "line-height",
        ]),
        axis: read(".primate-deep-axis", ["height", "border-radius"]),
      };
    });
  await page.goto("/primates");
  await expect(page.locator(".stage-plate-current")).toHaveClass(/is-loaded/);
  const reference = await styles();
  await page.screenshot({
    path: testInfo.outputPath("primates-reference.png"),
    animations: "disabled",
  });
  await page.goto("/dinosaurs");
  await expect(page.locator(".stage-plate-current")).toHaveClass(/is-loaded/);
  expect(await styles()).toEqual(reference);
  const grid = await page.locator(".atlas-grid").boundingBox();
  expect(grid!.y).toBeLessThan(480);
  await page.screenshot({
    path: testInfo.outputPath("dinosaurs-matched.png"),
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "От динозавров к птицам", exact: true })
    .click();
  await expect(page.locator(".stage-copy h2")).toHaveText("Диапсиды");
  await page
    .getByRole("button", { name: "Увеличить иллюстрацию шкалы динозавров" })
    .click();
  const panorama = page.getByRole("dialog", {
    name: "Увеличенная иллюстрация шкалы динозавров",
  });
  await expect(panorama).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panorama).toHaveCount(0);
});

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
      page.getByRole("heading", { name: "Вымерли ли динозавры", exact: true }),
    ).toBeVisible();
    const illustration = page.locator(
      width > 720 ? ".stage-plate-current" : ".mobile-stage-detail img",
    );
    await expect(illustration).toHaveJSProperty("complete", true);
    await expect(illustration).not.toHaveJSProperty("naturalWidth", 0);
    await expect(page.locator(".dinosaur-hero-pair")).toHaveCount(0);
    await expect(page.locator(".page-header--with-aside")).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`${width}-intro.png`),
      animations: "disabled",
    });
    await page.getByRole("link", { name: "Шкала", exact: true }).click();
    const timeline = page.locator("#dinosaur-timeline");
    await expect(timeline).toBeInViewport();
    const heading = await timeline.boundingBox();
    const header = await page.locator(".topbar").boundingBox();
    expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height);

    if (width > 720) {
      const route = page.getByRole("navigation", {
        name: "Маршрут динозавровой ветви",
      });
      const dinosaurs = route.getByRole("button", { name: /^Динозавры,/ });
      await dinosaurs.click();
      await expect(dinosaurs).toHaveAttribute("aria-current", "step");
      await expect(
        page.locator(".dinosaur-detail-card .stage-copy h2"),
      ).toHaveText("Ранние динозавры");
      await expect(
        page.locator(".dinosaur-detail-card .stage-plate-current"),
      ).toHaveAttribute("src", /early-dinosaurs-v2/);
      const axis = page.locator(".dinosaur-deep-axis");
      await axis.focus();
      await page.keyboard.press("ArrowRight");
      await expect(
        page.locator(".dinosaur-detail-card .stage-copy h2"),
      ).toHaveText("Тероподы");
      await expect(page.locator(".dinosaur-axis-current span")).toContainText(
        "13 из 18",
      );
      await expect(page.locator(".deep-active-card")).toHaveCount(0);
      if (width > 1200) {
        const detail = await page
          .locator(".dinosaur-detail-card")
          .boundingBox();
        expect(detail!.width).toBe(width > 1320 ? 430 : 380);
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
    await expect(
      zoom.locator(width > 720 ? ".stage-plate-current" : "img"),
    ).toHaveCSS("object-fit", "contain");
    await expect(
      zoom.locator(width > 720 ? ".stage-plate-current" : "img"),
    ).toHaveJSProperty("complete", true);
    await expect(
      zoom.locator(width > 720 ? ".stage-plate-current" : "img"),
    ).not.toHaveJSProperty("naturalWidth", 0);
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
