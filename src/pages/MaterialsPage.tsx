import { useEffect, useRef, useState } from "react";
import "../styles/pages/materials.css";
import { PageHeader } from "../components/ui/PageHeader";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Landmark,
  MapPin,
  PlayCircle,
} from "lucide-react";
import { OptimizedImage } from "../components/ui/optimized-image";
import {
  MUSEUM_RECOMMENDATIONS,
  READING_RECOMMENDATIONS,
  READING_TOPICS,
  type ReadingTopic,
  WATCH_RECOMMENDATIONS,
} from "../data/materials";

const materialSections = [
  {
    id: "materials-reading",
    label: "Книги",
    icon: BookOpen,
    count: READING_RECOMMENDATIONS.length,
  },
  {
    id: "materials-museums",
    label: "Музеи",
    icon: Landmark,
    count: MUSEUM_RECOMMENDATIONS.length,
  },
  {
    id: "materials-watch",
    label: "Видео",
    icon: PlayCircle,
    count: WATCH_RECOMMENDATIONS.length,
  },
];

export function MaterialsPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [readingTopic, setReadingTopic] = useState<ReadingTopic | "all">("all");
  const visibleBooks =
    readingTopic === "all"
      ? READING_RECOMMENDATIONS
      : READING_RECOMMENDATIONS.filter((book) =>
          book.topics.includes(readingTopic),
        );

  useEffect(() => {
    const header = document.querySelector(".topbar");
    if (!header) return;
    const update = () =>
      pageRef.current?.style.setProperty(
        "--materials-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={pageRef}
      className="document-page materials-page"
      data-tour-stop-id="page-materials"
    >
      <PageHeader
        eyebrow="Дополнительные материалы"
        title="Книги, музеи и видео"
      >
        Продолжите знакомство с эволюцией: книги для чтения, музеи для посещения
        и лекции для просмотра после разделов Атласа.
      </PageHeader>

      <nav className="materials-page-nav" aria-label="Разделы материалов">
        {materialSections.map(({ id, label, icon: Icon, count }) => (
          <a key={id} href={`#${id}`}>
            <Icon aria-hidden="true" size={18} />
            <span>{label}</span>
            <small>{count}</small>
          </a>
        ))}
      </nav>

      <section
        id="materials-reading"
        className="materials-recommendations"
        aria-labelledby="reading-title"
      >
        <div className="materials-section-heading">
          <BookOpen aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Книжная полка</p>
            <h2 id="reading-title">Что почитать</h2>
            <p>
              Короткая подборка из личной библиотеки: от доказательств эволюции,
              генетики и происхождения жизни до антропогенеза и дерева LUCA.
            </p>
          </div>
        </div>

        <div className="reading-filter-bar">
          <div className="reading-filters" role="group" aria-label="Темы книг">
            <button
              type="button"
              aria-pressed={readingTopic === "all"}
              aria-controls="reading-list"
              onClick={() => setReadingTopic("all")}
            >
              Все <span>{READING_RECOMMENDATIONS.length}</span>
            </button>
            {READING_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                aria-pressed={readingTopic === topic.id}
                aria-controls="reading-list"
                onClick={() => setReadingTopic(topic.id)}
              >
                {topic.labelRu}{" "}
                <span>
                  {
                    READING_RECOMMENDATIONS.filter((book) =>
                      book.topics.includes(topic.id),
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          <p className="reading-result-count" role="status">
            Показано {visibleBooks.length} из {READING_RECOMMENDATIONS.length}
          </p>
        </div>
        <div id="reading-list" className="reading-grid">
          {visibleBooks.map((book) => (
            <article key={book.id} className="reading-card">
              {book.coverSrc ? (
                <OptimizedImage
                  src={book.coverSrc}
                  alt={book.coverAltRu ?? ""}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="reading-card-cover-placeholder"
                  aria-hidden="true"
                >
                  <span>{book.authorRu}</span>
                  <strong>{book.titleRu}</strong>
                </div>
              )}
              <div className="reading-card-copy">
                <div className="reading-card-intro">
                  <span className="recommendation-kicker">{book.themeRu}</span>
                  <h3>{book.titleRu}</h3>
                  <strong className="reading-author">{book.authorRu}</strong>
                </div>
                <p>{book.descriptionRu}</p>
                <small>{book.whyReadRu}</small>
                <a
                  className="button button-secondary button-sm"
                  href={book.publisherHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {book.linkLabelRu ?? "Страница издательства"}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="materials-museums"
        className="materials-recommendations"
        aria-labelledby="museum-title"
      >
        <div className="materials-section-heading">
          <Landmark aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Музеи Москвы</p>
            <h2 id="museum-title">Куда сходить</h2>
            <p>
              Если хочется увидеть эволюцию вживую: витрины, скелеты,
              ископаемые, живые коллекции.
            </p>
          </div>
        </div>

        <div className="museum-grid">
          {MUSEUM_RECOMMENDATIONS.map((museum) => (
            <article key={museum.id} className="museum-card">
              <span>{museum.focusRu}</span>
              <h3>{museum.titleRu}</h3>
              <p className="museum-card-address">
                <MapPin aria-hidden="true" size={15} />
                {museum.addressRu}
              </p>
              <p>{museum.descriptionRu}</p>
              <small>{museum.whyVisitRu}</small>
              <a
                className="button button-secondary button-sm"
                href={museum.href}
                target="_blank"
                rel="noreferrer"
              >
                Сайт музея
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        id="materials-watch"
        className="materials-recommendations"
        aria-labelledby="watch-title"
      >
        <div className="materials-section-heading">
          <PlayCircle aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Видео и лекции</p>
            <h2 id="watch-title">Что посмотреть</h2>
            <p>
              Следующий шаг после чтения: фильм, интервью о химической
              неизбежности жизни, лекции по антропогенезу.
            </p>
          </div>
        </div>

        <div className="watch-grid">
          {WATCH_RECOMMENDATIONS.map((item) => (
            <article key={item.id} className="watch-card">
              <a
                className="watch-card-media"
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.titleRu}
              >
                <OptimizedImage
                  src={item.imageSrc}
                  alt={item.imageAltRu}
                  loading="lazy"
                  decoding="async"
                />
                <PlayCircle aria-hidden="true" size={32} />
              </a>
              <div className="watch-card-copy">
                <span>{item.formatRu}</span>
                <h3>{item.titleRu}</h3>
                <p>{item.descriptionRu}</p>
                <small>{item.whyWatchRu}</small>
                <a
                  className="button button-secondary button-sm"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Смотреть
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
