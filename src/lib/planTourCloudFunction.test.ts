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
          personalizationSource: "ai",
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

  it("rejects oversized bodies and long free text before planning", async () => {
    let calls = 0;
    const handler = createPlanTourCloudFunction({
      planTour: async () => {
        calls += 1;
        throw new Error("should not plan");
      },
    });

    const oversized = await handler({
      httpMethod: "POST",
      body: "x".repeat(16 * 1024 + 1),
    });
    const longText = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        intent: "custom",
        freeText: "x".repeat(301),
        allowedStops: [],
      }),
    });

    expect(oversized.statusCode).toBe(413);
    expect(longText.statusCode).toBe(400);
    expect(calls).toBe(0);
  });

  it("rejects malformed typed fields before planning", async () => {
    let calls = 0;
    const handler = createPlanTourCloudFunction({
      planTour: async () => {
        calls += 1;
        throw new Error("should not plan");
      },
    });

    const invalidRequests = [
      { intent: "unknown", allowedStops: [] },
      { intent: "custom", budgetMin: 10, allowedStops: [] },
      { intent: "custom", childAge: 8.5, allowedStops: [] },
      { intent: "custom", freeText: 42, allowedStops: [] },
      { intent: "custom", allowedStops: "not-an-array" },
      {
        intent: "custom",
        allowedStops: [{ id: "", titleRu: "Остановка" }],
      },
    ];

    for (const request of invalidRequests) {
      const response = await handler({
        httpMethod: "POST",
        body: JSON.stringify(request),
      });
      expect(response.statusCode).toBe(400);
    }

    expect(calls).toBe(0);
  });
});
