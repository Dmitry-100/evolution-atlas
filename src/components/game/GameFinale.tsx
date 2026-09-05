import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowRight,
  Check,
  Circle,
  History,
  Leaf,
  Mountain,
  RotateCcw,
  Snowflake,
  Sprout,
  Sun,
} from "lucide-react";
import { AttemptComparison } from "./FieldJournal";
import { readRecords } from "../../game/storage";
import { missionStatus } from "../../game/expedition";
import { GameDialog } from "./GameDialog";
import { expeditionSummary, type ExpeditionSummary } from "../../game/finale";
import { GENERATIONS, TURNS } from "../../game/content";
import type { GameState } from "../../game/types";
import "../../styles/pages/game-finale.css";

const number = (value: number) => value.toLocaleString("ru-RU");
const crisisDescriptions = {
  drought: "Сокращение запасов пищи на всех островах.",
  cold: "Похолодание и нехватка пищи в течение двух ходов.",
  eruption: "Удар по Фернандине и дефицит пищи во всём архипелаге.",
};

function PopulationChart({ summary }: { summary: ExpeditionSummary }) {
  const gradient = useId();
  const figure = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(780);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width)
        setWidth(Math.max(260, Math.round(entry.contentRect.width)));
    });
    if (figure.current) observer.observe(figure.current);
    return () => observer.disconnect();
  }, []);
  const maximum = Math.max(100, Math.ceil(summary.peak.population / 100) * 100);
  const x = (turn: number) => 35 + (turn / TURNS) * (width - 50);
  const y = (population: number) => 91 - (population / maximum) * 72;
  const line = summary.points
    .map((p, i) => `${i ? "L" : "M"}${x(p.turn)},${y(p.population)}`)
    .join(" ");
  const last = summary.points.at(-1)!;
  return (
    <figure className="game-finale-chart" ref={figure}>
      <figcaption>
        <span>Численность по ходам</span>
        <small>
          Пик: {number(summary.peak.population)} · ход {summary.peak.turn}
        </small>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} 112`}
        role="img"
        aria-label={`Численность по ходам: ${summary.points.map((p) => `${p.turn}: ${p.population}`).join(", ")}`}
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".24" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, maximum / 2, maximum].map((n) => (
          <g key={n}>
            <line
              className="game-finale-gridline"
              x1="35"
              x2={width - 15}
              y1={y(n)}
              y2={y(n)}
            />
            <text x="27" y={y(n) + 3} textAnchor="end">
              {number(n)}
            </text>
          </g>
        ))}
        {summary.crises.map((crisis) => (
          <rect
            key={crisis.turn}
            className="game-finale-crisis-band"
            x={x(crisis.turn - 1)}
            y="14"
            width={x(crisis.end) - x(crisis.turn - 1)}
            height="77"
          />
        ))}
        <path
          d={`${line} L${x(last.turn)},91 L35,91 Z`}
          fill={`url(#${gradient})`}
        />
        <path
          className="game-finale-line"
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength="1"
        />
        {summary.points.map((p) => (
          <circle
            key={p.turn}
            cx={x(p.turn)}
            cy={y(p.population)}
            r={p.turn === last.turn ? 4 : 2}
            fill="currentColor"
          />
        ))}
        {[0, 5, 6, 11, 12, 17, 18].map((turn) => (
          <text key={turn} x={x(turn)} y="107" textAnchor="middle">
            {turn}
          </text>
        ))}
      </svg>
      <p>
        Затемнены два хода каждого кризиса. Изменение численности включает
        размножение, гибель и расселение.
      </p>
    </figure>
  );
}

