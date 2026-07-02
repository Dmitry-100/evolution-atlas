import { describe, expect, it } from "vitest";
import { LUCA_EXHIBIT, LUCA_INHERITANCE, LUCA_SOURCES, LUCA_TREE_NODES } from "./luca";

describe("LUCA exhibit data", () => {
  it("describes LUCA as a reconstructed common ancestor, not first life", () => {
    expect(LUCA_EXHIBIT.titleRu).toContain("LUCA");
    expect(LUCA_EXHIBIT.acronymEn).toBe("Last Universal Common Ancestor");
    expect(LUCA_EXHIBIT.acronymRu).toBe("последний универсальный общий предок");
    expect(LUCA_EXHIBIT.leadRu).toContain("не первый организм");
    expect(LUCA_EXHIBIT.leadRu).toContain("последний общий предок");
    expect(LUCA_EXHIBIT.leadRu).not.toMatch(/первая жизнь|первая клетка/i);
    expect(LUCA_EXHIBIT.confidence).toBe("debated");
  });

  it("shows eukaryotes emerging inside the archaeal side of the tree", () => {
    expect(LUCA_TREE_NODES.map((node) => node.id)).toEqual(["luca", "bacteria", "archaea", "eukaryotes"]);
    expect(LUCA_TREE_NODES[0]?.children).toEqual(["bacteria", "archaea"]);
    expect(LUCA_TREE_NODES.find((node) => node.id === "archaea")?.children).toEqual(["eukaryotes"]);
    expect(LUCA_TREE_NODES.find((node) => node.id === "eukaryotes")?.confidence).toBe("likely");
    expect(LUCA_INHERITANCE).toEqual(
      expect.arrayContaining(["почти общий генетический код", "рибосомы", "ATP и ионные градиенты", "клеточные мембраны"]),
    );
  });

  it("uses authoritative sources for the claim", () => {
    const urls = LUCA_SOURCES.map((source) => source.url);

    expect(urls).toContain("https://www.nature.com/articles/s41559-024-02461-1");
    expect(urls).toContain("https://www.bristol.ac.uk/news/2024/july/luca.html");
    expect(urls).toContain("https://pubmed.ncbi.nlm.nih.gov/2112744/");
  });
});
