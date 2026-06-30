import { describe, expect, it } from "vitest";
import {
  GEOLOGIC_BOUNDARIES,
  GEOLOGIC_PERIODS,
  getGeologicContextForAge,
  getGeologicPeriodForAge,
} from "./geologicPeriods";

describe("geologic periods", () => {
  it("covers the visible atlas scale from early cells to today", () => {
    expect(GEOLOGIC_PERIODS[0].id).toBe("archean");
    expect(GEOLOGIC_PERIODS.at(-1)?.id).toBe("quaternary");
    expect(getGeologicPeriodForAge(3800)?.id).toBe("archean");
    expect(getGeologicPeriodForAge(0)?.id).toBe("quaternary");
  });

  it("keeps periods in old-to-young order without gaps on the atlas scale", () => {
    for (let index = 0; index < GEOLOGIC_PERIODS.length - 1; index += 1) {
      const older = GEOLOGIC_PERIODS[index];
      const younger = GEOLOGIC_PERIODS[index + 1];

      expect(older.youngerMa).toBeCloseTo(younger.olderMa, 2);
      expect(older.olderMa).toBeGreaterThan(older.youngerMa);
    }
  });

  it("identifies period context for ordinary atlas ages", () => {
    expect(getGeologicContextForAge(372)?.period.id).toBe("devonian");
    expect(getGeologicContextForAge(180)?.period.id).toBe("jurassic");
    expect(getGeologicContextForAge(20)?.period.id).toBe("neogene");
  });

  it("treats rounded atlas ages near formal boundaries as boundary context", () => {
    expect(getGeologicContextForAge(541)?.boundary?.id).toBe(
      "ediacaran-cambrian",
    );
    expect(getGeologicContextForAge(252)?.boundary?.id).toBe(
      "permian-triassic",
    );
    expect(getGeologicContextForAge(66)?.boundary?.id).toBe(
      "cretaceous-paleogene",
    );
  });

  it("keeps boundary cards tied to known neighboring periods", () => {
    const periodIds = new Set(GEOLOGIC_PERIODS.map((period) => period.id));

    for (const boundary of GEOLOGIC_BOUNDARIES) {
      expect(periodIds.has(boundary.periodBeforeId)).toBe(true);
      expect(periodIds.has(boundary.periodAfterId)).toBe(true);
    }
  });
});
