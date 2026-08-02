import {
  buildDarwinGuideContext,
  shouldUseExternalSearch,
  type DarwinGuideCitation,
  type DarwinGuideContext,
  type DarwinGuideContextInput,
  type DarwinGuideRelatedLink,
} from "./aiGuideContext";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { logPublicApiEvent } from "./publicApiSecurity";

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

export type DarwinExternalSearchSource = {
  label: string;
  url: string;
};

export type DarwinExternalSearchEvidence = {
  answerRu: string;
  sources: DarwinExternalSearchSource[];
};

export type DarwinGuideHandlerConfig = {
  apiKey: string;
  folderId: string;
  modelUri?: string;
  baseURL?: string;
  searchBaseURL?: string;
  generate?: (request: ModelGenerateRequest) => Promise<unknown>;
  search?: (query: string) => Promise<DarwinExternalSearchEvidence>;
};

const DEFAULT_MODEL_NAME = "yandexgpt-5.1";
const DEFAULT_BASE_URL = "https://ai.api.cloud.yandex.net/v1";
const DEFAULT_SEARCH_BASE_URL =
  "https://searchapi.api.cloud.yandex.net/v2/gen/search";

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
  "Используй только ссылки из явно переданного allow-list источников.",
  "Ответь строго JSON-объектом с полями darwinAnswerRu, modernNoteRu, citations, relatedLinks, confidence, grounding.",
  "confidence: solid, likely или debated. grounding: site или external.",
  "citations должны содержать реальные label и url из контекста или из проверенного внешнего поиска.",
].join("\n");

function modelUriFromConfig(config: DarwinGuideHandlerConfig) {
  return config.modelUri ?? `gpt://${config.folderId}/${DEFAULT_MODEL_NAME}`;
}

function sanitizeHistory(history: DarwinGuideMessage[] = []) {
  return history
    .filter((message) => message.content.trim().length > 0)
    .slice(-6)
    .map((message) => `${message.role}: ${message.content.trim()}`)
    .join("\n");
}

