import { describe, expect, it } from "vitest";
import { GLOSSARY_TERMS, getGlossaryTerm, getStageGlossaryTerm } from "./glossary";

describe("glossary data", () => {
  it("covers the core evolutionary terms used in the atlas", () => {
    const requiredTerms = [
      "chordates",
      "amniotes",
      "synapsids",
      "therapsids",
      "cynodonts",
      "primates",
      "anthropoids",
      "hominins",
      "cladogram",
    ];

    for (const id of requiredTerms) {
      const term = getGlossaryTerm(id);
      expect(term?.titleRu.length).toBeGreaterThan(4);
      expect(term?.definitionRu.length).toBeGreaterThan(30);
    }
  });

  it("maps stage ids to matching glossary terms", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(9);
    expect(getStageGlossaryTerm("chordates")?.id).toBe("chordates");
    expect(getStageGlossaryTerm("hominins")?.id).toBe("hominins");
  });
});
