import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Binoculars,
  Check,
  ChevronRight,
  CloudRain,
  Compass,
  Dna,
  Expand,
  HelpCircle,
  History,
  Leaf,
  Map,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Snowflake,
  Sun,
  Thermometer,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { IslandScene } from "../components/game/IslandScene";
import { GameCard } from "../components/game/GameCard";
import { CARD_ART } from "../game/art";
import { GameDialog } from "../components/game/GameDialog";
import { GameFinale } from "../components/game/GameFinale";
import { GameSelect } from "../components/game/GameSelect";
import { OptimizedImage } from "../components/ui/optimized-image";
import {
  CARDS,
  CRISIS_TURNS,
  EVENTS,
  GENERATIONS,
  LESSONS,
  REGIONS,
  TRAITS,
  DEFAULT_SETTINGS,
  TURNS,
  cardKind,
} from "../game/content";
import {
  actionError,
  addAction,
  chapter,
  connected,
  count,
  createGame,
  createExpedition,
  keepCard,
  currentEvent,
  environment,
  forecast,
  isCrisis,
  neighbors,
  nextTurn,
  previewState,
  resolveTurn,
  spent,
  swapCard,
  total,
} from "../game/engine";
import {
  loadGame,
  occupied,
  readRecords,
  saveGame,
  saveRecord,
} from "../game/storage";
import type { ExpeditionSettings, GameAction, GameState } from "../game/types";
import { trackGoal } from "../lib/analytics";
import { getVersionedAssetSrc } from "../lib/assetManifest";
import "../styles/pages/game.css";
import "../styles/pages/game-expedition.css";
import {
  TraitBars,
  TraitExplanation,
  FoodBudget,
  AnimalComparison,
} from "../components/game/TraitExplorer";
import { ExpeditionSetup } from "../components/game/ExpeditionSetup";
import {
  FieldJournal,
  FieldNote,
  DiscoveryCards,
} from "../components/game/FieldJournal";
import {
  MODEL_NOTE,
  GALAPAGOS_INTRO,
  cardImpact,
  eventDescription,
  missionStatus,
  scouting,
  sharedExpedition,
} from "../game/expedition";

const degrees = (temperature: number) =>
  Math.round(18 + temperature * 12) + "°";
const islandOptions = REGIONS.map((region, index) => ({
  value: String(index),
  label: region.name,
  detail: region.biome,
}));
const EVENT_ICONS = {
  sun: Sun,
  rain: CloudRain,
  snow: Snowflake,
  leaf: Leaf,
  paw: Bug,
  wave: Waves,
  volcano: Mountain,
};

