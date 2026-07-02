import { describe, expect, it } from "vitest";
import { ERAS, STAGES, getStageById, primateStages } from "./lineage";

describe("lineage data", () => {
  it("contains a single typed stage set with source-backed image metadata", () => {
    expect(STAGES.length).toBeGreaterThanOrEqual(35);
    expect(ERAS.length).toBeGreaterThanOrEqual(6);

    const ids = new Set<string>();
    for (const stage of STAGES) {
      expect(ids.has(stage.id), `duplicate id ${stage.id}`).toBe(false);
      ids.add(stage.id);
      expect(stage.ageMa).toBeGreaterThanOrEqual(0);
      expect(stage.summaryRu.length).toBeGreaterThan(30);
      expect(stage.whyMattersRu.length).toBeGreaterThan(30);
      expect(stage.image.altRu.length).toBeGreaterThan(10);
      expect(stage.image.credit.length).toBeGreaterThan(2);
      expect(stage.image.src).toMatch(/^\/assets\/images\/source-backed\//);
      expect(stage.image.sourceUrl).toMatch(/^https?:\/\//);
      expect(stage.image.license).not.toMatch(/локальный проектный ассет/i);
      expect(stage.sources.length).toBeGreaterThan(0);
      expect(stage.sources.map((source) => source.label).join(" ")).not.toMatch(
        /Visual Capitalist/i,
      );
    }
  });

  it("marks deep-time molecular-clock nodes with confidence levels", () => {
    for (const id of [
      "cell-lines",
      "eukaryotes",
      "choanoflagellates",
      "early-animals",
      "bilaterians",
    ]) {
      expect(getStageById(id)?.confidence).toMatch(/likely|debated/);
    }
  });

  it("uses early Cambrian chordate dating instead of the legacy 600 Ma label", () => {
    const chordates = getStageById("chordates");
    expect(chordates?.ageMa).toBeGreaterThanOrEqual(505);
    expect(chordates?.ageMa).toBeLessThanOrEqual(520);
  });

  it("places the Cambrian explosion as a sourced event before early chordates", () => {
    const stageIds = STAGES.map((stage) => stage.id);
    const cambrianExplosion = getStageById("cambrian-explosion");

    expect(cambrianExplosion).toEqual(
      expect.objectContaining({
        titleRu: "Кембрийский взрыв",
        latin: "Cambrian explosion",
        ageMa: 538.8,
        eraId: "animals",
        lineageRole: "representative",
      }),
    );
    expect(cambrianExplosion?.summaryRu).toMatch(/разнообраз/i);
    expect(cambrianExplosion?.whyMattersRu).toMatch(/не мгнов/i);
    expect(cambrianExplosion?.sources.map((source) => source.label)).toContain(
      "Understanding Evolution: The Cambrian explosion",
    );
    expect(stageIds.indexOf("bilaterians")).toBeLessThan(
      stageIds.indexOf("cambrian-explosion"),
    );
    expect(stageIds.indexOf("cambrian-explosion")).toBeLessThan(
      stageIds.indexOf("chordates"),
    );
  });

  it("uses dedicated generated art for the Cambrian explosion stage", () => {
    const cambrianExplosion = getStageById("cambrian-explosion");
    const imageSrc = cambrianExplosion?.image.src ?? "";

    expect(imageSrc).toBe(
      "/assets/images/source-backed/generated-atlas/cambrian-explosion.png",
    );
    expect(cambrianExplosion?.image.credit).not.toMatch(/временный/i);
    expect(cambrianExplosion?.image.promptId).toBe(
      "cambrian-explosion-paleoart-2026-06-30",
    );
  });

  it("marks primate-focused stages for the zoomed mode", () => {
    expect(primateStages.length).toBeGreaterThanOrEqual(10);
    expect(primateStages[0]?.id).toBe("early-primates");
    expect(primateStages.some((stage) => stage.id === "sapiens")).toBe(true);
  });
});
