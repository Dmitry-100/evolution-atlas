import { test, expect, type Page } from "@playwright/test";
import {
  addAction,
  createGame,
  nextTurn,
  resolveTurn,
} from "../src/game/engine";
import { CARDS, CARD_KINDS } from "../src/game/content";
import { SAVE_KEY } from "../src/game/storage";
import type { GameState } from "../src/game/types";

async function enter(
  page: Page,
  state: GameState,
  reducedMotion: "reduce" | "no-preference" = "reduce",
) {
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
    { key: SAVE_KEY, state },
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

for (const [card, kind] of CARD_KINDS.entries()) {
  test(`${kind}: a card changes the rendered world, cancellation restores it`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "The shared renderer is checked once per card.",
    );
    const state = createGame(146);
    state.hand = [
      card,
      ...Array.from({ length: 16 }, (_, i) => i)
        .filter((i) => i !== card)
        .slice(0, 3),
    ];
    state.deck = Array.from({ length: 16 }, (_, i) => i).filter(
      (i) => !state.hand.includes(i),
    );
    await enter(page, state);
    const canvas = page.locator(".island-scene canvas");
    const before = await canvas.screenshot();
    await page
      .locator(".islands-card-main")
      .filter({ hasText: CARDS[kind].title })
      .click();
    if (CARDS[kind].target !== "region") {
      await page
        .getByRole("combobox", { name: "Соседний берег", exact: true })
        .click();
      await page
        .getByRole("option", {
          name: kind === "bridge" ? /Тихая бухта/ : /Ветровая равнина/,
        })
        .click();
    }
    await page
      .getByRole("button", { name: "Добавить в план", exact: true })
      .click();
    await expect(page.locator(".game-map-plan")).toContainText("Предпросмотр");
    await expect(page.getByTestId("game-population")).toHaveText("80");
    await expect(
      page.locator(".island-scene-labels .islands-map-node").first(),
    ).toHaveAttribute("data-effects", new RegExp(`${kind}:planned`));
    const preview = await canvas.screenshot({
      path: info.outputPath(`${kind}-preview.png`),
    });
    expect(
      preview.equals(before),
      "The card must alter actual WebGL pixels, not just a UI label",
    ).toBe(false);
    await page
      .getByRole("button", { name: "Отменить план", exact: true })
      .click();
    await expect(page.locator(".game-map-plan")).toHaveCount(0);
    await expect
      .poll(async () => (await canvas.screenshot()).equals(before), {
        timeout: 8000,
      })
      .toBe(true);
  });
}

for (const [turn, kind] of [
  [5, "drought"],
  [11, "cold"],
  [17, "eruption"],
] as const) {
  test(`${kind}: a crisis visibly affects all islands and the scene survives a turn`, async ({
    page,
  }, info) => {
    let state = createGame(123);
    while (state.turn < turn) state = nextTurn(resolveTurn(state));
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await enter(page, state);
    const labels = page.locator(".island-scene-labels .islands-map-node");
    for (const label of await labels.all())
      await expect(label).toHaveAttribute(
        "data-effects",
        new RegExp(`${kind}:active`),
      );
    await page.screenshot({
      path: info.outputPath(`${kind}-world.png`),
      animations: "disabled",
    });
    if (kind === "eruption") await labels.nth(5).click();
    await page
      .getByRole("button", { name: "Рассмотреть выбранный остров" })
      .click();
    await page.screenshot({
      path: info.outputPath(`${kind}-close.png`),
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Вернуть ракурс" }).click();
    await page.getByRole("button", { name: "Следующие поколения" }).click();
    await expect(page.locator(".islands-report")).toBeVisible();
    await expect(
      page.locator(".islands-population-change").first(),
    ).toBeAttached();
    await page.getByRole("button", { name: "К следующему ходу" }).click();
    for (const label of await labels.all())
      await expect(label).toHaveAttribute(
        "data-effects",
        new RegExp(`${kind}:active`),
      );
    expect(errors).toEqual([]);
  });
}

test("population motion can be paused, and a planned shelter becomes an applied object", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Motion is checked with a desktop pointer.",
  );
  const state = addAction(createGame(146), { card: 3, region: 0 });
  await enter(page, state, "no-preference");
  await page.getByRole("button", { name: "Остановить анимацию" }).click();
  await page
    .getByRole("button", { name: "Рассмотреть выбранный остров" })
    .click();
  await page.getByRole("button", { name: "Включить анимацию" }).click();
  const canvas = page.locator(".island-scene canvas");
  const moving = await canvas.screenshot();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(moving))
    .toBe(false);
  await page.getByRole("button", { name: "Остановить анимацию" }).click();
  const stopped = await canvas.screenshot({
    path: info.outputPath("inhabitants-and-shelter.png"),
  });
  expect((await canvas.screenshot()).equals(stopped)).toBe(true);
  await page.getByRole("button", { name: "Следующие поколения" }).click();
  await expect(
    page.locator(".island-scene-labels .islands-map-node").first(),
  ).toHaveAttribute("data-effects", /refuge:active/);
  await expect(page.locator(".game-map-plan")).toHaveCount(0);
});
