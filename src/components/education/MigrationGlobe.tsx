import { useEffect, useRef, useState } from "react";
import { Focus, Hand, Minus, Pause, Play, Plus } from "lucide-react";
import {
  HUMAN_MIGRATION_ROUTES,
  HUMAN_ORIGIN_SITES,
} from "../../data/humanOrigins";
import { FlatMigrationMap } from "./FlatMigrationMap";
import type { MigrationGlobeController } from "./migrationGlobeScene";

type Props = {
  activeRouteId: string;
  activeSiteId: string;
  siteFocusRequest: number;
  routeFocusRequest: number;
  onSiteSelect: (id: string) => void;
  onRouteSelect: (id: string) => void;
};

export function MigrationGlobe(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const scene = useRef<MigrationGlobeController | null>(null);
  const latest = useRef(props);
  const [mode, setMode] = useState<"globe" | "map">("globe");
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const playingRef = useRef(playing);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => {
      if (motion.matches) setPlaying(false);
    };
    motion.addEventListener("change", stopMotion);
    return () => motion.removeEventListener("change", stopMotion);
  }, []);
  useEffect(() => {
    latest.current = props;
  });
  useEffect(() => {
    playingRef.current = playing;
    scene.current?.setPlaying(playing);
  }, [playing]);
  useEffect(() => {
    scene.current?.selectRoute(props.activeRouteId);
  }, [props.activeRouteId, props.routeFocusRequest]);
  useEffect(() => {
    scene.current?.selectSite(props.activeSiteId, true);
  }, [props.activeSiteId, props.siteFocusRequest]);

  useEffect(() => {
    if (mode === "map" || !host.current) return;
    let cancelled = false;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        void import("./migrationGlobeScene")
          .then(({ createMigrationGlobe }) => {
            if (cancelled || !host.current) return;
            scene.current = createMigrationGlobe({
              host: host.current,
              labels: labels.current,
              activeRouteId: latest.current.activeRouteId,
              activeSiteId: latest.current.activeSiteId,
              playing: playingRef.current,
              onRouteSelect: (id) => latest.current.onRouteSelect(id),
              onFailure: () => {
                if (cancelled) return;
                scene.current?.dispose();
                scene.current = null;
                setStatus("fallback");
              },
            });
            setStatus("ready");
          })
          .catch(() => {
            if (cancelled) return;
            scene.current?.dispose();
            scene.current = null;
            setStatus("fallback");
          });
      },
      { rootMargin: "240px" },
    );
    observer.observe(host.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [mode]);

  const is3D = mode === "globe" && status === "ready";
  return (
    <div
      className="migration-globe"
      data-renderer={mode === "map" ? "map" : status}
    >
      <div className="migration-globe-topline">
        <div className="migration-globe-caption">
          <span />
          Одна планета. Общая история.
        </div>
        <select
          className="migration-mobile-route"
          aria-label="Выбрать маршрут"
          value={props.activeRouteId}
          onChange={(event) => props.onRouteSelect(event.target.value)}
        >
          {HUMAN_MIGRATION_ROUTES.map((route, index) => (
            <option key={route.id} value={route.id}>
              {String(index + 1).padStart(2, "0")} · {route.titleRu}
            </option>
          ))}
        </select>
        <div
          className="migration-view-switch"
          role="group"
          aria-label="Вид карты"
        >
          <button
            type="button"
            aria-pressed={mode === "globe"}
            onClick={() => {
              setMode("globe");
              if (mode !== "globe") setStatus("loading");
            }}
          >
            3D
          </button>
          <button
            type="button"
            aria-pressed={mode === "map"}
            onClick={() => setMode("map")}
          >
            2D
          </button>
        </div>
      </div>
      <div className="migration-viewport" ref={host}>
        {!is3D && (
          <FlatMigrationMap
            activeRouteId={props.activeRouteId}
            activeSiteId={props.activeSiteId}
            onSiteSelect={props.onSiteSelect}
          />
        )}
        <div
          className="migration-globe-labels"
          aria-hidden={!is3D}
          style={{ display: is3D ? undefined : "none" }}
        >
          {HUMAN_ORIGIN_SITES.map((site, index) => (
            <button
              key={site.id}
              type="button"
              ref={(node) => {
                labels.current[index] = node;
              }}
              className={`migration-globe-site migration-globe-site--${site.id}${site.id === props.activeSiteId ? " is-active" : ""}`}
              onClick={() => props.onSiteSelect(site.id)}
              aria-label={`${site.titleRu}, ${site.regionRu}`}
              aria-pressed={site.id === props.activeSiteId}
              tabIndex={is3D ? 0 : -1}
            >
              <span className="migration-site-anchor" />
              <span className="migration-site-label">{site.titleRu}</span>
            </button>
          ))}
        </div>
      </div>
      {is3D && (
        <div
          className="migration-globe-tools"
          role="group"
          aria-label="Управление глобусом"
        >
          <button
            type="button"
            onClick={() => scene.current?.zoom(0.88)}
            aria-label="Приблизить глобус"
            title="Приблизить"
          >
            <Plus size={17} />
          </button>
          <button
            type="button"
            onClick={() => scene.current?.zoom(1.12)}
            aria-label="Отдалить глобус"
            title="Отдалить"
          >
            <Minus size={17} />
          </button>
          <span />
          <button
            type="button"
            onClick={() => scene.current?.reset()}
            aria-label="Вернуться к выбранному маршруту"
            title="К выбранному маршруту"
          >
            <Focus size={17} />
          </button>
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            aria-label={
              playing
                ? "Остановить анимацию маршрута"
                : "Включить анимацию маршрута"
            }
            title={playing ? "Остановить анимацию" : "Анимация маршрута"}
            aria-pressed={playing}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      )}
      <div className="migration-globe-bottomline">
        <span className="migration-globe-hint">
          {is3D ? (
            <>
              <Hand size={14} />
              Вращайте, чтобы исследовать
            </>
          ) : mode === "globe" && status === "loading" ? (
            "Загрузка глобуса…"
          ) : status === "fallback" && mode === "globe" ? (
            "3D недоступно · открыта плоская карта"
          ) : (
            "Весь мир на одной карте"
          )}
        </span>
        <span className="migration-map-legend">
          <i />
          Маршруты <i />
          Находки
        </span>
      </div>
    </div>
  );
}