export function GamePage() {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    // All cards remain illustrated when the next hand is drawn offline.
    Object.values(CARD_ART).forEach((src) => {
      const image = new Image();
      image.src = getVersionedAssetSrc(src);
    });
  }, []);
  const [loaded] = useState(() => loadGame());
  const [state, setState] = useState<GameState>(
    () => loaded.state ?? createExpedition(20260905),
  );
  const [started, setStarted] = useState(false);
  const [setup, setSetup] = useState(false);
  const [shared] = useState(() => sharedExpedition(window.location.search));
  const [traitInfo, setTraitInfo] = useState(0);
  const [tutorial, setTutorial] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);
  const [cardId, setCardId] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | undefined>();
  const [fraction, setFraction] = useState<0.1 | 0.25>(0.25);
  const [storageIssue, setStorageIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [panel, setPanel] = useState<
    | "help"
    | "history"
    | "island"
    | "event"
    | "report"
    | "trait"
    | "journal"
    | null
  >(null);
  const [restart, setRestart] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resetView, setResetView] = useState(0);
  const [focusView, setFocusView] = useState(0);
  const [finaleDismissed, setFinaleDismissed] = useState<string | null>(null);
  const finaleTrigger = useRef<HTMLButtonElement>(null);
  const [records, setRecords] = useState(readRecords);
  const [wide, setWide] = useState(false);
  const lock = useRef(false);
  const planning = state.phase === "planning";
  const ended = state.phase === "won" || state.phase === "extinct";
  const finaleOpen =
    started &&
    ended &&
    finaleDismissed !== state.runId &&
    panel === null &&
    !restart &&
    !setup;
  const preview = previewState(state);
  const env = environment(preview, selected);
  const population = total(state);
  const localPopulation = count(state.regions[selected]);
  const event = currentEvent(state),
    eventInfo = { ...EVENTS[event.kind], description: eventDescription(state) },
    upcoming = forecast(state);
  const EventIcon =
    EVENT_ICONS[eventInfo.icon as keyof typeof EVENT_ICONS] ?? Sun;
  const chosen = cardId === null ? null : CARDS[cardKind(cardId)];
  const candidate: GameAction | null =
    cardId === null
      ? null
      : {
          card: cardId,
          region: selected,
          ...(chosen?.target !== "region" ? { destination } : {}),
          ...(chosen?.target === "migration" ? { fraction } : {}),
        };
  const candidateError = candidate ? actionError(state, candidate) : null;
  const report = state.history.at(-1);
  const lesson = LESSONS[Math.min(2, Math.floor((state.turn - 1) / 6))];

  function persist(next: GameState) {
    setState(next);
    setStorageIssue(saveGame(next) ? null : "unavailable");
  }
  function startNew(
    seed = crypto.getRandomValues(new Uint32Array(1))[0],
    settings: ExpeditionSettings = state.settings ?? DEFAULT_SETTINGS,
    teach = false,
    version: 1 | 2 = 2,
  ) {
    persist(createGame(seed, crypto.randomUUID(), settings, version));
    setSetup(false);
    setTutorial(teach ? 0 : null);
    setStarted(true);
    setRestart(false);
    setSelected(0);
    setCardId(null);
    setError("");
    setPanel(null);
    lock.current = false;
    trackGoal("game_started", { version });
  }
  function selectRegion(index: number) {
    if (tutorial === 0) setTutorial(1);
    setSelected(index);
    setDestination(undefined);
    setError("");
  }
  function queueAction() {
    if (!candidate) return;
    try {
      persist(addAction(state, candidate));
      if (tutorial !== null) setTutorial(2);
      setCardId(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function resolve() {
    if (lock.current || !planning) return;
    lock.current = true;
    try {
      const result = resolveTurn(state);
      persist(result);
      if (tutorial !== null) setTutorial(3);
      setCardId(null);
      setPanel(null);
      if (state.turn === 1)
        trackGoal("game_first_turn_completed", { version: state.version });
      if (CRISIS_TURNS.includes(state.turn))
        trackGoal("game_crisis_reached", {
          turn: state.turn,
          survived: total(result) > 0,
        });
      if (result.phase === "won" || result.phase === "extinct") {
        setRecords(saveRecord(result));
        trackGoal("game_finished", {
          turn: result.turn,
          outcome: result.phase,
          population: total(result),
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
    }
  }
  function continueTurn() {
    persist(nextTurn(state));
    setTutorial(null);
    setCardId(null);
    setError("");
    setPanel(null);
  }

  const traitBars = (
    <TraitBars
      state={state}
      island={selected}
      onExplain={(index) => {
        setTraitInfo(index);
        setPanel("trait");
      }}
    />
  );
  const candidatePreview =
    candidate && !candidateError
      ? previewState(addAction(state, candidate))
      : preview;
  const impact = cardImpact(preview, candidatePreview, selected).filter(
    ([, a, b]) => Math.round(a) !== Math.round(b),
  );

  const environmentStats = (
    <div className="game-environment">
      <span>
        <Thermometer size={14} />
        Температура<strong>{degrees(env.temperature)}</strong>
      </span>
      <span>
        <Leaf size={14} />
        Побеги<strong>{Math.round(env.foodA)}</strong>
      </span>
      <span>
        <Sun size={14} />
        Семена<strong>{Math.round(env.foodB)}</strong>
      </span>
      <span>
        <Bug size={14} />
        Вместимость<strong>{Math.round(env.capacity)}</strong>
      </span>
      <span>
        <Shield size={14} />
        Хищники
        <strong>
          {env.predators < 0.4
            ? "Мало"
            : env.predators > 1
              ? "Много"
              : "Умеренно"}
        </strong>
      </span>
    </div>
  );

  const reportDetails = report && (
    <div className="game-report-details">
      <div className="game-report-numbers">
        <span>
          Численность
          <strong>
            {report.before} → {report.after}
          </strong>
        </span>
        <span>
          Успешные переходы<strong>{report.migrations}</strong>
        </span>
        <span>
          Потери в пути<strong>{report.transitLosses}</strong>
        </span>
      </div>
      <ul>
        {report.notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
      <DiscoveryCards state={state} />
      <div className="game-note">
        <h3>Почему так произошло?</h3>
        <p>
          {event.kind === "drought" || event.kind === "eruption"
            ? "Пищи стало меньше. В модели особям с меньшими энергетическими затратами и доступным рационом проще оставить потомство."
            : event.kind === "cold" || event.kind === "chill"
              ? "Холод снижает ожидаемое число потомков. Сильная теплоизоляция уменьшает этот штраф, но исход также зависит от пищи и случайности."
              : "Вклад в следующее поколение зависит от температуры, доступной пищи и давления хищников. Миграция переносит существующие варианты, мутации могут создавать новые."}
        </p>
        <p>
          Изменений наследуемого профиля в этом ходе: {report.mutations}. Они
          возникали случайно относительно потребностей популяции. Это объяснение
          правил упрощённой модели.
        </p>
      </div>
      <Link
        className="game-article-link"
        to={lesson.href}
        onClick={() =>
          trackGoal("game_article_opened", {
            route: lesson.href,
            turn: state.turn,
          })
        }
      >
        <BookOpen size={16} />
        {lesson.label}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );

  return (
    <section
      className={"game-studio" + (wide ? " is-expanded" : "")}
      data-game-phase={started ? state.phase : "intro"}
      data-tutorial={tutorial ?? undefined}
    >
      <header className="game-heading">
        <div className="game-heading-title">
          <span className="game-emblem">
            <Dna size={22} />
          </span>
          <div>
            <span className="game-eyebrow">Галапагосы · Живая лаборатория</span>
            <h1>Острова эволюции</h1>
          </div>
        </div>
        {started && (
          <div className="islands-status-bar">
            <div className="game-turn-count">
              <span>Ход</span>
              <strong>
                {state.turn}
                <small> / {TURNS}</small>
              </strong>
            </div>
            <div>
              <span>Существа</span>
              <strong data-testid="game-population">{population}</strong>
            </div>
            <div>
              <span>Колонии</span>
              <strong>
                {occupied(state)}
                <small> / 6</small>
              </strong>
            </div>
          </div>
        )}
        <div className="game-heading-actions">
          <button
            className="game-icon-button"
            onClick={() => setPanel("history")}
            aria-label="История популяций"
            title="Полевой дневник"
          >
            <History size={18} />
          </button>
          <button
            className="game-icon-button"
            onClick={() => setPanel("journal")}
            aria-label="Дневник натуралиста"
            title="Открытия, ветви и цель экспедиции"
          >
            <BookOpen size={18} />
          </button>
          <button
            className="game-icon-button"
            onClick={() => setPanel("help")}
            aria-label="Как играть"
            title="Как играть"
          >
            <HelpCircle size={18} />
          </button>
          {started && (
            <button
              className="game-icon-button game-restart"
              onClick={() => setRestart(true)}
              aria-label="Начать заново"
              title="Начать заново"
            >
              <RotateCcw size={17} />
            </button>
          )}
        </div>
      </header>

      <div className="game-world-layout">
        <div className={"game-world" + (!started ? " is-intro" : "")}>
          <IslandScene
            state={state}
            selected={selected}
            onSelect={selectRegion}
            paused={
              paused || finaleOpen || setup || panel !== null || cardId !== null
            }
            evolving={started && !planning}
            resetView={resetView}
            focusView={focusView}
          />
          <div className="game-world-vignette" />
          {started &&
            !setup &&
            !finaleOpen &&
            tutorial !== null &&
            panel === null &&
            cardId === null && (
              <aside className="game-tutorial" aria-live="polite">
                <span className="game-eyebrow">
                  {tutorial < 3
                    ? `Первый ход · ${tutorial + 1} / 3`
                    : "Первое наблюдение"}
                </span>
                <strong>
                  {
                    [
                      "Выберите остров на карте",
                      "Откройте карточку и выберите действие",
                      "Теперь смените поколения",
                      "Посмотрите, что изменилось",
                    ][tutorial]
                  }
                </strong>
                <p>
                  {
                    [
                      "Начните с Санта-Крус: там живут первые 80 существ. Пища и климат — условия острова, полосы — признаки животных.",
                      "На ход есть 2 очка. Расселите часть колонии или поддержите пищу. В окне карты видны цена и последствия.",
                      "Кнопка «Следующие поколения» применит план и рассчитает 20 поколений. До этого можно отменить выбор.",
                      "В отчёте видны численность и переходы. Откройте разбор: он связывает ваши действия, условия и изменения популяции.",
                    ][tutorial]
                  }
                </p>
                <button
                  onClick={() => setTutorial(null)}
                  className="game-text-button"
                >
                  {tutorial === 3
                    ? "Понятно, продолжить"
                    : "Пропустить подсказки"}
                  <ArrowRight size={13} />
                </button>
              </aside>
            )}
          <div className="game-world-topline">
            <span className="game-world-caption">
              <span />
              Архипелаг • {chapter(state.turn)}
            </span>
            <div className="game-scene-controls">
              {started && (
                <button
                  className="game-icon-button"
                  aria-label="Рассмотреть выбранный остров"
                  title="Рассмотреть животных и изменения на острове"
                  onClick={() => setFocusView((value) => value + 1)}
                >
                  <Binoculars size={16} />
                </button>
              )}
              {!reducedMotion && (
                <button
                  className="game-icon-button"
                  aria-label={
                    paused ? "Включить анимацию" : "Остановить анимацию"
                  }
                  aria-pressed={paused}
                  onClick={() => setPaused(!paused)}
                  title={paused ? "Включить движение" : "Пауза анимации"}
                >
                  {paused ? <Play size={15} /> : <Pause size={15} />}
                </button>
              )}
              <button
                className="game-icon-button"
                aria-label="Вернуть ракурс"
                onClick={() => setResetView((value) => value + 1)}
                title="Вернуть ракурс"
              >
                <Compass size={16} />
              </button>
              <button
                className="game-icon-button game-expand"
                aria-label={wide ? "Обычный экран" : "Развернуть игру"}
                onClick={() => setWide(!wide)}
                title="Развернуть игру"
              >
                <Expand size={15} />
              </button>
            </div>
          </div>
          {started ? (
            <>
              <button
                className={
                  "islands-event" + (isCrisis(event) ? " is-crisis" : "")
                }
                onClick={() => setPanel("event")}
                aria-label={"Событие: " + eventInfo.title}
              >
                <span className="game-event-icon">
                  <EventIcon size={23} />
                </span>
                <span>
                  <small>
                    {isCrisis(event)
                      ? "Кризис архипелага"
                      : "Сейчас • " + REGIONS[event.region].name}
                  </small>
                  <strong>{eventInfo.title}</strong>
                </span>
                <ChevronRight size={15} />
              </button>
              <div className="game-world-bottomline">
                <span
                  className={
                    state.draft.length ? "game-map-plan" : "game-orbit-hint"
                  }
                >
                  {state.draft.length ? <Check size={13} /> : <Map size={13} />}
                  {state.draft.length
                    ? "Предпросмотр плана · изменения после хода"
                    : "Вращайте мир · рассмотрите остров вблизи"}
                </span>
                <button
                  className="game-mobile-island"
                  onClick={() => setPanel("island")}
                >
                  <Bug size={14} />
                  {REGIONS[selected].name}
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="game-intro-overlay">
              <span className="game-eyebrow">
                Одна популяция. Шесть возможных судеб.
              </span>
              <h2>
                Дайте жизни
                <br />
                <em>шанс продолжиться.</em>
              </h2>
              <p>
                Исследуйте условные Галапагосы: расселяйте животных и сохраните
                свою ветвь жизни за 18 ходов.
              </p>
              <div className="game-intro-actions">
                <button
                  className="islands-primary"
                  onClick={() =>
                    loaded.state
                      ? setStarted(true)
                      : loaded.issue === "invalid"
                        ? setRestart(true)
                        : setSetup(true)
                  }
                >
                  {loaded.state ? "Продолжить экспедицию" : "Начать экспедицию"}
                  <ArrowRight size={18} />
                </button>
                <button
                  className="game-text-button"
                  onClick={() => setPanel("help")}
                >
                  Как играть
                  <ArrowUpRight size={15} />
                </button>
              </div>
              {shared && (
                <button
                  className="game-shared-world game-text-button"
                  onClick={() => setSetup(true)}
                >
                  Открыть мир по ссылке ·{" "}
                  {shared.seed.toString(16).toUpperCase()}
                </button>
              )}
              <span className="game-intro-meta">
                18 ходов
                <span />3 кризиса
                <span />
                10–15 минут
              </span>
            </div>
          )}
          {!started && (
            <span className="game-intro-caption">
              Реальные острова. Условная модель эволюции.
            </span>
          )}
        </div>

        {started && (
          <aside className="game-island-panel" aria-label="Выбранный остров">
            <div className="game-island-panel-top">
              <span className="game-eyebrow">Полевые наблюдения</span>
              <span className="game-island-index">0{selected + 1}</span>
            </div>
            <GameSelect
              label="Исследовать остров"
              value={String(selected)}
              onChange={(value) => selectRegion(Number(value))}
              options={islandOptions}
            />
            <div className="islands-region-heading">
              <span title={REGIONS[selected].biome}>
                {REGIONS[selected].subtitle}
              </span>
              <h2>
                {localPopulation}
                <small> существ</small>
              </h2>
            </div>
            <div className="game-island-summary">
              <span>
                <Thermometer size={15} />
                <strong>{degrees(env.temperature)}</strong>
                <small>Климат</small>
              </span>
              <span>
                <Leaf size={15} />
                <strong>{Math.round(env.foodA + env.foodB)}</strong>
                <small>Пища</small>
              </span>
              <span>
                <Bug size={15} />
                <strong>{Math.round(env.capacity)}</strong>
                <small>Места</small>
              </span>
            </div>
            <div className="game-traits-heading">
              <Dna size={14} />
              <span>Признаки жителей · нажмите ⓘ</span>
            </div>
            {traitBars}
            <button
              className="game-island-more"
              onClick={() => setPanel("island")}
            >
              Исследовать популяцию
              <ArrowUpRight size={14} />
            </button>
          </aside>
        )}
      </div>

      {started && (
        <div className="game-bottom">
          <div className="game-timeline">
            <span className="game-chapter">
              <small>Глава {Math.min(3, Math.ceil(state.turn / 6))}</small>
              {chapter(state.turn)}
            </span>
            <div
              className="game-timeline-track"
              aria-label={"Ход " + state.turn + " из 18"}
            >
              {Array.from({ length: TURNS }, (_, index) => (
                <span
                  key={index}
                  className={
                    (index < state.turn ? "is-complete " : "") +
                    (CRISIS_TURNS.includes(index + 1) ? "is-crisis" : "")
                  }
                  title={"Ход " + (index + 1)}
                >
                  {CRISIS_TURNS.includes(index + 1) &&
                    (index === 4 ? (
                      <Sun size={12} />
                    ) : index === 10 ? (
                      <Snowflake size={12} />
                    ) : (
                      <Mountain size={12} />
                    ))}
                </span>
              ))}
            </div>
            <button
              className="islands-forecast"
              onClick={() => setPanel("event")}
            >
              <Wind size={14} />
              <span>
                {upcoming
                  ? (upcoming.turn === state.turn + 1
                      ? "На следующем ходу: "
                      : "Ход " + upcoming.turn + ": ") +
                    EVENTS[upcoming.event.kind].title.toLowerCase()
                  : "Все кризисы позади"}
              </span>
              <ChevronRight size={13} />
            </button>
          </div>
          {planning ? (
            <div className="game-command-deck">
              <div className="game-deck-heading">
                <div>
                  <span className="game-eyebrow">Ваш ход</span>
                  <h2>Помогите жизни найти путь</h2>
                </div>
                <span className="game-influence">
                  <i className={spent(state) < 2 ? "is-available" : ""} />
                  <i className={spent(state) < 1 ? "is-available" : ""} />
                  {2 - spent(state)} из 2 очков
                </span>
              </div>
              <div className="game-card-hand">
                {state.hand.map((id) => (
                  <GameCard
                    key={id}
                    id={id}
                    selected={id === cardId}
                    disabled={
                      CARDS[cardKind(id)].cost > 2 - spent(state) ||
                      state.draft.length >= 2
                    }
                    canSwap={!state.swapped}
                    kept={(state.kept ?? []).includes(id)}
                    canKeep={
                      state.version === 2 &&
                      ((state.kept ?? []).includes(id) ||
                        (state.kept ?? []).length < 2)
                    }
                    onKeep={
                      state.version === 2
                        ? () => persist(keepCard(state, id))
                        : undefined
                    }
                    onSelect={() => {
                      setCardId(id);
                      setDestination(undefined);
                      setError("");
                    }}
                    onSwap={() => {
                      persist(swapCard(state, id));
                      setCardId(null);
                    }}
                  />
                ))}
              </div>
              <div className="game-command-footer">
                <div className="islands-draft" aria-live="polite">
                  {state.draft.length ? (
                    <>
                      <Check size={15} />
                      <span>
                        {state.draft
                          .map((action) => CARDS[cardKind(action.card)].title)
                          .join(" + ")}
                      </span>
                      <button
                        aria-label="Отменить план"
                        className="game-icon-button"
                        onClick={() => persist({ ...state, draft: [] })}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Dna size={16} />
                      <span>{GENERATIONS} поколений за один ход</span>
                      <small>
                        {state.version === 2
                          ? "Закрепите до 2 карт; остальные обновятся."
                          : "Карты меняют среду, а не гены."}
                      </small>
                    </>
                  )}
                </div>
                <button className="islands-primary" onClick={resolve}>
                  Следующие поколения
                  <Play size={16} />
                </button>
              </div>
            </div>
          ) : (
            report && (
              <div
                className={"islands-report" + (ended ? " is-final" : "")}
                aria-live={ended ? undefined : "polite"}
              >
                <div className="game-report-emblem">
                  {state.phase === "won" ? (
                    <Dna size={36} />
                  ) : state.phase === "extinct" ? (
                    <Leaf size={36} />
                  ) : (
                    <Bug size={32} />
                  )}
                </div>
                <div className="game-report-summary">
                  <span className="game-eyebrow">
                    {ended
                      ? "Итог экспедиции"
                      : "Ход " + state.turn + " завершён"}
                  </span>
                  <h2>
                    {state.phase === "won"
                      ? "Жизнь продолжается."
                      : state.phase === "extinct"
                        ? "Эта ветвь оборвалась."
                        : "Ещё двадцать поколений."}
                  </h2>
                  <p>
                    {ended
                      ? state.phase === "won"
                        ? "Ваши популяции пережили три кризиса."
                        : "Попробуйте другой путь в следующей экспедиции."
                      : report.notes[0]}
                  </p>
                  <button
                    className="game-text-button"
                    ref={ended ? finaleTrigger : undefined}
                    onClick={() =>
                      ended ? setFinaleDismissed(null) : setPanel("report")
                    }
                  >
                    {ended ? "Итоги экспедиции" : "Разобрать результат"}
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="game-report-change">
                  <span>Существа</span>
                  <strong>
                    {report.before}
                    <ArrowRight size={17} />
                    {report.after}
                  </strong>
                  <span>Успешные переходы: {report.migrations}</span>
                </div>
                <div className="game-report-actions">
                  {ended ? (
                    <>
                      <button
                        className="islands-primary"
                        onClick={() => {
                          trackGoal("game_restarted", { sameScenario: true });
                          startNew(
                            state.seed,
                            state.settings ?? DEFAULT_SETTINGS,
                            false,
                            state.version,
                          );
                        }}
                      >
                        Те же условия
                        <RotateCcw size={16} />
                      </button>
                      <button
                        className="game-text-button"
                        onClick={() => {
                          trackGoal("game_restarted", { sameScenario: false });
                          startNew();
                        }}
                      >
                        Новая экспедиция
                        <ArrowRight size={14} />
                      </button>
                    </>
                  ) : (
                    <button className="islands-primary" onClick={continueTurn}>
                      К следующему ходу
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {((storageIssue && !noticeDismissed) || error) && (
        <div className="game-toast" role={error ? "alert" : "status"}>
          {error ||
            (storageIssue === "invalid"
              ? "Сохранённую экспедицию не удалось прочитать. Она сохранится до начала новой."
              : "Браузер не позволяет сохранить прогресс. Можно играть до закрытия страницы.")}
          <button
            className="game-icon-button"
            aria-label="Закрыть уведомление"
            onClick={() => {
              setNoticeDismissed(true);
              setError("");
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <GameDialog
        open={cardId !== null && planning && started}
        onOpenChange={(open) => {
          if (!open) setCardId(null);
        }}
        title={chosen?.title ?? ""}
        description={chosen?.description}
        className="game-action-dialog"
      >
        {chosen && cardId !== null && (
          <>
            <div className="game-action-art">
              {CARD_ART[cardKind(cardId)] && (
                <OptimizedImage
                  src={CARD_ART[cardKind(cardId)]}
                  alt=""
                  width={400}
                  height={500}
                />
              )}
              <span>
                {chosen.cost} {chosen.cost === 1 ? "очко" : "очка"} ·{" "}
                {chosen.duration ? chosen.duration + " хода" : "Сразу"}
              </span>
            </div>
            <div className="game-action-settings">
              <p>{chosen.tradeoff}</p>
              {impact.length > 0 && (
                <div className="game-action-impact">
                  <strong>Изменение условий с этой картой</strong>
                  {impact.map(([label, a, b]) => (
                    <p key={label}>
                      <span>{label}</span>
                      <b>
                        {Math.round(a)} → {Math.round(b)}
                      </b>
                    </p>
                  ))}
                </div>
              )}
              <FieldNote kind={cardKind(cardId)} />
              {cardKind(cardId) === "scout" && (
                <p className="game-muted">
                  После применения откройте событие над картой: в нём появится
                  подробный прогноз.
                </p>
              )}
              <GameSelect
                label="Остров"
                value={String(selected)}
                onChange={(value) => selectRegion(Number(value))}
                options={islandOptions}
              />
              {chosen.target !== "region" && (
                <GameSelect
                  label="Соседний берег"
                  value={destination === undefined ? "" : String(destination)}
                  onChange={(value) => setDestination(Number(value))}
                  options={neighbors(selected).map((index) => ({
                    value: String(index),
                    label: REGIONS[index].name,
                    detail: connected(preview, selected, index)
                      ? "Путь открыт"
                      : "Путь закрыт",
                  }))}
                />
              )}
              {chosen.target === "migration" && (
                <GameSelect
                  label="Доля популяции"
                  value={String(fraction)}
                  onChange={(value) => setFraction(Number(value) as 0.1 | 0.25)}
                  options={[
                    {
                      value: "0.1",
                      label:
                        "10% · " +
                        Math.floor(localPopulation * 0.1) +
                        " существ",
                    },
                    {
                      value: "0.25",
                      label:
                        "25% · " +
                        Math.floor(localPopulation * 0.25) +
                        " существ",
                    },
                  ]}
                />
              )}
              {candidateError && (
                <p className="game-action-hint">{candidateError}</p>
              )}
              <button
                className="islands-primary"
                onClick={queueAction}
                disabled={!!candidateError}
              >
                Добавить в план
                <Check size={17} />
              </button>
            </div>
          </>
        )}
      </GameDialog>

      <GameDialog
        open={panel === "island"}
        onOpenChange={(open) => !open && setPanel(null)}
        title={REGIONS[selected].name}
        description={`${REGIONS[selected].subtitle} · ${REGIONS[selected].biome}`}
      >
        <div className="game-observation">
          <span className="game-large-number">{localPopulation}</span> существ
          на острове
        </div>
        {environmentStats}
        <FoodBudget state={preview} island={selected} />
        <h3>Наследуемые признаки жителей</h3>
        {traitBars}
        <AnimalComparison state={state} island={selected} />
        <div className="game-note">
          <h3>Соседние берега</h3>
          {neighbors(selected).map((index) => (
            <button
              className="game-neighbor"
              key={index}
              onClick={() => selectRegion(index)}
            >
              <span>{REGIONS[index].name}</span>
              <small>
                {connected(preview, selected, index)
                  ? "Путь открыт"
                  : "Нужен морской путь или плот"}
              </small>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>
        <p className="game-muted">
          Цветные полосы показывают соотношение наследуемых вариантов. Отдельная
          колония ещё не означает новый вид.
        </p>
      </GameDialog>
      <GameDialog
        open={panel === "event"}
        onOpenChange={(open) => !open && setPanel(null)}
        title={eventInfo.title}
        description={eventInfo.description}
      >
        <div className="game-event-detail">
          <EventIcon size={54} />
          <span>
            {isCrisis(event) ? "Все острова" : REGIONS[event.region].name}
            <small>
              {eventInfo.duration} {eventInfo.duration === 1 ? "ход" : "хода"}
            </small>
          </span>
        </div>
        <FieldNote kind={event.kind} />
        {scouting(state).length > 0 && (
          <div className="game-note">
            <h3>Разведка: следующие события</h3>
            {scouting(state).map(({ event: future, turn }) => (
              <p key={turn}>
                <strong>
                  Ход {turn} · {EVENTS[future.kind].title}
                </strong>
                <br />
                {REGIONS[future.region].name} ·{" "}
                {EVENTS[future.kind].description}
              </p>
            ))}
          </div>
        )}
        {upcoming && (
          <div className="game-note">
            <span className="game-eyebrow">Прогноз • ход {upcoming.turn}</span>
            <h3>{EVENTS[upcoming.event.kind].title}</h3>
            <p>{eventDescription(state, upcoming.event)}</p>
          </div>
        )}
      </GameDialog>
      {ended && (
        <GameFinale
          key={state.runId}
          state={state}
          open={finaleOpen}
          returnFocusRef={finaleTrigger}
          onClose={() => setFinaleDismissed(state.runId)}
          onReplay={(same) => {
            trackGoal("game_restarted", { sameScenario: same });
            startNew(
              same ? state.seed : undefined,
              state.settings ?? DEFAULT_SETTINGS,
              false,
              same ? state.version : 2,
            );
          }}
          onHistory={() => {
            setFinaleDismissed(state.runId);
            setPanel("history");
          }}
        />
      )}
      <GameDialog
        open={panel === "report"}
        onOpenChange={(open) => !open && setPanel(null)}
        title={"Итоги хода " + state.turn}
        description="Что изменилось за двадцать поколений"
      >
        {reportDetails}
      </GameDialog>
      <GameDialog
        open={panel === "history"}
        onOpenChange={(open) => !open && setPanel(null)}
        title="История популяций"
        description="Каждый ход — двадцать поколений вашей ветви жизни."
        className="game-history-dialog"
      >
        <div className="islands-history">
          {state.history.length ? (
            <div className="game-history-scroll">
              <table>
                <caption>Численность колоний после каждого хода</caption>
                <thead>
                  <tr>
                    <th>Ход</th>
                    {REGIONS.map((r, i) => (
                      <th key={r.name}>
                        {i + 1}. {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.history.map((row) => (
                    <tr key={row.turn}>
                      <th>
                        {row.turn}
                        {isCrisis(row.event) && " ✦"}
                      </th>
                      {row.populations.map((n, i) => (
                        <td key={i}>{n || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="game-empty-note">
              <History size={32} />
              <p>Здесь появятся первые записи, когда сменятся поколения.</p>
            </div>
          )}
        </div>
        {records.length > 0 && (
          <div className="game-note">
            <h3>Завершённые экспедиции</h3>
            {records.map((record) => (
              <p key={record.runId}>
                {record.outcome === "won"
                  ? "Линия сохранилась"
                  : "Линия оборвалась на " + record.turns + "-м ходу"}{" "}
                · {record.population} существ
              </p>
            ))}
          </div>
        )}
      </GameDialog>
      <GameDialog
        open={panel === "help"}
        onOpenChange={(open) => !open && setPanel(null)}
        title="Вы меняете условия. Жизнь отвечает."
        description="Цель — сохранить хотя бы одну популяцию после трёх кризисов."
      >
        <div className="game-start-goal">
          <Compass size={28} />
          <div>
            <h3>80 существ. 18 ходов. Сохраните живую колонию.</h3>
            <p>
              Впереди засуха, похолодание и извержение. Дополнительная цель:{" "}
              {missionStatus(state).title.toLowerCase()}.
            </p>
          </div>
        </div>
        <ol className="game-help-steps">
          <li>
            <span>01</span>
            <div>
              <h3>Оцените условия</h3>
              <p>
                Выберите остров. Сравните пищу и климат с признаками жителей.
                Нажмите название признака для объяснения.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Выберите действие</h3>
              <p>
                На ход есть 2 очка. Откройте карту, выберите цель и добавьте в
                план. План можно отменить; наблюдать без карт тоже можно.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Посмотрите результат</h3>
              <p>
                «Следующие поколения» применяет план и рассчитывает 20
                поколений. В разборе видно, как изменились численность и
                признаки.
              </p>
            </div>
          </li>
        </ol>
        <div className="game-note">
          <h3>Как обновляются карты</h3>
          <p>
            {state.version === 2
              ? "Закрепите значком булавки до двух карт на следующий ход. Остальные заменятся; одинаковых типов в руке нет. Одна бесплатная замена доступна сразу. Новые карты открываются на ходах 4 и 7."
              : "В этой сохранённой партии действуют прежние правила: неиспользованные карты остаются в руке."}
          </p>
        </div>
        <details>
          <summary>Почему Галапагосы?</summary>
          <p>{GALAPAGOS_INTRO}</p>
          <p>{MODEL_NOTE}</p>
        </details>
        <details>
          <summary>Карта, камера и правила модели</summary>
          <p>
            Перетаскивайте карту для поворота, используйте бинокль для
            приближения. Компас возвращает общий ракурс. Фигурки обозначают
            представителей групп. Наследование упрощено до бесполого
            размножения. Карты меняют условия, мутации возникают случайно
            относительно потребностей.
          </p>
        </details>
        <button
          className="game-text-button"
          onClick={() => setPanel("journal")}
        >
          Открытия и история островов <ArrowUpRight size={14} />
        </button>
      </GameDialog>
      <GameDialog
        open={restart}
        onOpenChange={setRestart}
        title="Начать новую экспедицию?"
        description="Текущий прогресс будет заменён. Завершённые экспедиции останутся в истории этого браузера."
        alert
      >
        <div className="game-confirm-actions">
          <button
            className="game-text-button"
            onClick={() => setRestart(false)}
          >
            Вернуться
          </button>
          <button
            className="islands-primary"
            onClick={() => {
              setRestart(false);
              setSetup(true);
            }}
          >
            Настроить новую экспедицию
            <ArrowRight size={16} />
          </button>
        </div>
      </GameDialog>
      <ExpeditionSetup
        key={setup ? "open" : "closed"}
        open={setup}
        initial={shared}
        onClose={() => setSetup(false)}
        onStart={(settings, seed, teach) => startNew(seed, settings, teach)}
      />
      <FieldJournal
        state={state}
        records={records}
        open={panel === "journal"}
        onClose={() => setPanel(null)}
      />
      <GameDialog
        open={panel === "trait"}
        onOpenChange={(open) => !open && setPanel(null)}
        title={TRAITS[traitInfo].name}
        description={`Признаки жителей · ${REGIONS[selected].name}`}
      >
        <TraitExplanation state={preview} island={selected} index={traitInfo} />
        <button className="game-text-button" onClick={() => setPanel("island")}>
          Все наблюдения острова <ArrowRight size={14} />
        </button>
      </GameDialog>
    </section>
  );
}
