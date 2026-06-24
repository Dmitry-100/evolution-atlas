import {
  buildDarwinGuideContext,
  shouldUseExternalSearch,
  type DarwinGuideCitation,
  type DarwinGuideContext,
  type DarwinGuideContextInput,
  type DarwinGuideRelatedLink,
} from "./aiGuideContext";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type DarwinGuideConfidence = "solid" | "likely" | "debated";
export type DarwinGuideGrounding = "site" | "external";

export type DarwinGuideMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DarwinGuideRequest = DarwinGuideContextInput & {
  history?: DarwinGuideMessage[];
};

export type DarwinGuideResponseData = {
  darwinAnswerRu: string;
  modernNoteRu: string;
  citations: DarwinGuideCitation[];
  relatedLinks: DarwinGuideRelatedLink[];
  confidence: DarwinGuideConfidence;
  grounding: DarwinGuideGrounding;
};

export type DarwinGuideResult =
  | { ok: true; data: DarwinGuideResponseData }
  | { ok: false; error: { messageRu: string } };

export type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ModelGenerateRequest = {
  model: string;
  temperature: number;
  maxTokens: number;
  messages: ModelMessage[];
};

export type DarwinGuideHandlerConfig = {
  apiKey: string;
  folderId: string;
  modelUri?: string;
  baseURL?: string;
  generate?: (request: ModelGenerateRequest) => Promise<unknown>;
};

const DEFAULT_MODEL_NAME = "yandexgpt-5.1";
const DEFAULT_BASE_URL = "https://ai.api.cloud.yandex.net/v1";

const FALLBACK_RESPONSE: DarwinGuideResult = {
  ok: false,
  error: {
    messageRu:
      "Ответ не показан: не хватает источников для аккуратного научного ответа.",
  },
};

export const DARWIN_GUIDE_SYSTEM_PROMPT = [
  "Ты AI-гид русского сайта об эволюции.",
  "Персона: сначала коротко отвечает Дарвин - живо, образно, без мистики и без устаревших утверждений.",
  "Затем современный научный редактор уточняет то, чего исторический Дарвин не мог знать: ДНК, LUCA, хромосомы, филогенетику.",
  "Если нет источника или контекста, не утверждай факт; скажи, что данных недостаточно.",
  "Не выдумывай ссылки, даты, статьи, имена и численные значения.",
  "Ответь строго JSON-объектом с полями darwinAnswerRu, modernNoteRu, citations, relatedLinks, confidence, grounding.",
  "confidence: solid, likely или debated. grounding: site или external.",
  "citations должны содержать реальные label и url из контекста или из проверенного внешнего поиска.",
].join("\n");

function modelUriFromConfig(config: DarwinGuideHandlerConfig) {
  return (
    config.modelUri ??
    `gpt://${config.folderId}/${DEFAULT_MODEL_NAME}`
  );
}

function sanitizeHistory(history: DarwinGuideMessage[] = []) {
  return history
    .filter((message) => message.content.trim().length > 0)
    .slice(-6)
    .map((message) => `${message.role}: ${message.content.trim()}`)
    .join("\n");
}

