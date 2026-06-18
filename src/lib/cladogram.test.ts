import { describe, expect, it } from "vitest";
import { STAGES } from "../data/lineage";
import { buildCladogram } from "./cladogram";

describe("cladogram builder", () => {
  it("builds an expanded main trunk from foundation, stem, and direct-lineage stages, oldest first", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.trunk.length).toBeGreaterThan(25);
    expect(tree.trunk.map((stage) => stage.id)).toEqual(
      expect.arrayContaining([
        "cell-lines",
        "chordates",
        "vertebrates",
        "tiktaalik",
        "hominins",
        "early-homo",
      ]),
    );
    expect(tree.trunk[0]?.id).toBe("cell-lines");
    expect(tree.trunk.at(-1)?.id).toBe("sapiens");
  });

  it("attaches representative, side, and close-relative branches to the nearest older trunk node", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.branches.length).toBeGreaterThanOrEqual(30);
    expect(
      tree.branches.find((branch) => branch.stage?.id === "prokaryotes")?.parent
        .id,
    ).toBe("cell-lines");
    expect(
      tree.branches.find((branch) => branch.stage?.id === "choanoflagellates")
        ?.parent.id,
    ).toBe("eukaryotes");
    expect(
      tree.branches.find((branch) => branch.stage?.id === "new-world-monkeys")
        ?.parent.id,
    ).toBe("anthropoids");
    expect(
      tree.branches.find((branch) => branch.stage?.id === "old-world-monkeys")
        ?.parent.id,
    ).toBe("catarrhini");
    expect(
      tree.branches.find((branch) => branch.stage?.id === "neanderthals")
        ?.parent.id,
    ).toBe("heidelbergensis");
  });

  it("adds explanatory context branches for major evolutionary forks", () => {
    const tree = buildCladogram(STAGES);

    expect(
      tree.branches.find((branch) => branch.id === "branch-diapsids"),
    ).toMatchObject({
      kind: "context",
      titleRu: expect.stringContaining("Диапсиды"),
      image: expect.objectContaining({
        src: expect.stringMatching(/^\/assets\/images\//),
        altRu: expect.any(String),
      }),
      parent: expect.objectContaining({ id: "amniotes" }),
    });
    expect(
      tree.branches.find((branch) => branch.id === "branch-chimpanzees"),
    ).toMatchObject({
      kind: "context",
      titleRu: "Шимпанзе и бонобо",
      parent: expect.objectContaining({ id: "hominins" }),
    });
  });

  it("keeps every branch visually inspectable", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.branches).not.toHaveLength(0);
    for (const branch of tree.branches) {
      expect(branch.image.src, branch.titleRu).toMatch(/^\/assets\/images\//);
      expect(branch.image.altRu, branch.titleRu).toBeTruthy();
      expect(branch.image.sourceUrl, branch.titleRu).toMatch(/^https?:\/\//);
    }
  });
});
