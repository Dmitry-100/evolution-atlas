import { describe, expect, it } from "vitest";
import { createYandexCloudFunction } from "./yandexCloudFunction";
import { PRODUCTION_PORTAL_ORIGIN } from "./publicApiSecurity";

describe("Yandex Cloud Function adapter", () => {
  it("adapts a POST event to the Darwin guide handler response", async () => {
    const handler = createYandexCloudFunction({
      askDarwin: async (request) => ({
        ok: true,
        data: {
          darwinAnswerRu: `Дарвин получил: ${request.message}`,
          modernNoteRu: "Современная заметка.",
          citations: [{ label: "Источник", url: "https://example.com" }],
          relatedLinks: [{ labelRu: "Атлас", href: "/" }],
          confidence: "solid",
          grounding: "site",
        },
      }),
    });

    const response = await handler({
      httpMethod: "POST",
      headers: { Origin: PRODUCTION_PORTAL_ORIGIN },
      body: JSON.stringify({
        message: "Почему приматы важны?",
        pagePath: "/",
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["Access-Control-Allow-Origin"]).toBe(
      PRODUCTION_PORTAL_ORIGIN,
    );
    expect(JSON.parse(response.body)).toMatchObject({
      ok: true,
      data: {
        darwinAnswerRu: "Дарвин получил: Почему приматы важны?",
        grounding: "site",
      },
    });
  });

  it("returns a safe 400 response for malformed JSON", async () => {
    const handler = createYandexCloudFunction({
      askDarwin: async () => {
        throw new Error("should not call handler");
      },
    });

    const response = await handler({
      httpMethod: "POST",
      body: "{bad",
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      ok: false,
      error: { messageRu: expect.stringMatching(/не удалось прочитать/i) },
    });
  });

  it("answers CORS preflight without calling the model", async () => {
    const handler = createYandexCloudFunction({
      askDarwin: async () => {
        throw new Error("should not call handler");
      },
    });

    const response = await handler({ httpMethod: "OPTIONS", body: "" });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
  });

  it("rejects oversized bodies before calling YandexGPT", async () => {
    let calls = 0;
    const handler = createYandexCloudFunction({
      askDarwin: async () => {
        calls += 1;
        throw new Error("should not call handler");
      },
    });

    const response = await handler({
      httpMethod: "POST",
      body: "x".repeat(32 * 1024 + 1),
    });

    expect(response.statusCode).toBe(413);
    expect(calls).toBe(0);
  });

  it("enforces question and history limits before calling YandexGPT", async () => {
    let calls = 0;
    const handler = createYandexCloudFunction({
      askDarwin: async () => {
        calls += 1;
        throw new Error("should not call handler");
      },
    });

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        message: "x".repeat(601),
        pagePath: "/",
        history: Array.from({ length: 7 }, () => ({
          role: "user",
          content: "вопрос",
        })),
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(calls).toBe(0);
  });

  it("rejects an unknown atlas mode before calling YandexGPT", async () => {
    let calls = 0;
    const handler = createYandexCloudFunction({
      askDarwin: async () => {
        calls += 1;
        throw new Error("should not call handler");
      },
    });

    const response = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        message: "Что здесь показано?",
        pagePath: "/",
        atlasMode: "unknown",
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(calls).toBe(0);
  });
});
