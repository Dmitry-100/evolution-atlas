import { describe, expect, it } from "vitest";
import { QUIZ_QUESTIONS, scoreQuiz } from "./quiz";

describe("quiz data", () => {
  it("starts with the atlas hook question", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(4);
    expect(QUIZ_QUESTIONS[0]?.promptRu).toMatch(/от кого произошла обезьяна/i);
    expect(QUIZ_QUESTIONS[0]?.options.some((option) => option.isCorrect)).toBe(true);
  });

  it("scores selected answers", () => {
    const answers = Object.fromEntries(QUIZ_QUESTIONS.map((question) => [question.id, question.options.find((option) => option.isCorrect)!.id]));

    expect(scoreQuiz(answers)).toEqual({
      correct: QUIZ_QUESTIONS.length,
      total: QUIZ_QUESTIONS.length,
    });
  });
});
