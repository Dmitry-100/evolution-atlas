import { ExternalLink } from "lucide-react";
import { OptimizedImage } from "../components/ui/optimized-image";
import { sortedStages } from "../data/lineage";
import { SCIENCE_SOURCE_GROUPS, SCIENCE_SOURCE_KIND_LABELS } from "../data/scienceSources";
import { formatAgeRu } from "../lib/timeline";

const cleanCredit = (value: string) =>
  value.replaceAll(" / локальная музейная обработка", " / музейная обработка");

const readableLicense = (value: string) => {
  if (value === "см. исходный источник") {
    return "указана на странице источника";
  }

  if (value === "см. страницу файла") {
    return "указана на странице файла";
  }

  return value;
};

export function SourcesPage() {
  return (
    <section className="document-page" data-tour-stop-id="page-sources">
      <div className="document-header">
        <p className="eyebrow">Прозрачность</p>
        <h1>Источники, лицензии и изображения</h1>
        <p>
          Здесь собраны изображения, авторские указания и ссылки, по которым можно проверить визуальные материалы
          атласа. Если для этапа использована реконструкция, она помечена отдельно.
        </p>
      </div>

      <section className="science-sources" aria-labelledby="science-sources-title">
        <div className="science-sources-heading">
          <p className="eyebrow">Научный слой</p>
          <h2 id="science-sources-title">Фактологическая база по разделам</h2>
          <p>
            Здесь собраны обзорные, музейные и первичные источники, которые поддерживают основные утверждения портала.
            Ниже отдельно остаются лицензии и происхождение изображений.
          </p>
        </div>

        <div className="science-source-grid">
          {SCIENCE_SOURCE_GROUPS.map((group) => (
            <article key={group.id} className="science-source-card">
              <div className="science-source-card-heading">
                <a href={group.routeHref}>{group.titleRu}</a>
                <p>{group.noteRu}</p>
              </div>
              <div className="science-source-links">
                {group.sources.map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                    <span>{SCIENCE_SOURCE_KIND_LABELS[source.kind]}</span>
                    <strong>{source.label}</strong>
                    <small>{source.noteRu}</small>
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="source-list">
        {sortedStages.map((stage) => (
          <article key={stage.id} className="source-card">
            <figure className="source-card-media" aria-hidden="true">
              <OptimizedImage src={stage.image.src} alt="" loading="lazy" decoding="async" />
            </figure>
            <div className="source-card-copy">
              <p className="kicker">{formatAgeRu(stage.ageMa)}</p>
              <h2>{stage.titleRu}</h2>
              <p>{stage.image.altRu}</p>
              <dl>
                <div>
                  <dt>Изображение</dt>
                  <dd>{cleanCredit(stage.image.credit)}</dd>
                </div>
                <div>
                  <dt>Лицензия</dt>
                  <dd>{readableLicense(stage.image.license)}</dd>
                </div>
              </dl>
              <div className="source-links">
                <a href={stage.image.sourceUrl} target="_blank" rel="noreferrer">
                  Источник изображения
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
                {stage.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
