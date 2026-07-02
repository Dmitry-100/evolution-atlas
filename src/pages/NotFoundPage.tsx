import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="document-page not-found-page">
      <div className="document-header">
        <p className="eyebrow">404</p>
        <h1>Такой ветви в Атласе нет</h1>
        <p>
          Ссылка могла устареть или в адресе появилась опечатка. Начните с
          главной шкалы, карты родства или подборки материалов.
        </p>
      </div>
      <div className="hero-actions">
        <Link className="button button-primary button-md" to="/">
          Вернуться в атлас
        </Link>
        <Link className="button button-secondary button-md" to="/cladogram">
          Открыть дерево родства
        </Link>
        <Link className="button button-secondary button-md" to="/materials">
          Материалы
        </Link>
      </div>
    </section>
  );
}
