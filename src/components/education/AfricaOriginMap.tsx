import { ExternalLink, Globe2, MapPin, Route as RouteIcon } from "lucide-react";
import { useState, type CSSProperties } from "react";
import {
  AFRICA_ORIGIN_NOTE,
  HUMAN_MIGRATION_ROUTES,
  HUMAN_ORIGIN_SITES,
  type HumanMigrationRoute,
} from "../../data/humanOrigins";
import { AFRICA_LAND_PATH, WORLD_LAND_PATH, WORLD_MAP_VIEW_BOX } from "../../data/worldMapPaths";
import { ConfidenceBadge } from "./ConfidenceBadge";

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

    if (previous && Math.abs(projected.x - previous.x) > MAP_WIDTH / 2 && current.length > 0) {
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

export function AfricaOriginMap() {
  const [activeSiteId, setActiveSiteId] = useState(HUMAN_ORIGIN_SITES[0]?.id ?? "jebel-irhoud");
  const [activeRouteId, setActiveRouteId] = useState(HUMAN_MIGRATION_ROUTES[1]?.id ?? "levant-arabia");
  const activeSite = HUMAN_ORIGIN_SITES.find((site) => site.id === activeSiteId) ?? HUMAN_ORIGIN_SITES[0];
  const activeRoute =
    HUMAN_MIGRATION_ROUTES.find((route) => route.id === activeRouteId) ?? HUMAN_MIGRATION_ROUTES[0];

  if (!activeSite || !activeRoute) return null;

  return (
    <section className="africa-origin" aria-labelledby="africa-origin-title">
      <div className="africa-origin-heading">
        <Globe2 aria-hidden="true" size={24} />
        <div>
          <p className="eyebrow">Колыбель человечества</p>
          <h2 id="africa-origin-title">Африка и ранние маршруты расселения</h2>
          <p>{AFRICA_ORIGIN_NOTE}</p>
        </div>
      </div>

      <div className="africa-origin-grid">
        <div className="africa-map-panel" aria-label="Карта ранних свидетельств и маршрутов Homo sapiens">
          <svg className="human-migration-map" viewBox={WORLD_MAP_VIEW_BOX} role="img" aria-hidden="true">
            <defs>
              <marker id="migration-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" />
              </marker>
            </defs>
            <g className="map-graticule">
              {[-120, -60, 0, 60, 120].map((longitude) => {
                const { x } = projectPoint([longitude, 0]);
                return <line key={`lon-${longitude}`} x1={x} x2={x} y1="0" y2={MAP_HEIGHT} />;
              })}
              {[-45, 0, 45].map((latitude) => {
                const { y } = projectPoint([0, latitude]);
                return <line key={`lat-${latitude}`} x1="0" x2={MAP_WIDTH} y1={y} y2={y} />;
              })}
            </g>
            <path className="world-land" d={WORLD_LAND_PATH} />
            <path className="africa-land-highlight" d={AFRICA_LAND_PATH} />
            <g className="migration-routes">
              {HUMAN_MIGRATION_ROUTES.map((route) =>
                buildRouteSegments(route).map((segment, index, allSegments) => (
                  <polyline
                    key={`${route.id}-${index}`}
                    className={route.id === activeRoute.id ? "migration-route is-active" : "migration-route"}
                    points={segment.join(" ")}
                    markerEnd={index === allSegments.length - 1 ? "url(#migration-arrow)" : undefined}
                  />
                )),
              )}
            </g>
          </svg>
          {HUMAN_ORIGIN_SITES.map((site) => (
            <button
              key={site.id}
              type="button"
              className={site.id === activeSite.id ? "africa-site is-active" : "africa-site"}
              style={positionStyle([site.longitude, site.latitude])}
              onClick={() => setActiveSiteId(site.id)}
              aria-label={`${site.titleRu}, ${site.regionRu}`}
            >
              <MapPin aria-hidden="true" size={18} />
              <span>{site.titleRu}</span>
            </button>
          ))}
        </div>

        <div className="human-origin-side">
          <article className="africa-site-detail" aria-live="polite">
            <div className="africa-site-meta">
              <span>{activeSite.regionRu}</span>
              <ConfidenceBadge level={activeSite.confidence} />
            </div>
            <h3>{activeSite.titleRu}</h3>
            <strong>{activeSite.ageRu}</strong>
            <p>{activeSite.evidenceRu}</p>
            <p>{activeSite.whyMattersRu}</p>
            <a href={activeSite.source.url} target="_blank" rel="noreferrer">
              {activeSite.source.label}
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          </article>

          <article className="migration-route-detail" aria-live="polite">
            <div className="africa-site-meta">
              <span>Предполагаемый маршрут</span>
              <ConfidenceBadge level={activeRoute.confidence} />
            </div>
            <h3>{activeRoute.titleRu}</h3>
            <strong>{activeRoute.dateRu}</strong>
            <p>{activeRoute.summaryRu}</p>
            <a href={activeRoute.source.url} target="_blank" rel="noreferrer">
              {activeRoute.source.label}
              <ExternalLink aria-hidden="true" size={14} />
            </a>
          </article>
        </div>
      </div>

      <div className="migration-route-list" aria-label="Маршруты расселения Homo sapiens">
        {HUMAN_MIGRATION_ROUTES.map((route) => (
          <button
            key={route.id}
            type="button"
            className={route.id === activeRoute.id ? "migration-route-button is-active" : "migration-route-button"}
            onClick={() => setActiveRouteId(route.id)}
          >
            <RouteIcon aria-hidden="true" size={17} />
            <span>{route.titleRu}</span>
            <small>{route.dateRu}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
