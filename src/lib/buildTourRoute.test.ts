import { describe, expect, it } from "vitest";
import { buildTourRoute } from "./buildTourRoute";

describe("buildTourRoute", () => {
  const guidedIntents = [
    "overview",
    "skeptical",
    "ancestors",
    "child",
    "origin",
    "dinosaurs",
    "presenter",
    "custom",
  ] as const;

  it("starts the skeptical route with scientific theory and evidence", () => {
    const plan = buildTourRoute({ intent: "skeptical", budgetMin: 5 });

    expect(plan.routeTitleRu).toMatch(/сомнения/i);
    expect(plan.introRu).toMatch(/не буду просить.*верить/i);
    expect(plan.steps[0]).toMatchObject({
      id: "page-theory",
      href: "/theory",
    });
    expect(plan.steps.map((step) => step.id)).toContain("page-genetics");
  });

  it("builds an overview route across the portal without creating narrow evidence-only routes", () => {
    const plan = buildTourRoute({ intent: "overview", budgetMin: 5 });
    const stepIds = plan.steps.map((step) => step.id);

    expect(plan.routeTitleRu).toMatch(/портал/i);
    expect(stepIds).toEqual([
      "stage-cell-lines",
      "page-theory",
      "page-origin-of-life",
      "page-genetics",
      "page-cladogram",
      "page-body-map",
      "page-primates",
      "page-quiz",
    ]);
  });

  it("builds dinosaurs and presenter routes from explicit tour intents", () => {
    const dinosaursPlan = buildTourRoute({ intent: "dinosaurs", budgetMin: 5 });
    const presenterPlan = buildTourRoute({ intent: "presenter", budgetMin: 5 });

    expect(dinosaursPlan.routeTitleRu).toMatch(/динозавр/i);
    expect(dinosaursPlan.steps.map((step) => step.id)).toContain("page-dinosaurs");
    expect(dinosaursPlan.steps.map((step) => step.id)).toContain("page-extinctions");
    expect(dinosaursPlan.steps.map((step) => step.id)).not.toContain("page-origin-of-life");

    expect(presenterPlan.routeTitleRu).toMatch(/рассказ|урок/i);
    expect(presenterPlan.steps.map((step) => step.id)).toEqual([
      "page-about",
      "page-theory",
      "stage-cell-lines",
      "page-genetics",
      "page-body-map",
      "page-materials",
      "page-primates",
      "page-quiz",
    ]);
  });

  it("builds a deep ancestry route from early life to Homo sapiens", () => {
    const plan = buildTourRoute({ intent: "ancestors", budgetMin: 15 });

    expect(plan.routeTitleRu).toMatch(/родословная/i);
    expect(plan.steps[0].id).toBe("stage-cell-lines");
    expect(plan.steps.at(-1)?.id).toBe("stage-sapiens");
    expect(plan.steps.map((step) => step.id)).toContain("page-body-map");
    expect(plan.steps.map((step) => step.id)).toContain("page-primates");
    expect(plan.steps.length).toBeGreaterThanOrEqual(7);
  });

  it("uses child age in a longer story-like child route", () => {
    const plan = buildTourRoute({
      intent: "child",
      childAge: 8,
      budgetMin: 5,
    });

    expect(plan.routeTitleRu).toBe("Эволюция для ребенка 8 лет");
    expect(plan.introRu).toMatch(/как экскурсовод/i);
    expect(plan.steps.length).toBeGreaterThan(5);
    expect(plan.steps[0].narrationRu).toMatch(/Представьте/i);
    expect(plan.steps.map((step) => step.id)).toContain("page-body-map");
    expect(plan.steps.map((step) => step.id)).toContain("page-primates");
    expect(plan.steps[0].narrationRu.length).toBeGreaterThan(130);
  });

  it("threads the dedicated primates section and trait map into broad tours", () => {
    const routesWithTraitMap = [
      "overview",
      "skeptical",
      "ancestors",
      "child",
      "dinosaurs",
      "presenter",
    ] as const;
    const routesWithPrimates = [
      "overview",
      "skeptical",
      "ancestors",
      "child",
      "dinosaurs",
      "presenter",
    ] as const;

    for (const intent of routesWithTraitMap) {
      expect(
        buildTourRoute({ intent, budgetMin: 15, childAge: 8 }).steps.map(
          (step) => step.id,
        ),
      ).toContain("page-body-map");
    }

    for (const intent of routesWithPrimates) {
      expect(
        buildTourRoute({ intent, budgetMin: 15, childAge: 8 }).steps.map(
          (step) => step.id,
        ),
      ).toContain("page-primates");
    }
  });

  it("builds 8-step base routes and 15-step full routes for every guided intent", () => {
    for (const intent of guidedIntents) {
      const answers = {
        intent,
        childAge: intent === "child" ? 8 : undefined,
        freeText: intent === "custom" ? "Мне интересно, как человек связан с ДНК и древними предками" : undefined,
      };

      expect(buildTourRoute({ ...answers, budgetMin: 5 }).steps).toHaveLength(8);
      expect(buildTourRoute({ ...answers, budgetMin: 15 }).steps).toHaveLength(15);
    }
  });

  it("keeps the origin route focused on abiogenesis and early life instead of the human lineage", () => {
    const plan = buildTourRoute({ intent: "origin", budgetMin: 15 });
    const stepIds = plan.steps.map((step) => step.id);
    const routeCopy = [
      plan.pitchRu,
      plan.introRu,
      ...plan.steps.map((step) => step.narrationRu),
    ].join("\n");

    expect(stepIds).toContain("page-origin-of-life");
    expect(stepIds).toContain("stage-cell-lines");
    expect(stepIds).toContain("stage-prokaryotes");
    expect(stepIds).toContain("stage-eukaryotes");
    expect(stepIds).toContain("page-genetics");
    expect(stepIds).not.toContain("page-extinctions");
    expect(stepIds).not.toContain("stage-mammals");
    expect(stepIds).not.toContain("stage-early-primates");
    expect(stepIds).not.toContain("stage-sapiens");
    expect(stepIds.at(-1)).not.toBe("stage-sapiens");
    expect(routeCopy).toMatch(/абиогенез|РНК|мембран|хими|протоклет/i);
  });

  it("threads extinctions and genetics into broad routes without defining them as separate intents", () => {
    const routesWithExtinctions = [
      "overview",
      "skeptical",
      "ancestors",
      "child",
      "dinosaurs",
      "presenter",
    ] as const;
    const routesWithGenetics = [
      "overview",
      "skeptical",
      "ancestors",
      "dinosaurs",
      "presenter",
    ] as const;

    for (const intent of routesWithExtinctions) {
      expect(
        buildTourRoute({ intent, budgetMin: 15, childAge: 8 }).steps.map(
          (step) => step.id,
        ),
      ).toContain("page-extinctions");
    }

    for (const intent of routesWithGenetics) {
      expect(
        buildTourRoute({ intent, budgetMin: 15 }).steps.map((step) => step.id),
      ).toContain("page-genetics");
    }

    const intentIds = guidedIntents.map((intent) =>
      buildTourRoute({
        intent,
        budgetMin: 5,
        childAge: intent === "child" ? 8 : undefined,
        freeText: intent === "custom" ? "Хочу понять предков" : undefined,
      }).intent,
    );
    expect(intentIds).not.toContain("extinctions");
    expect(intentIds).not.toContain("dna");
  });

  it("adds deterministic next steps to every guided non-browse route", () => {
    for (const intent of guidedIntents) {
      const plan = buildTourRoute({
        intent,
        budgetMin: 5,
        childAge: intent === "child" ? 8 : undefined,
        freeText: intent === "custom" ? "Хочу понять ДНК и предков" : undefined,
      });

      expect(plan.nextSteps).toHaveLength(3);
      expect(
        plan.nextSteps.every((nextStep) => nextStep.href.length > 0),
      ).toBe(true);
      expect(plan.nextSteps.map((nextStep) => nextStep.labelRu).join("\n")).toMatch(
        /Путь от клетки|Photon|Достающее|Происхождение|Квиз|Источники|лекции/i,
      );
    }
  });

  it("describes every guided route before the visitor chooses the length", () => {
    for (const intent of guidedIntents) {
      const plan = buildTourRoute({
        intent,
        budgetMin: 5,
        childAge: intent === "child" ? 8 : undefined,
        freeText: intent === "custom" ? "Хочу понять ДНК и предков" : undefined,
      });

      expect(plan.pitchRu.length).toBeGreaterThan(80);
      expect(plan.pitchRu).not.toMatch(/двер|Факт:/i);
      expect(plan.factsRu).toHaveLength(3);
      expect(plan.factsRu.every((fact) => !fact.startsWith("Факт:"))).toBe(
        true,
      );
      expect(
        plan.factsRu.every((fact) => fact.length > 45),
        `${intent} should have substantial facts`,
      ).toBe(
        true,
      );
    }
  });

  it("keeps guide notes self-contained without repeated reveal boilerplate", () => {
    const plan = buildTourRoute({ intent: "ancestors", budgetMin: 5 });

    for (const step of plan.steps) {
      expect(step.revealRu).not.toMatch(/Интересный факт:|два масштаба/i);
      expect(step.revealRu.length).toBeGreaterThan(55);
    }
  });

  it("keeps deterministic tour copy away from obvious AI-ish templates", () => {
    for (const intent of guidedIntents) {
      const plan = buildTourRoute({
        intent,
        budgetMin: 15,
        childAge: intent === "child" ? 8 : undefined,
        freeText: intent === "custom" ? "Хочу понять ДНК и предков" : undefined,
      });
      const copy = [
        plan.introRu,
        plan.pitchRu,
        ...plan.factsRu,
        ...plan.steps.flatMap((step) => [
          step.narrationRu,
          step.lookAtRu,
          step.revealRu,
        ]),
        plan.outroRu,
      ].join("\n");
      const notButTicks = copy.match(/\bне\s+[^.!?\n]{1,80},?\s+а\b/gi) ?? [];

      expect(copy).not.toMatch(
        /Интересный факт для прогулки|два масштаба|главные двери|несколько двер|доста[её]м лупу|театральную шляпу|На маршруте эта точка нужна/i,
      );
      expect(notButTicks.length, `${intent} uses too many "не…, а…" turns`).toBeLessThanOrEqual(
        3,
      );
    }
  });

  it("tells the visitor where to look and avoids repeated stop-card wording", () => {
    for (const intent of guidedIntents) {
      const plan = buildTourRoute({
        intent,
        budgetMin: 5,
        childAge: intent === "child" ? 8 : undefined,
        freeText: intent === "custom" ? "почему обезьяны не превращаются в людей" : undefined,
      });

      for (const step of plan.steps) {
        expect(step.lookAtRu).toMatch(/смотр|обратите|главн|видно/i);
        expect(step.narrationRu).not.toMatch(/^Остановка \d/i);
      }
    }
  });

  it("keeps deterministic adult routes varied instead of repeating a quiz template", () => {
    for (const intent of ["skeptical", "ancestors", "origin"] as const) {
      const plan = buildTourRoute({ intent, budgetMin: 15 });
      const narrations = plan.steps.map((step) => step.narrationRu);
      const notes = plan.steps.map((step) => step.revealRu);

      expect(new Set(narrations).size).toBe(narrations.length);
      expect(new Set(notes).size).toBe(notes.length);
      expect(narrations.join("\n")).not.toMatch(/Остановка \d/i);
    }
  });

  it("returns browse links instead of a forced tour for free exploration", () => {
    const plan = buildTourRoute({ intent: "browse" });

    expect(plan.steps).toEqual([]);
    expect(plan.browseLinks?.map((link) => link.href)).toEqual([
      "/",
      "/primates",
      "/cladogram",
      "/quiz",
    ]);
  });

  it("maps custom text to a known topic without inventing stops", () => {
    const plan = buildTourRoute({
      intent: "custom",
      freeText: "Мне интересно, откуда взялись ДНК и РНК",
      budgetMin: 5,
    });

    expect(plan.routeTitleRu).toMatch(/свой вопрос/i);
    expect(plan.steps.map((step) => step.id)).toContain("page-genetics");
    expect(plan.steps.every((step) => step.id.startsWith("page-") || step.id.startsWith("stage-"))).toBe(true);
  });

  it("routes body and trait questions to the body map", () => {
    const plan = buildTourRoute({
      intent: "custom",
      freeText: "Какие признаки тела человека достались от древних предков?",
      budgetMin: 5,
    });

    expect(plan.steps.map((step) => step.id)).toContain("page-body-map");
    expect(plan.steps.map((step) => step.href)).toContain("/body-map");
  });

  it("routes primate and human-lineage questions through the dedicated primates section", () => {
    const plan = buildTourRoute({
      intent: "custom",
      freeText: "Хочу понять приматов, обезьян и путь к человеку",
      budgetMin: 5,
    });

    expect(plan.steps.map((step) => step.id)).toContain("page-primates");
    expect(plan.steps.map((step) => step.href)).toContain("/primates");
  });
});
