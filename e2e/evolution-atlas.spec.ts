import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  MUSEUM_RECOMMENDATIONS,
  READING_RECOMMENDATIONS,
} from "../src/data/materials";

const navItems = [
  "Атлас",
  "Приматы → человек",
  "Теория эволюции",
  "Зарождение жизни",
  "РНК/ДНК",
  "Дерево родства",
  "Карта признаков",
  "Глобальные вымирания",
  "Вымерли ли динозавры",
  "Дополнительные материалы",
  "О проекте",
  "Проверь себя",
];

const baseGuidedRouteCases = [
  {
    label: "Быстро понять портал",
    title: "Быстро понять портал",
  },
  {
    label: "Разобраться, почему эволюция - не просто мнение",
    title: "От сомнения к доказательствам",
  },
  {
    label: "Пройти путь к человеку: кто были наши предки",
    title: "Ваша родословная на 4 миллиарда лет",
  },
  {
    label: "Понять, как вообще появилась жизнь",
    title: "Как жизнь стала жизнью",
  },
  {
    label: "Узнать, почему динозавры не совсем исчезли",
    title: "Динозавры не совсем исчезли",
  },
  {
    label: "Подготовить рассказ, урок или презентацию",
    title: "Готовый рассказ об эволюции",
  },
  {
    label: "Объяснить ребенку эволюцию без занудства",
    title: "Эволюция для ребенка 8 лет",
    age: "8 лет",
  },
];

async function useDeterministicTourFallback(page: Page) {
  await page.route("**/api/plan-tour", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: { messageRu: "E2E uses deterministic tour fallback." },
      }),
    });
  });
}

async function chooseDarwinRoute(
  page: Page,
  routeCase: (typeof baseGuidedRouteCases)[number],
) {
  await page.getByRole("button", { name: routeCase.label }).click();
}

async function resetTourStorage(page: Page) {
  await page.evaluate(() => {
    window.sessionStorage.removeItem("evolution-atlas.active-tour");
    window.localStorage.removeItem("evolution-atlas.active-tour");
  });
}

async function advanceTourToStep(
  page: Page,
  tour: Locator,
  stepNumber: number,
  totalSteps: number,
) {
  await Promise.all([
    page.waitForURL(
      (url) => url.searchParams.get("step") === String(stepNumber - 1),
      { timeout: 10_000 },
    ),
    tour.getByRole("button", { name: "Дальше" }).click(),
  ]);
  await expect(tour.getByText(`Шаг ${stepNumber} из ${totalSteps}`)).toBeVisible();
}

