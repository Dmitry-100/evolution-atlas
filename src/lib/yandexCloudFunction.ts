import {
  createDarwinGuideHandler,
  type DarwinGuideRequest,
  type DarwinGuideResult,
  type DarwinGuideHandlerConfig,
} from "./askDarwinHandler";

export type YandexCloudFunctionEvent = {
  httpMethod?: string;
  body?: string | null;
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
};

export type YandexCloudFunctionEnv = {
  YANDEX_API_KEY?: string;
  YANDEX_FOLDER_ID?: string;
  YANDEX_MODEL_URI?: string;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

function getMethod(event: YandexCloudFunctionEvent) {
  return event.httpMethod ?? event.requestContext?.http?.method ?? "POST";
}

function jsonResponse(
  statusCode: number,
  payload: DarwinGuideResult,
): YandexCloudFunctionResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(payload),
  };
}

function emptyResponse(statusCode: number): YandexCloudFunctionResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: "",
  };
}

function parseRequestBody(body: string | null | undefined): DarwinGuideRequest {
  const parsed = JSON.parse(body || "{}") as Partial<DarwinGuideRequest>;
  if (typeof parsed.message !== "string" || typeof parsed.pagePath !== "string") {
    throw new Error("Invalid Darwin guide request body");
  }

  return {
    message: parsed.message,
    pagePath: parsed.pagePath,
    stageId: typeof parsed.stageId === "string" ? parsed.stageId : undefined,
    atlasMode:
      parsed.atlasMode === "all" || parsed.atlasMode === "primates"
        ? parsed.atlasMode
        : undefined,
    history: Array.isArray(parsed.history) ? parsed.history : [],
  };
}

export function createYandexCloudFunction(config: YandexCloudFunctionConfig) {
  return async function askDarwinFunction(
    event: YandexCloudFunctionEvent,
  ): Promise<YandexCloudFunctionResponse> {
    const method = getMethod(event).toUpperCase();

    if (method === "OPTIONS") return emptyResponse(204);

    if (method !== "POST") {
      return jsonResponse(405, {
        ok: false,
        error: { messageRu: "Метод не поддерживается." },
      });
    }

    let request: DarwinGuideRequest;
    try {
      request = parseRequestBody(event.body);
    } catch {
      return jsonResponse(400, {
        ok: false,
        error: { messageRu: "Не удалось прочитать вопрос для Дарвина." },
      });
    }

    return jsonResponse(200, await config.askDarwin(request));
  };
}

export function createYandexCloudFunctionFromEnv(
  env: YandexCloudFunctionEnv,
  generate?: DarwinGuideHandlerConfig["generate"],
) {
  const { YANDEX_API_KEY, YANDEX_FOLDER_ID, YANDEX_MODEL_URI } = env;

  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return createYandexCloudFunction({
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
    askDarwin: createDarwinGuideHandler({
      apiKey: YANDEX_API_KEY,
      folderId: YANDEX_FOLDER_ID,
      modelUri: YANDEX_MODEL_URI,
      generate,
    }),
  });
}
