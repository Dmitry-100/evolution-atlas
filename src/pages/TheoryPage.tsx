import { BookOpenCheck, Network, ShieldCheck } from "lucide-react";
import { EvidenceSection } from "../components/atlas/EvidenceSection";

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

      <EvidenceSection />
    </section>
  );
}
