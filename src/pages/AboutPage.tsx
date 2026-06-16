import { Code2, GitBranch, Server } from "lucide-react";

const cards = [
  {
    icon: Code2,
    title: "Стек",
    text: "Vite SPA, React, TypeScript, Tailwind и shadcn-compatible Radix primitives. Без серверного runtime.",
  },
  {
    icon: GitBranch,
    title: "Источник правды",
    text: "GitHub хранит код и данные. Домашний сервер только подтягивает проект, собирает его и раздает статический dist.",
  },
  {
    icon: Server,
    title: "Деплой",
    text: "Caddy или nginx отдает dist/ с fallback на index.html, поэтому маршруты /sources и /about работают как SPA.",
  },
];

export function AboutPage() {
  return (
    <section className="document-page">
      <div className="document-header">
        <p className="eyebrow">О проекте</p>
        <h1>Evolution Atlas как полноценный статический проект</h1>
        <p>
          Цель проекта - объяснить происхождение человека так, чтобы человек без биологической подготовки сразу понял
          маршрут и захотел пройти по нему дальше.
        </p>
      </div>

      <div className="about-grid">
        {cards.map(({ icon: Icon, title, text }) => (
          <article key={title} className="about-card">
            <Icon aria-hidden="true" size={24} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="deploy-note">
        <h2>Домашний production</h2>
        <p>
          Команда деплоя: <code>scripts/deploy-home.sh</code>. Она делает pull, устанавливает зависимости, собирает проект
          и оставляет веб-серверу только готовую папку <code>dist/</code>.
        </p>
      </div>
    </section>
  );
}
