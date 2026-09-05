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
  await page.getByLabel("Соседний берег", { exact: true }).selectOption("1");
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
  await expect(page.locator(".islands-history")).toBeVisible();
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
        .locator(".islands-map-art")
        .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page
    .getByLabel("Исследовать остров", { exact: true })
    .selectOption("3");
  await expect(page.locator(".islands-region-heading")).toContainText(
    "Тёплое побережье",
  );
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
