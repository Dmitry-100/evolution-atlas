import { describe, expect, it } from "vitest";
import {
  createQuizAttempt,
  QUIZ_ATTEMPT_SIZE,
  QUIZ_QUESTIONS,
  QUIZ_TOPICS,
  scoreQuiz,
  type QuizAnswerValue,
  type QuizQuestion,
} from "./quiz";

function questionById(id: string) {
  return QUIZ_QUESTIONS.find((question) => question.id === id);
}

function correctAnswerFor(question: QuizQuestion): QuizAnswerValue {
  if (question.type === "single-choice") {
    return question.options.find((option) => option.isCorrect)!.id;
  }

  if (question.type === "order") {
    return [...question.correctOrder];
  }

  return question.correctNodeId;
}

describe("quiz data", () => {
  it("starts with the atlas hook question", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(36);
    const firstQuestion = QUIZ_QUESTIONS[0];
    expect(firstQuestion?.promptRu).toMatch(/от кого произошла обезьяна/i);
    expect(firstQuestion?.type).toBe("single-choice");
    if (firstQuestion?.type !== "single-choice") throw new Error("First quiz question should be single-choice.");
    expect(firstQuestion.options.some((option) => option.isCorrect)).toBe(true);
  });

  it("contains a broad, valid question bank", () => {
    const ids = new Set(QUIZ_QUESTIONS.map((question) => question.id));
    const topicIds = new Set(Object.keys(QUIZ_TOPICS));
    expect(ids.size).toBe(QUIZ_QUESTIONS.length);

    for (const question of QUIZ_QUESTIONS) {
      expect(question.promptRu.trim().length).toBeGreaterThan(20);
      expect(question.explanationRu.trim().length).toBeGreaterThan(30);
      expect(topicIds.has(question.topicId)).toBe(true);

      if (question.type === "single-choice") {
        expect(question.options).toHaveLength(3);
        expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1);
        expect(new Set(question.options.map((option) => option.id)).size).toBe(3);
      }

      if (question.type === "order") {
        expect(question.items.length).toBeGreaterThanOrEqual(4);
        expect(new Set(question.items.map((item) => item.id)).size).toBe(question.items.length);
        expect(new Set(question.correctOrder)).toEqual(new Set(question.items.map((item) => item.id)));
      }

      if (question.type === "branch-choice") {
        expect(question.nodes).toHaveLength(3);
        expect(question.nodes.some((node) => node.id === question.correctNodeId)).toBe(true);
      }
    }

    const prompts = QUIZ_QUESTIONS.map((question) => question.promptRu).join(" ");
    expect(prompts).toMatch(/динозавр/i);
    expect(prompts).toMatch(/вымира/i);
    expect(prompts).toMatch(/Дарвин/i);
    expect(prompts).toMatch(/теори/i);
  });

  it("contains the planned interactive question formats", () => {
    const deepTime = questionById("deep-time");
    expect(deepTime?.type).toBe("order");
    if (deepTime?.type !== "order") throw new Error("deep-time should be an order question.");
    expect(deepTime.correctOrder).toEqual(["early-life", "vertebrates", "mammals", "primates", "sapiens"]);

    const mammalsLate = questionById("mammals-late");
    expect(mammalsLate?.type).toBe("order");
    if (mammalsLate?.type !== "order") throw new Error("mammals-late should be an order question.");
    expect(mammalsLate.correctOrder).toEqual(["early-life", "early-animals", "mammals", "primates"]);

    const chimpAncestor = questionById("chimp-common-ancestor");
    expect(chimpAncestor?.type).toBe("branch-choice");
    if (chimpAncestor?.type !== "branch-choice") throw new Error("chimp-common-ancestor should be a branch-choice question.");
    expect(chimpAncestor.correctNodeId).toBe("common-ancestor");

    const birds = questionById("birds-are-dinosaurs");
    expect(birds?.type).toBe("branch-choice");
    if (birds?.type !== "branch-choice") throw new Error("birds-are-dinosaurs should be a branch-choice question.");
    expect(birds.correctNodeId).toBe("birds");

    const dnaTree = questionById("dna-tree");
    expect(dnaTree?.type).toBe("branch-choice");
    if (dnaTree?.type !== "branch-choice") throw new Error("dna-tree should be a branch-choice question.");
    expect(dnaTree.correctNodeId).toBe("nested-tree");
  });

  it("sends human-lineage practice back to the dedicated primates section", () => {
    expect(QUIZ_TOPICS["human-lineage"].links).toContainEqual({
      labelRu: "Приматы → человек",
      href: "/primates",
    });
  });

  it("scores mixed answers and recommends topics with mistakes", () => {
    const perfectAnswers = Object.fromEntries(
      QUIZ_QUESTIONS.map((question) => [question.id, correctAnswerFor(question)]),
    ) as Record<string, QuizAnswerValue>;

    expect(scoreQuiz(perfectAnswers)).toMatchObject({
      correct: QUIZ_QUESTIONS.length,
      total: QUIZ_QUESTIONS.length,
      recommendedTopics: [],
    });

    const answersWithMistakes: Record<string, QuizAnswerValue> = {
      ...perfectAnswers,
      "deep-time": ["sapiens", "primates", "mammals", "vertebrates", "early-life"],
      "chimp-common-ancestor": "modern-chimp",
      "dna-tree": "ladder",
    };

    const result = scoreQuiz(answersWithMistakes);

    expect(result).toMatchObject({
      correct: QUIZ_QUESTIONS.length - 3,
      total: QUIZ_QUESTIONS.length,
    });
    expect(result.topicResults["deep-time"].wrong).toBe(1);
    expect(result.topicResults["human-lineage"].wrong).toBe(1);
    expect(result.topicResults["genetics-origin"].wrong).toBe(1);
    expect(result.recommendedTopics.map((topic) => topic.id)).toEqual([
      "deep-time",
      "human-lineage",
      "genetics-origin",
    ]);
  });

  it("creates a 10-question randomized attempt without mutating the question bank", () => {
    const sourceQuestions = QUIZ_QUESTIONS.slice(0, 12);
    const originalOrder = sourceQuestions.map((question) => question.id);
    const attempt = createQuizAttempt(sourceQuestions, QUIZ_ATTEMPT_SIZE, () => 0.7);

    expect(attempt).toHaveLength(QUIZ_ATTEMPT_SIZE);
    expect(new Set(attempt.map((question) => question.id)).size).toBe(QUIZ_ATTEMPT_SIZE);
    expect(attempt.every((question) => sourceQuestions.includes(question))).toBe(true);
    expect(sourceQuestions.map((question) => question.id)).toEqual(originalOrder);
  });

  it("scores only the questions from the current attempt", () => {
    const attemptQuestions = QUIZ_QUESTIONS.slice(0, QUIZ_ATTEMPT_SIZE);
    const answers = Object.fromEntries(
      attemptQuestions.map((question) => [question.id, correctAnswerFor(question)]),
    ) as Record<string, QuizAnswerValue>;

    const result = scoreQuiz(answers, attemptQuestions);

    expect(result.correct).toBe(QUIZ_ATTEMPT_SIZE);
    expect(result.total).toBe(QUIZ_ATTEMPT_SIZE);
    expect(result.recommendedTopics).toEqual([]);
  });
});