export function GameFinale({
  state,
  open,
  onClose,
  onReplay,
  onHistory,
  returnFocusRef,
}: {
  state: GameState;
  open: boolean;
  onClose: () => void;
  onReplay: (same: boolean) => void;
  onHistory: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const summary = useMemo(() => expeditionSummary(state), [state]);
  const won = state.phase === "won";
  const drop = summary.biggestDrop;
  const change = summary.traitChange;
  const cold = state.effects.some(
    (e) => e.kind === "cold" && e.until >= state.turn,
  );
  return (
    <GameDialog
      open={open}
      onOpenChange={(value) => !value && onClose()}
      title={won ? "Жизнь продолжается." : "Эта ветвь оборвалась."}
      eyebrow={
        won
          ? "Экспедиция завершена · Линия сохранена"
          : "Экспедиция завершена · Вымирание"
      }
      description={
        won
          ? `${TURNS} ходов, ${TURNS * GENERATIONS} поколений. Ваша ветвь жизни пережила все три кризиса.`
          : `На ${state.turn}-м ходу в архипелаге не осталось живых популяций. Экспедиция завершена — её историю можно изучить и попробовать другой путь.`
      }
      className={`game-finale ${won ? "is-won" : "is-extinct"}`}
      returnFocusRef={returnFocusRef}
    >
      <div className="game-finale-seal" aria-hidden="true">
        {won ? <Sprout /> : <Leaf />}
        <i />
        <i />
        <i />
      </div>
      <dl className="game-finale-stats">
        <div>
          <dt>Существ в финале</dt>
          <dd data-testid="final-population">{number(summary.population)}</dd>
          <small>В начале — {summary.initialPopulation}</small>
        </div>
        <div>
          <dt>Пик численности</dt>
          <dd>{number(summary.peak.population)}</dd>
          <small>
            Ход {summary.peak.turn} из {TURNS}
          </small>
        </div>
        <div>
          <dt>Живых колоний</dt>
          <dd>
            {summary.colonies}
            <span> / 6</span>
          </dd>
          <small>Одновременно на пике — {summary.peakColonies}</small>
        </div>
        <div>
          <dt>Кризисов пройдено</dt>
          <dd data-testid="final-crises">
            {summary.survivedCrises}
            <span> / 3</span>
          </dd>
          <small>С учётом обоих ходов</small>
        </div>
      </dl>
      <Tabs.Root defaultValue="overview" className="game-finale-tabs">
        <Tabs.List
          aria-label="Итоги экспедиции"
          className="game-finale-tab-list"
        >
          <Tabs.Trigger value="overview">Вся экспедиция</Tabs.Trigger>
          <Tabs.Trigger value="explanation">Что повлияло</Tabs.Trigger>
          <Tabs.Trigger value="islands">По островам</Tabs.Trigger>
          <Tabs.Trigger value="attempts">Цель и попытки</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview" className="game-finale-tab-panel">
          <PopulationChart summary={summary} />
          <div className="game-finale-crises">
            {summary.crises.map((crisis, i) => {
              const Icon = [Sun, Snowflake, Mountain][i];
              const Status =
                crisis.status === "survived"
                  ? Check
                  : crisis.status === "lost"
                    ? Leaf
                    : Circle;
              return (
                <article key={crisis.turn} data-status={crisis.status}>
                  <div>
                    <Icon size={19} />
                    <span>
                      Ходы {crisis.turn}–{crisis.end}
                    </span>
                    <Status size={14} />
                  </div>
                  <h3>{crisis.title}</h3>
                  <strong>
                    {crisis.status === "unreached"
                      ? "Не достигнут"
                      : crisis.status === "lost"
                        ? "Линия оборвалась"
                        : crisis.status === "survived"
                          ? "Пройден"
                          : "Начался"}
                  </strong>
                  {crisis.before !== null && (
                    <p className="game-finale-crisis-numbers">
                      {number(crisis.before)} <ArrowRight size={12} />{" "}
                      {number(crisis.after!)} <span>существ</span>
                    </p>
                  )}
                  <p>
                    {
                      crisisDescriptions[
                        crisis.event.kind as keyof typeof crisisDescriptions
                      ]
                    }
                  </p>
                </article>
              );
            })}
          </div>
          <p className="game-finale-observation">{summary.observation}</p>
        </Tabs.Content>
        <Tabs.Content value="explanation" className="game-finale-tab-panel">
          <div className="game-finale-analysis">
            <article>
              <span className="game-eyebrow">01 · Численность</span>
              <h3>
                {drop
                  ? `Самый резкий спад · ход ${drop.turn}`
                  : "Популяция росла от хода к ходу"}
              </h3>
              <p>
                {drop
                  ? `${number(drop.before)} → ${number(drop.after)} существ: сокращение на ${Math.round((1 - drop.after / drop.before) * 100)}%. Это итог всего хода, а не измерение воздействия одного события.`
                  : `Зафиксированный максимум — ${number(summary.peak.population)} существ. Ни один завершённый ход не закончился снижением общей численности.`}
              </p>
              <p>{summary.observation}</p>
            </article>
            <article>
              <span className="game-eyebrow">02 · Наследуемые признаки</span>
              <h3>
                {change.trait} · {change.value.toLowerCase()}
              </h3>
              <p className="game-finale-trait-shift">
                {Math.round(change.before)}% <ArrowRight size={20} />{" "}
                {Math.round(change.after)}%
              </p>
              <p>
                Самое заметное изменение доли признака от начала до{" "}
                {won
                  ? "финала"
                  : `последнего живого среза (ход ${summary.compositionTurn})`}
                . Частоты менялись через размножение, отбор, миграцию и
                случайность.
              </p>
            </article>
            <article>
              <span className="game-eyebrow">03 · Движение и изменения</span>
              <h3>Жизнь искала новые пути</h3>
              <dl className="game-finale-totals">
                <div>
                  <dt>Успешных переходов</dt>
                  <dd>{number(summary.migrations)}</dd>
                </div>
                <div>
                  <dt>Потерь в пути</dt>
                  <dd>{number(summary.transitLosses)}</dd>
                </div>
                <div>
                  <dt>Мутационных изменений</dt>
                  <dd>{number(summary.mutations)}</dd>
                </div>
              </dl>
              <p>
                Переходы включают естественное и заданное картами расселение.
                Мутации возникали при размножении; не все сохранились в
                популяции.
              </p>
            </article>
            <article>
              <span className="game-eyebrow">04 · Следующая попытка</span>
              <h3>
                {won
                  ? "Сохраните больше колоний"
                  : "Попробуйте изменить условия"}
              </h3>
              <p>
                {cold
                  ? "Сравните температуру островов и теплоизоляцию обитателей. «Убежище» смягчает температурный стресс, но не добавляет пищи."
                  : "Перед кризисом сравните запасы пищи и рационы колоний. «Новые побеги» увеличивают один источник пищи, «Мозаика жизни» перераспределяет запасы между двумя."}
              </p>
              <p>
                Повторите те же условия и проверьте другой план: исходный мир и
                последовательность событий будут прежними.
              </p>
            </article>
          </div>
          <details className="game-finale-notes">
            <summary>Записи последнего хода</summary>
            <ul>
              {summary.last?.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </details>
          <p className="game-finale-footnote">
            В этой модели исход зависит от пищи, температуры, хищников,
            наследуемых различий и случайности. Карты меняют условия, а не
            задают нужные мутации.
          </p>
        </Tabs.Content>
        <Tabs.Content value="islands" className="game-finale-tab-panel">
          <p className="game-finale-island-intro">
            Где сохранилась жизнь и какой численности достигала каждая колония
            по отчётам ходов.
          </p>
          <div className="game-finale-islands">
            {summary.islands.map((island, i) => (
              <article
                key={island.name}
                className={island.population ? "is-alive" : ""}
              >
                <span className="game-finale-island-index">0{i + 1}</span>
                <div>
                  <h3>{island.name}</h3>
                  <p>
                    {island.population
                      ? "Колония сохранилась"
                      : island.peak
                        ? "Колония исчезла"
                        : "Колоний в отчётах нет"}
                  </p>
                  <div className="game-finale-island-bar" aria-hidden="true">
                    <i
                      style={{
                        width: `${(island.population / Math.max(1, island.peak)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <strong>
                  {number(island.population)}
                  <small>пик {number(island.peak)}</small>
                </strong>
              </article>
            ))}
          </div>
        </Tabs.Content>
        <Tabs.Content value="attempts" className="game-finale-tab-panel">
          <div className="game-note">
            <h3>{missionStatus(state).title}</h3>
            <p>
              {missionStatus(state).achieved
                ? "Цель достигнута."
                : "Цель пока не достигнута."}{" "}
              {missionStatus(state).description}
            </p>
            <strong>{missionStatus(state).progress}</strong>
          </div>
          <AttemptComparison state={state} records={readRecords()} />
        </Tabs.Content>
      </Tabs.Root>
      <div className="game-finale-footer">
        <button className="game-text-button" onClick={onHistory}>
          <History size={15} /> История популяций
        </button>
        <div>
          <button className="game-text-button" onClick={() => onReplay(false)}>
            Новая экспедиция <ArrowRight size={14} />
          </button>
          <button className="islands-primary" onClick={() => onReplay(true)}>
            Те же условия <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </GameDialog>
  );
}
