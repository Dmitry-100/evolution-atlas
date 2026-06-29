import { describe, expect, it } from "vitest";
import { createPlanTourHandler } from "./planTourHandler";
import { buildTourRoute } from "./buildTourRoute";

describe("plan tour handler", () => {
  it("personalizes a deterministic allow-list without accepting unknown stops", async () => {
    const fallback = buildTourRoute({ intent: "ancestors", budgetMin: 5 });
    const handler = createPlanTourHandler({
      apiKey: "test-key",
      folderId: "folder",
      modelUri: "gpt://folder/yandexgpt-5.1",
      generate: async (request) => {
        expect(request.messages[0]?.content).toMatch(/ТОЛЬКО/i);
        expect(request.messages[0]?.content).not.toMatch(/интересный факт/i);
        expect(request.messages[0]?.content).toMatch(/без префикса/i);
        expect(request.messages[1]?.content).toMatch(fallback.steps[0].id);

        return {
          introRu: "Пойдем по родословной без лестницы прогресса.",
          routeTitleRu: "Личная родословная",
          steps: [
            {
              id: fallback.steps[1].id,
              narrationRu: "Эта остановка показывает следующий узел.",
              socraticQuestionRu: "Что здесь наследуется?",
              revealRu: "Наследуется работающая биологическая основа.",
            },
            {
              id: "stage-made-up",
              narrationRu: "Лишний шаг.",
              socraticQuestionRu: "Лишний вопрос?",
              revealRu: "Лишний ответ.",
            },
          ],
          outroRu: "Теперь видна ветвящаяся линия.",
        };
      },
    });

    const response = await handler({
      intent: "ancestors",
      budgetMin: 5,
      allowedStops: fallback.steps.map(({ id, titleRu, hintRu }) => ({
        id,
        titleRu,
        hintRu,
      })),
    });

    if (!response.ok) throw new Error(response.error.messageRu);
    expect(response.data.steps.some((step) => step.id === "stage-made-up")).toBe(
      false,
    );
    expect(response.data.steps.length).toBeGreaterThanOrEqual(3);
    expect(response.data.routeTitleRu).toBe("Личная родословная");
  });

  it("returns a deterministic plan when the model fails", async () => {
    const handler = createPlanTourHandler({
      apiKey: "test-key",
      folderId: "folder",
      generate: async () => {
        throw new Error("network down");
      },
    });

    const response = await handler({
      intent: "skeptical",
      budgetMin: 5,
      allowedStops: [],
    });

    if (!response.ok) throw new Error(response.error.messageRu);
    expect(response.data.routeTitleRu).toMatch(/сомнения/i);
    expect(response.data.steps[0].id).toBe("page-theory");
  });
});
