import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/extinctions.css";
import { ArrowRight, ChevronDown, FileText } from "lucide-react";
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
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef(new Map<string, HTMLElement>());
  const firstEventId = MASS_EXTINCTIONS[0]?.id ?? "";
  const [activeEventId, setActiveEventId] = useState(firstEventId);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
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

    let frame = 0;
    const updateActiveEvent = () => {
      frame = 0;
      const anchor =
        (navRef.current?.getBoundingClientRect().bottom ?? 180) + 24;
      const cardAtAnchor =
        cards.find((card) => {
          const rect = card.getBoundingClientRect();
          return rect.top <= anchor && rect.bottom > anchor;
        }) ??
        cards.reduce((nearest, card) => {
          const distance = Math.abs(card.getBoundingClientRect().top - anchor);
          const nearestDistance = Math.abs(
            nearest.getBoundingClientRect().top - anchor,
          );
          return distance < nearestDistance ? card : nearest;
        });

      if (cardAtAnchor.dataset.eventId) {
        setActiveEventId(cardAtAnchor.dataset.eventId);
      }
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveEvent);
    };

    updateActiveEvent();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  function openEvent(eventId: string) {
    setActiveEventId(eventId);
    setExpandedEventId(eventId);
    requestAnimationFrame(() => {
      cardsRef.current.get(eventId)?.scrollIntoView({
        behavior: "auto",
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

      <a
        className="extinction-pdf-link"
        href="/assets/materials/six-planet-apocalypses.pdf"
        target="_blank"
        rel="noreferrer"
        aria-label="Открыть PDF: Шесть апокалипсисов планеты"
      >
        <FileText aria-hidden="true" size={17} />
        <span>
          Шесть апокалипсисов планеты <span>· PDF</span>
        </span>
        <ArrowRight aria-hidden="true" size={15} />
      </a>

      <nav
        ref={navRef}
        className="extinction-event-nav"
        aria-label="Переходы по шести кризисам"
      >
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

      <div
        className="extinction-timeline"
        aria-label="Шесть крупных кризисов биоразнообразия"
      >
        {MASS_EXTINCTIONS.map((event, index) => {
          const image = event.image;
          const title = formatExtinctionTitleRu(event.titleRu);
          const isActive = event.id === activeEventId;
          const isExpanded = event.id === expandedEventId;
          const isCurrent = event.id === "holocene-anthropocene";
          const loss = /^(?:около|примерно)\s+(\d+(?:%| млн))\s+(.+)$/.exec(
            event.lossPercentRu,
          );

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
                  "--extinction-color": event.color,
                } as CSSProperties
              }
            >
              <header className="extinction-card-header">
                <div className="extinction-card-meta">
                  <span className="extinction-card-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="extinction-card-date">{event.windowRu}</span>
                  {isCurrent ? (
                    <span className="extinction-live-badge">Продолжается</span>
                  ) : null}
                </div>
                <h2 id={`extinction-title-${event.id}`}>{title}</h2>
                <p className="extinction-lead">{event.lossRu}</p>
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
                  <figcaption>Художественная AI-реконструкция</figcaption>
                </figure>

                <div className="extinction-summary">
                  <div className="extinction-loss-stat">
                    <span className="extinction-summary-label">
                      {isCurrent ? "Под угрозой" : "Масштаб потерь"}
                    </span>
                    <p>
                      <span className="sr-only">{event.lossPercentRu}</span>
                      {loss ? (
                        <span
                          className="extinction-loss-value"
                          aria-hidden="true"
                        >
                          <strong>≈{loss[1]}</strong>
                          <span>{loss[2]}</span>
                        </span>
                      ) : (
                        <span aria-hidden="true">{event.lossPercentRu}</span>
                      )}
                    </p>
                  </div>
                  <dl className="extinction-explanation">
                    {[
                      ["Что произошло", event.snapshotRu],
                      ["Как долго", event.tempoRu],
                      ["Что изменилось", event.afterRu],
                    ].map(([label, text]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          {text.charAt(0).toLocaleUpperCase("ru") +
                            text.slice(1)}
                        </dd>
                      </div>
                    ))}
                  </dl>
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
                    <strong>Возможные причины</strong>
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
