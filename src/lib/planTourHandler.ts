import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { buildTourRoute, type GuidedTourAnswers, type TourPlan, type TourPlanStep } from "./buildTourRoute";
import type { TourIntent } from "../data/guidedTour";
import type { ModelGenerateRequest } from "./askDarwinHandler";

export type PlanTourAllowedStop = {
  id: string;
  titleRu: string;
  hintRu?: string;
  hint?: string;
};

export type PlanTourRequest = GuidedTourAnswers & {
  allowedStops?: PlanTourAllowedStop[];
};

export type PlanTourResult =
  | { ok: true; data: TourPlan }
  | { ok: false; error: { messageRu: string } };

export type PlanTourHandlerConfig = {
  apiKey: string;
  folderId: string;
  modelUri?: string;
  baseURL?: string;
  generate?: (request: ModelGenerateRequest) => Promise<unknown>;
};

const DEFAULT_MODEL_NAME = "yandexgpt-5.1";
const DEFAULT_BASE_URL = "https://ai.api.cloud.yandex.net/v1";

export const PLAN_TOUR_SYSTEM_PROMPT = [
  "Ты Дарвин-экскурсовод русского сайта об эволюции.",
  "Выбери и упорядочь остановки ТОЛЬКО из переданного allow-list id.",
  "Не выдумывай id, ссылки, даты, статьи, имена и численные значения.",
  "Для каждой остановки напиши связный narrationRu на 3-5 живых фраз, lookAtRu с явной подсказкой куда смотреть на странице и revealRu как короткую заметку гида без префикса и без повторяющегося шаблона.",
  "socraticQuestionRu можно оставить коротким и ненавязчивым; интерфейс не строит тур вокруг вопросов.",
  "Не повторяй одинаковые зачины, вопросы и ответы от шага к шагу; маршрут должен читаться как цельная экскурсия.",
  "Скептический маршрут веди уважительно: объясняй научную теорию и доказательства, не высмеивай сомнения.",
  "Если маршрут базовый, сохрани 8 шагов; если полный, сохрани 15 шагов.",
  "Верни строгий JSON-объект с полями introRu, routeTitleRu, steps, outroRu.",
].join("\n");

