import { expect, test } from "@playwright/test";

test.describe("Evolution Atlas", () => {
  test("renders the atlas without console errors or horizontal overflow", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Человек произошел от обезьяны\.\.\. а от кого произошла обезьяна\?/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Теория эволюции" })).toBeVisible();
    await expect(page.getByLabel("Основная навигация").getByRole("link", { name: "Глобальные вымирания" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Материалы" })).toBeVisible();
    await expect(page.locator(".deep-time-axis")).toBeVisible();
    await expect(page.locator(".extinction-marker")).toHaveCount(5);
    await expect(page.getByText(/до появления приматов - 98,4%/i)).toBeVisible();
    await expect(page.getByText(/к выбранной точке/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ранние приматы/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Что значит.*теория/i })).not.toBeVisible();
    await expect(page.locator(".specimen-strip")).toHaveCount(0);

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test("hover, click and primate mode update the active species card", async ({ page }, testInfo) => {
    await page.goto("/");

    const image = page.locator(".stage-plate-main");
    const firstSrc = await image.getAttribute("src");
    await expect(image).toHaveCSS("object-fit", "contain");

    await page.getByRole("button", { name: /Homo sapiens,/i }).click();
    await expect(page.getByRole("heading", { name: "Homo sapiens", exact: true })).toBeVisible();
    await expect(image).not.toHaveAttribute("src", firstSrc ?? "");

    await page.getByRole("tab", { name: /Приматы крупно/i }).click();
    await expect(page.locator(".primate-photo-axis")).toBeVisible();
    await expect(page.locator(".primate-photo-node img").first()).toBeVisible();
    await expect(page.getByText(/65 млн лет крупно/i)).toBeVisible();
    await expect(page.getByText("Маршрут по эпохам")).toHaveCount(0);

    if (testInfo.project.name === "mobile") {
      await page.getByRole("button", { name: /Древние приматы, 55 млн лет назад/i }).click();
    } else {
      await page.getByRole("button", { name: /Древние приматы, 55 млн лет назад/i }).hover();
    }
    await expect(page.getByRole("heading", { name: /Древние приматы/i })).toBeVisible();
  });

  test("visible and keyboard arrows move along the deep-time scale", async ({ page }) => {
    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");
    await expect(activeHeading).toHaveText("Ранние приматы");

    await page.getByRole("button", { name: /Следующий этап/i }).click();
    await expect(activeHeading).toHaveText("Древние приматы");

    await page.locator(".deep-time-axis").focus();
    await page.keyboard.press("ArrowRight");
    await expect(activeHeading).toHaveText("Антропоиды");

    await page.getByRole("button", { name: /Предыдущий этап/i }).click();
    await expect(activeHeading).toHaveText("Древние приматы");
  });

  test("theory route explains scientific theory and evidence", async ({ page }) => {
    await page.goto("/theory");
    await expect(page.getByRole("heading", { name: /Что значит.*теория/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Дарвин/i })).toBeVisible();
    await expect(page.getByText(/Происхождение видов/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ископаемые" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Молекулярные данные" })).toBeVisible();
    await expect(page.getByRole("link", { name: /National Academies/i }).first()).toBeVisible();
  });

  test("extinctions route explains mass extinctions", async ({ page }) => {
    await page.goto("/extinctions");
    await expect(page.getByRole("heading", { name: /Глобальные вымирания/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Пермское/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Мел-палеогеновое/i })).toBeVisible();
    await expect(page.getByText(/млекопитающим/i).first()).toBeVisible();
  });

  test("about route is reader-facing, not technical deploy notes", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /Зачем нужен этот атлас/i })).toBeVisible();
    await expect(page.getByText(/общий предок/i).first()).toBeVisible();
    await expect(page.getByText(/Vite|GitHub|Caddy|nginx|pnpm|dist\//i)).toHaveCount(0);
  });

  test("sources route exposes image metadata and source links", async ({ page }) => {
    await page.goto("/sources");
    await expect(page.getByRole("heading", { name: /Источники/i })).toBeVisible();
    await expect(page.getByText(/Wikimedia Commons|NASA|NOAA|Natural History Museum/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sourceUrl/i }).first()).toBeVisible();
  });

  test("materials route exposes presentations and downloads", async ({ page }) => {
    await page.goto("/materials");
    await expect(page.getByRole("heading", { name: /Презентации и лекции/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Путь от клетки к человеку" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Шесть апокалипсисов планеты" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "От клетки до человека: детская версия" })).toBeVisible();
    await expect(page.locator(".material-card")).toHaveCount(5);
    await expect(page.getByRole("link", { name: /Открыть PDF/i }).first()).toHaveAttribute("href", /\.pdf$/);
    await expect(page.getByRole("link", { name: /Скачать PPTX/i }).first()).toHaveAttribute("href", /\.pptx$/);
  });
});
