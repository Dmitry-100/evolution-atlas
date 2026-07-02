import { describe, expect, it } from "vitest";
import {
  birdDinosaurBranch,
  dinosaurCommonAncestor,
  sharedAnimalBranch,
} from "./dinosaurLineage";

describe("dinosaur and bird lineage data", () => {
  it("reuses the shared animal ancestors from the human lineage without duplicating them", () => {
    expect(sharedAnimalBranch.map((stage) => stage.id)).toEqual([
      "early-animals",
      "bilaterians",
      "chordates",
      "vertebrates",
      "jawed-fish",
      "lobe-finned",
      "tiktaalik",
      "tetrapods",
      "amniotes",
    ]);
  });

  it("keeps the dinosaur-to-bird branch separate and ends with living birds", () => {
    expect(birdDinosaurBranch.map((stage) => stage.id)).toEqual([
      "diapsids",
      "archosaurs",
      "early-dinosaurs",
      "theropods",
      "feathered-dinosaurs",
      "archaeopteryx",
      "early-birds",
      "kpg-survivors",
      "modern-birds",
    ]);

    expect(birdDinosaurBranch[0]?.ageMa).toBeGreaterThan(birdDinosaurBranch.at(-1)?.ageMa ?? -1);
    expect(birdDinosaurBranch.at(-1)?.titleRu).toBe("Современные птицы");
  });

  it("has local images, evidence text, and sources for every dinosaur branch node", () => {
    for (const stage of birdDinosaurBranch) {
      expect(stage.image.src).toMatch(/^\/assets\/images\/dinosaurs\//);
      expect(stage.image.altRu.length).toBeGreaterThan(12);
      expect(stage.evidenceRu.length).toBeGreaterThan(20);
      expect(stage.sources.length).toBeGreaterThan(0);
    }
  });

  it("does not place Sinosauropteryx inside Pennaraptora evidence text", () => {
    const featheredDinosaurs = birdDinosaurBranch.find(
      (stage) => stage.id === "feathered-dinosaurs",
    );

    expect(featheredDinosaurs?.latin).toBe("Pennaraptora");
    expect(featheredDinosaurs?.evidenceRu).not.toMatch(/Sinosauropteryx/i);
  });

  it("names the shared ancestor with birds as early amniotes", () => {
    expect(dinosaurCommonAncestor.titleRu).toBe("Ранние амниоты");
    expect(dinosaurCommonAncestor.ageMa).toBe(320);
    expect(dinosaurCommonAncestor.humanBranchRu).toMatch(/млекопитающие/);
    expect(dinosaurCommonAncestor.dinosaurBranchRu).toMatch(/птицы/);
  });
});
