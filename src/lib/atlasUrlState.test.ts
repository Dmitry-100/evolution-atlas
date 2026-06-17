import { describe, expect, it } from "vitest";
import { parseAtlasUrlState, toAtlasSearchParams } from "./atlasUrlState";
import { getStageById } from "../data/lineage";

describe("atlas URL state", () => {
  it("parses a shared link to the full atlas", () => {
    expect(parseAtlasUrlState(new URLSearchParams("mode=all&stage=homo-sapiens"))).toEqual({
      mode: "all",
      stageId: "sapiens",
    });
  });

  it("parses a shared link to the primate zoom mode", () => {
    expect(parseAtlasUrlState(new URLSearchParams("mode=primates&stage=early-apes"))).toEqual({
      mode: "primates",
      stageId: "early-apes",
    });
  });

  it("falls back to early primates for invalid or hidden stage slugs", () => {
    expect(parseAtlasUrlState(new URLSearchParams("mode=primates&stage=tiktaalik"))).toEqual({
      mode: "primates",
      stageId: "early-primates",
    });
    expect(parseAtlasUrlState(new URLSearchParams("mode=unknown&stage=missing"))).toEqual({
      mode: "all",
      stageId: "early-primates",
    });
  });

  it("serializes state with stable stage slugs", () => {
    const sapiens = getStageById("sapiens");

    expect(sapiens).toBeDefined();
    expect(toAtlasSearchParams({ mode: "all", stage: sapiens! }).toString()).toBe("mode=all&stage=homo-sapiens");
  });
});
