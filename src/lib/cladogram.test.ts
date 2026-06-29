import { describe, expect, it } from "vitest";
import { STAGES } from "../data/lineage";
import { buildCladogram } from "./cladogram";

describe("cladogram builder", () => {
  it("adds LUCA as the root ancestor for the cladogram view", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.root).toMatchObject({
      id: "luca",
      titleRu: expect.stringContaining("LUCA"),
      ageMa: expect.any(Number),
    });
    expect(tree.root.descriptionRu).toContain("реконструируемый");
  });

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

  it("marks every extant comparison branch and gives them explicit common ancestors", () => {
    const tree = buildCladogram(STAGES);
    const livingBranchIds = tree.livingBranches.map((branch) => branch.id);

    expect(livingBranchIds).toEqual(
      expect.arrayContaining([
        "prokaryotes",
        "cyanobacteria",
        "choanoflagellates",
        "branch-plants-algae",
        "branch-fungi",
        "branch-sponges",
        "branch-arthropods",
        "branch-mollusks-worms",
        "branch-tunicates-lancelets",
        "branch-jawless-fish",
        "branch-cartilaginous-fish",
        "branch-ray-finned-fish",
        "branch-living-sarcopterygians",
        "branch-amphibians",
        "branch-diapsids",
        "branch-monotremes",
        "branch-marsupials",
        "branch-laurasiatheria",
        "branch-rodents",
        "branch-lemurs-lorises",
        "branch-tarsiers",
        "new-world-monkeys",
        "old-world-monkeys",
        "branch-gibbons",
        "branch-orangutans",
        "branch-gorillas",
        "branch-chimpanzees",
      ]),
    );
    expect(livingBranchIds).not.toEqual(
      expect.arrayContaining([
        "after-kpg",
        "plesiadapis",
        "neanderthals",
        "branch-denisovans",
      ]),
    );

    for (const branch of tree.livingBranches) {
      expect(branch.isLivingComparison, branch.titleRu).toBe(true);
      expect(branch.commonAncestor.titleRu, branch.titleRu).toBeTruthy();
      expect(branch.commonAncestor.ageMa, branch.titleRu).toBeGreaterThan(0);
      expect(branch.commonAncestor.relationRu, branch.titleRu).toContain(
        "общий предок с нами",
      );
    }
  });

  it("uses specific common ancestor labels for distant and close living branches", () => {
    const tree = buildCladogram(STAGES);

    expect(
      tree.branches.find((branch) => branch.id === "prokaryotes")
        ?.commonAncestor,
    ).toMatchObject({
      titleRu: "LUCA",
      relationRu: expect.stringContaining("бактериями и археями"),
    });
    expect(
      tree.branches.find((branch) => branch.id === "branch-plants-algae")
        ?.commonAncestor,
    ).toMatchObject({
      titleRu: "Эукариотический предок",
      relationRu: expect.stringContaining("растениями и водорослями"),
    });
    expect(
      tree.branches.find((branch) => branch.id === "branch-diapsids")
        ?.commonAncestor,
    ).toMatchObject({
      titleRu: "Ранний амниот",
      relationRu: expect.stringContaining("птицами и рептилиями"),
    });
    expect(
      tree.branches.find((branch) => branch.id === "branch-chimpanzees")
        ?.commonAncestor,
    ).toMatchObject({
      titleRu: "Предок линии Homo-Pan",
      relationRu: expect.stringContaining("шимпанзе и бонобо"),
    });
  });

  it("uses real living-species photos for stage-derived living monkey comparison cards only in the cladogram", () => {
    const tree = buildCladogram(STAGES);

    expect(
      tree.branches.find((branch) => branch.id === "new-world-monkeys")?.image,
    ).toMatchObject({
      src: "/assets/images/source-backed/capuchin-branch.jpg",
      kind: "source-backed",
      altRu: expect.stringContaining("капуцин"),
    });
    expect(
      tree.branches.find((branch) => branch.id === "old-world-monkeys")?.image,
    ).toMatchObject({
      src: "/assets/images/source-backed/douc-langur-head.jpg",
      kind: "source-backed",
      altRu: expect.stringContaining("дук"),
    });

    expect(
      STAGES.find((stage) => stage.id === "new-world-monkeys")?.image.kind,
    ).toBe("generated-reconstruction");
    expect(
      STAGES.find((stage) => stage.id === "old-world-monkeys")?.image.kind,
    ).toBe("generated-reconstruction");
  });

  it("uses the selected Denisovan reconstruction image for the Denisovan branch", () => {
    const tree = buildCladogram(STAGES);

    expect(
      tree.branches.find((branch) => branch.id === "branch-denisovans")?.image,
    ).toMatchObject({
      src: "/assets/images/source-backed/denisovan-reconstruction.webp",
      kind: "source-backed",
      altRu: expect.stringContaining("Денисов"),
    });
  });

  it("keeps every branch visually inspectable", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.branches).not.toHaveLength(0);
    for (const branch of tree.branches) {
      expect(branch.image.src, branch.titleRu).toMatch(/^\/assets\/images\//);
      expect(branch.image.altRu, branch.titleRu).toBeTruthy();
      expect(branch.image.sourceUrl, branch.titleRu).toMatch(/^https?:\/\//);
      expect(branch.commonAncestor.titleRu, branch.titleRu).toBeTruthy();
    }
  });
});
