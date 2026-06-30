import { describe, expect, it } from "vitest";
import { GLOSSARY_TERMS, getGlossaryTerm, getStageGlossaryTerm } from "./glossary";

describe("glossary data", () => {
  it("covers the core evolutionary terms used in the atlas", () => {
    const requiredTerms = [
      "chordates",
      "prokaryotes",
      "cyanobacteria",
      "eukaryotes",
      "vertebrates",
      "tetrapods",
      "amniotes",
      "synapsids",
      "therapsids",
      "cynodonts",
      "eutherians",
      "primates",
      "anthropoids",
      "catarrhines",
      "apes",
      "hominins",
      "cladogram",
      "abiogenesis",
      "protocells",
      "luca",
      "archaea",
      "codon",
      "amino-acid",
      "genome",
      "chromosome-2",
      "endogenous-retroviruses",
      "mitochondrial-dna",
      "diapsids",
      "theropods",
      "archaeopteryx",
      "ancestral-node",
      "homologous-structures",
      "mitochondria",
    ];

    for (const id of requiredTerms) {
      const term = getGlossaryTerm(id);
      expect(term?.titleRu.length).toBeGreaterThan(4);
      expect(term?.definitionRu.length).toBeGreaterThan(30);
    }
  });

  it("maps stage ids to matching glossary terms", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(32);
    expect(getStageGlossaryTerm("prokaryotes")?.id).toBe("prokaryotes");
    expect(getStageGlossaryTerm("eukaryotes")?.id).toBe("eukaryotes");
    expect(getStageGlossaryTerm("chordates")?.id).toBe("chordates");
    expect(getStageGlossaryTerm("vertebrates")?.id).toBe("vertebrates");
    expect(getStageGlossaryTerm("tetrapods")?.id).toBe("tetrapods");
    expect(getStageGlossaryTerm("placentals")?.id).toBe("eutherians");
    expect(getStageGlossaryTerm("hominins")?.id).toBe("hominins");
  });
});
