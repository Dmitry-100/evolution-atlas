import { useRef, useState, type ComponentType } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  ChevronRight,
  CloudRain,
  Dna,
  GitBranch,
  HelpCircle,
  Leaf,
  Mountain,
  MoveRight,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Shuffle,
  Snowflake,
  Sun,
  Thermometer,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { IslandMap } from "../components/game/IslandMap";
import {
  CARDS,
  CHAPTERS,
  CRISIS_TURNS,
  EVENTS,
  GENERATIONS,
  LESSONS,
  REGIONS,
  TRAITS,
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
  traitCounts,
} from "../game/engine";
import {
  loadGame,
  occupied,
  readRecords,
  saveGame,
  saveRecord,
} from "../game/storage";
import type { CardKind, GameAction, GameState } from "../game/types";
import { trackGoal } from "../lib/analytics";
import "../styles/pages/game.css";

const CARD_ICONS: Record<
  CardKind,
  ComponentType<{ size?: number; "aria-hidden"?: boolean }>
> = {
  bridge: GitBranch,
  divide: Waves,
  migrate: MoveRight,
  refuge: Shield,
  shade: CloudRain,
  food: Leaf,
  mosaic: Dna,
  cover: Mountain,
};
function freshSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}
const degrees = (temperature: number) =>
  `${Math.round(18 + temperature * 12)}°`;

