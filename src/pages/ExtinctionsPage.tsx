import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/extinctions.css";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Clock3,
  FileText,
  Flame,
  RefreshCw,
  Sparkles,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ImageLightbox } from "../components/ui/image-lightbox";
import { OptimizedImage } from "../components/ui/optimized-image";
import { formatExtinctionTitleRu, MASS_EXTINCTIONS } from "../data/extinctions";

const EVENT_NAV_LABELS: Record<string, { title: string; date: string }> = {
  "ordovician-silurian": { title: "Ордовик", date: "444 млн лет" },
  "late-devonian": { title: "Поздний девон", date: "372–359 млн" },
  "permian-triassic": { title: "Пермь", date: "252 млн лет" },
  "triassic-jurassic": { title: "Триас — юра", date: "201 млн лет" },
  "cretaceous-paleogene": { title: "K–Pg", date: "66 млн лет" },
  "holocene-anthropocene": { title: "Сейчас", date: "продолжается" },
};

export function ExtinctionsPage() {
  const pageRef = useRef<HTMLElement>(null);
  const cardsRef = useRef(new Map<string, HTMLElement>());
  const firstEventId = MASS_EXTINCTIONS[0]?.id ?? "";
  const [activeEventId, setActiveEventId] = useState(firstEventId);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(
    firstEventId,
  );
  const [expandedVisual, setExpandedVisual] = useState<{
    src: string;
    alt: string;
    caption: string;
  } | null>(null);

  useEffect(() => {
    const header = document.querySelector(".topbar");
    const page = pageRef.current;
    if (!header || !page) return;

    const update = () =>
      page.style.setProperty(
        "--extinctions-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(header);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const cards = [...cardsRef.current.values()];
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const eventId = (visible?.target as HTMLElement | undefined)?.dataset
          .eventId;
        if (eventId) setActiveEventId(eventId);
      },
      {
        rootMargin: "-20% 0px -58% 0px",
        threshold: [0, 0.25, 0.5, 0.75],
      },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  function openEvent(eventId: string) {
    setActiveEventId(eventId);
    setExpandedEventId(eventId);
    requestAnimationFrame(() => {
      cardsRef.current.get(eventId)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  }

  return (
    <section
      ref={pageRef}
      className="document-page extinction-page"
      data-tour-stop-id="page-extinctions"
    >
      <PageHeader
        eyebrow="История жизни"
        title="Глобальные вымирания: шесть кризисов жизни"
      >
        Эволюция идёт неровно. Климат, океаны, вулканы, удары из космоса не раз
        резко обрушивали разнообразие жизни. Уцелевшие ветви потом занимали
        освободившиеся ниши.
      </PageHeader>

      <nav
        className="extinction-event-nav"
        aria-label="Переходы по шести кризисам"
      >
        <span className="extinction-event-nav-label">Хронология</span>
        <div className="extinction-event-nav-track">
          {MASS_EXTINCTIONS.map((event, index) => {
            const label = EVENT_NAV_LABELS[event.id] ?? {
              title: event.titleRu,
              date: event.windowRu,
            };
            const isActive = event.id === activeEventId;
            return (
              <button
                key={event.id}
                type="button"
                className={isActive ? "is-active" : undefined}
                style={{ "--extinction-color": event.color } as CSSProperties}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${formatExtinctionTitleRu(event.titleRu)}, ${event.windowRu}`}
                onClick={() => openEvent(event.id)}
              >
                <span className="extinction-event-nav-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{label.title}</strong>
                  <small>{label.date}</small>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <section
        className="extinction-overview-band"
        aria-label="Как читать историю массовых вымираний"
      >
        <div className="extinction-overview">
          <article>
            <Waves aria-hidden="true" size={20} />
            <div>
              <h2>Жизнь сохраняется</h2>
              <p>Кризисы меняют состав экосистем и освобождают новые ниши.</p>
            </div>
          </article>
          <article>
            <RefreshCw aria-hidden="true" size={20} />
            <div>
              <h2>Ветви получают шанс</h2>
              <p>
                После рубежа 66 млн лет особенно быстро росли млекопитающие.
              </p>
            </div>
          </article>
          <article>
            <Clock3 aria-hidden="true" size={20} />
            <div>
              <h2>Кризис длится долго</h2>
              <p>Удар бывает резким, а вымирание и восстановление — долгими.</p>
            </div>
          </article>
        </div>
        <a
          className="extinction-material-link"
          href="/assets/materials/six-planet-apocalypses.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <FileText aria-hidden="true" size={21} />
          <span>
            <strong>Шесть апокалипсисов планеты</strong>
            <small>Слайды и диаграммы · PDF</small>
          </span>
          <ArrowRight aria-hidden="true" size={17} />
        </a>
      </section>

      <div
        className="extinction-timeline"
        aria-label="Шесть крупных кризисов биоразнообразия"
      >
        {MASS_EXTINCTIONS.map((event) => {
          const image = event.pageImage;
          const title = formatExtinctionTitleRu(event.titleRu);
          const isActive = event.id === activeEventId;
          const isExpanded = event.id === expandedEventId;
          const isCurrent = event.id === "holocene-anthropocene";

          return (
            <article
              key={event.id}
              id={`extinction-${event.id}`}
              ref={(node) => {
                if (node) cardsRef.current.set(event.id, node);
                else cardsRef.current.delete(event.id);
              }}
              data-event-id={event.id}
              className={`extinction-card${isActive ? " is-active" : ""}${
                isCurrent ? " is-current" : ""
              }`}
              style={
                {
                  borderColor: event.color,
                  "--extinction-color": event.color,
                } as CSSProperties
              }
            >
              <header className="extinction-card-header">
                <div className="extinction-card-meta">
                  <span className="extinction-card-date">{event.windowRu}</span>
                  {isCurrent ? (
                    <span className="extinction-live-badge">Продолжается</span>
                  ) : null}
                </div>
                <h2 id={`extinction-title-${event.id}`}>{title}</h2>
                <p className="extinction-loss">{event.lossRu}</p>
              </header>

              <div className="extinction-card-overview">
                <figure className="extinction-visual">
                  <button
                    type="button"
                    className="extinction-image-zoom"
                    aria-label={`Увеличить изображение: ${title}`}
                    onClick={() =>
                      setExpandedVisual({
                        src: image.src,
                        alt: image.altRu,
                        caption: `${title}. ${image.creditRu}`,
                      })
                    }
                  >
                    <OptimizedImage
                      src={image.src}
                      alt={image.altRu}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </figure>

                <div className="extinction-stat-grid">
                  <div>
                    <BarChart3 aria-hidden="true" size={18} />
                    <span>масштаб потерь</span>
                    <strong>{event.lossPercentRu}</strong>
                  </div>
                  <div>
                    <Sparkles aria-hidden="true" size={18} />
                    <span>главная причина</span>
                    <strong>{event.snapshotRu}</strong>
                  </div>
                  <div className="extinction-tempo-stat">
                    <Clock3 aria-hidden="true" size={18} />
                    <span>темп кризиса</span>
                    <strong>{event.tempoRu}</strong>
                  </div>
                  <div className="extinction-result-stat">
                    <RefreshCw aria-hidden="true" size={18} />
                    <span>итог</span>
                    <strong>{event.afterRu}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="extinction-details-toggle"
                aria-expanded={isExpanded}
                aria-controls={`extinction-details-${event.id}`}
                onClick={() => {
                  setActiveEventId(event.id);
                  setExpandedEventId((current) =>
                    current === event.id ? null : event.id,
                  );
                }}
              >
                <span>
                  <strong>
                    {isExpanded ? "Скрыть подробности" : "Подробнее"}
                  </strong>
                  <small>Причины, факты, наша ветвь и источники</small>
                </span>
                <ChevronDown aria-hidden="true" size={20} />
              </button>

              <div
                id={`extinction-details-${event.id}`}
                className="extinction-details"
                role="region"
                aria-label={`Подробности: ${title}`}
                hidden={!isExpanded}
              >
                <div className="extinction-details-grid">
                  <div className="extinction-causes">
                    <strong>
                      <Flame aria-hidden="true" size={16} />
                      Возможные причины
                    </strong>
                    <ul>
                      {event.likelyCausesRu.map((cause) => (
                        <li key={cause}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="extinction-facts">
                    <strong>Главное</strong>
                    <ul>
                      {event.keyFactsRu.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="extinction-relation">
                  <strong>Связь с нашей ветвью:</strong> {event.relationRu}
                </p>

                <div className="extinction-sources">
                  <strong>Источники</strong>
                  {event.sources.map((item) => (
                    <a
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ImageLightbox
        image={expandedVisual}
        ariaLabel="Иллюстрация массового вымирания крупно"
        onClose={() => setExpandedVisual(null)}
      />

      <div className="extinction-bridge">
        <div>
          <strong>Посмотреть, где это на шкале</strong>
          <p>
            Вернитесь в атлас и сравните рубеж 66 млн лет с появлением ранних
            приматов.
          </p>
        </div>
        <Link className="button button-secondary button-md" to="/">
          Открыть атлас
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
