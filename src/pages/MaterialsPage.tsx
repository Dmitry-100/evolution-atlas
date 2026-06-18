import { BookOpen, ExternalLink, FileText, PlayCircle, Sparkles } from "lucide-react";
import { PORTAL_MATERIALS, READING_RECOMMENDATIONS, WATCH_RECOMMENDATIONS } from "../data/materials";

export function MaterialsPage() {
  return (
    <section className="document-page materials-page">
      <div className="document-header">
        <p className="eyebrow">Материалы</p>
        <h1>Презентации и лекции</h1>
        <p>
          Эти материалы можно читать как самостоятельные лекции или использовать как второй слой атласа. PDF открываются
          прямо в браузере и подходят для самостоятельного просмотра.
        </p>
      </div>

      <div className="materials-note">
        <Sparkles aria-hidden="true" size={22} />
        <p>
          В презентациях слайды хранятся как цельные изображения. Поэтому их лучше публиковать целиком, а для нативных
          страниц портала переносить идеи и факты отдельными карточками, схемами и текстом.
        </p>
      </div>

      <div className="materials-grid">
        {PORTAL_MATERIALS.map((material) => (
          <article key={material.id} className="material-card">
            <img src={material.coverSrc} alt="" aria-hidden="true" loading="lazy" decoding="async" />
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
            <p className="eyebrow">Что почитать</p>
            <h2 id="reading-title">Книги, которые хорошо продолжают портал</h2>
            <p>
              Короткая подборка из личной библиотеки: от доказательств
              эволюции и происхождения жизни до антропогенеза и дерева LUCA.
            </p>
          </div>
        </div>

        <div className="reading-grid">
          {READING_RECOMMENDATIONS.map((book) => (
            <article key={book.id} className="reading-card">
              <img src={book.coverSrc} alt={book.coverAltRu} loading="lazy" decoding="async" />
              <div className="reading-card-copy">
                <span>{book.themeRu}</span>
                <h3>{book.titleRu}</h3>
                <strong>{book.authorRu}</strong>
                <p>{book.descriptionRu}</p>
                <small>{book.whyReadRu}</small>
                <a className="button button-secondary button-sm" href={book.publisherHref} target="_blank" rel="noreferrer">
                  Страница издательства
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="materials-recommendations" aria-labelledby="watch-title">
        <div className="materials-section-heading">
          <PlayCircle aria-hidden="true" size={23} />
          <div>
            <p className="eyebrow">Что посмотреть</p>
            <h2 id="watch-title">Видео и лекции для следующего шага</h2>
            <p>
              Если хочется не только читать, но и почувствовать масштаб идеи:
              фильм, интервью про химическую неизбежность жизни и лекции по
              антропогенезу.
            </p>
          </div>
        </div>

        <div className="watch-grid">
          {WATCH_RECOMMENDATIONS.map((item) => (
            <article key={item.id} className="watch-card">
              <span>{item.formatRu}</span>
              <h3>{item.titleRu}</h3>
              <p>{item.descriptionRu}</p>
              <small>{item.whyWatchRu}</small>
              <a className="button button-secondary button-sm" href={item.href} target="_blank" rel="noreferrer">
                Открыть
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