export function GamePage() {
  const [loaded] = useState(() => loadGame());
  const [state, setState] = useState<GameState>(
    () => loaded.state ?? createGame(20260905),
  );
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState(0);
  const [cardId, setCardId] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | undefined>();
  const [fraction, setFraction] = useState<0.1 | 0.25>(0.25);
  const [storageIssue, setStorageIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [restart, setRestart] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [records, setRecords] = useState(readRecords);
  const lock = useRef(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const planning = state.phase === "planning";
  const ended = state.phase === "won" || state.phase === "extinct";
  const preview = previewState(state);
  const env = environment(preview, selected);
  const population = total(state);
  const localPopulation = count(state.regions[selected]);
  const event = currentEvent(state),
    eventInfo = EVENTS[event.kind],
    upcoming = forecast(state);
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
  const selectedTraits = traitCounts([state.regions[selected]]);

  function persist(next: GameState) {
    setState(next);
    setStorageIssue(saveGame(next) ? null : "unavailable");
  }
  function startNew(seed = freshSeed()) {
    const next = createGame(seed, crypto.randomUUID());
    persist(next);
    setStarted(true);
    setRestart(false);
    setSelected(0);
    setCardId(null);
    setError("");
    setAnimating(false);
    lock.current = false;
    trackGoal("game_started", { version: 1 });
  }
  function selectRegion(i: number) {
    setSelected(i);
    setDestination(undefined);
    setError("");
  }
  function queueAction() {
    if (!candidate) return;
    try {
      persist(addAction(state, candidate));
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
      setCardId(null);
      if (state.turn === 1)
        trackGoal("game_first_turn_completed", { version: 1 });
      if (CRISIS_TURNS.includes(state.turn))
        trackGoal("game_crisis_reached", {
          turn: state.turn,
          survived: total(result) > 0,
        });
      if (result.phase === "won" || result.phase === "extinct")
        setRecords(saveRecord(result));
      if (result.phase === "won" || result.phase === "extinct")
        trackGoal("game_finished", {
          turn: result.turn,
          outcome: result.phase,
          population: total(result),
        });
      setAnimating(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      requestAnimationFrame(() =>
        reportRef.current?.focus({ preventScroll: true }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
    }
  }
  function continueTurn() {
    persist(nextTurn(state));
    setCardId(null);
    setAnimating(false);
    setError("");
  }

  return (
    <section
      className="document-page islands-page"
      data-game-phase={started ? state.phase : "intro"}
    >
      <header className="document-header page-header page-header--with-aside">
        <div className="page-header-copy">
          <p className="eyebrow page-header-eyebrow">Живая лаборатория</p>
          <h1>Острова эволюции</h1>
          <p className="page-header-description">
            Сохраните свою ветвь жизни в мире, который меняется.
          </p>
        </div>
        <button
          className="islands-help-button"
          onClick={() => setHelp(!help)}
          aria-expanded={help}
        >
          <HelpCircle size={17} />
          Как играть
        </button>
      </header>
      {help && (
        <div className="islands-help-panel">
          <div>
            <strong>Вы меняете условия. Жизнь отвечает.</strong>
            <p>
              Выберите карту, затем остров. На ход есть 2 очка вмешательства.
              Подтвердите решение — пройдёт {GENERATIONS} поколений. Цель:
              сохранить хотя бы одну популяцию после трёх кризисов.
            </p>
          </div>
          <div>
            <strong>У каждого преимущества есть цена.</strong>
            <p>
              Существа наследуют размер, теплоизоляцию, рацион и способность к
              расселению. Новые варианты возникают случайно. Карты не изменяют
              гены напрямую.
            </p>
          </div>
          <div>
            <strong>Условная модель, настоящие вопросы.</strong>
            <p>
              Организмы и архипелаг вымышлены. Наследование упрощено до
              бесполого размножения. Отдельная колония ещё не означает новый
              вид.
            </p>
            <Link to="/theory">
              Подробнее об эволюции <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}
      {storageIssue && (
        <div className="islands-storage-note" role="status">
          {storageIssue === "invalid"
            ? "Сохранённую экспедицию не удалось прочитать. Она останется нетронутой, пока вы не начнёте новую."
            : "Браузер не позволяет сохранить прогресс. Играть можно, но после закрытия страницы партия может потеряться."}
        </div>
      )}

      {!started ? (
        <div className="islands-intro">
          <IslandMap
            state={state}
            selected={selected}
            onSelect={selectRegion}
          />
          <div className="islands-intro-copy">
            <span className="islands-kicker">
              <span /> Экспедиция на 10–15 минут
            </span>
            <h2>
              Одна популяция.
              <br />
              Много возможных судеб.
            </h2>
            <p>
              Откройте путь к новым берегам. Подготовьтесь к засухе и долгой
              зиме. Посмотрите, какие потомки переживут перемены.
            </p>
            <div className="islands-intro-facts">
              <span>
                <GitBranch size={16} />6 островов
              </span>
              <span>
                <Leaf size={16} />
                18 ходов
              </span>
              <span>
                <Waves size={16} />3 кризиса
              </span>
            </div>
            {loaded.state ? (
              <button
                className="islands-primary"
                onClick={() => {
                  setStarted(true);
                  setSelected(
                    Math.max(
                      0,
                      state.regions.findIndex((r) => count(r)),
                    ),
                  );
                }}
              >
                Продолжить экспедицию <Play size={17} />
              </button>
            ) : (
              <button
                className="islands-primary"
                onClick={() =>
                  storageIssue === "invalid" ? setRestart(true) : startNew()
                }
              >
                Начать экспедицию <ArrowRight size={18} />
              </button>
            )}
            {loaded.state && (
              <button
                className="islands-text-button"
                onClick={() => setRestart(true)}
              >
                Новая экспедиция
              </button>
            )}
            <small>Прогресс сохраняется в этом браузере.</small>
          </div>
        </div>
      ) : (
        <>
          <div className="islands-status-bar">
            <div className="islands-chapter">
              <span className="islands-kicker">
                Глава {Math.min(3, Math.ceil(state.turn / 6))} / 3
              </span>
              <strong>{chapter(state.turn)}</strong>
            </div>
            <div className="islands-stat">
              <span>Ход</span>
              <strong>
                {state.turn}
                <small> / {TURNS}</small>
              </strong>
            </div>
            <div className="islands-stat">
              <span>Существа</span>
              <strong data-testid="game-population">{population}</strong>
            </div>
            <div className="islands-stat">
              <span>Колонии</span>
              <strong>
                {occupied(state)}
                <small> / 6</small>
              </strong>
            </div>
            <button
              className="islands-icon-button"
              onClick={() => setRestart(true)}
              aria-label="Начать новую экспедицию"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <div
            className="islands-timeline"
            aria-label={`Ход ${state.turn} из 18`}
          >
            {Array.from({ length: TURNS }, (_, i) => (
              <span
                key={i}
                className={`${i + 1 <= state.turn ? "is-past" : ""}${CRISIS_TURNS.includes(i + 1) ? " is-crisis" : ""}${i + 1 === state.turn ? " is-current" : ""}`}
                title={`Ход ${i + 1}${CRISIS_TURNS.includes(i + 1) ? " · кризис" : ""}`}
              />
            ))}
          </div>
          <div className="islands-workspace">
            <div className="islands-board">
              <div
                className={`islands-event${isCrisis(event) ? " is-crisis" : ""}`}
              >
                <span className="islands-event-icon">
                  {eventInfo.icon === "snow" ? (
                    <Snowflake />
                  ) : eventInfo.icon === "volcano" ? (
                    <Mountain />
                  ) : eventInfo.icon === "rain" ? (
                    <CloudRain />
                  ) : eventInfo.icon === "wave" ? (
                    <Waves />
                  ) : (
                    <Sun />
                  )}
                </span>
                <div>
                  <span className="islands-kicker">
                    {isCrisis(event)
                      ? "Крупный кризис"
                      : planning
                        ? "Этот ход"
                        : "Событие хода"}
                    {!isCrisis(event) && event.kind !== "calm"
                      ? ` · ${REGIONS[event.region].name}`
                      : ""}
                  </span>
                  <strong>{eventInfo.title}</strong>
                  <p>{eventInfo.description}</p>
                </div>
              </div>
              <IslandMap
                state={preview}
                selected={selected}
                onSelect={selectRegion}
                highlighted={
                  chosen?.target !== "region" && chosen
                    ? neighbors(selected)
                    : []
                }
                playing={animating}
              />
              {upcoming && planning && upcoming.turn > state.turn && (
                <div
                  className={`islands-forecast${upcoming.turn - state.turn === 1 ? " is-imminent" : ""}`}
                >
                  <Wind size={17} />
                  <span>
                    {upcoming.turn - state.turn === 1
                      ? "На следующем ходу"
                      : `На ${upcoming.turn}-м ходу`}
                    :{" "}
                    <strong>
                      {EVENTS[upcoming.event.kind].title.toLowerCase()}
                    </strong>
                  </span>
                  <span>Есть время подготовиться</span>
                </div>
              )}
              {animating && (
                <button
                  className="islands-skip"
                  onClick={() => setAnimating(false)}
                >
                  <Pause size={14} />
                  Остановить анимацию
                </button>
              )}
            </div>
            <aside
              className="islands-region-panel"
              aria-label="Выбранный остров"
            >
              <label className="islands-kicker" htmlFor="islands-region-select">
                Исследовать остров
              </label>
              <select
                id="islands-region-select"
                value={selected}
                onChange={(e) => selectRegion(Number(e.target.value))}
              >
                {REGIONS.map((r, i) => (
                  <option key={r.name} value={i}>
                    {i + 1}. {r.name}
                  </option>
                ))}
              </select>
              <div className="islands-region-heading">
                <span>{REGIONS[selected].biome}</span>
                <strong>
                  {localPopulation}
                  <small> существ</small>
                </strong>
              </div>
              <div className="islands-environment">
                <span>
                  <Thermometer size={15} />
                  Температура<b>{degrees(env.temperature)}</b>
                </span>
                <span>
                  <Leaf size={15} />
                  Побеги<b>{Math.round(env.foodA)}</b>
                </span>
                <span>
                  <Sun size={15} />
                  Семена<b>{Math.round(env.foodB)}</b>
                </span>
                <span>
                  <Bug size={15} />
                  Вместимость<b>{env.capacity}</b>
                </span>
                <span>
                  <Shield size={15} />
                  Хищники
                  <b>
                    {env.predators < 0.35
                      ? "Мало"
                      : env.predators < 0.9
                        ? "Умеренно"
                        : "Много"}
                  </b>
                </span>
              </div>
              {state.draft.length > 0 && (
                <p className="islands-preview-label">
                  Условия с учётом выбранных карт. Событие хода ещё не
                  применено.
                </p>
              )}
              <div className="islands-traits">
                <h3>Кто здесь живёт</h3>
                {localPopulation ? (
                  TRAITS.map((trait, t) => (
                    <div className="islands-trait" key={trait.name}>
                      <span>
                        {trait.name}
                        <b>
                          {
                            trait.values[
                              selectedTraits[t].indexOf(
                                Math.max(...selectedTraits[t]),
                              )
                            ]
                          }
                        </b>
                      </span>
                      <div
                        className="islands-trait-bar"
                        role="img"
                        aria-label={trait.values
                          .map(
                            (label, v) =>
                              `${label}: ${Math.round((selectedTraits[t][v] / localPopulation) * 100)}%`,
                          )
                          .join(", ")}
                      >
                        {trait.values.map((label, v) => (
                          <i
                            key={label}
                            style={{
                              width: `${(selectedTraits[t][v] / localPopulation) * 100}%`,
                            }}
                            title={`${label}: ${selectedTraits[t][v]}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>
                    Пока не заселён. Открытый путь даст соседним популяциям
                    возможность добраться сюда.
                  </p>
                )}
              </div>
              <div className="islands-links">
                <span className="islands-kicker">Соседние берега</span>
                {neighbors(selected).map((i) => (
                  <button key={i} onClick={() => selectRegion(i)}>
                    <span>{REGIONS[i].name}</span>
                    <small>
                      {connected(preview, selected, i)
                        ? "Путь открыт"
                        : "Нужен мост"}
                    </small>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </aside>
          </div>

          {planning ? (
            <div className="islands-planning">
              <div className="islands-hand-heading">
                <div>
                  <span className="islands-kicker">Ваше вмешательство</span>
                  <h2>Как вы поможете жизни?</h2>
                </div>
                <span className="islands-points">
                  <i className={spent(state) >= 2 ? "is-spent" : ""} />
                  <i className={spent(state) >= 1 ? "is-spent" : ""} />
                  {2 - spent(state)} из 2 очков
                </span>
              </div>
              {state.turn <= 3 && (
                <p className="islands-tutorial">
                  {state.turn === 1
                    ? "Начните с расселения: выберите карту, исходный остров и соседний берег. Или поддержите популяцию новой пищей."
                    : state.turn === 2
                      ? "Наследуются различия, а не готовые улучшения. Откройте карточку острова и посмотрите, какие признаки стали чаще."
                      : "Крупные кризисы затрагивают весь архипелаг. Несколько колоний в разных условиях могут сохранить вашу линию."}
                </p>
              )}
              <div className="islands-hand">
                {state.hand.map((id) => {
                  const kind = cardKind(id),
                    card = CARDS[kind],
                    Icon = CARD_ICONS[kind],
                    queued = state.draft.some((a) => a.card === id),
                    tooExpensive = spent(state) + card.cost > 2;
                  return (
                    <div
                      className={`islands-card${cardId === id ? " is-selected" : ""}${queued ? " is-queued" : ""}`}
                      key={id}
                    >
                      <button
                        className="islands-card-main"
                        onClick={() => {
                          setCardId(cardId === id ? null : id);
                          setDestination(undefined);
                          setError("");
                        }}
                        aria-pressed={cardId === id}
                        disabled={queued}
                      >
                        <span className="islands-card-top">
                          <Icon size={24} aria-hidden />
                          <b>{queued ? <Check size={15} /> : card.cost}</b>
                        </span>
                        <strong>{card.title}</strong>
                        <span>{card.description}</span>
                        <small>
                          {queued
                            ? "В плане хода"
                            : tooExpensive
                              ? "Не хватает очков"
                              : card.duration
                                ? `${card.duration} хода`
                                : "Один переход"}
                        </small>
                      </button>
                      <button
                        className="islands-card-swap"
                        aria-label={`Заменить карту «${card.title}»`}
                        disabled={state.swapped || queued}
                        onClick={() => {
                          try {
                            persist(swapCard(state, id));
                            setCardId(null);
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        <Shuffle size={13} />
                        {state.swapped ? "Замена использована" : "Заменить"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {chosen && candidate && (
                <div className="islands-card-editor">
                  <div>
                    <strong>
                      {chosen.title} <ArrowRight size={15} />{" "}
                      {REGIONS[selected].name}
                    </strong>
                    <p>{chosen.tradeoff}</p>
                  </div>
                  <div className="islands-card-fields">
                    <label>
                      Остров
                      <select
                        value={selected}
                        onChange={(e) => selectRegion(Number(e.target.value))}
                      >
                        {REGIONS.map((r, i) => (
                          <option key={r.name} value={i}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {chosen.target !== "region" && (
                      <label>
                        Соседний берег
                        <select
                          aria-label="Соседний берег"
                          value={destination ?? ""}
                          onChange={(e) =>
                            setDestination(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                        >
                          <option value="">Выберите берег</option>
                          {neighbors(selected).map((i) => (
                            <option value={i} key={i}>
                              {REGIONS[i].name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {chosen.target === "migration" && (
                      <label>
                        Доля популяции
                        <select
                          aria-label="Доля популяции"
                          value={fraction}
                          onChange={(e) =>
                            setFraction(Number(e.target.value) as 0.1 | 0.25)
                          }
                        >
                          <option value={0.1}>
                            10% · {Math.floor(localPopulation * 0.1)} существ
                          </option>
                          <option value={0.25}>
                            25% · {Math.floor(localPopulation * 0.25)} существ
                          </option>
                        </select>
                      </label>
                    )}
                    <button
                      className="islands-primary"
                      onClick={queueAction}
                      disabled={!!candidateError}
                    >
                      Добавить в план <Check size={16} />
                    </button>
                  </div>
                  {candidateError && (
                    <p className="islands-field-hint">{candidateError}</p>
                  )}
                </div>
              )}
              <div className="islands-draft" aria-live="polite">
                {state.draft.length ? (
                  <>
                    <span>План хода:</span>
                    {state.draft.map((action) => (
                      <span className="islands-draft-item" key={action.card}>
                        {CARDS[cardKind(action.card)].title} ·{" "}
                        {REGIONS[action.region].name}
                        {action.destination !== undefined
                          ? ` → ${REGIONS[action.destination].name}`
                          : ""}
                        <button
                          aria-label={`Отменить ${CARDS[cardKind(action.card)].title}`}
                          onClick={() => {
                            persist({ ...state, draft: [] });
                            setError("");
                          }}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    <small>Отмена очищает последовательность действий.</small>
                  </>
                ) : (
                  <span>
                    Можно ничего не менять и посмотреть, что произойдёт.
                  </span>
                )}
              </div>
              <div className="islands-turn-footer">
                <span>
                  <Dna size={18} />
                  {GENERATIONS} поколений за один ход
                </span>
                <button className="islands-primary" onClick={resolve}>
                  Следующие поколения <Play size={17} />
                </button>
              </div>
            </div>
          ) : (
            report && (
              <div
                className={`islands-report${ended ? " is-final" : ""}`}
                tabIndex={-1}
                ref={reportRef}
                aria-live="polite"
              >
                <div className="islands-report-heading">
                  <span className="islands-kicker">
                    {ended ? "Итог экспедиции" : `Ход ${state.turn} завершён`}
                  </span>
                  <h2>
                    {state.phase === "won"
                      ? "Ваша ветвь жизни продолжается."
                      : state.phase === "extinct"
                        ? "Эта ветвь оборвалась."
                        : isCrisis(event)
                          ? "Мир изменился. Жизнь отвечает."
                          : "Ещё двадцать поколений."}
                  </h2>
                  <p>
                    {state.phase === "extinct"
                      ? "На всех островах исчезли потомки исходной популяции. В следующей экспедиции можно попробовать другой путь."
                      : state.phase === "won"
                        ? "Потомки исходной популяции пережили три кризиса и их последствия."
                        : "Посмотрите, что изменилось, прежде чем сделать следующий выбор."}
                  </p>
                </div>
                <div className="islands-report-numbers">
                  <span>
                    Существа
                    <strong>
                      {report.before} <ArrowRight size={20} /> {report.after}
                    </strong>
                  </span>
                  <span>
                    Успешные переходы<strong>{report.migrations}</strong>
                  </span>
                  <span>
                    Потери в пути<strong>{report.transitLosses}</strong>
                  </span>
                </div>
                <ul className="islands-report-notes">
                  {report.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
                <details className="islands-why">
                  <summary>Почему так произошло?</summary>
                  <p>
                    {event.kind === "drought" || event.kind === "eruption"
                      ? "Пищи стало меньше. В модели особям с меньшими энергетическими затратами и доступным рационом проще оставить потомство."
                      : event.kind === "cold" || event.kind === "chill"
                        ? "Холод снижает ожидаемое число потомков. Сильная теплоизоляция уменьшает этот штраф, но исход также зависит от пищи и случайности."
                        : "Вклад в следующее поколение зависит от температуры, доступной пищи и давления хищников. Миграция переносит уже существующие варианты, мутации могут создавать новые."}{" "}
                    Это объяснение правил модели; отдельная партия не доказывает
                    преимущество одной стратегии.
                  </p>
                  <p>
                    В этом ходе зарегистрировано изменений наследуемого профиля:{" "}
                    {report.mutations}. Они возникали случайно относительно
                    потребностей популяции.
                  </p>
                </details>
                <div className="islands-report-footer">
                  <Link
                    onClick={() =>
                      trackGoal("game_article_opened", {
                        route:
                          LESSONS[Math.min(2, Math.floor((state.turn - 1) / 6))]
                            .href,
                        turn: state.turn,
                      })
                    }
                    to={
                      LESSONS[Math.min(2, Math.floor((state.turn - 1) / 6))]
                        .href
                    }
                  >
                    <BookOpen size={16} />
                    {
                      LESSONS[Math.min(2, Math.floor((state.turn - 1) / 6))]
                        .label
                    }
                    <ArrowUpRight size={14} />
                  </Link>
                  {ended ? (
                    <div className="islands-replay-buttons">
                      <button
                        className="islands-text-button"
                        onClick={() => {
                          trackGoal("game_restarted", { sameScenario: true });
                          startNew(state.seed);
                        }}
                      >
                        <RotateCcw size={16} />
                        Те же условия
                      </button>
                      <button
                        className="islands-primary"
                        onClick={() => {
                          trackGoal("game_restarted", { sameScenario: false });
                          startNew();
                        }}
                      >
                        Новая экспедиция <ArrowRight size={17} />
                      </button>
                    </div>
                  ) : (
                    <button className="islands-primary" onClick={continueTurn}>
                      К следующему ходу <ArrowRight size={17} />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
          {error && (
            <p className="islands-error" role="alert">
              {error}
            </p>
          )}
          {state.history.length > 0 && (
            <details className="islands-history" open={ended}>
              <summary>
                История популяций <span>{state.history.length} ходов</span>
              </summary>
              <div className="islands-history-scroll">
                <table>
                  <caption>Численность колоний после каждого хода</caption>
                  <thead>
                    <tr>
                      <th>Ход</th>
                      {REGIONS.map((r, i) => (
                        <th key={r.name} title={r.name}>
                          {i + 1}. {r.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.history.map((r) => (
                      <tr key={r.turn}>
                        <th>
                          {r.turn}
                          {isCrisis(r.event) && (
                            <span title={EVENTS[r.event.kind].title}> ✦</span>
                          )}
                        </th>
                        {r.populations.map((n, i) => (
                          <td key={i} className={n ? "is-alive" : ""}>
                            {n || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Новые колонии — ветви истории популяций. Их появление не
                означает автоматического возникновения новых видов.
              </p>
            </details>
          )}
        </>
      )}
      {!started && records.length > 0 && (
        <details className="islands-history">
          <summary>
            Последние экспедиции <span>{records.length}</span>
          </summary>
          <ul className="islands-records">
            {records.map((record) => (
              <li key={record.runId}>
                <span>
                  {record.outcome === "won"
                    ? "Линия сохранилась"
                    : `Линия оборвалась на ${record.turns}-м ходу`}
                </span>
                <strong>
                  {record.population} существ · {record.crises} кризиса
                </strong>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="islands-model-note">
        Вымышленный мир · Упрощённая модель наследования · {CHAPTERS.length}{" "}
        главы о выживании и переменах
      </p>
      <Dialog.Root open={restart} onOpenChange={setRestart}>
        <Dialog.Portal>
          <Dialog.Overlay className="islands-modal-overlay" />
          <Dialog.Content
            className="islands-confirm-content"
            role="alertdialog"
          >
            <Dialog.Title>Начать новую экспедицию?</Dialog.Title>
            <Dialog.Description>
              Текущий прогресс будет заменён. Завершённые экспедиции останутся в
              истории этого браузера.
            </Dialog.Description>
            <div>
              <Dialog.Close asChild>
                <button className="islands-text-button">Вернуться</button>
              </Dialog.Close>
              <button className="islands-primary" onClick={() => startNew()}>
                Начать новую
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
