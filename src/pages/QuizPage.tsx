import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/quiz.css";
import { QuizPanel } from "../components/atlas/QuizPanel";

export function QuizPage() {
  return (
    <section className="quiz-page" data-tour-stop-id="page-quiz">
      <PageHeader eyebrow="10 вопросов" title="Проверь себя">
        Несколько коротких вопросов, чтобы закрепить главную мысль: эволюция — это
        дерево родства, а не лестница к человеку.
      </PageHeader>

      <QuizPanel />
    </section>
  );
}