function modelUriFromConfig(config: PlanTourHandlerConfig) {
  return (
    config.modelUri ??
    `gpt://${config.folderId}/${DEFAULT_MODEL_NAME}`
  );
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

function allowedIdsFromRequest(
  fallback: TourPlan,
  allowedStops: PlanTourAllowedStop[] = [],
) {
  const fallbackIds = new Set(fallback.steps.map((step) => step.id));
  const requested = allowedStops
    .map((stop) => stop.id)
    .filter((id) => fallbackIds.has(id));

  return new Set(requested.length > 0 ? requested : [...fallbackIds]);
}

function createUserPrompt(input: PlanTourRequest, fallback: TourPlan) {
  const allowList = fallback.steps.map((step) => ({
    id: step.id,
    titleRu: step.titleRu,
    hintRu: step.hintRu.slice(0, 420),
  }));

  return [
    `Намерение пользователя: ${input.intent}`,
    input.childAge ? `Возраст ребенка: ${input.childAge}` : undefined,
    input.budgetMin === 15
      ? "Длина маршрута: полный, 15 остановок"
      : "Длина маршрута: базовый, 8 остановок",
    input.freeText ? `Свободный интерес: ${input.freeText}` : undefined,
    "Allow-list остановок:",
    JSON.stringify(allowList),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function normalizeSteps(
  value: unknown,
  fallback: TourPlan,
  allowedIds: Set<string>,
) {
  const fallbackById = new Map(fallback.steps.map((step) => [step.id, step]));
  const seen = new Set<string>();
  const normalized = Array.isArray(value)
    ? value
        .map((item): TourPlanStep | undefined => {
          const record = asRecord(item);
          const id = stringFrom(record, ["id"]);
          const fallbackStep = fallbackById.get(id);
          if (!fallbackStep || !allowedIds.has(id) || seen.has(id)) return undefined;
          seen.add(id);

          return {
            ...fallbackStep,
            narrationRu:
              stringFrom(record, ["narrationRu", "narration"]) ||
              fallbackStep.narrationRu,
            socraticQuestionRu:
              stringFrom(record, ["socraticQuestionRu", "questionRu"]) ||
              fallbackStep.socraticQuestionRu,
            lookAtRu:
              stringFrom(record, ["lookAtRu", "focusRu", "whereToLookRu"]) ||
              fallbackStep.lookAtRu,
            revealRu:
              stringFrom(record, ["revealRu", "answerRu"]) ||
              fallbackStep.revealRu,
          };
        })
        .filter((step): step is TourPlanStep => Boolean(step))
    : [];

  for (const fallbackStep of fallback.steps) {
    if (normalized.length >= fallback.steps.length) break;
    if (seen.has(fallbackStep.id) || !allowedIds.has(fallbackStep.id)) continue;
    normalized.push(fallbackStep);
    seen.add(fallbackStep.id);
  }

  return normalized.length > 0 ? normalized : fallback.steps;
}

function normalizeResponse(
  response: unknown,
  fallback: TourPlan,
  allowedIds: Set<string>,
) {
  const record = asRecord(response);

  return {
    ...fallback,
    introRu: stringFrom(record, ["introRu", "intro"]) || fallback.introRu,
    routeTitleRu:
      stringFrom(record, ["routeTitleRu", "titleRu", "routeTitle"]) ||
      fallback.routeTitleRu,
    steps: normalizeSteps(record.steps, fallback, allowedIds),
    outroRu: stringFrom(record, ["outroRu", "outro"]) || fallback.outroRu,
  } satisfies TourPlan;
}

function isUsableIntent(intent: unknown): intent is TourIntent {
  return (
    intent === "overview" ||
    intent === "skeptical" ||
    intent === "ancestors" ||
    intent === "child" ||
    intent === "origin" ||
    intent === "dinosaurs" ||
    intent === "presenter" ||
    intent === "browse" ||
    intent === "custom"
  );
}

export function normalizePlanTourRequest(input: Partial<PlanTourRequest>) {
  const intent = isUsableIntent(input.intent) ? input.intent : "ancestors";
  const childAge =
    typeof input.childAge === "number" && input.childAge > 0
      ? Math.min(18, Math.max(3, Math.round(input.childAge)))
      : null;

  return {
    intent,
    budgetMin: input.budgetMin === 15 ? 15 : input.budgetMin === 5 ? 5 : null,
    childAge,
    freeText: typeof input.freeText === "string" ? input.freeText : undefined,
    allowedStops: Array.isArray(input.allowedStops) ? input.allowedStops : [],
  } satisfies PlanTourRequest;
}

async function callYandexChatCompletions(
  config: PlanTourHandlerConfig,
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

  return JSON.parse(content) as unknown;
}

export function createPlanTourHandler(config: PlanTourHandlerConfig) {
  const generate =
    config.generate ??
    ((request: ModelGenerateRequest) => callYandexChatCompletions(config, request));

  return async function planTour(input: PlanTourRequest): Promise<PlanTourResult> {
    const normalizedInput = normalizePlanTourRequest(input);
    const fallback = buildTourRoute(normalizedInput);
    if (normalizedInput.intent === "browse") return { ok: true, data: fallback };

    try {
      const allowedIds = allowedIdsFromRequest(fallback, normalizedInput.allowedStops);
      const response = await generate({
        model: modelUriFromConfig(config),
        temperature: 0.18,
        maxTokens: 4800,
        messages: [
          { role: "system", content: PLAN_TOUR_SYSTEM_PROMPT },
          { role: "user", content: createUserPrompt(normalizedInput, fallback) },
        ],
      });

      return {
        ok: true,
        data: normalizeResponse(response, fallback, allowedIds),
      };
    } catch (error) {
      console.error(
        "Plan tour request failed",
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { message: String(error) },
      );
      return { ok: true, data: fallback };
    }
  };
}
