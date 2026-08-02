import { buildTourRoute } from "./buildTourRoute";
import {
  createPlanTourHandler,
  normalizePlanTourRequest,
  type PlanTourHandlerConfig,
  type PlanTourRequest,
  type PlanTourResult,
} from "./planTourHandler";
import {
  PublicApiValidationError,
  allowedOriginsFromEnv,
  assertBodySize,
  corsHeaders,
  logPublicApiEvent,
} from "./publicApiSecurity";

export type PlanTourCloudFunctionEvent = {
  httpMethod?: string;
  body?: string | null;
  headers?: Record<string, string | undefined>;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
};

export type PlanTourCloudFunctionResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export type PlanTourCloudFunctionConfig = {
  planTour: (request: PlanTourRequest) => Promise<PlanTourResult>;
  allowedOrigins?: string[];
};

export type PlanTourCloudFunctionEnv = {
  YANDEX_API_KEY?: string;
  YANDEX_FOLDER_ID?: string;
  YANDEX_MODEL_URI?: string;
  ALLOWED_ORIGINS?: string;
};

const PLAN_TOUR_MAX_BODY_BYTES = 16 * 1024;

function getMethod(event: PlanTourCloudFunctionEvent) {
  return event.httpMethod ?? event.requestContext?.http?.method ?? "POST";
}

function jsonResponse(
  statusCode: number,
  payload: PlanTourResult,
  headers: Record<string, string>,
): PlanTourCloudFunctionResponse {
  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  };
}

function emptyResponse(
  statusCode: number,
  headers: Record<string, string>,
): PlanTourCloudFunctionResponse {
  return {
    statusCode,
    headers,
    body: "",
  };
}

function parseRequestBody(body: string | null | undefined): PlanTourRequest {
  assertBodySize(body, PLAN_TOUR_MAX_BODY_BYTES);
  const decoded = JSON.parse(body || "{}");
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
    throw new PublicApiValidationError(400, "Маршрут имеет неверный формат.");
  }

  const parsed = decoded as Partial<PlanTourRequest>;
  const normalized = normalizePlanTourRequest(parsed);

  if (parsed.intent !== undefined && parsed.intent !== normalized.intent) {
    throw new PublicApiValidationError(400, "Неизвестная тема маршрута.");
  }

  if (
    parsed.budgetMin !== undefined &&
    parsed.budgetMin !== null &&
    parsed.budgetMin !== 5 &&
    parsed.budgetMin !== 15
  ) {
    throw new PublicApiValidationError(
      400,
      "Длительность маршрута должна быть 5 или 15 минут.",
    );
  }

  if (parsed.freeText !== undefined && typeof parsed.freeText !== "string") {
    throw new PublicApiValidationError(400, "Интерес должен быть текстом.");
  }

  if (typeof parsed.freeText === "string" && parsed.freeText.length > 300) {
    throw new PublicApiValidationError(
      400,
      "Опишите интерес короче: не более 300 символов.",
    );
  }

  if (
    parsed.childAge !== undefined &&
    parsed.childAge !== null &&
    (typeof parsed.childAge !== "number" ||
      !Number.isInteger(parsed.childAge) ||
      parsed.childAge < 5 ||
      parsed.childAge > 17)
  ) {
    throw new PublicApiValidationError(
      400,
      "Возраст должен быть от 5 до 17 лет.",
    );
  }

  if (
    parsed.allowedStops !== undefined &&
    !Array.isArray(parsed.allowedStops)
  ) {
    throw new PublicApiValidationError(
      400,
      "Список остановок имеет неверный формат.",
    );
  }

  if (Array.isArray(parsed.allowedStops)) {
    if (parsed.allowedStops.length > 15) {
      throw new PublicApiValidationError(
        400,
        "Маршрут не может содержать больше 15 остановок.",
      );
    }

    for (const stop of parsed.allowedStops) {
      if (
        !stop ||
        typeof stop.id !== "string" ||
        stop.id.trim().length === 0 ||
        stop.id.length > 80 ||
        typeof stop.titleRu !== "string" ||
        stop.titleRu.trim().length === 0 ||
        stop.titleRu.length > 180 ||
        (stop.hintRu !== undefined &&
          (typeof stop.hintRu !== "string" || stop.hintRu.length > 500))
      ) {
        throw new PublicApiValidationError(
          400,
          "Одна из остановок маршрута имеет неверный формат.",
        );
      }
    }
  }

  return normalized;
}

export function createPlanTourCloudFunction(
  config: PlanTourCloudFunctionConfig,
) {
  const allowedOrigins =
    config.allowedOrigins ?? allowedOriginsFromEnv(undefined);

  return async function planTourFunction(
    event: PlanTourCloudFunctionEvent,
  ): Promise<PlanTourCloudFunctionResponse> {
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

    let request: PlanTourRequest;
    try {
      request = parseRequestBody(event.body);
    } catch (error) {
      const statusCode =
        error instanceof PublicApiValidationError ? error.statusCode : 400;
      logPublicApiEvent({
        endpoint: "plan-tour",
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
                : "Не удалось прочитать маршрут Дарвина.",
          },
        },
        responseHeaders,
      );
    }

    const result = await config.planTour(request);
    logPublicApiEvent({
      endpoint: "plan-tour",
      result: result.ok ? "ok" : "fallback",
      source: result.ok ? result.data.personalizationSource : "error",
      grounding: "site",
      intent: request.intent,
      inputLength: request.freeText?.length ?? 0,
      latencyMs: Date.now() - startedAt,
      errorCode: result.ok ? null : "planner_unavailable",
    });
    return jsonResponse(200, result, responseHeaders);
  };
}

export function createPlanTourCloudFunctionFromEnv(
  env: PlanTourCloudFunctionEnv,
  generate?: PlanTourHandlerConfig["generate"],
) {
  const {
    YANDEX_API_KEY,
    YANDEX_FOLDER_ID,
    YANDEX_MODEL_URI,
    ALLOWED_ORIGINS,
  } = env;
  const allowedOrigins = allowedOriginsFromEnv(ALLOWED_ORIGINS);

  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return createPlanTourCloudFunction({
      allowedOrigins,
      planTour: async (request) => ({
        ok: true,
        data: buildTourRoute(request),
      }),
    });
  }

  return createPlanTourCloudFunction({
    allowedOrigins,
    planTour: createPlanTourHandler({
      apiKey: YANDEX_API_KEY,
      folderId: YANDEX_FOLDER_ID,
      modelUri: YANDEX_MODEL_URI,
      generate,
    }),
  });
}
