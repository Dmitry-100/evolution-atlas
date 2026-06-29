import {
  ArrowRight,
  BarChart3,
  Clock3,
  FileText,
  Flame,
  RefreshCw,
  Sparkles,
  Waves,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "../components/ui/optimized-image";
import { formatExtinctionTitleRu, MASS_EXTINCTIONS } from "../data/extinctions";

export function ExtinctionsPage() {
  return (
    <section
      className="document-page extinction-page"
      data-tour-stop-id="page-extinctions"
    >
      <div className="document-header">
        <p className="eyebrow">История жизни</p>
        <h1>Глобальные вымирания: когда жизнь меняла направление</h1>
        <p>
          Эволюция идет не ровной линией. Иногда климат, океаны, вулканы или
          космические события резко сокращали разнообразие жизни, а выжившие
          ветви потом занимали новые экологические роли.
        </p>
      </div>

      <div className="extinction-overview">
        <article>
          <Waves aria-hidden="true" size={24} />
          <h2>Вымирание - не “конец жизни”</h2>
          <p>
            Даже самые тяжелые кризисы не стирали жизнь полностью. Они меняли
            состав экосистем: одни ветви исчезали, другие получали пространство
            для будущего разнообразия.
          </p>
        </article>
        <article>
          <RefreshCw aria-hidden="true" size={24} />
          <h2>После кризиса меняется сцена</h2>
          <p>
            Наша линия много раз проходила через такие фильтры. Особенно важен
            рубеж 66 млн лет назад: после него млекопитающим стало проще занять
            ниши, где позже появятся приматы.
          </p>
        </article>
        <article>
          <Clock3 aria-hidden="true" size={24} />
          <h2>Это редко “одна секунда”</h2>
          <p>
            Некоторые вымирания длились волнами миллионы лет. Другие начинались
            резко, как K-Pg, но даже тогда экологический коллапс и
            восстановление растягивались намного дольше самого удара.
          </p>
        </article>
      </div>

      <div className="extinction-material-link">
        <FileText aria-hidden="true" size={22} />
        <div>
          <strong>Связанная презентация</strong>
          <p>
            В материалах есть лекция “Шесть апокалипсисов планеты”: она
            раскрывает те же шесть кризисов с диаграммами и слайдами.
          </p>
        </div>
        <a
          className="button button-secondary button-md"
          href="/assets/materials/six-planet-apocalypses.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Открыть PDF
          <ArrowRight aria-hidden="true" size={17} />
        </a>
      </div>

      <div
        className="extinction-timeline"
        aria-label="Шесть крупных кризисов биоразнообразия"
      >
        {MASS_EXTINCTIONS.map((event) => {
          const image = event.pageImage;

          return (
            <article
              key={event.id}
              className="extinction-card"
              style={
                {
                  borderColor: event.color,
                  "--extinction-color": event.color,
                } as CSSProperties
              }
            >
              <figure className="extinction-visual">
                <OptimizedImage
                  src={image.src}
                  alt={image.altRu}
                  loading="lazy"
                  decoding="async"
                />
              </figure>

              <div className="extinction-card-body">
                <div className="extinction-card-date">{event.windowRu}</div>
                <h2>{formatExtinctionTitleRu(event.titleRu)}</h2>
                <p className="extinction-loss">{event.lossRu}</p>

                <div className="extinction-stat-grid">
                  <div>
                    <BarChart3 aria-hidden="true" size={18} />
                    <span>масштаб потерь</span>
                    <strong>{event.lossPercentRu}</strong>
                  </div>
                  <div>
                    <Sparkles aria-hidden="true" size={18} />
                    <span>что произошло</span>
                    <strong>{event.snapshotRu}</strong>
                  </div>
                  <div className="extinction-tempo-stat">
                    <Clock3 aria-hidden="true" size={18} />
                    <span>темп кризиса</span>
                    <strong>{event.tempoRu}</strong>
                  </div>
                </div>

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
                  <strong>Что важно запомнить</strong>
                  <ul>
                    {event.keyFactsRu.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                </div>

                <p>
                  <strong>После:</strong> {event.afterRu}
                </p>
                <p>
                  <strong>Связь с нашей ветвью:</strong> {event.relationRu}
                </p>

                <div className="extinction-sources">
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
