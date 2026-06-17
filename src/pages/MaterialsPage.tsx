import { Download, ExternalLink, FileText, Presentation, Sparkles } from "lucide-react";
import { PORTAL_MATERIALS } from "../data/materials";

export function MaterialsPage() {
  return (
    <section className="document-page materials-page">
      <div className="document-header">
        <p className="eyebrow">Материалы</p>
        <h1>Презентации и лекции</h1>
        <p>
          Эти материалы можно читать как самостоятельные лекции или использовать как второй слой атласа. PDF открывается
          прямо в браузере, PPTX можно скачать и редактировать.
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

              <div className="material-use">
                <strong>Как использовать на портале</strong>
                <ul>
                  {material.portalUseRu.map((item) => (
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
                <a className="button button-ghost button-sm" href={material.pptxHref} download>
                  <Presentation aria-hidden="true" size={16} />
                  Скачать PPTX
                  <Download aria-hidden="true" size={14} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
