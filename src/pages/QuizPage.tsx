import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/quiz.css";
import { QuizPanel } from "../components/atlas/QuizPanel";
import { QUIZ_ATTEMPT_SIZE } from "../data/quiz";

export function QuizPage() {
  return (
    <section className="quiz-page" data-tour-stop-id="page-quiz">
      <PageHeader
        eyebrow={`${QUIZ_ATTEMPT_SIZE} вопросов по Атласу`}
        title="Проверь себя"
      >
        Проверьте, как вы разобрались в эволюции. После каждого ответа —
        объяснение, в конце — результат и темы для повторения.
      </PageHeader>

      <QuizPanel />
    </section>
  );
}