function createUserPrompt(input: DarwinGuideRequest, context: DarwinGuideContext) {
  const useExternalSearch = shouldUseExternalSearch(input.message, context);
  const history = sanitizeHistory(input.history);

  return [
    `Вопрос пользователя: ${input.message}`,
    history ? `Короткая история диалога:\n${history}` : undefined,
    `Разрешение на внешний поиск: ${useExternalSearch ? "да, если контекста сайта недостаточно" : "нет, сначала отвечай по материалам сайта"}.`,
    "Контекст сайта:",
    context.contextRu,
    "Связанные переходы сайта:",
    context.relatedLinks.map((link) => `${link.labelRu}: ${link.href}`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function stringFrom(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function confidenceFrom(value: unknown): DarwinGuideConfidence {
  return value === "solid" || value === "likely" || value === "debated"
    ? value
    : "likely";
}

function groundingFrom(value: unknown): DarwinGuideGrounding {
  return value === "external" ? "external" : "site";
}

function normalizeCitations(value: unknown, context: DarwinGuideContext, grounding: DarwinGuideGrounding) {
  const citations = Array.isArray(value)
    ? value
        .map((item): DarwinGuideCitation | undefined => {
          const record = asRecord(item);
          const label = stringFrom(record, ["label", "title", "labelRu"]);
          const url = stringFrom(record, ["url", "href"]);

          return label && /^https?:\/\//.test(url) ? { label, url } : undefined;
        })
        .filter((item): item is DarwinGuideCitation => Boolean(item))
    : [];

  if (citations.length > 0 || grounding !== "site") return citations;

  return context.citations.slice(0, 5);
}

function normalizeRelatedLinks(value: unknown, context: DarwinGuideContext) {
  const links = Array.isArray(value)
    ? value
        .map((item): DarwinGuideRelatedLink | undefined => {
          if (typeof item === "string") {
            const contextLink = context.relatedLinks.find((link) => link.href === item);
            return contextLink ?? (item.startsWith("/") ? { labelRu: item, href: item } : undefined);
          }

          const record = asRecord(item);
          const labelRu = stringFrom(record, ["labelRu", "label", "title"]);
          const href = stringFrom(record, ["href", "url"]);

          return labelRu && href.startsWith("/") ? { labelRu, href } : undefined;
        })
        .filter((item): item is DarwinGuideRelatedLink => Boolean(item))
    : [];

  return links.length > 0 ? links : context.relatedLinks.slice(0, 3);
}

function normalizeResponse(response: unknown, context: DarwinGuideContext) {
  const record = asRecord(response);
  const grounding = groundingFrom(record.grounding);
  const citations = normalizeCitations(record.citations, context, grounding);

  return {
    darwinAnswerRu: stringFrom(record, ["darwinAnswerRu", "darwin_answer_ru", "darwinAnswer", "answerRu"]),
    modernNoteRu: stringFrom(record, ["modernNoteRu", "modern_note_ru", "modernNote", "editorNoteRu"]),
    citations,
    relatedLinks: normalizeRelatedLinks(record.relatedLinks, context),
    confidence: confidenceFrom(record.confidence),
    grounding,
  } satisfies DarwinGuideResponseData;
}

function isUsableResponse(response: DarwinGuideResponseData) {
  return (
    response.darwinAnswerRu.trim().length > 0 &&
    response.modernNoteRu.trim().length > 0 &&
    response.citations.length > 0 &&
    ["solid", "likely", "debated"].includes(response.confidence) &&
    ["site", "external"].includes(response.grounding)
  );
}

function parseModelContent(content: string): unknown {
  return JSON.parse(content);
}

async function callYandexChatCompletions(
  config: DarwinGuideHandlerConfig,
  request: ModelGenerateRequest,
) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: config.apiKey,
    project: config.folderId,
    baseURL: config.baseURL ?? DEFAULT_BASE_URL,
  });

  const completion = await client.chat.completions.create({
    model: request.model,
    messages: request.messages as ChatCompletionMessageParam[],
    temperature: request.temperature,
    max_tokens: request.maxTokens,
    response_format: { type: "json_object" },
  });
  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("Yandex AI response had no content");

  return parseModelContent(content);
}

export function createDarwinGuideHandler(config: DarwinGuideHandlerConfig) {
  const generate =
    config.generate ??
    ((request: ModelGenerateRequest) => callYandexChatCompletions(config, request));

  return async function askDarwin(
    input: DarwinGuideRequest,
  ): Promise<DarwinGuideResult> {
    if (!input.message || input.message.trim().length < 3) {
      return {
        ok: false,
        error: { messageRu: "Напишите вопрос чуть подробнее." },
      };
    }

    try {
      const context = buildDarwinGuideContext(input);
      const response = await generate({
        model: modelUriFromConfig(config),
        temperature: 0.15,
        maxTokens: 1200,
        messages: [
          { role: "system", content: DARWIN_GUIDE_SYSTEM_PROMPT },
          { role: "user", content: createUserPrompt(input, context) },
        ],
      });
      const normalized = normalizeResponse(response, context);

      if (!isUsableResponse(normalized)) return FALLBACK_RESPONSE;

      return { ok: true, data: normalized };
    } catch (error) {
      console.error(
        "Darwin guide request failed",
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { message: String(error) },
      );
      return {
        ok: false,
        error: {
          messageRu:
            "Дарвин сейчас не отвечает. Попробуйте еще раз или откройте источники сайта.",
        },
      };
    }
  };
}
