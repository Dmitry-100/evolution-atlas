import { describe, expect, it } from "vitest";
import {
  buildDarwinGuideContext,
  shouldUseExternalSearch,
} from "./aiGuideContext";

describe("AI guide context", () => {
  it("builds a sourced site context for the selected atlas stage", () => {
    const context = buildDarwinGuideContext({
      message: "Почему Homo sapiens появился в Африке?",
      pagePath: "/primates?stage=homo-sapiens",
      stageId: "sapiens",
      atlasMode: "primates",
    });

    expect(context.currentPage.titleRu).toBe("Приматы → человек");
    expect(context.currentStage?.titleRu).toBe("Homo sapiens");
    expect(context.contextRu).toMatch(/Homo sapiens/);
    expect(context.contextRu).toMatch(/Африк/i);
    expect(context.contextRu).toMatch(/Дарвин/i);
    expect(context.citations.length).toBeGreaterThanOrEqual(4);
    expect(context.citations.some((citation) => citation.url.includes("humanorigins.si.edu"))).toBe(true);
    expect(context.relatedLinks).toContainEqual({
      labelRu: "Открыть этап: Homo sapiens",
      href: "/primates?stage=homo-sapiens",
    });
  });

  it("keeps uncertain or external questions eligible for web search", () => {
    expect(
      shouldUseExternalSearch(
        "Что нового известно про LUCA в 2024 году?",
        buildDarwinGuideContext({
          message: "Что нового известно про LUCA в 2024 году?",
          pagePath: "/origin-of-life",
        }),
      ),
    ).toBe(true);

    expect(
      shouldUseExternalSearch(
        "Почему Tiktaalik важен для выхода на сушу?",
        buildDarwinGuideContext({
          message: "Почему Tiktaalik важен для выхода на сушу?",
          pagePath: "/",
          stageId: "tiktaalik",
        }),
      ),
    ).toBe(false);
  });

  it("adds the body map to page context and direct related links", () => {
    const context = buildDarwinGuideContext({
      message: "Какие признаки тела пришли от древних предков?",
      pagePath: "/body-map",
    });

    expect(context.currentPage.titleRu).toBe("Карта признаков");
    expect(context.contextRu).toMatch(/Карта признаков/);
    expect(context.contextRu).toMatch(/признак|тело|предков/i);
    expect(context.relatedLinks).toContainEqual({
      labelRu: "Открыть карту признаков",
      href: "/body-map",
    });
  });
});
