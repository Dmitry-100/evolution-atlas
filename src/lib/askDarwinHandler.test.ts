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
          darwinAnswerRu:
            "Я бы сказал: ищите не лестницу, а ветвящееся родство.",
          modernNoteRu:
            "Современная генетика уточняет картину общим происхождением и сравнением ДНК.",
          citations: [
            {
              label: "Smithsonian: Homo sapiens",
              url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
            },
          ],
          relatedLinks: [
            {
              labelRu: "Открыть этап: Homo sapiens",
              href: "/primates?stage=homo-sapiens",
            },
          ],
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
        modernNoteRu:
          "Современная генетика уточняет картину общим происхождением и сравнением ДНК.",
        citations: [
          {
            label: "Smithsonian: Homo sapiens",
            url: "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
          },
        ],
        relatedLinks: [
          {
            labelRu: "Открыть этап: Homo sapiens",
            href: "/primates?stage=homo-sapiens",
          },
        ],
        confidence: "solid",
        grounding: "site",
      },
    });
  });

  it("does not call YandexGPT when a fresh answer has no verified search sources", async () => {
    let generateCalls = 0;
    const handler = createDarwinGuideHandler({
      apiKey: "test-key",
      folderId: "folder",
      modelUri: "gpt://folder/yandexgpt-5.1",
      search: async () => {
        throw new Error("no verified sources");
      },
      generate: async () => {
        generateCalls += 1;
        throw new Error("must not generate");
      },
    });

    const response = await handler({
      message: "Расскажи свежую сенсацию про эволюцию",
      pagePath: "/",
    });

    if (response.ok) throw new Error("Expected an unsourced response to fail");
    expect(response.error.messageRu).toMatch(/свежая справка/i);
    expect(generateCalls).toBe(0);
  });

  it("uses only used external sources and caps one-source confidence at likely", async () => {
    const usedUrl = "https://example.org/research/verified";
    const handler = createDarwinGuideHandler({
      apiKey: "test-key",
      folderId: "folder",
      search: async () => ({
        answerRu: "В проверенной публикации описаны новые данные.",
        sources: [{ label: "Проверенная публикация", url: usedUrl }],
      }),
      generate: async (request) => {
        expect(request.messages[1]?.content).toContain(usedUrl);
        expect(request.messages[1]?.content).toMatch(/allow-list/i);
        return {
          darwinAnswerRu: "Я бы внимательно сверил это новое наблюдение.",
          modernNoteRu: "Современный вывод опирается на найденную публикацию.",
          citations: [
            { label: "Проверенная публикация", url: usedUrl },
            { label: "Выдуманная ссылка", url: "https://invented.invalid" },
          ],
          relatedLinks: [],
          confidence: "solid",
          grounding: "site",
        };
      },
    });

    const response = await handler({
      message: "Какие появились новые данные об эволюции в 2026 году?",
      pagePath: "/",
    });

    if (!response.ok) throw new Error(response.error.messageRu);
    expect(response.data.grounding).toBe("external");
    expect(response.data.confidence).toBe("likely");
    expect(response.data.citations).toEqual([
      { label: "Проверенная публикация", url: usedUrl },
    ]);
  });

  it("uses site context citations when YandexGPT returns a site-grounded answer without citations", async () => {
    const handler = createDarwinGuideHandler({
      apiKey: "test-key",
      folderId: "folder",
      modelUri: "gpt://folder/yandexgpt-5.1",
      generate: async () => ({
        darwinAnswerRu:
          "Современные обезьяны эволюционируют в своих ветвях, а не в сторону человека.",
        modernNoteRu:
          "У человека и шимпанзе был общий предок; обе линии изменялись после расхождения.",
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
    expect(
      response.data.citations.some((citation) =>
        citation.url.includes("humanorigins.si.edu"),
      ),
    ).toBe(true);
    expect(response.data.relatedLinks).toContainEqual({
      labelRu: "Открыть молекулярные доказательства",
      href: "/genetics",
    });
  });
});
