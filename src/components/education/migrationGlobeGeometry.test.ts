import { describe, expect, it } from "vitest";
import { HUMAN_MIGRATION_ROUTES } from "../../data/humanOrigins";
import { globePoint, migrationArc } from "./migrationGlobeGeometry";

describe("migration globe geometry", () => {
  it("aligns Greenwich, east and the north pole with the map texture", () => {
    expect(globePoint([0, 0])).toEqual([1, 0, -0]);
    expect(globePoint([90, 0])[2]).toBeCloseTo(-1);
    expect(globePoint([0, 90])[1]).toBeCloseTo(1);
  });

  it("crosses Beringia locally rather than circling the world", () => {
    const arc = migrationArc([
      [179, 60],
      [-170, 62],
    ]);
    for (const [x, y, z] of arc) {
      expect(x).toBeLessThan(-0.45);
      expect(y).toBeGreaterThan(0.85);
      expect(Math.abs(z)).toBeLessThan(0.1);
    }
  });

  it("keeps every route above the surface without jumps or invalid coordinates", () => {
    for (const route of HUMAN_MIGRATION_ROUTES) {
      const arc = migrationArc(route.points);
      for (const [index, point] of arc.entries()) {
        expect(point.every(Number.isFinite)).toBe(true);
        expect(Math.hypot(...point)).toBeGreaterThan(1.01);
        expect(Math.hypot(...point)).toBeLessThan(1.06);
        if (index)
          expect(
            Math.hypot(
              ...point.map((value, axis) => value - arc[index - 1][axis]),
            ),
          ).toBeLessThan(0.05);
      }
      const end = globePoint(route.points.at(-1)!, 1.012);
      arc
        .at(-1)!
        .forEach((value, axis) => expect(value).toBeCloseTo(end[axis], 5));
    }
  });
});
