import { MapPin } from "lucide-react";
import type { CSSProperties } from "react";
import {
  HUMAN_MIGRATION_ROUTES,
  HUMAN_ORIGIN_SITES,
  type HumanMigrationRoute,
} from "../../data/humanOrigins";
import {
  AFRICA_LAND_PATH,
  WORLD_LAND_PATH,
  WORLD_MAP_VIEW_BOX,
} from "../../data/worldMapPaths";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 520;

function projectPoint([longitude, latitude]: [number, number]) {
  return {
    x: ((longitude + 180) / 360) * MAP_WIDTH,
    y: ((90 - latitude) / 180) * MAP_HEIGHT,
  };
}

function positionStyle(point: [number, number]) {
  const { x, y } = projectPoint(point);
  return {
    "--site-x": `${(x / MAP_WIDTH) * 100}%`,
    "--site-y": `${(y / MAP_HEIGHT) * 100}%`,
  } as CSSProperties;
}

function buildRouteSegments(route: HumanMigrationRoute) {
  const segments: string[][] = [];
  let current: string[] = [];
  let previous = null as ReturnType<typeof projectPoint> | null;

  for (const point of route.points) {
    const projected = projectPoint(point);

    if (
      previous &&
      Math.abs(projected.x - previous.x) > MAP_WIDTH / 2 &&
      current.length > 0
    ) {
      segments.push(current);
      current = [];
    }

    current.push(`${projected.x.toFixed(1)},${projected.y.toFixed(1)}`);
    previous = projected;
  }

  if (current.length > 1) {
    segments.push(current);
  }

  return segments;
}

export function FlatMigrationMap({
  activeRouteId,
  activeSiteId,
  onSiteSelect,
}: {
  activeRouteId: string;
  activeSiteId: string;
  onSiteSelect: (id: string) => void;
}) {
  return (
    <div className="migration-flat-map">
      <svg
        className="human-migration-map"
        viewBox={WORLD_MAP_VIEW_BOX}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="migration-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" />
          </marker>
        </defs>
        <g className="map-graticule">
          {[-120, -60, 0, 60, 120].map((longitude) => {
            const { x } = projectPoint([longitude, 0]);
            return (
              <line
                key={`lon-${longitude}`}
                x1={x}
                x2={x}
                y1="0"
                y2={MAP_HEIGHT}
              />
            );
          })}
          {[-45, 0, 45].map((latitude) => {
            const { y } = projectPoint([0, latitude]);
            return (
              <line
                key={`lat-${latitude}`}
                x1="0"
                x2={MAP_WIDTH}
                y1={y}
                y2={y}
              />
            );
          })}
        </g>
        <path className="world-land" d={WORLD_LAND_PATH} />
        <path className="africa-land-highlight" d={AFRICA_LAND_PATH} />
        <g className="migration-routes">
          {HUMAN_MIGRATION_ROUTES.filter(
            (route) => route.kind === "migration",
          ).map((route) =>
            buildRouteSegments(route).map((segment, index, allSegments) => (
              <polyline
                key={`${route.id}-${index}`}
                className={
                  route.id === activeRouteId
                    ? "migration-route is-active"
                    : "migration-route"
                }
                points={segment.join(" ")}
                markerEnd={
                  index === allSegments.length - 1
                    ? "url(#migration-arrow)"
                    : undefined
                }
              />
            )),
          )}
        </g>
      </svg>
      {HUMAN_ORIGIN_SITES.map((site) => (
        <button
          key={site.id}
          type="button"
          className={
            site.id === activeSiteId ? "africa-site is-active" : "africa-site"
          }
          style={positionStyle([site.longitude, site.latitude])}
          onClick={() => onSiteSelect(site.id)}
          aria-label={`${site.titleRu}, ${site.regionRu}`}
          aria-pressed={site.id === activeSiteId}
        >
          <MapPin aria-hidden="true" size={18} />
          <span>{site.titleRu}</span>
        </button>
      ))}
    </div>
  );
}
