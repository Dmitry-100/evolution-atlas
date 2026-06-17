import { CalendarDays } from "lucide-react";
import type { CSSProperties } from "react";
import type { EvolutionStage } from "../../data/lineage";
import { mapAgeToLifeYear } from "../../lib/deepTimeCalendar";

type DeepTimeCalendarPanelProps = {
  activeStage: EvolutionStage;
};

const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const milestones = [
  { label: "Старт жизни", ageMa: 4000 },
  { label: "Приматы", ageMa: 65 },
  { label: "Homo sapiens", ageMa: 0.3 },
] as const;

export function DeepTimeCalendarPanel({ activeStage }: DeepTimeCalendarPanelProps) {
  const activeDate = mapAgeToLifeYear(activeStage.ageMa);

  return (
    <section className="life-year-calendar" aria-labelledby="life-year-calendar-heading">
      <div className="life-year-heading">
        <CalendarDays aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Глубокое время</p>
          <h2 id="life-year-calendar-heading">4 млрд лет как один год</h2>
          <p>
            Если всю историю жизни сжать до календарного года, большая часть знакомых животных появится только в
            декабре, а человеческая история окажется в самом конце 31 декабря.
          </p>
        </div>
      </div>

      <div className="life-year-track" aria-label="Календарь сжатой истории жизни">
        <div className="life-year-months" aria-hidden="true">
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>

        <div className="life-year-line">
          {milestones.map((milestone) => {
            const date = mapAgeToLifeYear(milestone.ageMa);
            return (
              <span
                key={milestone.label}
                className="life-year-marker"
                style={{ "--calendar-position": `${date.share * 100}%` } as CSSProperties}
              >
                <strong>{milestone.label}</strong>
                <small>{date.labelRu}</small>
              </span>
            );
          })}

          <span
            className="life-year-marker is-active"
            style={{ "--calendar-position": `${activeDate.share * 100}%` } as CSSProperties}
          >
            <strong>{activeStage.titleRu}</strong>
            <small>{activeDate.labelRu}</small>
          </span>
        </div>
      </div>
    </section>
  );
}
