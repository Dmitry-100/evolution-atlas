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
          В текущей версии каждая точка шкалы использует локально сохраненное изображение: найденный открытый материал
          там, где он читается хорошо, или явно помеченную AI-реконструкцию там, где источники дают только черепа и
          фрагменты. Метаданные, кредиты и лицензии хранятся в одном датасете вместе с этапами.
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
