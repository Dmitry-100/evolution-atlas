import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  createQuizAttempt,
  isQuizAnswerCorrect,
  scoreQuiz,
  type BranchChoiceQuizQuestion,
  type OrderQuizQuestion,
  type QuizAnswerValue,
  type QuizScoreResult,
  type SingleChoiceQuizQuestion,
} from "../../data/quiz";
import { trackGoal } from "../../lib/analytics";

export function QuizPanel() {
  const [attemptQuestions, setAttemptQuestions] = useState(() =>
    createQuizAttempt(),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string[]>>({});
  const [isFinished, setIsFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const shouldFocusHeading = useRef(false);
  const question = attemptQuestions[questionIndex];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const hasSubmittedAnswer = selectedAnswer !== undefined;
  const isCurrentAnswerCorrect = question
    ? isQuizAnswerCorrect(question, selectedAnswer)
    : false;
  const result = useMemo(
    () => scoreQuiz(answers, attemptQuestions),
    [answers, attemptQuestions],
  );
  const completedCount = Object.keys(answers).length;

  useEffect(() => {
    if (shouldFocusHeading.current) {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
      shouldFocusHeading.current = false;
    }
  }, [questionIndex, isFinished, attemptQuestions]);

  useEffect(() => {
    if (hasSubmittedAnswer && !isFinished) {
      if (question?.type === "order") {
        feedbackRef.current?.focus({ preventScroll: true });
      }
      feedbackRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [hasSubmittedAnswer, isFinished, question?.type]);

  function selectAnswer(answer: QuizAnswerValue) {
    if (!question || hasSubmittedAnswer) {
      return;
    }
    if (Object.keys(answers).length === 0) {
      trackGoal("quiz_started", { questions: attemptQuestions.length });
    }
    setAnswers((current) => ({ ...current, [question.id]: answer }));
  }

  function orderFor(questionToOrder: OrderQuizQuestion) {
    return (
      orderDrafts[questionToOrder.id] ??
      questionToOrder.items.map((item) => item.id)
    );
  }

  function moveOrderItem(
    questionToOrder: OrderQuizQuestion,
    itemIndex: number,
    direction: -1 | 1,
  ) {
    if (answers[questionToOrder.id] !== undefined) {
      return;
    }

    const currentOrder = orderFor(questionToOrder);
    const nextIndex = itemIndex + direction;
    if (nextIndex < 0 || nextIndex >= currentOrder.length) {
      return;
    }

    const nextOrder = [...currentOrder];
    [nextOrder[itemIndex], nextOrder[nextIndex]] = [
      nextOrder[nextIndex],
      nextOrder[itemIndex],
    ];
    setOrderDrafts((current) => ({
      ...current,
      [questionToOrder.id]: nextOrder,
    }));
  }

  function submitOrder(questionToOrder: OrderQuizQuestion) {
    selectAnswer(orderFor(questionToOrder));
  }

  function moveNext() {
    if (!hasSubmittedAnswer) return;
    shouldFocusHeading.current = true;
    if (questionIndex < attemptQuestions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    trackGoal("quiz_completed", {
      correct: result.correct,
      total: result.total,
    });
    setIsFinished(true);
  }

  function restart() {
    shouldFocusHeading.current = true;
    setAttemptQuestions(createQuizAttempt());
    setQuestionIndex(0);
    setAnswers({});
    setOrderDrafts({});
    setIsFinished(false);
  }

  return (
    <section className="quiz-panel" aria-label="Тест по Атласу">
      <div className="quiz-progress">
        <div className="quiz-progress-label">
          <span>
            {isFinished
              ? "Тест завершён"
              : `Вопрос ${questionIndex + 1} из ${attemptQuestions.length}`}
          </span>
        </div>
        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-label="Пройдено вопросов"
          aria-valuemin={0}
          aria-valuemax={attemptQuestions.length}
          aria-valuenow={completedCount}
        >
          {attemptQuestions.map((item, index) => (
            <span
              key={item.id}
              className={
                answers[item.id] !== undefined
                  ? "is-complete"
                  : index === questionIndex && !isFinished
                    ? "is-current"
                    : ""
              }
            />
          ))}
        </div>
      </div>

      {isFinished || !question ? (
        <QuizResult
          result={result}
          onRestart={restart}
          headingRef={headingRef}
        />
      ) : (
        <div className="quiz-body" key={question.id}>
          <h2 id="quiz-question" ref={headingRef} tabIndex={-1}>
            {question.promptRu}
          </h2>
          {question.type === "single-choice" ? (
            <SingleChoiceQuestion
              question={question}
              selectedAnswer={selectedAnswer}
              onSelect={selectAnswer}
            />
          ) : null}
          {question.type === "order" ? (
            <OrderQuestion
              question={question}
              orderIds={orderFor(question)}
              hasSubmittedAnswer={hasSubmittedAnswer}
              onMove={moveOrderItem}
              onSubmit={submitOrder}
            />
          ) : null}
          {question.type === "branch-choice" ? (
            <BranchChoiceQuestion
              question={question}
              selectedAnswer={selectedAnswer}
              onSelect={selectAnswer}
            />
          ) : null}

          {hasSubmittedAnswer ? (
            <div className="quiz-feedback" ref={feedbackRef} tabIndex={-1}>
              <div
                className={
                  isCurrentAnswerCorrect
                    ? "quiz-explanation is-correct"
                    : "quiz-explanation is-wrong"
                }
                role="status"
              >
                <strong>
                  {isCurrentAnswerCorrect ? (
                    <CheckCircle2 aria-hidden="true" size={19} />
                  ) : (
                    <XCircle aria-hidden="true" size={19} />
                  )}
                  {isCurrentAnswerCorrect ? "Верно" : "Не совсем"}
                </strong>
                <p>{question.explanationRu}</p>
              </div>
              <button
                className="button button-primary button-md quiz-next"
                type="button"
                onClick={moveNext}
              >
                {questionIndex === attemptQuestions.length - 1
                  ? "Показать результат"
                  : "Следующий вопрос"}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
          ) : question.type !== "order" ? (
            <p className="quiz-hint">
              Выберите один ответ — затем появится объяснение.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function SingleChoiceQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: SingleChoiceQuizQuestion;
  selectedAnswer: QuizAnswerValue | undefined;
  onSelect: (answer: QuizAnswerValue) => void;
}) {
  const selectedOptionId =
    typeof selectedAnswer === "string" ? selectedAnswer : undefined;
  const showState = selectedAnswer !== undefined;

  return (
    <div className="quiz-options" role="group" aria-labelledby="quiz-question">
      {question.options.map((option, index) => {
        const isSelected = selectedOptionId === option.id;
        const className = [
          "quiz-option",
          isSelected ? "is-selected" : "",
          showState && option.isCorrect ? "is-correct" : "",
          showState && isSelected && !option.isCorrect ? "is-wrong" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <QuizChoice
            key={option.id}
            className={className}
            index={index}
            text={option.textRu}
            isSelected={isSelected}
            isCorrect={option.isCorrect}
            showState={showState}
            onSelect={() => onSelect(option.id)}
          />
        );
      })}
    </div>
  );
}

function QuizChoice({
  className,
  index,
  text,
  detail,
  isSelected,
  isCorrect,
  showState,
  onSelect,
}: {
  className: string;
  index: number;
  text: string;
  detail?: string;
  isSelected: boolean;
  isCorrect: boolean;
  showState: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`quiz-answer ${className}`}
      type="button"
      aria-pressed={isSelected}
      aria-disabled={showState}
      tabIndex={showState && !isSelected ? -1 : 0}
      onClick={() => {
        if (!showState) onSelect();
      }}
    >
      <span className="quiz-answer-marker" aria-hidden="true">
        {showState && isCorrect ? (
          <CheckCircle2 size={21} />
        ) : showState && isSelected ? (
          <XCircle size={21} />
        ) : (
          String(index + 1).padStart(2, "0")
        )}
      </span>
      <span className="quiz-answer-copy">
        <span className={detail ? "quiz-answer-title" : undefined}>{text}</span>
        {detail ? <span className="quiz-answer-detail">{detail}</span> : null}
      </span>
      {showState && (isSelected || isCorrect) ? (
        <span className="quiz-answer-state">
          {isCorrect
            ? isSelected
              ? "Верно · ваш ответ"
              : "Верный ответ"
            : "Ваш ответ"}
        </span>
      ) : null}
    </button>
  );
}

function OrderQuestion({
  question,
  orderIds,
  hasSubmittedAnswer,
  onMove,
  onSubmit,
}: {
  question: OrderQuizQuestion;
  orderIds: string[];
  hasSubmittedAnswer: boolean;
  onMove: (
    question: OrderQuizQuestion,
    itemIndex: number,
    direction: -1 | 1,
  ) => void;
  onSubmit: (question: OrderQuizQuestion) => void;
}) {
  return (
    <div className="quiz-order">
      <p className="quiz-instruction">{question.instructionRu}</p>
      <ol className="quiz-order-list">
        {orderIds.map((itemId, index) => {
          const item = question.items.find(
            (candidate) => candidate.id === itemId,
          );
          if (!item) return null;

          return (
            <li key={item.id} className="quiz-order-item">
              <span className="quiz-order-index">{index + 1}</span>
              <span>{item.textRu}</span>
              <div className="quiz-order-controls">
                <button
                  type="button"
                  aria-label={`Поднять ${item.textRu}`}
                  disabled={hasSubmittedAnswer || index === 0}
                  onClick={() => onMove(question, index, -1)}
                >
                  <ArrowUp aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Опустить ${item.textRu}`}
                  disabled={hasSubmittedAnswer || index === orderIds.length - 1}
                  onClick={() => onMove(question, index, 1)}
                >
                  <ArrowDown aria-hidden="true" size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {!hasSubmittedAnswer ? (
        <button
          className="button button-secondary button-md"
          type="button"
          onClick={() => onSubmit(question)}
        >
          Проверить
        </button>
      ) : null}
    </div>
  );
}

function BranchChoiceQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: BranchChoiceQuizQuestion;
  selectedAnswer: QuizAnswerValue | undefined;
  onSelect: (answer: QuizAnswerValue) => void;
}) {
  const selectedNodeId =
    typeof selectedAnswer === "string" ? selectedAnswer : undefined;
  const showState = selectedAnswer !== undefined;

  return (
    <div className="quiz-branch">
      <p className="quiz-instruction">{question.instructionRu}</p>
      <div
        className="quiz-branch-options"
        role="group"
        aria-labelledby="quiz-question"
      >
        {question.nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isCorrect = node.id === question.correctNodeId;
          const className = [
            "quiz-branch-node",
            isSelected ? "is-selected" : "",
            showState && isCorrect ? "is-correct" : "",
            showState && isSelected && !isCorrect ? "is-wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <QuizChoice
              key={node.id}
              className={className}
              index={index}
              text={node.textRu}
              detail={node.detailRu}
              isSelected={isSelected}
              isCorrect={isCorrect}
              showState={showState}
              onSelect={() => onSelect(node.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function QuizResult({
  result,
  onRestart,
  headingRef,
}: {
  result: QuizScoreResult;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const hasRecommendations = result.recommendedTopics.length > 0;
  const isPerfect = result.correct === result.total;
  const darwinTitle = isPerfect
    ? "Мистер Дарвин снимает шляпу"
    : result.correct >= 8
      ? "Дарвин доволен вашей наблюдательностью"
      : result.correct >= 5
        ? "Дарвин видит рабочую гипотезу"
        : "Дарвин предлагает вернуться к наблюдениям";
  const darwinCopy = isPerfect
    ? "Особенная благодарность от Дарвина: вы уверенно видите, что жизнь ветвится, наследует и меняется."
    : "Ошибки здесь полезны: они показывают, какие ветви дерева стоит рассмотреть внимательнее.";

  return (
    <div className="quiz-result">
      <div className="quiz-result-summary">
        <div>
          <p className="quiz-result-label">Ваш результат</p>
          <h2 className="quiz-score" ref={headingRef} tabIndex={-1}>
            {result.correct} <span>из {result.total}</span>
          </h2>
        </div>
        <div className="quiz-darwin-note">
          <p className="quiz-result-label">Оценка Дарвина</p>
          <h3>{darwinTitle}</h3>
          <p>{darwinCopy}</p>
        </div>
      </div>

      <section className="quiz-route" aria-labelledby="quiz-route-heading">
        <h3 id="quiz-route-heading">Ваш маршрут</h3>
        {hasRecommendations ? (
          <div className="quiz-route-grid">
            {result.recommendedTopics.map((topic) => (
              <article key={topic.id} className="quiz-route-card">
                <strong>{topic.titleRu}</strong>
                <p>{topic.practiceRu}</p>
                <div className="quiz-route-links">
                  {topic.links.map((link) => (
                    <Link key={link.href} to={link.href}>
                      {link.labelRu} <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="quiz-route-perfect">
            <strong>Вы уверенно видите дерево родства.</strong>
            <p>
              Можно идти глубже: сравнить ветви, молекулярные следы и материалы
              для закрепления.
            </p>
            <div className="quiz-route-links">
              <Link to="/cladogram">
                Дерево родства <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link to="/genetics">
                РНК/ДНК <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link to="/materials">
                Материалы <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>

      <button
        className="button button-secondary button-md"
        type="button"
        onClick={onRestart}
      >
        <RotateCcw aria-hidden="true" size={17} />
        Пройти ещё раз
      </button>
    </div>
  );
}
