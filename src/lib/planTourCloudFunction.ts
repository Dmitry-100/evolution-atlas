import { buildTourRoute } from "./buildTourRoute";
import {
  createPlanTourHandler,
  normalizePlanTourRequest,
  type PlanTourHandlerConfig,
  type PlanTourRequest,
  type PlanTourResult,
} from "./planTourHandler";

export type PlanTourCloudFunctionEvent = {
  httpMethod?: string;
  body?: string | null;
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
};

export type PlanTourCloudFunctionEnv = {
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

function getMethod(event: PlanTourCloudFunctionEvent) {
  return event.httpMethod ?? event.requestContext?.http?.method ?? "POST";
}

function jsonResponse(
  statusCode: number,
  payload: PlanTourResult,
): PlanTourCloudFunctionResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(payload),
  };
}

function emptyResponse(statusCode: number): PlanTourCloudFunctionResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: "",
  };
}

function parseRequestBody(body: string | null | undefined): PlanTourRequest {
  const parsed = JSON.parse(body || "{}") as Partial<PlanTourRequest>;
  return normalizePlanTourRequest(parsed);
}

export function createPlanTourCloudFunction(
  config: PlanTourCloudFunctionConfig,
) {
  return async function planTourFunction(
    event: PlanTourCloudFunctionEvent,
  ): Promise<PlanTourCloudFunctionResponse> {
    const method = getMethod(event).toUpperCase();

    if (method === "OPTIONS") return emptyResponse(204);

    if (method !== "POST") {
      return jsonResponse(405, {
        ok: false,
        error: { messageRu: "Метод не поддерживается." },
      });
    }

    let request: PlanTourRequest;
    try {
      request = parseRequestBody(event.body);
    } catch {
      return jsonResponse(400, {
        ok: false,
        error: { messageRu: "Не удалось прочитать маршрут Дарвина." },
      });
    }

    return jsonResponse(200, await config.planTour(request));
  };
}

export function createPlanTourCloudFunctionFromEnv(
  env: PlanTourCloudFunctionEnv,
  generate?: PlanTourHandlerConfig["generate"],
) {
  const { YANDEX_API_KEY, YANDEX_FOLDER_ID, YANDEX_MODEL_URI } = env;

  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return createPlanTourCloudFunction({
      planTour: async (request) => ({
        ok: true,
        data: buildTourRoute(request),
      }),
    });
  }

  return createPlanTourCloudFunction({
    planTour: createPlanTourHandler({
      apiKey: YANDEX_API_KEY,
      folderId: YANDEX_FOLDER_ID,
      modelUri: YANDEX_MODEL_URI,
      generate,
    }),
  });
}
