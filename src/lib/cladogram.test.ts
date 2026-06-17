import { describe, expect, it } from "vitest";
import { STAGES } from "../data/lineage";
import { buildCladogram } from "./cladogram";

describe("cladogram builder", () => {
  it("builds the main trunk from direct-lineage stages, oldest first", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.trunk.length).toBeGreaterThan(15);
    expect(tree.trunk.every((stage) => stage.lineageRole === "direct-lineage")).toBe(true);
    expect(tree.trunk[0]?.id).toBe("eukaryotes");
    expect(tree.trunk.at(-1)?.id).toBe("sapiens");
  });

  it("attaches side and close-relative branches to the nearest older trunk node", () => {
    const tree = buildCladogram(STAGES);

    expect(tree.branches.length).toBeGreaterThanOrEqual(5);
    expect(tree.branches.find((branch) => branch.stage.id === "new-world-monkeys")?.parent.id).toBe("anthropoids");
    expect(tree.branches.find((branch) => branch.stage.id === "old-world-monkeys")?.parent.id).toBe("catarrhini");
    expect(tree.branches.find((branch) => branch.stage.id === "neanderthals")?.parent.id).toBe("erectus");
  });
});
