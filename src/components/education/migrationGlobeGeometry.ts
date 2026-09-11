import type { HumanMigrationRoute } from "../../data/humanOrigins";

export type GlobePoint = [x: number, y: number, z: number];
type Coordinates = [longitude: number, latitude: number];

// Matches Three.js SphereGeometry's equirectangular UVs: east is +Z at Greenwich.
export function globePoint([longitude, latitude]: Coordinates, radius = 1): GlobePoint {
  const lon = longitude * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)];
}

// Interpolate on the sphere so the Beringia route crosses the antimeridian locally.
export function migrationArc(points: Coordinates[]): GlobePoint[] {
  const result: GlobePoint[] = [];
  for (let segment = 0; segment < points.length - 1; segment++) {
    const a = globePoint(points[segment]);
    const b = globePoint(points[segment + 1]);
    const angle = Math.acos(Math.max(-1, Math.min(1, a.reduce((sum, value, i) => sum + value * b[i], 0))));
    const steps = Math.max(8, Math.ceil(angle * 60));
    for (let step = segment ? 1 : 0; step <= steps; step++) {
      const t = step / steps;
      const progress = (segment + t) / (points.length - 1);
      const radius = 1.012 + Math.sin(progress * Math.PI) * 0.045;
      const weightA = angle < 0.0001 ? 1 - t : Math.sin((1 - t) * angle) / Math.sin(angle);
      const weightB = angle < 0.0001 ? t : Math.sin(t * angle) / Math.sin(angle);
      result.push(a.map((value, i) => (weightA * value + weightB * b[i]) * radius) as GlobePoint);
    }
  }
  return result;
}

export function routeView(route: HumanMigrationRoute): Coordinates {
  const views: Record<string, Coordinates> = {
    "african-mosaic": [20, 8],
    "levant-arabia": [36, 20],
    "southern-asia-sahul": [91, 2],
    europe: [20, 43],
    "east-asia": [100, 28],
    americas: [-166, 43],
  };
  return views[route.id] ?? route.points[0];
}
