import "./DarwinGuide.css";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Compass,
  ExternalLink,
  Loader2,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import type {
  DarwinGuideMessage,
  DarwinGuideRequest,
  DarwinGuideResponseData,
  DarwinGuideResult,
} from "../../lib/askDarwinHandler";
import { sortedStages } from "../../data/lineage";
import { DARWIN_TOUR_MENU_EVENT } from "../tour/DarwinWelcome";

type ChatEntry = {
  id: string;
  question: string;
  answer?: DarwinGuideResponseData;
  errorRu?: string;
};

function getApiUrl() {
  const baseUrl = import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/$/, "");
  return `${baseUrl ?? ""}/api/ask-darwin`;
}

function extractAtlasContext(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const modeParam = params.get("mode");
  const stageParam = params.get("stage");
  const stage = sortedStages.find(
    (item) => item.slug === stageParam || item.id === stageParam,
  );

  return {
    pagePath: `${pathname}${search}`,
    stageId: stage?.id,
    atlasMode:
      pathname === "/primates"
        ? "primates"
        : modeParam === "all" || modeParam === "primates"
          ? modeParam
          : undefined,
  } satisfies Pick<DarwinGuideRequest, "pagePath" | "stageId" | "atlasMode">;
}

function historyFromEntries(entries: ChatEntry[]): DarwinGuideMessage[] {
  return entries
    .flatMap((entry): DarwinGuideMessage[] => {
      if (!entry.answer) return [{ role: "user", content: entry.question }];

      return [
        { role: "user", content: entry.question },
        {
          role: "assistant",
          content: `${entry.answer.darwinAnswerRu}\n${entry.answer.modernNoteRu}`,
        },
      ];
    })
    .slice(-6);
}

async function askDarwin(request: DarwinGuideRequest) {
  const response = await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("AI endpoint failed");
  }

  return (await response.json()) as DarwinGuideResult;
}

function groundingLabel(answer: DarwinGuideResponseData) {
  return answer.grounding === "site" ? "по материалам сайта" : "с внешней справкой";
}

function confidenceLabel(answer: DarwinGuideResponseData) {
  const labels = {
    solid: "надежно",
    likely: "вероятно",
    debated: "обсуждается",
  } satisfies Record<DarwinGuideResponseData["confidence"], string>;

  return labels[answer.confidence];
}

function openTourGuideMenu() {
  window.dispatchEvent(new Event(DARWIN_TOUR_MENU_EVENT));
}

export function DarwinGuide() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [isPending, setIsPending] = useState(false);
  const atlasContext = useMemo(
    () => extractAtlasContext(location.pathname, location.search),
    [location.pathname, location.search],
  );

  function handleOpenTourGuideMenu() {
    openTourGuideMenu();
    setIsOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = question.trim();
    if (!message || isPending) return;

    const nextEntry: ChatEntry = {
      id: `${Date.now()}-${entries.length}`,
      question: message,
    };
    setEntries((current) => [...current, nextEntry]);
    setQuestion("");
    setIsPending(true);

    try {
      const result = await askDarwin({
        message,
        ...atlasContext,
        history: historyFromEntries(entries),
      });

      setEntries((current) =>
        current.map((entry) =>
          entry.id === nextEntry.id
            ? {
                ...entry,
                answer: result.ok ? result.data : undefined,
                errorRu: result.ok ? undefined : result.error.messageRu,
              }
            : entry,
        ),
      );
    } catch {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === nextEntry.id
            ? {
                ...entry,
                errorRu:
                  "AI-гид сейчас недоступен. Проверьте настройку /api/ask-darwin или попробуйте позже.",
              }
            : entry,
        ),
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <aside className="darwin-guide" aria-label="AI-гид Дарвин">
      {isOpen ? (
        <section
          className="darwin-guide-panel"
          role="dialog"
          aria-labelledby="darwin-guide-title"
        >
          <header className="darwin-guide-header">
            <div>
              <h2 id="darwin-guide-title">Спросить Дарвина</h2>
              <p>Дарвин + современный научный редактор</p>
            </div>
            <button
              type="button"
              className="darwin-guide-icon-button"
              aria-label="Закрыть AI-гид"
              onClick={() => setIsOpen(false)}
            >
              <X aria-hidden="true" size={18} />
            </button>
          </header>

          <div className="darwin-guide-thread" aria-live="polite">
            {entries.length === 0 ? (
              <div className="darwin-guide-empty">
                <Sparkles aria-hidden="true" size={20} />
                <p>Например: “почему человек не произошел от современной обезьяны?”</p>
                <button
                  type="button"
                  className="darwin-guide-tour-link"
                  onClick={handleOpenTourGuideMenu}
                >
                  <Compass aria-hidden="true" size={16} />
                  Подобрать экскурсию с Дарвином
                </button>
              </div>
            ) : (
              entries.map((entry) => (
                <article className="darwin-guide-entry" key={entry.id}>
                  <p className="darwin-guide-question">{entry.question}</p>
                  {entry.answer ? (
                    <div className="darwin-guide-answer">
                      <div className="darwin-guide-badges">
                        <span>{groundingLabel(entry.answer)}</span>
                        <span>{confidenceLabel(entry.answer)}</span>
                      </div>
                      <p>{entry.answer.darwinAnswerRu}</p>
                      <section>
                        <h3>Современная научная заметка</h3>
                        <p>{entry.answer.modernNoteRu}</p>
                      </section>
                      <section className="darwin-guide-sources">
                        <h3>Источники</h3>
                        {entry.answer.citations.map((citation) => (
                          <a
                            key={citation.url}
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {citation.label}
                            <ExternalLink aria-hidden="true" size={13} />
                          </a>
                        ))}
                      </section>
                      {entry.answer.relatedLinks.length > 0 ? (
                        <section className="darwin-guide-links">
                          <h3>Куда перейти</h3>
                          {entry.answer.relatedLinks.map((link) => (
                            <Link key={link.href} to={link.href}>
                              {link.labelRu}
                            </Link>
                          ))}
                        </section>
                      ) : null}
                    </div>
                  ) : null}
                  {entry.errorRu ? (
                    <p className="darwin-guide-error">{entry.errorRu}</p>
                  ) : null}
                </article>
              ))
            )}
            {isPending ? (
              <p className="darwin-guide-loading">
                <Loader2 aria-hidden="true" size={16} />
                Дарвин сверяет источники...
              </p>
            ) : null}
          </div>

          <form className="darwin-guide-form" onSubmit={handleSubmit}>
            <label htmlFor="darwin-guide-question">Вопрос для Дарвина</label>
            <textarea
              id="darwin-guide-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className="button button-primary button-md"
              disabled={isPending || question.trim().length === 0}
            >
              {isPending ? <Loader2 aria-hidden="true" size={17} /> : <MessageCircle aria-hidden="true" size={17} />}
              Задать вопрос
            </button>
          </form>
        </section>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          className="darwin-guide-trigger"
          aria-expanded="false"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles aria-hidden="true" size={19} />
          Спросить Дарвина
        </button>
      ) : null}
    </aside>
  );
}