test.describe("Evolution Atlas", () => {
  test("Darwin welcome starts a skeptical guided tour", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Открыть экскурсию с Дарвином" }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Дарвин встречает посетителя" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Дарвин встречает посетителя" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "У меня свой вопрос" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Еще экскурсии" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "Узнать, почему динозавры не совсем исчезли",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Подготовить рассказ, урок или презентацию",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Пойти самому" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Без Дарвина" }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Разобраться, почему эволюция - не просто мнение",
      })
      .click();
    await expect(page.getByText("От сомнения к доказательствам")).toBeVisible();
    await expect(page.getByText("Что будет в этой экскурсии")).toBeVisible();
    await expect(page.getByText("Интересные факты по пути")).toBeVisible();
    await expect(page.locator(".darwin-route-length-copy")).toContainText(
      /8 остановок.*15 остановок/i,
    );
    await expect(page.getByRole("button", { name: "Сменить выбор" })).toBeVisible();
    await page
      .getByRole("button", { name: /Базовый маршрут.*8 остановок/i })
      .click();

    await expect(page).toHaveURL(/\/theory\?tour=.*step=0/);
    await expect(
      page.getByRole("complementary", { name: "Тур Дарвина" }),
    ).toBeVisible();
    await expect(page.getByText("От сомнения к доказательствам")).toBeVisible();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Заметка гида")).toBeVisible();
    await expect(tour.getByText("Куда смотреть")).toHaveCount(0);
    await expect(tour.locator(".tour-look-at")).toHaveCount(0);
    await expect(tour.getByText(/научная теория/i)).toBeVisible();
    await expect(page.locator(".tour-focus-target[data-tour-focus-label]")).not.toHaveCount(0);
    await expect(tour.getByText("Вопрос Дарвина")).toHaveCount(0);
    await expect(
      tour.getByRole("button", { name: "Показать ответ" }),
    ).toHaveCount(0);
    await expect(
      tour.getByRole("button", { name: "Пойти самому" }),
    ).toHaveCount(0);
    await expect(
      tour.getByRole("button", { name: "Без Дарвина" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Дальше/i }).click();
    await expect(page).toHaveURL(/\/genetics\?tour=.*step=1/);
  });

  test("Darwin welcome asks child age before starting a child route", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", {
        name: "Объяснить ребенку эволюцию без занудства",
      })
      .click();
    await expect(page.getByText(/Сколько лет ребенку/i)).toBeVisible();

    await page.getByRole("button", { name: "8 лет" }).click();
    await page
      .getByRole("button", { name: /Базовый маршрут.*8 остановок/i })
      .click();

    await expect(page).toHaveURL(/\?tour=.*step=0/);
    await expect(page.getByText("Эволюция для ребенка 8 лет")).toBeVisible();
  });

  test("Darwin browse path offers free exploration without starting a tour", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await page.goto("/");
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", { name: "Дайте мне карту, я сам буду исследовать" })
      .click();

    const darwinWelcome = page.getByRole("dialog", {
      name: "Дарвин встречает посетителя",
    });
    await expect(
      darwinWelcome.getByRole("link", { name: "Открыть атлас" }),
    ).toBeVisible();
    const overflowingBrowseCards = await darwinWelcome
      .locator(".darwin-browse-links a")
      .evaluateAll((cards) =>
        cards.filter((card) => card.scrollWidth > card.clientWidth + 1).length,
      );
    expect(overflowingBrowseCards).toBe(0);
    await expect(
      page.getByRole("complementary", { name: "Тур Дарвина" }),
    ).toHaveCount(0);
  });

  test("Darwin route menu starts every guided route without UI errors", async ({
    page,
  }, testInfo) => {
    test.setTimeout(60_000);
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    for (const routeCase of baseGuidedRouteCases) {
      await page.goto("/");
      await resetTourStorage(page);
      await page
        .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
        .click();
      await chooseDarwinRoute(page, routeCase);

      if (routeCase.age) {
        await page.getByRole("button", { name: routeCase.age }).click();
      }
      await page
        .getByRole("button", { name: /Базовый маршрут.*8 остановок/i })
        .click();

      const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
      await expect(tour).toBeVisible();
      await expect(tour.getByText("Шаг 1 из 8")).toBeVisible();
      await expect(tour.getByText(routeCase.title)).toBeVisible();
      await expect(tour.getByText("Куда смотреть")).toHaveCount(0);
      await expect(tour.locator(".tour-look-at")).toHaveCount(0);
      await expect(page.locator(".tour-focus-target[data-tour-focus-label]")).not.toHaveCount(0);

      for (let stepNumber = 2; stepNumber <= 8; stepNumber += 1) {
        await advanceTourToStep(page, tour, stepNumber, 8);
        await expect(tour.getByText("Куда смотреть")).toHaveCount(0);
        await expect(tour.locator(".tour-look-at")).toHaveCount(0);
        await expect(page.locator(".tour-focus-target[data-tour-focus-label]")).not.toHaveCount(0);
      }

      await expect(tour.getByText("Куда пойти дальше")).toBeVisible();
      await expect(tour.locator(".tour-next-step-card")).toHaveCount(3);
      await expect(
        tour.getByRole("button", { name: "Пойти самому" }),
      ).toHaveCount(0);
      await tour.getByRole("button", { name: "Завершить" }).click();
      await expect(tour).toHaveCount(0);
    }

    expect(consoleErrors).toEqual([]);
  });

  test("Darwin route menu is usable in the mobile navigation", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", {
        name: "Пройти путь к человеку: кто были наши предки",
      })
      .click();

    await expect(page.getByText("Ваша родословная на 4 миллиарда лет")).toBeVisible();
    await expect(page.getByText("Что будет в этой экскурсии")).toBeVisible();
    await expect(page.getByText("Интересные факты по пути")).toBeVisible();
    await expect
      .poll(() =>
        page.locator(".darwin-welcome").evaluate((node) => node.scrollTop),
      )
      .toBe(0);
    await expect(
      page.getByRole("button", { name: /Базовый маршрут.*8 остановок/i }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Базовый маршрут.*8 остановок/i })
      .click();

    await expect(page.getByRole("button", { name: "Открыть меню" })).toBeVisible();
    await expect(page.getByLabel("Основная навигация")).toBeHidden();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Шаг 1 из 8")).toBeVisible();
    await expect(tour.getByText("Куда смотреть")).toHaveCount(0);
    await expect(tour.locator(".tour-look-at")).toHaveCount(0);
    await expect(page.locator(".tour-focus-target[data-tour-focus-label]")).not.toHaveCount(0);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);

    const tourBox = await page.locator(".tour-player").boundingBox();
    const viewport = page.viewportSize();
    expect(tourBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (tourBox && viewport) {
      expect(tourBox.width).toBeLessThanOrEqual(viewport.width);
      expect(tourBox.height).toBeLessThanOrEqual(viewport.height - 24);
    }
  });

  test("Darwin origin route keeps the focused origin card visible on mobile", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", { name: "Понять, как вообще появилась жизнь" })
      .click();
    await page
      .getByRole("button", { name: /Полная экскурсия.*15 остановок/i })
      .click();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Шаг 1 из 15")).toBeVisible();
    await tour.getByRole("button", { name: "Дальше" }).click();
    await expect(tour.getByText("Шаг 2 из 15")).toBeVisible();
    await expect(
      page.locator('.tour-focus-target[data-tour-stop-id="page-origin-energy"]'),
    ).toHaveCount(1);

    await expect
      .poll(() =>
        page.evaluate(() => {
          const focusRect = document
            .querySelector('.tour-focus-target[data-tour-stop-id="page-origin-energy"]')
            ?.getBoundingClientRect();
          const tourRect = document.querySelector(".tour-player")?.getBoundingClientRect();
          if (!focusRect || !tourRect) return true;

          return !(
            focusRect.right < tourRect.left ||
            focusRect.left > tourRect.right ||
            focusRect.bottom < tourRect.top ||
            focusRect.top > tourRect.bottom
          );
        }),
      )
      .toBe(false);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });

  test("Darwin full route starts with 15 stops", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", {
        name: "Пройти путь к человеку: кто были наши предки",
      })
      .click();
    await page
      .getByRole("button", { name: /Полная экскурсия.*15 остановок/i })
      .click();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Шаг 1 из 15")).toBeVisible();
    await expect(tour.getByText("Куда смотреть")).toHaveCount(0);
    await expect(tour.locator(".tour-look-at")).toHaveCount(0);
    await expect(page.locator(".tour-focus-target[data-tour-focus-label]")).not.toHaveCount(0);
  });

  test("Darwin recommendations show deterministic materials at the end of the overview route", async ({
    page,
  }, testInfo) => {
    test.setTimeout(60_000);
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page.getByRole("button", { name: "Быстро понять портал" }).click();
    await page
      .getByRole("button", { name: /Базовый маршрут.*8 остановок/i })
      .click();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Шаг 1 из 8")).toBeVisible();
    for (let stepNumber = 2; stepNumber <= 8; stepNumber += 1) {
      await advanceTourToStep(page, tour, stepNumber, 8);
    }

    await expect(tour.getByText("Куда пойти дальше")).toBeVisible();
    await expect(tour.locator(".tour-next-step-card")).toHaveCount(3);
    await expect(tour.getByRole("link", { name: /Путь от клетки к человеку/i })).toBeVisible();
    await expect(tour.getByRole("link", { name: /Photon/i })).toBeVisible();
    await expect(tour.getByRole("link", { name: /Проверить себя/i })).toBeVisible();

    await tour.getByRole("button", { name: "Завершить" }).click();
    await expect(tour).toHaveCount(0);
  });

  test("Darwin stage highlight preserves stage card and timeline positioning", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", {
        name: "Пройти путь к человеку: кто были наши предки",
      })
      .click();
    await page
      .getByRole("button", { name: /Базовый маршрут.*8 остановок/i })
      .click();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Шаг 1 из 8")).toBeVisible();
    await expect(page.locator(".stage-panel.tour-focus-target")).toHaveCount(1);
    await expect(page.locator(".deep-stage-dot.tour-focus-target")).toHaveCount(1);

    const positions = await page.evaluate(() => ({
      stagePanel: getComputedStyle(
        document.querySelector(".stage-panel.tour-focus-target") as Element,
      ).position,
      stageDot: getComputedStyle(
        document.querySelector(".deep-stage-dot.tour-focus-target") as Element,
      ).position,
    }));

    expect(positions).toEqual({
      stagePanel: "sticky",
      stageDot: "absolute",
    });
  });

  test("Darwin origin route stays about the origin of life", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop guided tour flow.");

    await useDeterministicTourFallback(page);
    await page.goto("/");
    await page
      .getByRole("button", { name: "Открыть экскурсию с Дарвином" })
      .click();
    await page
      .getByRole("button", { name: "Понять, как вообще появилась жизнь" })
      .click();
    await page
      .getByRole("button", { name: /Полная экскурсия.*15 остановок/i })
      .click();

    const tour = page.getByRole("complementary", { name: "Тур Дарвина" });
    await expect(tour.getByText("Шаг 1 из 15")).toBeVisible();

    const stepIds = await page.evaluate(() => {
      const snapshot = window.sessionStorage.getItem("evolution-atlas.active-tour");
      if (!snapshot) return [];
      const parsed = JSON.parse(snapshot) as {
        plan?: { steps?: Array<{ id: string }> };
        steps?: Array<{ id: string }>;
      };
      return (parsed.plan?.steps ?? parsed.steps ?? []).map((step) => step.id);
    });

    expect(stepIds).toContain("page-origin-of-life");
    expect(stepIds).toContain("stage-cell-lines");
    expect(stepIds).toContain("stage-prokaryotes");
    expect(stepIds).toContain("stage-eukaryotes");
    expect(stepIds).toContain("page-genetics");
    expect(stepIds).not.toContain("stage-mammals");
    expect(stepIds).not.toContain("stage-early-primates");
    expect(stepIds).not.toContain("stage-sapiens");

    await expect(tour.getByText("Как жизнь стала жизнью")).toBeVisible();
    await expect(tour.getByText(/абиогенез|РНК|химия|мембран/i)).toBeVisible();

    await tour.getByRole("button", { name: "Дальше" }).click();
    await expect(tour.getByText("Шаг 2 из 15")).toBeVisible();
    await expect(
      page.locator('.tour-focus-target[data-tour-stop-id="page-origin-energy"]'),
    ).toHaveCount(1);

    const overlapsTour = await page.evaluate(() => {
      const focusRect = document
        .querySelector('.tour-focus-target[data-tour-stop-id="page-origin-energy"]')
        ?.getBoundingClientRect();
      const tourRect = document.querySelector(".tour-player")?.getBoundingClientRect();
      if (!focusRect || !tourRect) return true;

      return !(
        focusRect.right < tourRect.left ||
        focusRect.left > tourRect.right ||
        focusRect.bottom < tourRect.top ||
        focusRect.top > tourRect.bottom
      );
    });
    expect(overlapsTour).toBe(false);
  });

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
    await expect(
      page
        .getByLabel("Основная навигация")
        .getByRole("link", { name: "Карта признаков" }),
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
            links.map((link) => link.getAttribute("aria-label") ?? ""),
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
            text: link.getAttribute("aria-label") ?? "",
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
    await expect(page.locator(".africa-origin")).toHaveCount(0);
    await expect(page.locator(".extinction-marker")).toHaveCount(5);
    await expect(page.locator(".app-ethereal-background")).toBeVisible();
    await expect(
      page.locator(".ethereal-ink-canvas, .ethereal-ink-fallback"),
    ).toHaveCount(1);
    await expect(page.locator(".scroll-progress")).toBeVisible();
    await expect(page.locator(".atlas-hero-paths")).toBeVisible();
    await expect(page.locator(".atlas-hero-constellation")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Открыть экскурсию с Дарвином" }),
    ).toBeVisible();
    await expect(
      page.locator(".atlas-hero").getByRole("button", {
        name: "Открыть экскурсию с Дарвином",
      }),
    ).toHaveCount(0);
    await expect(page.locator(".deep-time-region-label")).toHaveCount(5);
    const primatesFact = page
      .locator(".wow-facts-band article")
      .filter({ hasText: "До приматов" });
    await expect(primatesFact).toContainText("98,4%");
    await expect(
      primatesFact.getByText(/появления первых приматов/i),
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
    await expect(
      page.getByRole("button", { name: "Открыть экскурсию с Дарвином" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(
      page.getByRole("button", { name: "Открыть экскурсию с Дарвином" }),
    ).toBeVisible();
    await expect(page.locator(".deep-time-axis")).toHaveCount(0);
    await expect(page.locator(".stage-panel")).toHaveCount(0);
    await expect(page.locator(".mobile-atlas-tabs")).toHaveCount(0);

    await expect(page.locator(".mobile-stage-row").first()).toBeVisible();
    await expect(page.locator(".mobile-stage-detail")).toHaveCount(1);

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });

  test("mobile primates page preserves shared stage URL state", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile Atlas is mobile-only.");

    await page.goto("/primates?stage=early-primates");
    await expect(page.locator(".mobile-stage-row")).toHaveCount(16);
    await expect(page.locator(".africa-origin")).toBeVisible();

    await page
      .locator(".mobile-stage-row")
      .filter({ hasText: "Ранние человекообразные" })
      .getByRole("button")
      .click();
    await expect(page).toHaveURL(/\/primates\?stage=early-apes/);
    await expect(
      page.locator(".mobile-stage-detail").getByRole("heading", {
        name: "Ранние человекообразные",
      }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/primates\?stage=early-primates/);
    await expect(
      page.locator(".mobile-stage-detail").getByRole("heading", {
        name: "Ранние родственники приматов",
      }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/primates\?stage=early-apes/);
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
        ".mobile-atlas-stepper button, .mobile-stage-row > button",
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
    await expect(page).toHaveURL(/\/primates$/);

    await nav.getByRole("link", { name: "Приматы → человек" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/$/);

    await nav.getByRole("link", { name: "Атлас" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/quiz$/);
  });

  test("Darwin guide asks the backend with atlas context and renders sourced answer", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop AI guide flow.");

    const requests: unknown[] = [];
    await page.route("**/api/ask-darwin", async (route) => {
      const requestBody = route.request().postDataJSON();
      requests.push(requestBody);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            darwinAnswerRu:
              "Я бы начал с родства: человек не произошел от современной обезьяны, а делит с ней общего предка.",
            modernNoteRu:
              "Современные данные уточняют это через ДНК, ископаемые и ветвящееся дерево родства.",
            citations: [
              {
                label: "Understanding Evolution: Lines of evidence",
                url: "https://evolution.berkeley.edu/lines-of-evidence/",
              },
            ],
            relatedLinks: [
              { labelRu: "Открыть дерево родства", href: "/cladogram" },
            ],
            confidence: "solid",
            grounding: "site",
          },
        }),
      });
    });

    await page.goto("/primates?stage=homo-sapiens");
    await page.getByRole("button", { name: /Спросить Дарвина/i }).click();
    await expect(page.getByRole("dialog", { name: /Спросить Дарвина/i })).toBeVisible();
    await page
      .getByRole("button", { name: "Подобрать экскурсию с Дарвином" })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Дарвин встречает посетителя" }),
    ).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: /Спросить Дарвина/i }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Без Дарвина" }).click();
    await page.getByRole("button", { name: /Спросить Дарвина/i }).click();

    await page
      .getByLabel("Вопрос для Дарвина")
      .fill("От кого произошел человек?");
    await page.getByRole("button", { name: "Задать вопрос" }).click();

    await expect(page.getByText(/человек не произошел от современной обезьяны/i)).toBeVisible();
    await expect(page.getByText(/Современная научная заметка/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Lines of evidence/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Открыть дерево родства" })).toHaveAttribute("href", "/cladogram");

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      message: "От кого произошел человек?",
      pagePath: "/primates?stage=homo-sapiens",
      stageId: "sapiens",
      atlasMode: "primates",
    });
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
    await expect(
      page.locator(".topbar-nav .expandable-tab-mobile-label", {
        hasText: "Приматы → человек",
      }),
    ).toBeVisible();
    await expect(
      page.locator(".topbar-nav .expandable-tab-mobile-label", {
        hasText: "Карта признаков",
      }),
    ).toBeVisible();
    await expect(
      page.locator(".topbar-nav .expandable-tab-mobile-label", {
        hasText: "РНК/ДНК",
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

    await page.goto("/primates");
    await expect(page.locator(".primate-deep-axis")).toBeVisible();
    await expect(page.locator(".primate-timeline-river-image")).toBeVisible();
    await expect(page.locator(".primate-time-floating-paths")).toHaveCount(1);
    await expect(page.locator(".primate-stage-dots .deep-stage-dot")).toHaveCount(16);
    await expect(page.locator(".primate-zone-bands span")).toHaveCount(4);
    await expect(page.getByText(/66 млн лет назад.*сегодня/i)).toBeVisible();
    await expect(page.getByText("Маршрут по эпохам")).toHaveCount(0);
    await expect(
      page.locator(".atlas-hero").getByRole("link", { name: "Весь путь" }),
    ).toHaveCount(0);
    await expect(
      page.locator(".primate-focus-panel").getByText("Запустить эволюцию"),
    ).toBeVisible();

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

  test("main atlas opens primates from the timeline label", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/");
    await expect(
      page.locator(".atlas-hero").getByRole("link", {
        name: "Приматы → человек",
      }),
    ).toHaveCount(0);

    const primatesLabel = page.getByRole("link", { name: /Приматы и Homo/i });
    await expect(primatesLabel).toBeVisible();
    await expect(primatesLabel).toHaveAttribute("href", "/primates");

    await primatesLabel.click();
    await expect(page).toHaveURL(/\/primates$/);
    await expect(page.locator(".primate-deep-axis")).toBeVisible();
  });

  test("main atlas opens origin of life from the cellular timeline label", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/");
    const cellularLabel = page.getByRole("link", { name: /Клеточная жизнь/i });
    await expect(cellularLabel).toBeVisible();
    await expect(cellularLabel).toHaveAttribute("href", "/origin-of-life");

    await cellularLabel.click();
    await expect(page).toHaveURL(/\/origin-of-life$/);
    await expect(
      page.getByRole("heading", { name: /Гипотезы зарождения жизни/i }),
    ).toBeVisible();
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

  test("primates URL state restores selected stage", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/primates?stage=early-apes");
    await expect(
      page.getByRole("heading", { name: "Ранние человекообразные" }),
    ).toBeVisible();
    await expect(page.locator(".africa-origin")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Ранние человекообразные" }),
    ).toBeVisible();

    await page
      .locator(".primate-deep-axis")
      .getByRole("button", { name: /Homo sapiens/i })
      .click();
    await expect(page).toHaveURL(/\/primates\?stage=homo-sapiens/);
    await expect(
      page.getByRole("heading", { name: "Homo sapiens" }),
    ).toBeVisible();
  });

  test("legacy primate atlas links redirect to the dedicated section", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop Atlas layout.");

    await page.goto("/?mode=primates&stage=homo-sapiens");
    await expect(page).toHaveURL(/\/primates\?stage=homo-sapiens/);
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
      cladogram
        .locator(".cladogram-reader-guide")
        .getByText("Общий предок с нами"),
    ).toBeVisible();
    await expect(cladogram.getByText(/LUCA/i).first()).toBeVisible();
    await expect(
      cladogram.getByRole("button", { name: "Все ветви" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      cladogram.getByRole("button", { name: "Живущие сегодня" }),
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

    await cladogram.getByRole("button", { name: "Живущие сегодня" }).click();
    await expect(
      cladogram.getByRole("button", { name: "Живущие сегодня" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      cladogram
        .locator(".cladogram-branch")
        .filter({ hasText: "живут сегодня" })
        .first(),
    ).toBeVisible();
    await expect(
      cladogram
        .locator(".cladogram-branch")
        .filter({ hasText: "Киты, копытные, летучие мыши и хищные" }),
    ).toBeVisible();
    await expect(
      cladogram.locator(".cladogram-branch").filter({ hasText: "Лемуры и лори" }),
    ).toBeVisible();
    const newWorldMonkeyCard = cladogram
      .locator(".cladogram-branch")
      .filter({ hasText: "Широконосые обезьяны" });
    const oldWorldMonkeyCard = cladogram
      .locator(".cladogram-branch")
      .filter({ hasText: "Мартышковые" });
    await expect(
      newWorldMonkeyCard.locator(".cladogram-branch-thumb img"),
    ).toHaveAttribute("src", "/assets/images/source-backed/capuchin-branch.jpg");
    await expect(
      oldWorldMonkeyCard.locator(".cladogram-branch-thumb img"),
    ).toHaveAttribute(
      "src",
      "/assets/images/source-backed/douc-langur-head.jpg",
    );
    await expect(
      cladogram.getByRole("button", { name: /Неандертальцы/i }),
    ).toHaveCount(0);

    await cladogram
      .locator(".cladogram-branch")
      .filter({ hasText: "Шимпанзе и бонобо" })
      .click();
    await expect(page.locator(".cladogram-inspector")).toContainText(
      "общий предок с нами",
    );
    await expect(page.locator(".cladogram-inspector")).toContainText(
      "Предок линии Homo-Pan",
    );
    await expect(page.locator(".cladogram-inspector")).toContainText(
      "не предок человека, а современная соседняя ветвь",
    );
  });

  test("cladogram inspector opens species images in a lightbox", async ({
    page,
  }) => {
    await page.goto("/cladogram");
    const cladogram = page.locator(".cladogram-panel");

    await cladogram
      .locator(".cladogram-branch")
      .filter({ hasText: "Диапсиды" })
      .click();

    const zoomButton = page.getByRole("button", {
      name: /Увеличить изображение: Диапсиды/i,
    });
    await expect(zoomButton).toBeVisible();
    await zoomButton.click();
    await expect(
      page.getByRole("dialog", { name: "Увеличенное изображение ветви" }),
    ).toBeVisible();
    await expect(page.locator(".image-lightbox-panel img")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Увеличенное изображение ветви" }),
    ).toHaveCount(0);
  });

  test("body trait map switches layers and opens atlas stages", async ({
    page,
  }) => {
    await page.goto("/body-map");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Какие древние решения живут в нашем теле",
      }),
    ).toBeVisible();
    await expect(page.locator(".body-map-summary")).toHaveCount(0);
    await expect(page.getByText("в кураторской карте")).toHaveCount(0);
    await expect(
      page.getByText(/Изображение остается чистым фоном/i),
    ).toHaveCount(0);
    await expect(page.locator(".body-map-canvas img")).toBeVisible();
    await expect
      .poll(() =>
        page.locator(".body-map-canvas img").evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);

    await expect(
      page.getByRole("tab", { name: /Клетка/i }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".body-trait-inspector")).toContainText(
      "Мембраны",
    );

    await page.getByRole("tab", { name: "Движение" }).click();
    await expect(
      page.getByRole("tab", { name: "Движение" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".body-trait-inspector")).toContainText(
      "Парные придатки",
    );

    await page.getByRole("button", { name: /Пальцы: Четвероногие/i }).click();
    await expect(page.locator(".body-trait-inspector")).toContainText(
      "Пальцы",
    );
    await expect(page.locator(".body-trait-inspector")).toContainText(
      "Предковый узел",
    );
    await expect(page.locator(".body-trait-stage img")).toBeVisible();
    await expect
      .poll(() =>
        page.locator(".body-trait-stage img").evaluate((node) => {
          const image = node as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      )
      .toBe(true);
    await expect(
      page.getByRole("link", { name: /Открыть этап в Атласе/i }),
    ).toHaveAttribute("href", "/?mode=all&stage=tetrapods");

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });

  test("body trait pins stay separated on every layer", async ({ page }) => {
    const layerTabs = ["Клетка", "Тело", "Движение", "Чувства", "Мозг"];
    const minPinDistance = 42;

    await page.goto("/body-map");
    await expect(page.locator(".body-map-canvas img")).toBeVisible();

    for (const layerTab of layerTabs) {
      await page.getByRole("tab", { name: layerTab }).click();

      const spacing = await page.evaluate((threshold) => {
        const canvas = document.querySelector<HTMLElement>(".body-map-canvas");

        if (!canvas) {
          throw new Error("Missing body map canvas");
        }

        const canvasRect = canvas.getBoundingClientRect();
        const pins = [
          ...document.querySelectorAll<HTMLElement>(".body-trait-pin"),
        ].map((pin) => {
          const style = getComputedStyle(pin);

          return {
            label: pin.getAttribute("aria-label") ?? "unnamed pin",
            x:
              (Number.parseFloat(style.getPropertyValue("--trait-x")) / 100) *
              canvasRect.width,
            y:
              (Number.parseFloat(style.getPropertyValue("--trait-y")) / 100) *
              canvasRect.height,
          };
        });
        const tooClose: string[] = [];

        for (let index = 0; index < pins.length; index += 1) {
          for (
            let nextIndex = index + 1;
            nextIndex < pins.length;
            nextIndex += 1
          ) {
            const first = pins[index];
            const second = pins[nextIndex];
            const distance = Math.hypot(first.x - second.x, first.y - second.y);

            if (distance < threshold) {
              tooClose.push(
                `${first.label} / ${second.label}: ${Math.round(distance)}px`,
              );
            }
          }
        }

        return { pinCount: pins.length, tooClose };
      }, minPinDistance);

      expect(spacing.pinCount, `${layerTab} pin count`).toBeGreaterThanOrEqual(
        5,
      );
      expect(spacing.tooClose, `${layerTab} pin spacing`).toEqual([]);
    }
  });

  test("mobile body trait pins stay compact on the map", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile-only touch target QA.");

    await page.goto("/body-map");
    await expect(page.locator(".body-map-canvas img")).toBeVisible();

    const pinRects = await page.locator(".body-trait-pin").evaluateAll((pins) =>
      pins.map((pin) => {
        const rect = pin.getBoundingClientRect();

        return {
          width: rect.width,
          height: rect.height,
        };
      }),
    );

    expect(pinRects.length).toBeGreaterThan(4);

    for (const rect of pinRects) {
      expect(rect.width).toBeLessThanOrEqual(44);
      expect(rect.height).toBeLessThanOrEqual(44);
    }
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

  test("trait tracking surfaces link to the body trait map", async ({
    page,
  }, testInfo) => {
    await page.goto("/?mode=all&stage=homo-sapiens");
    await expect(
      page.getByRole("heading", { name: "Homo sapiens" }),
    ).toBeVisible();

    await expect(
      page
        .locator(".trait-accumulator")
        .getByRole("link", { name: /карт[ау] признаков/i }),
    ).toHaveAttribute("href", "/body-map");
    if (testInfo.project.name !== "mobile") {
      await expect(
        page.locator(".wow-facts-band").getByRole("link", {
          name: /Открыть карту/i,
        }),
      ).toHaveAttribute("href", "/body-map");
    }

    const stageTraitSurface =
      testInfo.project.name === "mobile"
        ? page.locator(".mobile-stage-detail")
        : page.locator(".inheritance-box");
    await expect(
      stageTraitSurface.getByRole("link", { name: /карт[ау] признаков/i }),
    ).toHaveAttribute("href", "/body-map");

    await page.goto("/cladogram?stage=tetrapods");
    await expect(
      page.locator(".cladogram-inspector-traits").getByRole("link", {
        name: /карт[ау] признаков/i,
      }),
    ).toHaveAttribute("href", "/body-map");
  });

  test("primates section omits the inherited traits accumulator", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".trait-accumulator")).toBeVisible();

    await page.goto("/primates?stage=homo-sapiens");
    await expect(page.locator(".africa-origin")).toBeVisible();
    await expect(page.locator(".trait-accumulator")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Унаследованные признаки" }),
    ).toHaveCount(0);
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
    expect(totalQuestions).toBe(10);

    for (let index = 0; index < totalQuestions; index += 1) {
      if ((await quiz.locator(".quiz-order-list").count()) > 0) {
        await quiz.getByRole("button", { name: "Проверить" }).click();
      } else if ((await quiz.locator(".quiz-branch-node").count()) > 0) {
        await quiz
          .locator(".quiz-branch-node")
          .first()
          .evaluate((node) => (node as HTMLButtonElement).click());
      } else {
        await quiz
          .locator(".quiz-option")
          .first()
          .evaluate((node) => (node as HTMLButtonElement).click());
      }

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
    await expect(quiz.getByText("Оценка Дарвина")).toBeVisible();
    await expect(
      quiz.getByRole("heading", { name: "Ваш маршрут" }),
    ).toBeVisible();
    const routeCards = quiz.locator(".quiz-route-card");
    const routeCardCount = await routeCards.count();
    if (routeCardCount > 0) {
      await expect(routeCards.first().locator("a").first()).toBeVisible();
      const routeHrefs = await routeCards
        .locator("a")
        .evaluateAll((links) =>
          links.map((link) => (link as HTMLAnchorElement).getAttribute("href")),
        );
      const expectedRouteHrefs = new Set([
        "/",
        "/cladogram",
        "/dinosaurs",
        "/extinctions",
        "/genetics",
        "/materials",
        "/origin-of-life",
        "/primates",
        "/sources",
        "/theory",
      ]);
      expect(routeHrefs.some((href) => expectedRouteHrefs.has(href ?? ""))).toBe(true);
    } else {
      await expect(quiz.getByText(/Особенная благодарность от Дарвина/i)).toBeVisible();
      await expect(quiz.locator(".quiz-route-perfect a")).toHaveCount(3);
    }
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

  test("evolution playback controls play and pause from the timeline", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop JourneyControls.");

    await page.goto("/");
    const activeHeading = page.locator(".stage-copy h2");
    const playback = page.locator(".deep-time-panel .journey-controls");

    await expect(
      page.locator(".atlas-hero").getByRole("button", {
        name: "Запустить эволюцию",
      }),
    ).toHaveCount(0);
    await expect(page.getByText("Запустить путешествие")).toHaveCount(0);
    await expect(page.getByText(/Маршрут \d+ из/i)).toHaveCount(0);
    await expect(playback.getByText("Запустить эволюцию")).toBeVisible();

    await playback
      .getByRole("button", { name: "Запустить эволюцию", exact: true })
      .click();
    await expect(activeHeading).toHaveText("Клеточные линии");
    await expect(page.locator(".journey-status")).toHaveCount(0);
    await expect
      .poll(() => activeHeading.textContent(), { timeout: 3000 })
      .not.toBe("Клеточные линии");

    await playback
      .getByRole("button", { name: "Поставить эволюцию на паузу" })
      .click();
    await expect(
      playback.getByRole("button", { name: "Продолжить эволюцию" }),
    ).toBeVisible();
    await page.waitForTimeout(1200);
    const pausedHeading = await activeHeading.textContent();
    await page.waitForTimeout(1200);
    await expect(activeHeading).toHaveText(pausedHeading ?? "");

    await playback
      .getByRole("button", { name: "Продолжить эволюцию" })
      .click();
    await expect(activeHeading).not.toHaveText(pausedHeading ?? "", {
      timeout: 2500,
    });

    await playback
      .getByRole("button", { name: "Запустить эволюцию сначала" })
      .click();
    await expect(activeHeading).toHaveText("Клеточные линии");
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
        name: /Дерево родства вместо лестницы прогресса/i,
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
  }, testInfo) => {
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
    await expect(
      page.getByRole("heading", { name: /Как появился проект/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Как с помощью ИИ за вечер погрузиться в любую тему/i),
    ).toBeVisible();
    await expect(page.getByText(/Сотников Дмитрий/i)).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Сотников Дмитрий/i }),
    ).toHaveAttribute("src", "/assets/images/about/dmitry-sotnikov.jpg");

    const originLayout = await page
      .locator(".about-origin-story")
      .evaluate((story) => {
        const media = story.querySelector(".about-author");
        const copy = story.querySelector(".about-origin-story__copy");
        const mediaRect = media?.getBoundingClientRect();
        const copyRect = copy?.getBoundingClientRect();

        return {
          copyLeft: copyRect?.left ?? null,
          copyTop: copyRect?.top ?? null,
          hasCopy: Boolean(copyRect),
          hasMedia: Boolean(mediaRect),
          mediaRight: mediaRect?.right ?? null,
          mediaTop: mediaRect?.top ?? null,
        };
      });

    expect(originLayout.hasMedia).toBe(true);
    expect(originLayout.hasCopy).toBe(true);

    if (testInfo.project.name === "desktop") {
      expect(originLayout.mediaRight).not.toBeNull();
      expect(originLayout.copyLeft).not.toBeNull();
      expect(originLayout.mediaRight as number).toBeLessThan(
        originLayout.copyLeft as number,
      );
    } else {
      expect(originLayout.mediaTop).not.toBeNull();
      expect(originLayout.copyTop).not.toBeNull();
      expect(originLayout.mediaTop as number).toBeLessThan(
        originLayout.copyTop as number,
      );
    }
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
      page.getByRole("heading", { name: /Презентации, книги, музеи и видео/i }),
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
    await expect(page.locator(".reading-card")).toHaveCount(
      READING_RECOMMENDATIONS.length,
    );
    await expect(page.locator(".reading-card img")).toHaveCount(
      READING_RECOMMENDATIONS.length,
    );
    await expect(
      page.getByRole("link", { name: /Страница издательства/i }),
    ).toHaveCount(
      READING_RECOMMENDATIONS.filter((book) => !book.linkLabelRu).length,
    );
    for (let index = 0; index < READING_RECOMMENDATIONS.length; index += 1) {
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
        name: "Музеи, которые продолжают маршрут",
      }),
    ).toBeVisible();
    await expect(page.locator(".museum-card")).toHaveCount(
      MUSEUM_RECOMMENDATIONS.length,
    );
    await expect(page.getByRole("link", { name: /Сайт музея/i })).toHaveCount(
      MUSEUM_RECOMMENDATIONS.length,
    );
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

  test("dinosaurs route opens active species images in a lightbox", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Desktop dinosaur axis layout.");

    await page.goto("/dinosaurs");
    const zoomButton = page.getByRole("button", {
      name: /Увеличить изображение: Первые животные/i,
    });
    await expect(zoomButton).toBeVisible();
    await zoomButton.click();
    await expect(
      page.getByRole("dialog", { name: "Увеличенное изображение вида" }),
    ).toBeVisible();
    await expect(page.locator(".image-lightbox-panel img")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Увеличенное изображение вида" }),
    ).toHaveCount(0);
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
    await page
      .getByRole("button", {
        name: /Увеличить изображение: Современные птицы/i,
      })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Увеличенное изображение вида" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Увеличенное изображение вида" }),
    ).toHaveCount(0);

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
