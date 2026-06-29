import { describe, expect, it } from "vitest";
import { getStageById } from "./lineage";
import { BODY_TRAIT_LAYERS, BODY_TRAITS } from "./bodyTraits";

describe("body trait map data", () => {
  it("defines five museum layers with local image assets", () => {
    expect(BODY_TRAIT_LAYERS.map((layer) => layer.id)).toEqual([
      "cells-energy",
      "body-plan",
      "movement",
      "senses",
      "brain-social",
    ]);

    for (const layer of BODY_TRAIT_LAYERS) {
      expect(layer.titleRu.length).toBeGreaterThan(4);
      expect(layer.descriptionRu.length).toBeGreaterThan(30);
      expect(layer.image.src).toMatch(/^\/assets\/images\/traits\/.+\.png$/);
      expect(layer.image.altRu.length).toBeGreaterThan(20);
    }
  });

  it("maps each displayed trait to an existing inherited lineage trait", () => {
    const ids = new Set<string>();

    for (const trait of BODY_TRAITS) {
      expect(ids.has(trait.id), `duplicate trait id ${trait.id}`).toBe(false);
      ids.add(trait.id);

      expect(BODY_TRAIT_LAYERS.some((layer) => layer.id === trait.layerId)).toBe(
        true,
      );
      expect(trait.anchor.x).toBeGreaterThanOrEqual(0);
      expect(trait.anchor.x).toBeLessThanOrEqual(100);
      expect(trait.anchor.y).toBeGreaterThanOrEqual(0);
      expect(trait.anchor.y).toBeLessThanOrEqual(100);
      expect(trait.noteRu.length).toBeGreaterThan(35);

      const stage = getStageById(trait.stageId);
      expect(stage, `${trait.id} stage exists`).toBeTruthy();
      expect(stage?.inherited).toContain(trait.traitRu);
    }
  });

  it("keeps every layer substantial enough for an interactive map", () => {
    for (const layer of BODY_TRAIT_LAYERS) {
      const layerTraits = BODY_TRAITS.filter(
        (trait) => trait.layerId === layer.id,
      );

      expect(layerTraits.length, `${layer.id} trait count`).toBeGreaterThanOrEqual(
        5,
      );
    }
  });

  it("keeps pins separated enough to be clickable", () => {
    const minAnchorDistance = 10;

    for (const layer of BODY_TRAIT_LAYERS) {
      const layerTraits = BODY_TRAITS.filter(
        (trait) => trait.layerId === layer.id,
      );

      for (let index = 0; index < layerTraits.length; index += 1) {
        for (
          let nextIndex = index + 1;
          nextIndex < layerTraits.length;
          nextIndex += 1
        ) {
          const first = layerTraits[index];
          const second = layerTraits[nextIndex];
          const distance = Math.hypot(
            first.anchor.x - second.anchor.x,
            first.anchor.y - second.anchor.y,
          );

          expect(
            distance,
            `${layer.id}: ${first.titleRu} is too close to ${second.titleRu}`,
          ).toBeGreaterThanOrEqual(minAnchorDistance);
        }
      }
    }
  });
});
