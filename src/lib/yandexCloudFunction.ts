import {
  createDarwinGuideHandler,
  type DarwinGuideRequest,
  type DarwinGuideResult,
  type DarwinGuideHandlerConfig,
} from "./askDarwinHandler";
import {
  PublicApiValidationError,
  allowedOriginsFromEnv,
  assertBodySize,
  corsHeaders,
  logPublicApiEvent,
} from "./publicApiSecurity";

export type YandexCloudFunctionEvent = {
  httpMethod?: string;
  body?: string | null;
  headers?: Record<string, string | undefined>;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
};

export type YandexCloudFunctionResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export type YandexCloudFunctionConfig = {
  askDarwin: (request: DarwinGuideRequest) => Promise<DarwinGuideResult>;
  allowedOrigins?: string[];
};

export type YandexCloudFunctionEnv = {
  YANDEX_API_KEY?: string;
  YANDEX_FOLDER_ID?: string;
  YANDEX_MODEL_URI?: string;
  ALLOWED_ORIGINS?: string;
};

const ASK_DARWIN_MAX_BODY_BYTES = 32 * 1024;
const ASK_DARWIN_MAX_MESSAGE_LENGTH = 600;
const ASK_DARWIN_MAX_HISTORY_MESSAGES = 6;
const ASK_DARWIN_MAX_HISTORY_LENGTH = 6_000;

function getMethod(event: YandexCloudFunctionEvent) {
  return event.httpMethod ?? event.requestContext?.http?.method ?? "POST";
}

function jsonResponse(
  statusCode: number,
  payload: DarwinGuideResult,
  headers: Record<string, string>,
): YandexCloudFunctionResponse {
  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  };
}

function emptyResponse(
  statusCode: number,
  headers: Record<string, string>,
): YandexCloudFunctionResponse {
  return {
    statusCode,
    headers,
    body: "",
  };
}

function parseRequestBody(body: string | null | undefined): DarwinGuideRequest {
  assertBodySize(body, ASK_DARWIN_MAX_BODY_BYTES);
  const parsed = JSON.parse(body || "{}") as Partial<DarwinGuideRequest>;
  if (
    typeof parsed.message !== "string" ||
    typeof parsed.pagePath !== "string"
  ) {
    throw new PublicApiValidationError(
      400,
      "Не удалось прочитать вопрос для Дарвина.",
    );
  }

  const message = parsed.message.trim();
  if (message.length < 3 || message.length > ASK_DARWIN_MAX_MESSAGE_LENGTH) {
    throw new PublicApiValidationError(
      400,
      "Вопрос должен содержать от 3 до 600 символов.",
    );
  }

  if (!parsed.pagePath.startsWith("/") || parsed.pagePath.length > 256) {
    throw new PublicApiValidationError(400, "Некорректный путь страницы.");
  }

  if (
    parsed.stageId !== undefined &&
    (typeof parsed.stageId !== "string" || parsed.stageId.length > 100)
  ) {
    throw new PublicApiValidationError(400, "Некорректный этап атласа.");
  }

  if (
    parsed.atlasMode !== undefined &&
    parsed.atlasMode !== "all" &&
    parsed.atlasMode !== "primates"
  ) {
    throw new PublicApiValidationError(400, "Некорректный режим атласа.");
  }

  const rawHistory = parsed.history ?? [];
  if (
    !Array.isArray(rawHistory) ||
    rawHistory.length > ASK_DARWIN_MAX_HISTORY_MESSAGES
  ) {
    throw new PublicApiValidationError(
      400,
      "История диалога не должна превышать 6 сообщений.",
    );
  }

  let historyLength = 0;
  const history = rawHistory.map((entry) => {
    if (
      !entry ||
      (entry.role !== "user" && entry.role !== "assistant") ||
      typeof entry.content !== "string" ||
      entry.content.trim().length === 0
    ) {
      throw new PublicApiValidationError(
        400,
        "История диалога имеет неверный формат.",
      );
    }

    const content = entry.content.trim();
    historyLength += content.length;
    return { role: entry.role, content };
  });

  if (historyLength > ASK_DARWIN_MAX_HISTORY_LENGTH) {
    throw new PublicApiValidationError(
      400,
      "История диалога не должна превышать 6000 символов.",
    );
  }

  return {
    message,
    pagePath: parsed.pagePath,
    stageId: typeof parsed.stageId === "string" ? parsed.stageId : undefined,
    atlasMode:
      parsed.atlasMode === "all" || parsed.atlasMode === "primates"
        ? parsed.atlasMode
        : undefined,
    history,
  };
}

export function createYandexCloudFunction(config: YandexCloudFunctionConfig) {
  const allowedOrigins =
    config.allowedOrigins ?? allowedOriginsFromEnv(undefined);

  return async function askDarwinFunction(
    event: YandexCloudFunctionEvent,
  ): Promise<YandexCloudFunctionResponse> {
    const startedAt = Date.now();
    const method = getMethod(event).toUpperCase();
    const responseHeaders = corsHeaders(event.headers, allowedOrigins);

    if (method === "OPTIONS") return emptyResponse(204, responseHeaders);

    if (method !== "POST") {
      return jsonResponse(
        405,
        {
          ok: false,
          error: { messageRu: "Метод не поддерживается." },
        },
        responseHeaders,
      );
    }

    let request: DarwinGuideRequest;
    try {
      request = parseRequestBody(event.body);
    } catch (error) {
      const statusCode =
        error instanceof PublicApiValidationError ? error.statusCode : 400;
      logPublicApiEvent({
        endpoint: "ask-darwin",
        result: "rejected",
        statusCode,
        inputLength: event.body?.length ?? 0,
        latencyMs: Date.now() - startedAt,
        errorCode: statusCode === 413 ? "payload_too_large" : "invalid_request",
      });
      return jsonResponse(
        statusCode,
        {
          ok: false,
          error: {
            messageRu:
              error instanceof PublicApiValidationError
                ? error.message
                : "Не удалось прочитать вопрос для Дарвина.",
          },
        },
        responseHeaders,
      );
    }

    const result = await config.askDarwin(request);
    logPublicApiEvent({
      endpoint: "ask-darwin",
      result: result.ok ? "ok" : "fallback",
      grounding: result.ok ? result.data.grounding : "none",
      inputLength: request.message.length,
      historyMessages: request.history?.length ?? 0,
      latencyMs: Date.now() - startedAt,
      errorCode: result.ok ? null : "model_unavailable_or_ungrounded",
    });
    return jsonResponse(200, result, responseHeaders);
  };
}

export function createYandexCloudFunctionFromEnv(
  env: YandexCloudFunctionEnv,
  generate?: DarwinGuideHandlerConfig["generate"],
  search?: DarwinGuideHandlerConfig["search"],
) {
  const {
    YANDEX_API_KEY,
    YANDEX_FOLDER_ID,
    YANDEX_MODEL_URI,
    ALLOWED_ORIGINS,
  } = env;
  const allowedOrigins = allowedOriginsFromEnv(ALLOWED_ORIGINS);

  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return createYandexCloudFunction({
      allowedOrigins,
      askDarwin: async () => ({
        ok: false,
        error: {
          messageRu:
            "AI-гид не настроен: отсутствуют YANDEX_API_KEY или YANDEX_FOLDER_ID.",
        },
      }),
    });
  }

  return createYandexCloudFunction({
    allowedOrigins,
    askDarwin: createDarwinGuideHandler({
      apiKey: YANDEX_API_KEY,
      folderId: YANDEX_FOLDER_ID,
      modelUri: YANDEX_MODEL_URI,
      generate,
      search,
    }),
  });
}
