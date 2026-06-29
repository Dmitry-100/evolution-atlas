import { describe, expect, it } from "vitest";
import {
  getStageHref,
  parseAtlasUrlState,
  parsePrimateUrlState,
  toAtlasSearchParams,
  toStageSearchParams,
} from "./atlasUrlState";
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

  it("parses stage-only links for the primates page", () => {
    expect(parsePrimateUrlState(new URLSearchParams("stage=homo-sapiens"))).toEqual({
      stageId: "sapiens",
    });
    expect(parsePrimateUrlState(new URLSearchParams("stage=tiktaalik"))).toEqual({
      stageId: "early-primates",
    });
  });

  it("serializes shared stage links to the owning section", () => {
    const sapiens = getStageById("sapiens");
    const tiktaalik = getStageById("tiktaalik");

    expect(sapiens).toBeDefined();
    expect(tiktaalik).toBeDefined();
    expect(toStageSearchParams(sapiens!).toString()).toBe("stage=homo-sapiens");
    expect(getStageHref(sapiens!)).toBe("/primates?stage=homo-sapiens");
    expect(getStageHref(tiktaalik!)).toBe("/?mode=all&stage=tiktaalik");
  });
});
