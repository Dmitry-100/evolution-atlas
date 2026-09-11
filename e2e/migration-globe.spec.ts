import { expect, test } from "@playwright/test";

test("migration globe supports route selection, rotation, sites and a flat view", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/primates");
  await page.getByRole("link", { name: "Африка", exact: true }).click();
  const globe = page.locator(".migration-globe");
  await expect(globe).toHaveAttribute("data-renderer", "ready", {
    timeout: 15_000,
  });
  const canvas = globe.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Включить анимацию маршрута" }),
  ).toBeVisible();

  const site = page.locator(".migration-globe-site--jebel-irhoud");
  const initialPosition = await site.getAttribute("style");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => site.getAttribute("style")).not.toBe(initialPosition);
  await page.getByRole("button", { name: "Приблизить глобус" }).click();
  await page
    .getByRole("button", { name: "Вернуться к выбранному маршруту" })
    .click();

  if (testInfo.project.name === "mobile") {
    await page
      .getByRole("combobox", { name: "Выбрать маршрут" })
      .selectOption("americas");
  } else {
    await page
      .getByRole("button", { name: /^Через Берингию в Америки,/ })
      .click();
  }
  await expect(page.locator(".migration-route-detail h3")).toHaveText(
    "Через Берингию в Америки",
  );
  await expect(page.locator(".migration-route-detail")).toContainText(
    "23-15 тыс.",
  );
  await expect(
    page.locator(".migration-route-detail .confidence-badge"),
  ).toContainText("обсуждается");
  await expect(site).not.toBeVisible();

  // Selecting the already active find must return to Africa after looking away.
  await page
    .getByRole("group", { name: "Африканские находки" })
    .getByRole("button", { name: "Jebel Irhoud", exact: true })
    .click();
  await expect(site).toBeVisible();

  await page
    .getByRole("group", { name: "Африканские находки" })
    .getByRole("button", { name: "Blombos", exact: true })
    .click();
  await expect(page.locator(".africa-site-detail h3")).toHaveText("Blombos");
  await expect(page.locator(".migration-globe-site--blombos")).toBeVisible();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(globe).toHaveAttribute("data-renderer", "map");
  await expect(canvas).toHaveCount(0);
  await expect(globe.locator(".human-migration-map")).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(globe).toHaveAttribute("data-renderer", "ready");
  await expect(canvas).toHaveCount(1);
  await page
    .getByRole("button", { name: "Включить анимацию маршрута" })
    .click();
  await expect(
    page.getByRole("button", { name: "Остановить анимацию маршрута" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Остановить анимацию маршрута" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
  expect(errors).toEqual([]);
  await globe.screenshot({ path: testInfo.outputPath("migration-globe.png") });
  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(globe).toHaveAttribute("data-renderer", "fallback");
  await expect(canvas).toHaveCount(0);
  await expect(globe.locator(".human-migration-map")).toBeVisible();
});

test("migration map stays usable when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/primates");
  await page.getByRole("link", { name: "Африка", exact: true }).click();
  await expect(page.locator(".migration-globe")).toHaveAttribute(
    "data-renderer",
    "fallback",
    { timeout: 15_000 },
  );
  await expect(
    page.getByText("3D недоступно · открыта плоская карта"),
  ).toBeVisible();
  await page
    .getByRole("group", { name: "Африканские находки" })
    .getByRole("button", { name: "Herto", exact: true })
    .click();
  await expect(page.locator(".africa-site-detail h3")).toHaveText("Herto");
  await page.getByRole("button", { name: /^Европейская ветвь,/ }).click();
  await expect(page.locator(".migration-route-detail h3")).toHaveText(
    "Европейская ветвь",
  );
});
