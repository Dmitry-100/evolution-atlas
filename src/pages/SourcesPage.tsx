import { ExternalLink } from "lucide-react";
import { sortedStages } from "../data/lineage";
import { formatAgeRu } from "../lib/timeline";

export function SourcesPage() {
  return (
    <section className="document-page">
      <div className="document-header">
        <p className="eyebrow">Прозрачность</p>
        <h1>Источники, лицензии и изображения</h1>
        <p>
          В атласе есть два типа визуалов: локальные реконструкции для музейного повествования и изображения,
          привязанные к открытым источникам. Метаданные хранятся в одном датасете вместе с этапами.
        </p>
      </div>

      <div className="source-list">
        {sortedStages.map((stage) => (
          <article key={stage.id} className="source-card">
            <img src={stage.image.src} alt="" aria-hidden="true" />
            <div>
              <p className="kicker">{formatAgeRu(stage.ageMa)}</p>
              <h2>{stage.titleRu}</h2>
              <p>{stage.image.altRu}</p>
              <dl>
                <div>
                  <dt>Изображение</dt>
                  <dd>{stage.image.credit}</dd>
                </div>
                <div>
                  <dt>Лицензия</dt>
                  <dd>{stage.image.license}</dd>
                </div>
              </dl>
              <div className="source-links">
                <a href={stage.image.sourceUrl} target="_blank" rel="noreferrer">
                  sourceUrl
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
