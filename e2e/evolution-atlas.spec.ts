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
    await expect(page.getByRole("link", { name: "Вымерли ли динозавры" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Проверь себя" })).toBeVisible();
    await expect(page.locator(".deep-time-axis")).toBeVisible();
    await expect(page.locator(".extinction-marker")).toHaveCount(5);
    await expect(page.locator(".app-ethereal-background")).toBeVisible();
    await expect(page.locator(".ethereal-ink-canvas, .ethereal-ink-fallback")).toHaveCount(1);
    await expect(page.locator(".scroll-progress")).toBeVisible();
    await expect(page.locator(".atlas-hero-paths")).toBeVisible();
    await expect(page.locator(".atlas-hero-constellation")).toBeVisible();
    await expect(page.locator(".deep-time-floating-paths")).toBeVisible();
    await expect(page.getByText(/до появления приматов - 98,4%/i)).toBeVisible();
    await expect(page.getByText(/к выбранной точке/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ранние приматы/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Что значит.*теория/i })).not.toBeVisible();
    await expect(page.locator(".specimen-strip")).toHaveCount(0);
    await expect(page.locator(".life-year-calendar")).toHaveCount(0);
    await expect(page.locator(".quiz-panel")).toHaveCount(0);

    const factsBox = await page.locator(".wow-facts-band").boundingBox();
    const atlasGridBox = await page.locator(".atlas-grid").boundingBox();
    expect(factsBox).not.toBeNull();
    expect(atlasGridBox).not.toBeNull();
    if (factsBox && atlasGridBox) {
      expect(factsBox.y).toBeLessThan(atlasGridBox.y);
      expect(atlasGridBox.y - (factsBox.y + factsBox.height)).toBeGreaterThanOrEqual(24);
    }

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test("click and primate mode update the active species card without hover tracking", async ({ page }) => {
    await page.goto("/");

    const image = page.locator(".stage-plate-current");
    const firstSrc = await image.getAttribute("src");
    await expect(image).toHaveCSS("object-fit", "contain");

    await page.getByRole("button", { name: /Homo sapiens,/i }).click();
    await expect(page.getByRole("heading", { name: "Homo sapiens", exact: true })).toBeVisible();
    await expect(image).not.toHaveAttribute("src", firstSrc ?? "");

    await page.getByRole("tab", { name: /Приматы крупно/i }).click();
    await expect(page.locator(".primate-photo-axis")).toBeVisible();
    await expect(page.locator(".primate-floating-paths")).toBeVisible();
    await expect(page.locator(".primate-constellation")).toBeVisible();
    await expect(page.locator(".primate-photo-node img").first()).toBeVisible();
    await expect(page.getByText(/65 млн лет крупно/i)).toBeVisible();
    await expect(page.getByText("Маршрут по эпохам")).toHaveCount(0);

    await page.getByRole("button", { name: /Древние приматы, 55 млн лет назад/i }).click();
    await expect(page.getByRole("heading", { name: /Древние приматы/i })).toBeVisible();
  });

  test("moving the mouse over the deep-time axis does not change the active stage", async ({ page }) => {
    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");
    await expect(activeHeading).toHaveText("Ранние приматы");

    const box = await page.locator(".deep-time-axis").boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + box.width * 0.08, box.y + box.height * 0.5);
    await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.35);
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.62);
    await expect(activeHeading).toHaveText("Ранние приматы");
  });

  test("mass extinction markers show event callouts on hover", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Hover callouts are a desktop interaction.");
    await page.goto("/");
    await page.locator(".extinction-marker").nth(2).hover();
    await expect(page.locator(".extinction-tooltip")).toBeVisible();
    await expect(page.locator(".extinction-tooltip")).toContainText(/Пермское/i);
    await expect(page.locator(".extinction-tooltip img").first()).toBeVisible();
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

  test("atlas URL state restores mode and selected stage", async ({ page }) => {
    await page.goto("/?mode=primates&stage=early-apes");
    await expect(page.getByRole("tab", { name: /Приматы крупно/i })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "Ранние человекообразные" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Ранние человекообразные" })).toBeVisible();

    await page.locator(".primate-photo-axis").getByRole("button", { name: /Homo sapiens/i }).click();
    await expect(page).toHaveURL(/mode=primates&stage=homo-sapiens/);
    await expect(page.getByRole("heading", { name: "Homo sapiens" })).toBeVisible();
  });

  test("cladogram branch clicks sync with the stage card and URL", async ({ page }) => {
    await page.goto("/");
    const cladogram = page.locator(".cladogram-panel");

    await expect(page.getByRole("heading", { name: "Дерево родства" })).toBeVisible();
    await expect(cladogram.getByRole("button", { name: /Неандертальцы/i })).toBeVisible();

    await cladogram.getByRole("button", { name: /Неандертальцы/i }).click();
    await expect(page.locator(".stage-copy h2")).toHaveText("Неандертальцы");
    await expect(page).toHaveURL(/mode=all&stage=neanderthals/);
  });

  test("trait accumulator grows as the route reaches Homo sapiens", async ({ page }) => {
    await page.goto("/?mode=all&stage=chordates");
    const accumulator = page.locator(".trait-accumulator");
    await expect(page.getByRole("heading", { name: "К этому моменту вы уже унаследовали" })).toBeVisible();
    const earlyCount = Number(await accumulator.getAttribute("data-trait-count"));

    await page.goto("/?mode=all&stage=homo-sapiens");
    await expect(page.getByRole("heading", { name: "Homo sapiens" })).toBeVisible();
    const lateCount = Number(await accumulator.getAttribute("data-trait-count"));

    expect(lateCount).toBeGreaterThan(earlyCount);
    await expect(accumulator.getByText("язык")).toBeVisible();
  });

  test("glossary tooltips explain evolutionary terms", async ({ page }) => {
    await page.goto("/?mode=all&stage=chordates");
    await page.locator(".stage-glossary-line").getByRole("button", { name: "Хордовые" }).focus();
    await expect(page.getByRole("tooltip")).toContainText(/внутренней опорной осью/i);
  });

  test("quiz runs through questions to a result", async ({ page }) => {
    await page.goto("/quiz");
    const quiz = page.locator(".quiz-panel");

    await expect(page.getByRole("heading", { name: "Проверь себя" })).toBeVisible();
    const progress = await quiz.locator(".quiz-progress").innerText();
    const totalQuestions = Number(progress.match(/из\s+(\d+)/i)?.[1]);
    expect(totalQuestions).toBeGreaterThanOrEqual(36);

    for (let index = 0; index < totalQuestions; index += 1) {
      await quiz.locator(".quiz-option").first().click();
      await quiz
        .getByRole("button", { name: index === totalQuestions - 1 ? "Показать результат" : "Следующий вопрос" })
        .click();
    }

    await expect(quiz.getByText(/Ваш результат/)).toBeVisible();
  });

  test("comparison panel shows differences between two stages", async ({ page }) => {
    await page.goto("/");
    const comparison = page.locator(".comparison-panel");

    await expect(page.getByRole("heading", { name: "Сравнить два этапа" })).toBeVisible();
    await comparison.getByLabel("Первый этап").selectOption("chordates");
    await comparison.getByLabel("Второй этап").selectOption("sapiens");
    await expect(comparison.getByText(/между ними появилось/i)).toBeVisible();
    await expect(comparison.getByText("язык")).toBeVisible();
  });

  test("active era changes the atlas ambient color token", async ({ page }) => {
    await page.goto("/?mode=all&stage=chordates");
    const atlas = page.locator(".atlas");
    const earlyColor = await atlas.evaluate((element) => getComputedStyle(element).getPropertyValue("--active-era-color").trim());

    await page.goto("/?mode=all&stage=homo-sapiens");
    const lateColor = await atlas.evaluate((element) => getComputedStyle(element).getPropertyValue("--active-era-color").trim());

    expect(earlyColor).not.toBe(lateColor);
    expect(lateColor).toBe("#d0a35b");
  });

  test("journey mode plays and pauses the atlas route", async ({ page }) => {
    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");

    await page.getByRole("button", { name: "Запустить путешествие" }).click();
    await expect(activeHeading).toHaveText("Клеточные линии");
    await expect(activeHeading).toHaveText("Прокариоты", { timeout: 2500 });

    await page.getByRole("button", { name: "Пауза" }).click();
    const pausedHeading = await activeHeading.textContent();
    await page.waitForTimeout(1200);
    await expect(activeHeading).toHaveText(pausedHeading ?? "");
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
    await expect(page.locator(".extinction-stat-grid strong", { hasText: /до 90-96% морских видов/i })).toBeVisible();
    await expect(page.locator(".extinction-stat-grid strong", { hasText: /примерно 75% видов/i })).toBeVisible();
    await expect(page.locator(".extinction-visual img")).toHaveCount(5);
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
    await expect(page.getByRole("link", { name: /Открыть PDF/i }).first()).toHaveAttribute(
      "href",
      /^\/assets\/materials\/.+\.pdf$/,
    );
    await expect(page.getByRole("link", { name: /Скачать PPTX/i }).first()).toHaveAttribute(
      "href",
      /^\/assets\/materials\/.+\.pptx$/,
    );
  });

  test("dinosaurs route separates shared animal ancestors from the bird branch", async ({ page }) => {
    await page.goto("/dinosaurs");
    await expect(page.getByRole("heading", { name: "Вымерли ли динозавры" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Общая животная линия" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Динозавры → птицы" })).toBeVisible();
    await expect(page.locator(".dinosaur-branch-card")).toHaveCount(9);
    await expect(page.getByRole("heading", { name: "Первые животные" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Современные птицы" })).not.toBeVisible();

    await page.getByRole("button", { name: /Современные птицы/i }).click();
    await expect(page.getByRole("heading", { name: "Современные птицы" })).toBeVisible();
    await expect(
      page
        .locator(".dinosaur-branch-section.is-dinosaurs .dinosaur-detail-copy")
        .getByText(/птицы — живая динозавровая ветвь/i),
    ).toBeVisible();
  });

});
