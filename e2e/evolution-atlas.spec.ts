import { expect, test } from "@playwright/test";

const navItems = [
  "Атлас",
  "Теория эволюции",
  "Зарождение жизни",
  "РНК/ДНК",
  "Дерево родства",
  "Глобальные вымирания",
  "Вымерли ли динозавры",
  "Дополнительные материалы",
  "О проекте",
  "Проверь себя",
];

test.describe("Evolution Atlas", () => {
  test("renders the atlas without console errors or horizontal overflow", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

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
    await expect(
      page.getByRole("link", { name: "Теория эволюции" }),
    ).toBeVisible();
    await expect(
      page
        .getByLabel("Основная навигация")
        .getByRole("link", { name: "Глобальные вымирания" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Дополнительные материалы" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Вымерли ли динозавры" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Проверь себя" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Зарождение жизни" }),
    ).toBeVisible();
    await expect(
      page
        .getByLabel("Основная навигация")
        .getByRole("link", { name: "РНК/ДНК" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Дерево родства" }),
    ).toBeVisible();
    await expect(page.locator(".brand-wordmark")).toHaveCount(0);
    await expect(page.locator(".brand-mark")).toHaveAttribute(
      "src",
      "/assets/brand/portal-logo-mark.png",
    );
    await expect(page.locator(".brand-mark")).toBeVisible();
    await expect
      .poll(() =>
        page
          .getByLabel("Основная навигация")
          .getByRole("link")
          .evaluateAll((links) =>
            links.map((link) => link.textContent?.trim() ?? ""),
          ),
      )
      .toEqual(navItems);
    const visibleNavItems = await page
      .getByLabel("Основная навигация")
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((link) => {
          const rect = link.getBoundingClientRect();
          return {
            text: link.textContent?.trim() ?? "",
            visible:
              rect.width > 0 &&
              rect.height > 0 &&
              getComputedStyle(link).visibility !== "hidden",
          };
        }),
      );
    expect(visibleNavItems).toEqual(
      navItems.map((text) => ({ text, visible: true })),
    );
    await expect(page.locator(".deep-time-axis")).toBeVisible();
    await expect(page.locator(".extinction-marker")).toHaveCount(5);
    await expect(page.locator(".app-ethereal-background")).toBeVisible();
    await expect(
      page.locator(".ethereal-ink-canvas, .ethereal-ink-fallback"),
    ).toHaveCount(1);
    await expect(page.locator(".scroll-progress")).toBeVisible();
    await expect(page.locator(".atlas-hero-paths")).toBeVisible();
    await expect(page.locator(".atlas-hero-constellation")).toBeVisible();
    await expect(page.locator(".deep-time-region-label")).toHaveCount(5);
    await expect(
      page.getByText(/до появления приматов - 98,4%/i),
    ).toBeVisible();
    await expect(page.getByText(/к выбранной точке/i)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Ранние родственники приматов/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Что значит.*теория/i }),
    ).not.toBeVisible();
    await expect(page.locator(".specimen-strip")).toHaveCount(0);
    await expect(page.locator(".life-year-calendar")).toHaveCount(0);
    await expect(page.locator(".quiz-panel")).toHaveCount(0);
    await expect(page.locator(".cladogram-panel")).toHaveCount(0);
    await expect(page.locator(".atlas-note-band")).toHaveCount(1);
    await expect(page.locator(".atlas-note-band")).toContainText(
      "Главная мысль",
    );

    const heroBox = await page.locator(".atlas-hero").boundingBox();
    const noteBox = await page.locator(".atlas-note-band").boundingBox();
    const factsBox = await page.locator(".wow-facts-band").boundingBox();
    const atlasGridBox = await page.locator(".atlas-grid").boundingBox();
    expect(heroBox).not.toBeNull();
    expect(noteBox).not.toBeNull();
    expect(factsBox).not.toBeNull();
    expect(atlasGridBox).not.toBeNull();
    if (heroBox && noteBox && factsBox && atlasGridBox) {
      expect(heroBox.y).toBeLessThan(noteBox.y);
      expect(noteBox.y).toBeLessThan(factsBox.y);
      expect(factsBox.y).toBeLessThan(atlasGridBox.y);
      expect(factsBox.y - (noteBox.y + noteBox.height)).toBeGreaterThanOrEqual(
        12,
      );
      expect(
        atlasGridBox.y - (factsBox.y + factsBox.height),
      ).toBeGreaterThanOrEqual(24);
    }

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test("mobile renders a vertical atlas instead of the desktop timeline", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

    await page.goto("/");
    await expect(page.locator(".mobile-atlas")).toBeVisible();
    await expect(page.locator(".deep-time-axis")).toHaveCount(0);
    await expect(page.locator(".stage-panel")).toHaveCount(0);
    await expect(
      page.getByRole("tab", { name: /Весь путь/i }),
    ).toHaveAttribute("aria-selected", "true");

    await expect(page.locator(".mobile-stage-row").first()).toBeVisible();
    await expect(page.locator(".mobile-stage-detail")).toHaveCount(1);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });

  test("mobile mode and stage interactions preserve shared atlas URL state", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

    await page.goto("/");

    await page.getByRole("tab", { name: /Приматы.*человек/i }).click();
    await expect(page).toHaveURL(/mode=primates/);
    await expect(page.locator(".mobile-stage-row")).toHaveCount(16);

    await page
      .locator(".mobile-stage-row")
      .filter({ hasText: "Ранние человекообразные" })
      .getByRole("button")
      .click();
    await expect(page).toHaveURL(/mode=primates&stage=early-apes/);
    await expect(
      page.locator(".mobile-stage-detail").getByRole("heading", {
        name: "Ранние человекообразные",
      }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/mode=primates&stage=early-primates/);
    await expect(
      page.locator(".mobile-stage-detail").getByRole("heading", {
        name: "Ранние родственники приматов",
      }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/mode=primates&stage=early-apes/);
    await expect(
      page.locator(".mobile-stage-detail").getByRole("heading", {
        name: "Ранние человекообразные",
      }),
    ).toBeVisible();
  });

  test("mobile atlas controls and rows meet touch target height", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

    await page.goto("/");

    const targetHeights = await page
      .locator(
        ".mobile-atlas-tabs button, .mobile-atlas-stepper button, .mobile-stage-row > button",
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => Math.round(node.getBoundingClientRect().height)),
      );

    expect(targetHeights.length).toBeGreaterThan(10);
    for (const height of targetHeights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });

  test("top navigation supports cyclic keyboard arrow navigation", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop top navigation.");

    await page.goto("/");
    const nav = page.getByLabel("Основная навигация");

    await nav.getByRole("link", { name: "Атлас" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/theory$/);

    await nav.getByRole("link", { name: "Теория эволюции" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/$/);

    await nav.getByRole("link", { name: "Атлас" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/quiz$/);
  });

  test("mobile header keeps a larger sticky brand and opens quick navigation", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile header only.");

    await page.goto("/dinosaurs");
    const topbar = page.locator(".topbar");
    const brandMark = page.locator(".brand-mark");

    await expect(page.locator(".mobile-dinosaur-journey")).toBeVisible();
    await expect(page.locator(".mobile-menu-button")).toBeVisible();
    await expect(page.getByLabel("Основная навигация")).toBeHidden();

    const initialTop = await topbar.evaluate(
      (node) => Math.round(node.getBoundingClientRect().top),
    );
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect
      .poll(() =>
        topbar.evaluate((node) => Math.round(node.getBoundingClientRect().top)),
      )
      .toBe(initialTop);

    const brandHeight = await brandMark.evaluate((node) =>
      Math.round(node.getBoundingClientRect().height),
    );
    expect(brandHeight).toBeGreaterThanOrEqual(60);

    await page.locator(".mobile-menu-button").click();
    await expect(page.getByLabel("Основная навигация")).toBeVisible();
    await expect(
      page.getByLabel("Основная навигация").getByRole("link", {
        name: "Дополнительные материалы",
      }),
    ).toBeVisible();
  });

  test("click and primate mode update the active species card without hover tracking", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/");

    const image = page.locator(".stage-plate-current");
    const firstSrc = await image.getAttribute("src");
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect(page.locator(".stage-plate-media")).toHaveAttribute(
      "data-image-state",
      "loaded",
    );
    await expect(
      page.locator(".stage-plate-media source[type='image/avif']"),
    ).toHaveCount(0);

    await page.getByRole("button", { name: /Homo sapiens,/i }).click();
    await expect(
      page.getByRole("heading", { name: "Homo sapiens", exact: true }),
    ).toBeVisible();
    await expect(image).not.toHaveAttribute("src", firstSrc ?? "");
    await expect(page.locator(".stage-plate-media")).toHaveAttribute(
      "data-image-state",
      "loaded",
    );
    await expect
      .poll(() =>
        image.evaluate((node) => {
          const img = node as HTMLImageElement;
          const styles = getComputedStyle(img);

          return (
            img.complete &&
            img.naturalWidth > 0 &&
            img.getBoundingClientRect().width > 0 &&
            styles.opacity === "1"
          );
        }),
      )
      .toBe(true);

    await page.getByRole("tab", { name: /Приматы.*человек/i }).click();
    await expect(page.locator(".primate-deep-axis")).toBeVisible();
    await expect(page.locator(".primate-timeline-river-image")).toBeVisible();
    await expect(page.locator(".primate-time-floating-paths")).toHaveCount(1);
    await expect(page.locator(".primate-stage-dots .deep-stage-dot")).toHaveCount(16);
    await expect(page.locator(".primate-zone-bands span")).toHaveCount(4);
    await expect(page.getByText(/66 млн лет назад.*сегодня/i)).toBeVisible();
    await expect(page.getByText("Маршрут по эпохам")).toHaveCount(0);

    await page
      .getByRole("button", { name: /Древние приматы, 55 млн лет назад/i })
      .click();
    await expect(
      page.getByRole("heading", { name: /Древние приматы/i }),
    ).toBeVisible();
  });

  test("moving the mouse over the deep-time axis does not change the active stage", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");
    await expect(activeHeading).toHaveText("Ранние родственники приматов");

    const box = await page.locator(".deep-time-axis").boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + box.width * 0.08, box.y + box.height * 0.5);
    await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.35);
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.62);
    await expect(activeHeading).toHaveText("Ранние родственники приматов");
  });

  test("mass extinction markers show event callouts on hover", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Hover callouts are a desktop interaction.",
    );
    await page.goto("/");
    await page.locator(".extinction-marker").nth(2).hover();
    await expect(page.locator(".extinction-tooltip")).toBeVisible();
    await expect(page.locator(".extinction-tooltip")).toContainText(
      /Пермское/i,
    );
    await expect(page.locator(".extinction-tooltip img").first()).toBeVisible();
  });

  test("visible and keyboard arrows move along the deep-time scale", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");
    await expect(activeHeading).toHaveText("Ранние родственники приматов");

    await page.getByRole("button", { name: /Следующий этап/i }).click();
    await expect(activeHeading).toHaveText("Древние приматы");

    await page.locator(".deep-time-axis").focus();
    await page.keyboard.press("ArrowRight");
    await expect(activeHeading).toHaveText("Антропоиды");

    await page.getByRole("button", { name: /Предыдущий этап/i }).click();
    await expect(activeHeading).toHaveText("Древние приматы");
  });

  test("atlas URL state restores mode and selected stage", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/?mode=primates&stage=early-apes");
    await expect(
      page.getByRole("tab", { name: /Приматы.*человек/i }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: "Ранние человекообразные" }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Ранние человекообразные" }),
    ).toBeVisible();

    await page
      .locator(".primate-deep-axis")
      .getByRole("button", { name: /Homo sapiens/i })
      .click();
    await expect(page).toHaveURL(/mode=primates&stage=homo-sapiens/);
    await expect(
      page.getByRole("heading", { name: "Homo sapiens" }),
    ).toBeVisible();
  });

  test("cladogram branch clicks sync with the stage card and URL", async ({
    page,
  }) => {
    await page.goto("/cladogram");
    const cladogram = page.locator(".cladogram-panel");

    await expect(
      page.getByRole("heading", { level: 1, name: "Дерево родства" }),
    ).toBeVisible();
    await expect(
      cladogram.getByText(/Выбранный маршрут показывает ветвь/i),
    ).toBeVisible();
    await expect(
      cladogram
        .locator(".cladogram-reader-guide")
        .getByText("Ветвь Homo sapiens"),
    ).toBeVisible();
    await expect(
      cladogram.locator(".cladogram-reader-guide").getByText("Общий предок"),
    ).toBeVisible();
    await expect(cladogram.locator(".cladogram-map")).toBeVisible();
    await expect(
      cladogram
        .locator(".cladogram-node")
        .filter({ hasText: "Ранние хордовые" }),
    ).toBeVisible();
    await expect(
      cladogram.locator(".cladogram-node").filter({ hasText: "Ранний Homo" }),
    ).toBeVisible();
    await expect(
      cladogram.locator(".cladogram-branch").filter({ hasText: "Прокариоты" }),
    ).toBeVisible();
    await expect(
      cladogram.locator(".cladogram-branch").filter({ hasText: "Диапсиды" }),
    ).toBeVisible();
    await expect(
      cladogram
        .locator(".cladogram-branch")
        .filter({ hasText: "Шимпанзе и бонобо" }),
    ).toBeVisible();
    await expect(
      cladogram.locator(".cladogram-row.has-branches"),
    ).not.toHaveCount(0);
    await expect(
      cladogram.locator(".cladogram-branch-thumb img").first(),
    ).toBeVisible();
    await expect
      .poll(() =>
        cladogram
          .locator(".cladogram-branch-thumb img")
          .evaluateAll((images) =>
            images.every((node) => {
              const image = node as HTMLImageElement;
              return image.getAttribute("src")?.startsWith("/assets/images/");
            }),
          ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        cladogram
          .locator(".cladogram-branch-thumb img")
          .evaluateAll((images) =>
            images.some((node) => {
              const image = node as HTMLImageElement;
              return image.complete && image.naturalWidth > 0;
            }),
          ),
      )
      .toBe(true);
    await expect(
      cladogram.getByRole("button", { name: /Неандертальцы/i }),
    ).toBeVisible();
    await expect(page.locator(".stage-panel")).toHaveCount(0);
    await expect(page.locator(".cladogram-inspector")).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) >= 1080) {
      await expect
        .poll(() =>
          page
            .locator(".cladogram-inspector")
            .evaluate((node) => getComputedStyle(node).position),
        )
        .toBe("sticky");
    }

    await cladogram
      .locator(".cladogram-branch")
      .filter({ hasText: "Диапсиды" })
      .click();
    await expect(page.locator(".cladogram-inspector h2")).toHaveText(
      /Диапсиды/,
    );
    await expect(page.locator(".cladogram-inspector")).toContainText(
      "общий предок",
    );
    await expect(page.locator(".cladogram-inspector-media img")).toBeVisible();
    await expect
      .poll(() =>
        page.locator(".cladogram-inspector-media img").evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);

    await cladogram
      .locator(".cladogram-branch")
      .filter({ hasText: "Неандертальцы" })
      .click();
    await expect(page.locator(".cladogram-inspector h2")).toHaveText(
      "Неандертальцы",
    );
    await expect(page).toHaveURL(/stage=neanderthals/);
  });

  test("trait accumulator grows as the route reaches Homo sapiens", async ({
    page,
  }) => {
    await page.goto("/?mode=all&stage=chordates");
    const accumulator = page.locator(".trait-accumulator");
    await expect(
      page.getByRole("heading", { name: "Унаследованные признаки" }),
    ).toBeVisible();
    const earlyCount = Number(
      await accumulator.getAttribute("data-trait-count"),
    );

    await page.goto("/?mode=all&stage=homo-sapiens");
    await expect(
      page.getByRole("heading", { name: "Homo sapiens" }),
    ).toBeVisible();
    const lateCount = Number(
      await accumulator.getAttribute("data-trait-count"),
    );

    expect(lateCount).toBeGreaterThan(earlyCount);
    await expect(accumulator.locator(".trait-compact-body")).toBeVisible();
    await expect(accumulator.locator(".trait-featured-chips")).toBeVisible();
    await expect(accumulator.locator(".trait-group-details")).toHaveCount(5);
    await expect(accumulator.locator(".trait-group-details[open]")).toHaveCount(
      0,
    );

    const brainGroup = accumulator.locator(".trait-group-details", {
      hasText: "Мозг и социальность",
    });
    await brainGroup.locator("summary").click();
    await expect(brainGroup.getByText("язык")).toBeVisible();
  });

  test("glossary tooltips explain evolutionary terms", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop stage card.");

    await page.goto("/?mode=all&stage=chordates");
    const chordatesTerm = page
      .locator(".stage-glossary-line")
      .getByRole("button", { name: "Хордовые" });
    await chordatesTerm.hover();
    await chordatesTerm.evaluate((node) => (node as HTMLElement).focus());
    await expect(page.getByRole("tooltip")).toContainText(
      /внутренней опорной осью/i,
      { timeout: 10_000 },
    );
  });

  test("quiz runs through questions to a result", async ({ page }) => {
    test.slow();
    await page.goto("/quiz");
    const quiz = page.locator(".quiz-panel");

    await expect(
      page.getByRole("heading", { name: "Проверь себя" }),
    ).toBeVisible();
    const progress = await quiz.locator(".quiz-progress").innerText();
    const totalQuestions = Number(progress.match(/из\s+(\d+)/i)?.[1]);
    expect(totalQuestions).toBeGreaterThanOrEqual(36);

    for (let index = 0; index < totalQuestions; index += 1) {
      await quiz
        .locator(".quiz-option")
        .first()
        .evaluate((node) => (node as HTMLButtonElement).click());
      const nextButton = quiz.getByRole("button", {
        name:
          index === totalQuestions - 1
            ? "Показать результат"
            : "Следующий вопрос",
      });
      await expect(nextButton).toBeEnabled();
      await nextButton.evaluate((node) => (node as HTMLButtonElement).click());
    }

    await expect(quiz.getByText(/Ваш результат/)).toBeVisible();
  });

  test("atlas no longer shows the unclear comparison panel", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator(".comparison-panel")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Сравнить два этапа" }),
    ).toHaveCount(0);
  });

  test("active era changes the atlas ambient color token", async ({ page }) => {
    await page.goto("/?mode=all&stage=chordates");
    const atlas = page.locator(".atlas");
    const earlyColor = await atlas.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--active-era-color").trim(),
    );

    await page.goto("/?mode=all&stage=homo-sapiens");
    const lateColor = await atlas.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--active-era-color").trim(),
    );

    expect(earlyColor).not.toBe(lateColor);
    expect(lateColor).toBe("#d0a35b");
  });

  test("journey mode plays and pauses the atlas route", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop JourneyControls.");

    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");

    await page.getByRole("button", { name: "Запустить путешествие" }).click();
    await expect(activeHeading).toHaveText("Клеточные линии");
    await expect(page.locator(".journey-status")).toContainText(
      /Маршрут 1 из/i,
    );
    await expect(activeHeading).toHaveText("Прокариоты", { timeout: 2500 });

    await page.getByRole("button", { name: "Пауза" }).click();
    await expect(
      page.getByRole("button", { name: "Продолжить" }),
    ).toBeVisible();
    await page.waitForTimeout(1200);
    const pausedHeading = await activeHeading.textContent();
    await page.waitForTimeout(1200);
    await expect(activeHeading).toHaveText(pausedHeading ?? "");

    await page.getByRole("button", { name: "Продолжить" }).click();
    await expect(activeHeading).not.toHaveText(pausedHeading ?? "", {
      timeout: 2500,
    });
  });

  test("theory route explains scientific theory and evidence", async ({
    page,
  }) => {
    await page.goto("/theory");
    await expect(
      page.getByRole("heading", { name: /Что значит.*теория/i }),
    ).toBeVisible();
    await expect(page.getByText(/Дарвин: идея/i)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Не лестница прогресса, а дерево родства/i,
      }),
    ).toBeVisible();
    await expect(page.getByText(/Происхождение видов/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ископаемые" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Молекулярные данные" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /National Academies/i }).first(),
    ).toBeVisible();
  });

  test("extinctions route explains mass extinctions", async ({ page }) => {
    await page.goto("/extinctions");
    await expect(
      page.getByRole("heading", { name: /Глобальные вымирания/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Пермское/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Мел-палеогеновое/i }),
    ).toBeVisible();
    await expect(
      page.locator(".extinction-stat-grid strong", {
        hasText: /около 90% всех видов/i,
      }),
    ).toBeVisible();
    await expect(
      page.locator(".extinction-stat-grid strong", {
        hasText: /примерно 75% видов/i,
      }),
    ).toBeVisible();
    await expect(page.locator(".extinction-visual img")).toHaveCount(6);
    await expect(
      page.getByRole("heading", {
        name: /Современный кризис биоразнообразия/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Открыть PDF/i }),
    ).toHaveAttribute("href", "/assets/materials/six-planet-apocalypses.pdf");
    await expect(page.getByText(/млекопитающим/i).first()).toBeVisible();
  });

  test("about route is reader-facing, not technical deploy notes", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /Зачем нужен этот атлас/i }),
    ).toBeVisible();
    await expect(page.getByText(/общий предок/i).first()).toBeVisible();
    await expect(
      page.getByText(/Vite|GitHub|Caddy|nginx|pnpm|dist\//i),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Открыть источники" }),
    ).toHaveAttribute("href", "/sources");
  });

  test("sources route exposes image metadata and source links", async ({
    page,
  }) => {
    await page.goto("/sources");
    await expect(
      page.getByRole("heading", { name: /Источники/i }),
    ).toBeVisible();
    await expect(
      page
        .getByText(/Wikimedia Commons|NASA|NOAA|Natural History Museum/i)
        .first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Источник изображения/i }).first(),
    ).toBeVisible();
    await expect(page.getByText(/sourceUrl|датасет|локальная музейная обработка/i)).toHaveCount(0);
  });

  test("mobile sources cards keep image media separate from metadata", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile sources layout.");

    await page.goto("/sources");
    const firstCard = page.locator(".source-card").first();
    const media = firstCard.locator(".source-card-media");
    const copy = firstCard.locator(".source-card-copy");

    await expect(media).toBeVisible();
    await expect(copy).toBeVisible();

    const boxes = await firstCard.evaluate((card) => {
      const mediaBox = card
        .querySelector(".source-card-media")
        ?.getBoundingClientRect();
      const copyBox = card
        .querySelector(".source-card-copy")
        ?.getBoundingClientRect();

      return mediaBox && copyBox
        ? {
            mediaBottom: mediaBox.bottom,
            mediaHeight: mediaBox.height,
            copyTop: copyBox.top,
          }
        : null;
    });

    expect(boxes).not.toBeNull();
    expect(boxes?.mediaHeight).toBeLessThanOrEqual(230);
    expect(boxes?.copyTop).toBeGreaterThanOrEqual(boxes?.mediaBottom ?? 0);
  });

  test("materials route exposes presentations and downloads", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/materials");
    await expect(
      page.getByRole("heading", { name: /Презентации, книги и видео/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Путь от клетки к человеку" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Шесть апокалипсисов планеты" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "От клетки до человека: детская версия",
      }),
    ).toBeVisible();
    await expect(page.locator(".material-card")).toHaveCount(5);
    await expect(
      page.getByRole("link", { name: /Открыть PDF/i }).first(),
    ).toHaveAttribute("href", /^\/assets\/materials\/.+\.pdf$/);
    await expect(
      page.getByRole("link", { name: /Открыть PDF/i }),
    ).toHaveCount(5);
    await expect(page.getByRole("link", { name: /Скачать PPTX/i })).toHaveCount(
      0,
    );
    await expect(page.getByText(/PPTX/i)).toHaveCount(0);
    await expect(page.getByText("Как использовать на портале")).toHaveCount(0);
    await expect(
      page.getByText(/слайды хранятся|нативных страниц|публиковать целиком/i),
    ).toHaveCount(0);
    await expect(page.getByText("Что внутри").first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Книги, которые хорошо продолжают портал",
      }),
    ).toBeVisible();
    await expect(page.locator(".reading-card")).toHaveCount(11);
    await expect(page.locator(".reading-card img")).toHaveCount(11);
    await expect(
      page.getByRole("link", { name: /Страница издательства/i }),
    ).toHaveCount(11);
    for (let index = 0; index < 11; index += 1) {
      const image = page.locator(".reading-card img").nth(index);
      await image.evaluate((node) =>
        node.scrollIntoView({ block: "center", inline: "nearest" }),
      );
      await expect
        .poll(() =>
          image.evaluate((node) => {
            const img = node as HTMLImageElement;
            return img.complete && img.naturalWidth > 0;
          }),
        )
        .toBe(true);
    }
    await expect(
      page.getByRole("heading", {
        name: "Видео и лекции для следующего шага",
      }),
    ).toBeVisible();
    await expect(page.locator(".watch-card")).toHaveCount(3);
    await expect(page.locator(".watch-card-media img")).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const image = page.locator(".watch-card-media img").nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((node) => {
            const img = node as HTMLImageElement;
            return img.complete && img.naturalWidth > 0;
          }),
        )
        .toBe(true);
    }
  });

  test("mobile materials cards use compact media without copy overlap", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile materials layout.");

    await page.goto("/materials");
    const firstCard = page.locator(".material-card").first();
    const media = firstCard.locator(".material-card-media");
    const copy = firstCard.locator(".material-card-body");

    await expect(media).toBeVisible();
    await expect(copy).toBeVisible();

    const boxes = await firstCard.evaluate((card) => {
      const mediaBox = card
        .querySelector(".material-card-media")
        ?.getBoundingClientRect();
      const copyBox = card
        .querySelector(".material-card-body")
        ?.getBoundingClientRect();

      return mediaBox && copyBox
        ? {
            mediaBottom: mediaBox.bottom,
            mediaHeight: mediaBox.height,
            copyTop: copyBox.top,
          }
        : null;
    });

    expect(boxes).not.toBeNull();
    expect(boxes?.mediaHeight).toBeLessThanOrEqual(230);
    expect(boxes?.copyTop).toBeGreaterThanOrEqual(boxes?.mediaBottom ?? 0);
  });

  test("dinosaurs route separates shared animal ancestors from the bird branch", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop dinosaur axis layout.");

    test.slow();
    await page.goto("/dinosaurs");
    await expect(
      page.getByRole("heading", { name: "Вымерли ли динозавры" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Общая линия → динозавры → птицы" }),
    ).toBeVisible();
    await expect(page.getByText("общий фундамент позвоночных")).toBeVisible();
    await expect(page.getByText("динозавры → птицы").first()).toBeVisible();
    await expect(page.getByText("~165 млн лет")).toBeVisible();
    await expect(
      page.locator(".dinosaur-facts-band").getByText("~320 млн лет"),
    ).toBeVisible();
    await expect(
      page.getByText(/синапсидная линия ведет к млекопитающим/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Ранние амниоты, ~320 млн лет назад/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/Последний общий предок нашей линии и линии птиц/i),
    ).toBeVisible();
    await expect(
      page.getByText(/синапсиды → терапсиды → млекопитающие/i),
    ).toBeVisible();
    await expect(
      page.getByText(/диапсиды → архозавры → динозавры/i),
    ).toBeVisible();
    await expect(page.locator(".dinosaur-atlas-grid")).toHaveCount(1);
    await expect(page.locator(".dinosaur-route-card")).toBeVisible();
    await expect(
      page.locator(".dinosaur-atlas-grid .dinosaur-detail-card"),
    ).toBeVisible();
    await expect(page.locator(".dinosaur-deep-axis")).toHaveCount(1);
    await expect(page.locator(".dinosaur-timeline-river-image")).toBeVisible();
    await expect(
      page.locator(".dinosaur-common-ancestor__media img"),
    ).toBeVisible();
    await expect(page.locator(".dinosaur-photo-axis")).toHaveCount(0);
    await expect(page.locator(".dinosaur-branch-card")).toHaveCount(0);
    await expect(
      page.locator(".dinosaur-stage-dots .deep-stage-dot"),
    ).toHaveCount(18);
    await expect(
      page.getByRole("heading", { name: "Первые животные" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Современные птицы" }),
    ).not.toBeVisible();

    const nextDinosaurStage = page.getByRole("button", {
      name: "Следующий этап",
    });
    for (let index = 1; index < 18; index += 1) {
      await nextDinosaurStage.evaluate((node) =>
        (node as HTMLButtonElement).click(),
      );
    }
    await expect(
      page.locator(".dinosaur-axis-section .dinosaur-detail-copy h2"),
    ).toHaveText("Современные птицы");
    await expect(
      page
        .locator(".dinosaur-axis-section .dinosaur-detail-copy")
        .getByText(/птицы — живая динозавровая ветвь/i),
    ).toBeVisible();
  });

  test("mobile dinosaurs route uses a vertical scroll map", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile dinosaur layout.");

    await page.goto("/dinosaurs");
    await expect(
      page.getByRole("heading", { name: "Вымерли ли динозавры" }),
    ).toBeVisible();
    await expect(page.locator(".mobile-dinosaur-journey")).toBeVisible();
    await expect(page.locator(".dinosaur-deep-axis")).toHaveCount(0);
    await expect(page.locator(".mobile-dinosaur-stage-row")).toHaveCount(18);
    await expect(page.locator(".mobile-dinosaur-stage-detail")).toHaveCount(1);

    await page
      .locator(".mobile-dinosaur-stage-row")
      .filter({ hasText: "Современные птицы" })
      .getByRole("button")
      .click();
    await expect(
      page.locator(".mobile-dinosaur-stage-detail").getByRole("heading", {
        name: "Современные птицы",
      }),
    ).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });

  test("origin of life route explains competing hypotheses", async ({
    page,
  }) => {
    await page.goto("/origin-of-life");
    await expect(
      page.getByRole("heading", { name: "Гипотезы зарождения жизни" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "РНК-мир" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Гидротермальные источники" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Панспермия" }),
    ).toBeVisible();
    await expect(page.locator(".origin-hero-image img")).toHaveCount(0);
    await expect(
      page.locator(".theory-bridge-band", { hasText: "Главная мысль" }),
    ).toBeVisible();
    await expect(page.locator(".origin-story-card img")).toHaveCount(4);
    await expect(page.locator(".origin-hypothesis-card")).toHaveCount(6);
    await expect(page.locator(".origin-hypothesis-media img")).toHaveCount(6);
    await page
      .locator(".origin-hypothesis-media img")
      .first()
      .scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.locator(".origin-hypothesis-media img").first().evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
  });

  test("genetics route explains RNA, DNA, genome similarity, and molecular evidence", async ({
    page,
  }) => {
    await page.goto("/genetics");
    await expect(
      page.getByRole("heading", { name: "РНК/ДНК: родство записано в коде" }),
    ).toBeVisible();
    await expect(page.locator(".genetics-flow article")).toHaveCount(5);
    await expect(page.locator(".genetics-hero-image img")).toHaveCount(0);
    await expect(
      page.locator(".theory-bridge-band", { hasText: "Главная мысль" }),
    ).toBeVisible();
    await expect(page.locator(".molecule-card img")).toHaveCount(3);
    await expect(page.locator(".genome-comparison-card")).toHaveCount(5);
    await expect(page.locator(".genome-comparison-meter")).toHaveCount(5);
    await expect(
      page.locator(".genome-comparison-card", { hasText: "Человек и банан" }),
    ).toBeVisible();
    await expect(page.locator(".genetics-evidence-card")).toHaveCount(6);
    await expect(page.locator(".genetics-evidence-media img")).toHaveCount(6);
    await expect(page.locator(".genetics-evidence-zoom")).toHaveCount(6);
    await expect(
      page.locator(".genome-comparison-card > strong", { hasText: "98-99%" }),
    ).toBeVisible();
    await expect(page.getByText(/не та же метрика/i)).toBeVisible();

    await page.getByRole("button", { name: /TAA UAA/i }).click();
    await expect(page.locator(".codon-reader")).toContainText("стоп");
    await expect(
      page.getByRole("link", { name: /NHGRI: Human Genomic Variation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Открыть дерево/i }),
    ).toBeVisible();
    await page
      .locator(".genetics-evidence-media img")
      .first()
      .scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.locator(".genetics-evidence-media img").first().evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
    await page.locator(".genetics-evidence-zoom").first().click();
    await expect(
      page.getByRole("dialog", { name: "Увеличенная схема" }),
    ).toBeVisible();
    await expect(page.locator(".image-lightbox-panel img")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Увеличенная схема" }),
    ).toHaveCount(0);
  });
});
