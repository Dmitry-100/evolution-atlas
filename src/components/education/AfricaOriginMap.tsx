import { ArrowRight, ExternalLink, Globe2, MapPin } from "lucide-react";
import { useState } from "react";
import {
  AFRICA_ORIGIN_NOTE,
  HUMAN_MIGRATION_ROUTES,
  HUMAN_ORIGIN_SITES,
} from "../../data/humanOrigins";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { MigrationGlobe } from "./MigrationGlobe";
import "../../styles/pages/migration-globe.css";

const ROUTE_LABELS: Record<string, { title: string; region: string }> = {
  "african-mosaic": {
    title: "Африканская мозаика",
    region: "Связанные популяции",
  },
  "levant-arabia": { title: "Выход из Африки", region: "Левант и Аравия" },
  "southern-asia-sahul": { title: "Южная дуга", region: "Азия → Сахул" },
  europe: { title: "Европа", region: "Западная ветвь" },
  "east-asia": { title: "Восточная Азия", region: "Несколько волн" },
  americas: { title: "Америки", region: "Через Берингию" },
};

export function AfricaOriginMap() {
  const [siteFocusRequest, setSiteFocusRequest] = useState(0);
  const [routeFocusRequest, setRouteFocusRequest] = useState(0);
  const [activeSiteId, setActiveSiteId] = useState(HUMAN_ORIGIN_SITES[0].id);
  const [activeRouteId, setActiveRouteId] = useState(
    HUMAN_MIGRATION_ROUTES[1].id,
  );
  const activeSite = HUMAN_ORIGIN_SITES.find(
    (site) => site.id === activeSiteId,
  )!;
  const activeRoute = HUMAN_MIGRATION_ROUTES.find(
    (route) => route.id === activeRouteId,
  )!;
  const routeIndex = HUMAN_MIGRATION_ROUTES.indexOf(activeRoute);
  function selectSite(id: string) {
    setActiveSiteId(id);
    setSiteFocusRequest((request) => request + 1);
  }
  function selectRoute(id: string) {
    setActiveRouteId(id);
    setRouteFocusRequest((request) => request + 1);
  }

  return (
    <section
      className="africa-origin migration-exhibit"
      aria-labelledby="africa-origin-title"
    >
      <div className="africa-origin-heading">
        <Globe2 aria-hidden="true" size={24} />
        <div>
          <p className="eyebrow">Колыбель человечества</p>
          <h2 id="africa-origin-title">Расселение Homo sapiens</h2>
          <p>{AFRICA_ORIGIN_NOTE}</p>
        </div>
        <span className="migration-exhibit-index" aria-hidden="true">
          Атлас человечества<span>01 — 06</span>
        </span>
      </div>

      <div className="africa-origin-grid">
        <MigrationGlobe
          activeSiteId={activeSiteId}
          activeRouteId={activeRouteId}
          siteFocusRequest={siteFocusRequest}
          routeFocusRequest={routeFocusRequest}
          onSiteSelect={selectSite}
          onRouteSelect={selectRoute}
        />
        <div className="human-origin-side">
          <article
            className="migration-route-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="africa-site-meta">
              <span>
                Маршрут {String(routeIndex + 1).padStart(2, "0")} / 06
              </span>
              <ConfidenceBadge level={activeRoute.confidence} />
            </div>
            <h3>{activeRoute.titleRu}</h3>
            <strong>{activeRoute.dateRu}</strong>
            <p>{activeRoute.summaryRu}</p>
            <a href={activeRoute.source.url} target="_blank" rel="noreferrer">
              {activeRoute.source.label}
              <ExternalLink aria-hidden="true" size={13} />
            </a>
          </article>

          <div className="migration-finds">
            <div className="migration-finds-heading">
              <MapPin size={14} aria-hidden="true" />
              <span>Ранние свидетельства</span>
            </div>
            <div
              className="migration-site-list"
              role="group"
              aria-label="Африканские находки"
            >
              {HUMAN_ORIGIN_SITES.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  aria-pressed={site.id === activeSite.id}
                  onClick={() => selectSite(site.id)}
                >
                  {site.titleRu}
                </button>
              ))}
            </div>
            <article
              className="africa-site-detail"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="africa-site-meta">
                <span>{activeSite.regionRu}</span>
                <ConfidenceBadge level={activeSite.confidence} />
              </div>
              <h3>{activeSite.titleRu}</h3>
              <strong>{activeSite.ageRu}</strong>
              <p>{activeSite.evidenceRu}</p>
              <details className="migration-site-context">
                <summary>Почему это важно</summary>
                <p>{activeSite.whyMattersRu}</p>
              </details>
              <a href={activeSite.source.url} target="_blank" rel="noreferrer">
                {activeSite.source.label}
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            </article>
          </div>
        </div>
      </div>

      <div
        className="migration-route-list"
        role="group"
        aria-label="Маршруты расселения Homo sapiens"
      >
        {HUMAN_MIGRATION_ROUTES.map((route, index) => (
          <button
            key={route.id}
            type="button"
            className={
              route.id === activeRoute.id
                ? "migration-route-button is-active"
                : "migration-route-button"
            }
            onClick={() => selectRoute(route.id)}
            aria-pressed={route.id === activeRoute.id}
            aria-label={`${route.titleRu}, ${route.dateRu}`}
          >
            <span className="migration-route-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{ROUTE_LABELS[route.id].title}</span>
            <small>{ROUTE_LABELS[route.id].region}</small>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="migration-science-note">
        Линии показывают предполагаемые направления, а не точные пути. Береговая
        линия — современная; уровень моря и очертания суши менялись.
      </p>
    </section>
  );
}
