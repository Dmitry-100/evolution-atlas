import { expect, test, type Page } from "@playwright/test";
import { createGame, nextTurn, resolveTurn } from "../src/game/engine";
import { SAVE_KEY } from "../src/game/storage";
import type { GameState } from "../src/game/types";

async function enter(page: Page, state = createGame(146)) {
  await page.addInitScript(
    ({ key, initial }) => {
      if (!sessionStorage.getItem("game-fixture-loaded")) {
        localStorage.setItem(key, JSON.stringify(initial));
        sessionStorage.setItem("game-fixture-loaded", "yes");
      }
    },
    { key: SAVE_KEY, initial: state },
  );
  await page.goto("/game");
  await page
    .getByRole("button", { name: "Продолжить экспедицию", exact: true })
    .click();
  await expect(page.locator(".island-scene")).toHaveAttribute(
    "data-renderer",
    "ready",
  );
}

test("game starts, plans real migration, persists the draft and resolves exactly once", async ({
  page,
}, info) => {
  test.setTimeout(60_000);
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) requests.push(request.url());
  });
  await enter(page);
  await expect(
    page.getByRole("heading", { name: "Острова эволюции", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("game-population")).toHaveText("80");
  await page
    .locator(".islands-card-main")
    .filter({ hasText: "Расселение" })
    .click();
  await page
    .getByRole("combobox", { name: "Соседний берег", exact: true })
    .click();
  await page.getByRole("option", { name: /Ветровая равнина/ }).click();
  await page.getByRole("button", { name: "Добавить в план" }).click();
  await expect(page.locator(".islands-draft")).toContainText("Расселение");
  await page.reload();
  await page
    .getByRole("button", { name: "Продолжить экспедицию", exact: true })
    .click();
  await expect(page.locator(".islands-draft")).toContainText("Расселение");
  await page.getByRole("button", { name: "Следующие поколения" }).click();
  await expect(page.locator("[data-game-phase]")).toHaveAttribute(
    "data-game-phase",
    "report",
  );
  await expect(page.locator(".islands-report")).toContainText(
    "Успешные переходы",
  );
  const result = await page.getByTestId("game-population").textContent();
  await page.reload();
  await page
    .getByRole("button", { name: "Продолжить экспедицию", exact: true })
    .click();
  await expect(page.getByTestId("game-population")).toHaveText(result!);
  await expect(page.locator("[data-game-phase]")).toHaveAttribute(
    "data-game-phase",
    "report",
  );
  await page.getByRole("button", { name: "К следующему ходу" }).click();
  await expect(page.locator(".islands-status-bar")).toContainText("2 / 18");
  expect(requests).toEqual([]);
  await page.screenshot({
    path: info.outputPath("game-turn.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("the complete campaign works without a backend or network after loading", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page, createGame(123));
  await page.context().setOffline(true);
  for (let turn = 1; turn <= 18; turn++) {
    await page.getByRole("button", { name: "Следующие поколения" }).click();
    await expect(page.locator(".islands-report")).toBeVisible();
    await expect(page.locator("[data-game-phase]")).toHaveAttribute(
      "data-game-phase",
      turn === 18 ? "won" : "report",
    );
    if (turn === 18) break;
    await page.getByRole("button", { name: "К следующему ходу" }).click();
    await expect(page.locator("[data-game-phase]")).toHaveAttribute(
      "data-game-phase",
      "planning",
    );
  }
  await expect(
    page.getByRole("button", { name: "Те же условия" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "История популяций", exact: true })
    .click();
  await expect(page.locator(".islands-history")).toBeVisible();
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.getByRole("button", { name: "Те же условия" }).click();
  await expect(page.getByTestId("game-population")).toHaveText("80");
});

test("a forecast precedes a crisis and the final report supports replay", async ({
  page,
}) => {
  let state: GameState = createGame(37);
  while (state.turn < 4) state = nextTurn(resolveTurn(state));
  await enter(page, state);
  await expect(page.locator(".islands-forecast")).toContainText(
    "На следующем ходу",
  );
  await expect(page.locator(".islands-forecast")).toContainText(
    "великая засуха",
  );
  await page.getByRole("button", { name: "Следующие поколения" }).click();
  await page.getByRole("button", { name: "К следующему ходу" }).click();
  await expect(page.locator(".islands-event")).toContainText("Великая засуха");
});

test("invalid saved data is preserved until the player chooses a fresh expedition", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem("bad-save-fixture")) {
      localStorage.setItem(key, "{invalid");
      sessionStorage.setItem("bad-save-fixture", "yes");
    }
  }, SAVE_KEY);
  await page.goto("/game");
  await expect(page.getByRole("status")).toContainText("не удалось прочитать");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY),
  ).toBe("{invalid");
  await page
    .getByRole("button", { name: "Начать экспедицию", exact: true })
    .click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Вернуться", exact: true }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY),
  ).toBe("{invalid");
});

