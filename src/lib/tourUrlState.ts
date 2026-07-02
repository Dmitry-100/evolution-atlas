import type { TourPlan } from "./buildTourRoute";
import type { TourIntent } from "../data/guidedTour";

export type TourUrlState = {
  planId: string;
  stepIndex: number;
  intent: TourIntent | null;
  budgetMin: 5 | 15 | null;
};

type StoredTourPlanSnapshot = {
  version: 1;
  plan: TourPlan;
};

function normalizeSearchParams(search: URLSearchParams | string) {
  return typeof search === "string" ? new URLSearchParams(search) : search;
}

export function parseTourUrlState(
  search: URLSearchParams | string,
): TourUrlState | null {
  const params = normalizeSearchParams(search);
  const planId = params.get("tour")?.trim();
  if (!planId) return null;

  const rawStep = Number.parseInt(params.get("step") ?? "0", 10);
  const rawBudget = Number.parseInt(params.get("budget") ?? "", 10);
  const intent = usableTourIntent(params.get("intent"));

  return {
    planId,
    stepIndex: Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 0,
    intent,
    budgetMin: rawBudget === 15 ? 15 : rawBudget === 5 ? 5 : null,
  };
}

export function toTourSearchParams(state: TourUrlState) {
  const params = new URLSearchParams();
  params.set("tour", state.planId);
  params.set("step", String(Math.max(0, state.stepIndex)));
  if (state.intent) params.set("intent", state.intent);
  if (state.budgetMin) params.set("budget", String(state.budgetMin));
  return params;
}

export function hrefWithTourState(href: string, state: TourUrlState) {
  const url = new URL(href, "https://evolution-atlas.local");
  const params = new URLSearchParams();
  params.set("tour", state.planId);
  params.set("step", String(Math.max(0, state.stepIndex)));
  if (state.intent) params.set("intent", state.intent);
  if (state.budgetMin) params.set("budget", String(state.budgetMin));
  url.searchParams.forEach((value, key) => {
    if (key !== "tour" && key !== "step" && key !== "intent" && key !== "budget") {
      params.set(key, value);
    }
  });
  url.search = params.toString();
  return `${url.pathname}${url.search}`;
}

export function stripTourUrlState(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  params.delete("tour");
  params.delete("step");
  params.delete("intent");
  params.delete("budget");
  const nextSearch = params.toString();
  return `${pathname}${nextSearch ? `?${nextSearch}` : ""}`;
}

function usableTourIntent(value: string | null | undefined): TourIntent | null {
  const intent = value?.trim();
  if (
    intent === "overview" ||
    intent === "skeptical" ||
    intent === "ancestors" ||
    intent === "child" ||
    intent === "origin" ||
    intent === "dinosaurs" ||
    intent === "presenter" ||
    intent === "browse" ||
    intent === "custom"
  ) {
    return intent;
  }

  return null;
}

export function inferTourIntentFromPlanId(planId: string): TourIntent | null {
  const [, intent] = planId.split("-");
  return usableTourIntent(intent);
}

export function createStoredTourPlanSnapshot(plan: TourPlan) {
  return JSON.stringify({ version: 1, plan } satisfies StoredTourPlanSnapshot);
}

function isStoredTourPlanSnapshot(value: unknown): value is StoredTourPlanSnapshot {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const plan = record.plan as Record<string, unknown> | undefined;

  return (
    record.version === 1 &&
    Boolean(plan) &&
    typeof plan?.planId === "string" &&
    Array.isArray(plan?.steps)
  );
}

export function restoreStoredTourPlan(
  snapshot: string | null | undefined,
  planId: string,
) {
  if (!snapshot) return null;

  try {
    const parsed = JSON.parse(snapshot) as unknown;
    if (!isStoredTourPlanSnapshot(parsed)) return null;

    return parsed.plan.planId === planId ? parsed.plan : null;
  } catch {
    return null;
  }
}
