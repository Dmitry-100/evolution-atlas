import { describe, expect, it } from "vitest";
import { mapAgeToLifeYear } from "./deepTimeCalendar";

describe("deep-time calendar mapping", () => {
  it("maps the beginning of the life story to January 1", () => {
    expect(mapAgeToLifeYear(4000)).toMatchObject({
      monthNameRu: "января",
      day: 1,
      time: "00:00",
    });
  });

  it("places primates at the very end of December", () => {
    const primates = mapAgeToLifeYear(65);

    expect(primates.monthNameRu).toBe("декабря");
    expect(primates.day).toBeGreaterThanOrEqual(25);
    expect(primates.day).toBeLessThanOrEqual(27);
  });

  it("places Homo sapiens in the final hour of December 31", () => {
    const sapiens = mapAgeToLifeYear(0.3);

    expect(sapiens.monthNameRu).toBe("декабря");
    expect(sapiens.day).toBe(31);
    expect(sapiens.hour).toBe(23);
  });
});
