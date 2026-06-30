import {
  BookOpen,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  PlayCircle,
} from "lucide-react";
import { OptimizedImage } from "../components/ui/optimized-image";
import {
  MUSEUM_RECOMMENDATIONS,
  PORTAL_MATERIALS,
  READING_RECOMMENDATIONS,
  WATCH_RECOMMENDATIONS,
} from "../data/materials";

export function MaterialsPage() {
  return (
    <section className="document-page materials-page" data-tour-stop-id="page-materials">
      <div className="document-header">
        <p className="eyebrow">Дополнительные материалы</p>
        <h1>Презентации, книги, музеи и видео</h1>
        <p>
          Их можно читать отдельно или после разделов Атласа. PDF открываются
          прямо в браузере.
        </p>
      </div>

      <div className="materials-grid">
        {PORTAL_MATERIALS.map((material) => (
          <article key={material.id} className="material-card">
            <div className="material-card-media" aria-hidden="true">
              <OptimizedImage src={material.coverSrc} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="material-card-body">
              <div className="material-card-kicker">
                <span>{material.slideCount} слайдов</span>
                <span>{material.audienceRu}</span>
              </div>
              <h2>{material.titleRu}</h2>
              <p className="material-subtitle">{material.subtitleRu}</p>
              <p>{material.summaryRu}</p>

              <div className="material-tags" aria-label="Темы">
                {material.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="material-highlights">
                <strong>Что внутри</strong>
                <ul>
                  {material.highlightsRu.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="material-actions">
                <a className="button button-secondary button-sm" href={material.pdfHref} target="_blank" rel="noreferrer">
                  <FileText aria-hidden="true" size={16} />
                  Открыть PDF
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="materials-recommendations" aria-labelledby="reading-title">
        <div className="materials-section-heading">
          <BookOpen aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Книжная полка</p>
            <h2 id="reading-title">Что почитать</h2>
            <p>
              Короткая подборка из личной библиотеки: от доказательств
              эволюции, генетики и происхождения жизни до антропогенеза и
              дерева LUCA.
            </p>
          </div>
        </div>

        <div className="reading-grid">
          {READING_RECOMMENDATIONS.map((book) => (
            <article key={book.id} className="reading-card">
              {book.coverSrc ? (
                <OptimizedImage src={book.coverSrc} alt={book.coverAltRu ?? ""} loading="lazy" decoding="async" />
              ) : (
                <div className="reading-card-cover-placeholder" aria-hidden="true">
                  <span>{book.authorRu}</span>
                  <strong>{book.titleRu}</strong>
                </div>
              )}
              <div className="reading-card-copy">
                <span>{book.themeRu}</span>
                <h3>{book.titleRu}</h3>
                <strong>{book.authorRu}</strong>
                <p>{book.descriptionRu}</p>
                <small>{book.whyReadRu}</small>
                <a className="button button-secondary button-sm" href={book.publisherHref} target="_blank" rel="noreferrer">
                  {book.linkLabelRu ?? "Страница издательства"}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="materials-recommendations" aria-labelledby="museum-title">
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
              <a className="button button-secondary button-sm" href={museum.href} target="_blank" rel="noreferrer">
                Сайт музея
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="materials-recommendations" aria-labelledby="watch-title">
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
              <a className="watch-card-media" href={item.href} target="_blank" rel="noreferrer" aria-label={item.titleRu}>
                <OptimizedImage src={item.imageSrc} alt={item.imageAltRu} loading="lazy" decoding="async" />
                <PlayCircle aria-hidden="true" size={32} />
              </a>
              <div className="watch-card-copy">
                <span>{item.formatRu}</span>
                <h3>{item.titleRu}</h3>
                <p>{item.descriptionRu}</p>
                <small>{item.whyWatchRu}</small>
                <a className="button button-secondary button-sm" href={item.href} target="_blank" rel="noreferrer">
                  Открыть
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
