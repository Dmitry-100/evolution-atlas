// CuriosityFacts uses the shared educational exhibit styles.
import "../styles/pages/origin-of-life.css";
import { BookOpenCheck, Network, ScrollText, ShieldCheck } from "lucide-react";
import { EvidenceFaq, EvidenceSection } from "../components/atlas/EvidenceSection";
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { OptimizedImage } from "../components/ui/optimized-image";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";

const principles = [
  {
    icon: ShieldCheck,
    title: "Система проверяемых объяснений",
    text: "Научная теория связывает много независимых фактов, выдерживает проверки и уточняется новыми данными.",
  },
  {
    icon: Network,
    title: "Предсказывает родство",
    text: "Ископаемые, анатомия и ДНК должны складываться в согласованное ветвящееся дерево. Для эволюции это работает.",
  },
  {
    icon: BookOpenCheck,
    title: "Проверяется разными способами",
    text: "Один и тот же вывод поддерживают породы, геномы, эмбриология, география видов и наблюдаемая эволюция.",
  },
];

const evolutionSteps = [
  { title: "Есть различия", text: "Организмы в популяции отличаются друг от друга." },
  { title: "Часть различий наследуется", text: "Потомки получают признаки от родителей." },
  { title: "Частоты признаков меняются", text: "На них влияют естественный отбор и дрейф генов." },
  { title: "Линии могут разойтись", text: "Со временем складывается ветвящееся родство." },
];

export function TheoryPage() {
  return (
    <section className="document-page theory-page" data-tour-stop-id="page-theory">
      <div className="document-header">
        <p className="eyebrow">Теория эволюции</p>
        <h1>Почему эволюция называется теорией</h1>
        <p>
          В науке теория — не догадка, а проверяемая система объяснений. Эволюцию
          подтверждают ископаемые, ДНК, анатомия, биогеография и наблюдаемые
          изменения популяций.
        </p>
      </div>

      <div className="theory-principles">
        {principles.map(({ icon: Icon, title, text }) => (
          <article key={title} className="theory-principle">
            <Icon aria-hidden="true" size={24} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <section className="theory-mechanism" aria-labelledby="theory-mechanism-title">
        <div className="theory-section-heading">
          <p className="eyebrow">От различий к ветвлению</p>
          <h2 id="theory-mechanism-title">Как работает эволюция</h2>
        </div>
        <ol className="darwin-flow" aria-label="Четыре шага эволюционных изменений">
          {evolutionSteps.map(({ title, text }, index) => (
            <li key={title}>
              <span className="darwin-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <EvidenceSection />

      <article className="darwin-spotlight">
        <figure className="darwin-portrait">
          <OptimizedImage
            src="/assets/images/theory/charles-darwin-portrait.jpg"
            alt="Портрет Чарльза Дарвина"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Чарльз Дарвин, XIX век</figcaption>
        </figure>
        <div className="darwin-copy">
          <div className="section-kicker">
            <ScrollText aria-hidden="true" size={22} />
            <span>Дарвин: идея, которая связала факты</span>
          </div>
          <h2>Дерево родства вместо лестницы прогресса</h2>
          <p>
            В 1858 году Чарльз Дарвин и Альфред Рассел Уоллес совместно представили идею естественного отбора, а в
            1859 году Дарвин развернул ее в книге “Происхождение видов”: наследуемые различия помогают одним организмам
            оставлять больше потомков, и популяции меняются поколение за поколением.
          </p>
          <p>
            Дарвин не знал ДНК и генов, но верно увидел общий принцип: виды имеют историю, родство и меняются через
            наследственную изменчивость, отбор и другие процессы. Современная теория эволюции шире Дарвина: к отбору
            добавились генетика, дрейф генов, палеонтология и статистические модели родства.
          </p>
        </div>
      </article>

      <CuriosityFacts
        factIds={CURIOSITY_FACT_PAGE_GROUPS.theory}
        eyebrow="Масштаб времени"
        title="Человек появляется почти у полуночи"
        description="Если сжать историю жизни в сутки, человек появляется за секунды до полуночи. Почти всё успело произойти без нас."
        headingId="theory-curiosity-facts"
      />

      <EvidenceFaq />
    </section>
  );
}
