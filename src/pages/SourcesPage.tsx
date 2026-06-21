import { ExternalLink } from "lucide-react";
import { sortedStages } from "../data/lineage";
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
    <section className="document-page">
      <div className="document-header">
        <p className="eyebrow">Прозрачность</p>
        <h1>Источники, лицензии и изображения</h1>
        <p>
          Здесь собраны изображения, авторские указания и ссылки, по которым можно проверить визуальные материалы
          атласа. Если для этапа использована реконструкция, она помечена отдельно.
        </p>
      </div>

      <div className="source-list">
        {sortedStages.map((stage) => (
          <article key={stage.id} className="source-card">
            <img src={stage.image.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div>
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