test("denied storage does not prevent play", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Denied", "SecurityError");
      },
    });
  });
  await page.goto("/game");
  await page
    .getByRole("button", { name: "Начать экспедицию", exact: true })
    .click();
  await page.getByRole("button", { name: "Следующие поколения" }).click();
  await expect(page.locator(".islands-report")).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "не позволяет сохранить",
  );
});

test("small screen, reduced motion, keyboard and assets remain usable", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page);
  await expect
    .poll(() =>
      page
        .locator(".game-card-art img")
        .evaluateAll((images: HTMLImageElement[]) =>
          images.every((el) => el.complete && el.naturalWidth > 0),
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /^Тихая бухта: / }).click();
  await page.locator(".game-mobile-island").click();
  await expect(page.getByRole("dialog")).toContainText("Тёплое побережье");
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.getByRole("button", { name: "Следующие поколения" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".islands-report")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Остановить анимацию" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath("game-small.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("the world and every turn control fit one screen, with illustrated themed menus", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page);
  const sizes =
    info.project.name === "mobile"
      ? [
          { width: 390, height: 844 },
          { width: 320, height: 568 },
          { width: 812, height: 375 },
        ]
      : [
          { width: 1440, height: 900 },
          { width: 1366, height: 768 },
          { width: 1280, height: 720 },
        ];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          horizontal: document.documentElement.scrollWidth > innerWidth + 1,
          vertical: document.documentElement.scrollHeight > innerHeight + 1,
        })),
      )
      .toEqual({ horizontal: false, vertical: false });
    for (const button of [
      page.getByRole("button", { name: "Следующие поколения" }),
      ...(await page.locator(".islands-card-main").all()),
    ]) {
      await expect(button).toBeInViewport({ ratio: 1 });
    }
    expect(
      (await page.locator(".game-world").boundingBox())!.height,
    ).toBeGreaterThan(120);
    await page.screenshot({
      path: info.outputPath("viewport-" + size.width + ".png"),
      animations: "disabled",
    });
    if (size.width === 812) {
      await page
        .getByRole("button", { name: "Открыть меню", exact: true })
        .click();
      await expect(
        page.getByRole("navigation", { name: "Основная навигация" }),
      ).toBeVisible();
      await page.screenshot({
        path: info.outputPath("landscape-navigation.png"),
        animations: "disabled",
      });
      await page
        .getByRole("button", { name: "Закрыть меню", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Следующие поколения" }),
      ).toBeInViewport({ ratio: 1 });
    }
  }
  await page
    .locator(".islands-card-main")
    .filter({ hasText: "Расселение" })
    .click();
  await page.getByRole("combobox", { name: "Остров", exact: true }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.locator("select:visible")).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath("themed-menu.png"),
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("3D camera can rotate, reset and pause without changing game state", async ({
  page,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "Pointer drag is checked on desktop.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await enter(page);
  const canvas = page.locator(".island-scene canvas");
  const label = page.locator(".island-scene-labels .islands-map-node").first();
  const initial = await label.getAttribute("style");
  const rect = (await canvas.boundingBox())!;
  await page.mouse.move(
    rect.x + rect.width * 0.52,
    rect.y + rect.height * 0.63,
  );
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width * 0.73,
    rect.y + rect.height * 0.64,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect.poll(() => label.getAttribute("style")).not.toBe(initial);
  await page.getByRole("button", { name: "Вернуть ракурс" }).click();
  await page.getByRole("button", { name: "Остановить анимацию" }).click();
  await expect(
    page.getByRole("button", { name: "Включить анимацию" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("game-population")).toHaveText("80");
  expect(errors).toEqual([]);
});

test("a browser without WebGL retains a playable illustrated map", async ({
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
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await page.goto("/game");
  await expect(page.locator(".island-scene")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await page
    .getByRole("button", { name: "Начать экспедицию", exact: true })
    .click();
  await page.getByRole("button", { name: "Следующие поколения" }).click();
  await expect(page.locator(".islands-report")).toBeVisible();
});

test("portal navigation releases the game viewport and restores the expedition", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await enter(page);
  await page.reload();
  await expect(page.locator(".island-scene")).toHaveAttribute(
    "data-renderer",
    "ready",
  );
  await page.screenshot({
    path: info.outputPath("game-intro.png"),
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Продолжить экспедицию", exact: true })
    .click();
  await page.getByRole("link", { name: "Открыть атлас", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".is-game-shell")).toHaveCount(0);
  await expect(page.locator(".island-scene")).toHaveCount(0);
  await page.goto("/game");
  await page
    .getByRole("button", { name: "Продолжить экспедицию", exact: true })
    .click();
  await expect(page.getByTestId("game-population")).toHaveText("80");
});
