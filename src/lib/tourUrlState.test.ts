import { describe, expect, it } from "vitest";
import {
  createStoredTourPlanSnapshot,
  parseTourUrlState,
  restoreStoredTourPlan,
  stripTourUrlState,
  toTourSearchParams,
  hrefWithTourState,
} from "./tourUrlState";
import { buildTourRoute } from "./buildTourRoute";

describe("tour URL state and storage", () => {
  it("parses and serializes tour plan id with zero-based step index", () => {
    expect(parseTourUrlState("tour=abc&step=2&intent=ancestors&budget=15")).toEqual({
      planId: "abc",
      stepIndex: 2,
      intent: "ancestors",
      budgetMin: 15,
    });
    expect(toTourSearchParams({ planId: "abc", stepIndex: 3, intent: "ancestors", budgetMin: 15 }).toString()).toBe(
      "tour=abc&step=3&intent=ancestors&budget=15",
    );
  });

  it("falls back to the first step for invalid step values", () => {
    expect(parseTourUrlState("tour=abc&step=-4")).toEqual({
      planId: "abc",
      stepIndex: 0,
      intent: null,
      budgetMin: null,
    });
    expect(parseTourUrlState("step=2")).toBeNull();
  });

  it("adds tour state before existing page parameters", () => {
    expect(
      hrefWithTourState("/?mode=all&stage=cell-lines", {
        planId: "tour-abc",
        stepIndex: 0,
        intent: "ancestors",
        budgetMin: 15,
      }),
    ).toBe("/?tour=tour-abc&step=0&intent=ancestors&budget=15&mode=all&stage=cell-lines");
  });

  it("strips invalid or completed tour parameters without losing page state", () => {
    expect(
      stripTourUrlState("/", "?tour=&step=&intent=&budget=&stage=cell-lines"),
    ).toBe("/?stage=cell-lines");
  });

  it("restores a stored plan only when ids match", () => {
    const plan = buildTourRoute({ intent: "ancestors", budgetMin: 5 });
    const snapshot = createStoredTourPlanSnapshot(plan);

    expect(restoreStoredTourPlan(snapshot, plan.planId)?.routeTitleRu).toBe(
      plan.routeTitleRu,
    );
    expect(restoreStoredTourPlan(snapshot, "other-plan")).toBeNull();
    expect(restoreStoredTourPlan("not-json", plan.planId)).toBeNull();
  });
});
