import { describe, expect, it } from "vitest";
import { CONFIDENCE_LABELS } from "./confidence";

describe("confidence labels", () => {
  it("uses reader-friendly Russian labels", () => {
    expect(CONFIDENCE_LABELS.solid).toBe("подтверждено");
    expect(CONFIDENCE_LABELS.solid).not.toBe("надежно");
    expect(CONFIDENCE_LABELS.likely).toBe("вероятно");
    expect(CONFIDENCE_LABELS.debated).toBe("обсуждается");
  });
});