function createUserPrompt(
  input: DarwinGuideRequest,
  context: DarwinGuideContext,
  externalEvidence?: DarwinExternalSearchEvidence,
) {
  const history = sanitizeHistory(input.history);

  return [
    `Вопрос пользователя: ${input.message}`,
    history ? `Короткая история диалога:\n${history}` : undefined,
    externalEvidence
      ? "Grounding ответа: external. Используй только приведенную ниже внешнюю справку и ее allow-list ссылок."
      : "Grounding ответа: site. Используй только источники контекста сайта.",
    externalEvidence
      ? `Проверенная внешняя справка:\n${externalEvidence.answerRu}`
      : undefined,
    externalEvidence
      ? `Allow-list внешних источников:\n${externalEvidence.sources
          .map(
            (source, index) => `${index + 1}. ${source.label}: ${source.url}`,
          )
          .join("\n")}`
      : undefined,
    "Контекст сайта:",
    context.contextRu,
    "Связанные переходы сайта:",
    context.relatedLinks
      .map((link) => `${link.labelRu}: ${link.href}`)
      .join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
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

function normalizeCitations(
  value: unknown,
  allowedCitations: DarwinGuideCitation[],
) {
  const allowedByUrl = new Map(
    allowedCitations.map((citation) => [citation.url, citation]),
  );
  const citations = Array.isArray(value)
    ? value
        .map((item): DarwinGuideCitation | undefined => {
          const record = asRecord(item);
          const label = stringFrom(record, ["label", "title", "labelRu"]);
          const url = stringFrom(record, ["url", "href"]);

          const allowed = allowedByUrl.get(url);
          return label && allowed ? { label: allowed.label, url } : undefined;
        })
        .filter((item): item is DarwinGuideCitation => Boolean(item))
    : [];

  return citations.length > 0 ? citations : allowedCitations.slice(0, 5);
}

function normalizeRelatedLinks(value: unknown, context: DarwinGuideContext) {
  const links = Array.isArray(value)
    ? value
        .map((item): DarwinGuideRelatedLink | undefined => {
          if (typeof item === "string") {
            const contextLink = context.relatedLinks.find(
              (link) => link.href === item,
            );
            return (
              contextLink ??
              (item.startsWith("/") ? { labelRu: item, href: item } : undefined)
            );
          }

          const record = asRecord(item);
          const labelRu = stringFrom(record, ["labelRu", "label", "title"]);
          const href = stringFrom(record, ["href", "url"]);

          return labelRu && href.startsWith("/")
            ? { labelRu, href }
            : undefined;
        })
        .filter((item): item is DarwinGuideRelatedLink => Boolean(item))
    : [];

  return links.length > 0 ? links : context.relatedLinks.slice(0, 3);
}

function distinctSourceCount(citations: DarwinGuideCitation[]) {
  const hosts = new Set<string>();
  for (const citation of citations) {
    try {
      hosts.add(new URL(citation.url).hostname);
    } catch {
      // Invalid URLs never enter the allow-list, but stay defensive here.
    }
  }
  return hosts.size;
}

function normalizeGroundedResponse(
  response: unknown,
  context: DarwinGuideContext,
  externalEvidence?: DarwinExternalSearchEvidence,
) {
  const record = asRecord(response);
  const grounding: DarwinGuideGrounding = externalEvidence
    ? "external"
    : "site";
  const allowedCitations = externalEvidence?.sources ?? context.citations;
  const citations = normalizeCitations(record.citations, allowedCitations);
  const requestedConfidence = confidenceFrom(record.confidence);
  const confidence =
    grounding === "external" &&
    requestedConfidence === "solid" &&
    distinctSourceCount(citations) < 2
      ? "likely"
      : requestedConfidence;

  return {
    darwinAnswerRu: stringFrom(record, [
      "darwinAnswerRu",
      "darwin_answer_ru",
      "darwinAnswer",
      "answerRu",
    ]),
    modernNoteRu: stringFrom(record, [
      "modernNoteRu",
      "modern_note_ru",
      "modernNote",
      "editorNoteRu",
    ]),
    citations,
    relatedLinks: normalizeRelatedLinks(record.relatedLinks, context),
    confidence,
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

function extractSearchRecord(value: unknown) {
  if (Array.isArray(value)) return asRecord(value.at(-1));
  return asRecord(value);
}

async function callYandexGenerativeSearch(
  config: DarwinGuideHandlerConfig,
  query: string,
): Promise<DarwinExternalSearchEvidence> {
  const response = await fetch(
    config.searchBaseURL ?? DEFAULT_SEARCH_BASE_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ content: query.slice(0, 400), role: "ROLE_USER" }],
        folderId: config.folderId,
        fixMisspell: true,
        enableNrfmDocs: false,
        getPartialResults: false,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Yandex Search API returned ${response.status}`);
  }

  const record = extractSearchRecord((await response.json()) as unknown);
  const message = asRecord(record.message);
  const answerRu = stringFrom(message, ["content"]);
  const sources = Array.isArray(record.sources)
    ? record.sources
        .map((value): DarwinExternalSearchSource | undefined => {
          const source = asRecord(value);
          if (source.used !== true) return undefined;
          const url = stringFrom(source, ["url"]);
          const label = stringFrom(source, ["title", "label"]);
          return /^https?:\/\//.test(url) && label ? { label, url } : undefined;
        })
        .filter((source): source is DarwinExternalSearchSource =>
          Boolean(source),
        )
        .slice(0, 5)
    : [];

  if (!answerRu || sources.length === 0) {
    throw new Error("Yandex Search API returned no grounded sources");
  }

  return { answerRu, sources };
}

export function createDarwinGuideHandler(config: DarwinGuideHandlerConfig) {
  const generate =
    config.generate ??
    ((request: ModelGenerateRequest) =>
      callYandexChatCompletions(config, request));
  const search =
    config.search ??
    ((query: string) => callYandexGenerativeSearch(config, query));

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
      const useExternalSearch = shouldUseExternalSearch(input.message, context);
      let externalEvidence: DarwinExternalSearchEvidence | undefined;

      if (useExternalSearch) {
        try {
          externalEvidence = await search(input.message);
        } catch (error) {
          logPublicApiEvent({
            endpoint: "ask-darwin",
            result: "provider_error",
            errorCode: "external_search_failed",
            errorName: error instanceof Error ? error.name : "UnknownError",
          });
          return {
            ok: false,
            error: {
              messageRu:
                "Свежая справка сейчас недоступна или не подтверждена источниками. Попробуйте позже.",
            },
          };
        }
      }

      const response = await generate({
        model: modelUriFromConfig(config),
        temperature: 0.15,
        maxTokens: 1200,
        messages: [
          { role: "system", content: DARWIN_GUIDE_SYSTEM_PROMPT },
          {
            role: "user",
            content: createUserPrompt(input, context, externalEvidence),
          },
        ],
      });
      const normalized = normalizeGroundedResponse(
        response,
        context,
        externalEvidence,
      );

      if (!isUsableResponse(normalized)) return FALLBACK_RESPONSE;

      return { ok: true, data: normalized };
    } catch (error) {
      logPublicApiEvent({
        endpoint: "ask-darwin",
        result: "provider_error",
        errorCode: "generation_failed",
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
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
