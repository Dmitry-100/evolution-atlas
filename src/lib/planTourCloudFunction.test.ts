import { describe, expect, it } from "vitest";
import {
  createPlanTourCloudFunction,
  createPlanTourCloudFunctionFromEnv,
} from "./planTourCloudFunction";

describe("plan tour cloud function", () => {
  it("adapts a POST event to the plan tour handler response", async () => {
    const handler = createPlanTourCloudFunction({
      planTour: async (request) => ({
        ok: true,
        data: {
          planId: "tour-1",
          intent: request.intent,
          routeTitleRu: "Маршрут",
          pitchRu: "Короткое описание маршрута.",
          factsRu: ["Факт один.", "Факт два.", "Факт три."],
          introRu: "Начинаем.",
          steps: [],
          browseLinks: [],
          nextSteps: [],
          outroRu: "Готово.",
        },
      }),
    });

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({ intent: "browse", allowedStops: [] }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      ok: true,
      data: { intent: "browse" },
    });
  });

  it("falls back without Yandex credentials instead of failing", async () => {
    const handler = createPlanTourCloudFunctionFromEnv({});

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({ intent: "skeptical", allowedStops: [] }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      ok: true,
      data: { routeTitleRu: expect.stringMatching(/сомнения/i) },
    });
  });
});
