import { describe, expect, it } from "vitest";
import { createDarwinGuideHandler } from "./askDarwinHandler";

describe("Darwin guide handler", () => {
  it("calls YandexGPT with strict grounding instructions and returns normalized JSON", async () => {
    const handler = createDarwinGuideHandler({
      apiKey: "test-key",
      folderId: "folder",
      modelUri: "gpt://folder/yandexgpt-5.1",
      generate: async (request) => {
        expect(request.model).toBe("gpt://folder/yandexgpt-5.1");
        expect(request.temperature).toBe(0.15);
        expect(request.messages[0]?.content).toMatch(/если нет источника/i);
        expect(request.messages[1]?.content).toMatch(/Homo sapiens/);
        expect(request.messages[1]?.content).toMatch(/Источники контекста/i);

        return {
          darwinAnswerRu: "Я бы сказал: ищите не лестницу, а ветвящееся родство.",
          modernNoteRu: "Современная генетика уточняет картину общим происхождением и сравнением ДНК.",
          citations: [
            {
              label: "Smithsonian: Homo sapiens",
              url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
            },
          ],
          relatedLinks: [{ labelRu: "Открыть этап: Homo sapiens", href: "/primates?stage=homo-sapiens" }],
          confidence: "solid",
          grounding: "site",
        };
      },
    });

    const response = await handler({
      message: "От кого произошел Homo sapiens?",
      pagePath: "/primates?stage=homo-sapiens",
      stageId: "sapiens",
      atlasMode: "primates",
      history: [],
    });

    expect(response).toEqual({
      ok: true,
      data: {
        darwinAnswerRu: "Я бы сказал: ищите не лестницу, а ветвящееся родство.",
        modernNoteRu: "Современная генетика уточняет картину общим происхождением и сравнением ДНК.",
        citations: [
          {
            label: "Smithsonian: Homo sapiens",
            url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
          },
        ],
        relatedLinks: [{ labelRu: "Открыть этап: Homo sapiens", href: "/primates?stage=homo-sapiens" }],
        confidence: "solid",
        grounding: "site",
      },
    });
  });

  it("returns a safe fallback instead of unsourced model output", async () => {
    const handler = createDarwinGuideHandler({
      apiKey: "test-key",
      folderId: "folder",
      modelUri: "gpt://folder/yandexgpt-5.1",
      generate: async () => ({
        darwinAnswerRu: "Кажется, это так.",
        modernNoteRu: "Без источников.",
        citations: [],
        relatedLinks: [],
        confidence: "likely",
        grounding: "external",
      }),
    });

    const response = await handler({
      message: "Расскажи свежую сенсацию про эволюцию",
      pagePath: "/",
    });

    if (response.ok) throw new Error("Expected an unsourced response to fail");
    expect(response.error.messageRu).toMatch(/не хватает источников/i);
  });

  it("uses site context citations when YandexGPT returns a site-grounded answer without citations", async () => {
    const handler = createDarwinGuideHandler({
      apiKey: "test-key",
      folderId: "folder",
      modelUri: "gpt://folder/yandexgpt-5.1",
      generate: async () => ({
        darwinAnswerRu: "Современные обезьяны эволюционируют в своих ветвях, а не в сторону человека.",
        modernNoteRu: "У человека и шимпанзе был общий предок; обе линии изменялись после расхождения.",
        citations: [],
        relatedLinks: ["/genetics", "/cladogram"],
        confidence: "solid",
        grounding: "site",
      }),
    });

    const response = await handler({
      message: "Почему современные обезьяны не эволюционируют в человека?",
      pagePath: "/primates?stage=homo-sapiens",
      stageId: "sapiens",
      atlasMode: "primates",
    });

    if (!response.ok) throw new Error(response.error.messageRu);
    expect(response.data.citations.length).toBeGreaterThan(0);
    expect(response.data.citations.some((citation) => citation.url.includes("humanorigins.si.edu"))).toBe(true);
    expect(response.data.relatedLinks).toContainEqual({
      labelRu: "Открыть молекулярные доказательства",
      href: "/genetics",
    });
  });
});
