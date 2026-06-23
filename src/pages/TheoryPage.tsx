import { BookOpenCheck, Network, ScrollText, ShieldCheck } from "lucide-react";
import { EvidenceSection } from "../components/atlas/EvidenceSection";
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { OptimizedImage } from "../components/ui/optimized-image";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";

const principles = [
  {
    icon: ShieldCheck,
    title: "Не догадка, а объяснительная система",
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

export function TheoryPage() {
  return (
    <section className="document-page theory-page">
      <div className="document-header">
        <p className="eyebrow">Теория эволюции</p>
        <h1>Почему эволюция называется теорией</h1>
        <p>
          В бытовой речи “теория” часто звучит как предположение. В науке это слово означает намного более строгую
          вещь: проверяемое объяснение, которое связывает факты и делает предсказания.
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
          <h2>Не лестница прогресса, а дерево родства</h2>
          <p>
            В 1859 году Чарльз Дарвин опубликовал “Происхождение видов” и предложил механизм естественного отбора:
            наследуемые различия помогают одним организмам оставлять больше потомков, и популяции меняются поколение за
            поколением.
          </p>
          <p>
            Дарвин не знал ДНК и генов, но верно увидел общий принцип: виды имеют историю, родство и меняются под
            действием наследственной изменчивости и отбора. Современная теория эволюции шире Дарвина: к отбору
            добавились генетика, палеонтология и статистические модели родства.
          </p>
          <div className="darwin-flow" aria-label="Как работает дарвиновская идея">
            <span>
              <strong>01</strong>
              есть различия
            </span>
            <span>
              <strong>02</strong>
              часть различий наследуется
            </span>
            <span>
              <strong>03</strong>
              среда меняет шансы потомства
            </span>
            <span>
              <strong>04</strong>
              линии ветвятся со временем
            </span>
          </div>
        </div>
      </article>

      <CuriosityFacts
        factIds={CURIOSITY_FACT_PAGE_GROUPS.theory}
        eyebrow="Масштаб времени"
        title="Человек появляется почти у полуночи"
        description="Глубокое время помогает почувствовать, почему эволюция не сводится к человеческой истории."
        headingId="theory-curiosity-facts"
      />

      <EvidenceSection />
    </section>
  );
}
