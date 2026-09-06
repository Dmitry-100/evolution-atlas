import { CARD_NOTES } from "../../game/cardNotes";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Copy, GitBranch } from "lucide-react";
import { REGIONS, TRAITS, describeAction } from "../../game/content";
import { count } from "../../game/engine";
import {
  branchDifference,
  discoveryHistory,
  isolatedTurns,
} from "../../game/observations";
import { OptimizedImage } from "../ui/optimized-image";
import {
  comparisonRun,
  expeditionLink,
  FIELD_NOTES,
  FIELD_SOURCES,
  GALAPAGOS_INTRO,
  MODEL_NOTE,
  missionStatus,
} from "../../game/expedition";
import type { GameState, RunRecord } from "../../game/types";
import { GameDialog } from "./GameDialog";

export function CardStory({
  kind,
}: {
  kind: import("../../game/types").CardKind;
}) {
  const note = CARD_NOTES[kind];
  return (
    <aside className="game-card-story">
      <span className="game-eyebrow">{note.topic}</span>
      <h3>{note.title}</h3>
      <p>{note.text}</p>
      <div>
        <Link to={note.atlas}>
          Открыть в атласе <ArrowUpRight size={12} />
        </Link>
        <a
          href={note.source}
          target="_blank"
          rel="noreferrer"
          title={note.sourceTitle}
        >
          Источник <ArrowUpRight size={12} />
        </a>
      </div>
    </aside>
  );
}
export function FieldNote({ kind }: { kind: string }) {
  const note = FIELD_NOTES[kind as keyof typeof FIELD_NOTES];
  if (!note) return null;
  const source = FIELD_SOURCES[note.source];
  return (
    <aside className="game-field-note">
      <span className="game-eyebrow">Заметка натуралиста</span>
      <h3>{note.title}</h3>
      <p>{note.text}</p>
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.title} <ArrowUpRight size={13} />
      </a>
    </aside>
  );
}
export function DiscoveryCards({ state }: { state: GameState }) {
  const notes = discoveryHistory(state);
  return (
    <div className="game-discoveries">
      {!notes.length && (
        <p className="game-muted">
          Первые открытия появятся после хода. Наблюдайте, что меняется у
          потомков.
        </p>
      )}
      {notes.map((note) => (
        <article key={note.id}>
          <OptimizedImage
            src={`/assets/images/game/discoveries/${note.art}-v5.jpg`}
            alt={note.alt}
            width={900}
            height={600}
          />
          <div className="game-discovery-copy">
            <span className="game-eyebrow">Открытие · ход {note.turn}</span>
            <h3>{note.title}</h3>
            <p>{note.text}</p>
            <Link to={note.href}>
              {note.label}
              <ArrowUpRight size={14} />
            </Link>
            <a
              className="game-discovery-source"
              href={note.source}
              target="_blank"
              rel="noreferrer"
            >
              Источник <ArrowUpRight size={12} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
function ColonyTree({ state }: { state: GameState }) {
  const storageKey = `evolution-atlas.lineage-names.${state.runId}`;
  const [names, setNames] = useState<Record<string, string>>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "{}",
      );
      return value && typeof value === "object" && !Array.isArray(value)
        ? Object.fromEntries(
            Object.entries(value).filter(
              ([k, v]) =>
                /^[0-5]$/.test(k) && typeof v === "string" && v.length <= 40,
            ),
          )
        : {};
    } catch {
      return {};
    }
  });
  const origins = state.lineages ?? [];
  const depth = (island: number, seen: number[] = []): number => {
    const parent = origins.find((o) => o.island === island)?.parent;
    return parent == null || seen.includes(parent)
      ? 0
      : 1 + depth(parent, [...seen, island]);
  };
  return (
    <>
      <p className="game-muted">
        Первое заселение берегов вашей линией. Последующее смешение популяций
        здесь не показано; это история колоний, а не доказательство появления
        новых видов.
      </p>
      {origins.length ? (
        <ol className="game-colony-tree">
          {origins.map((o) => {
            const difference = branchDifference(state, o.island, o.parent);
            const isolated = isolatedTurns(state, o.island);
            return (
              <li
                key={o.island}
                style={{ marginLeft: `${depth(o.island) * 20}px` }}
              >
                <GitBranch size={18} />
                <div>
                  <strong>{REGIONS[o.island].name}</strong>
                  <p>
                    {o.parent === null
                      ? "Исходная популяция"
                      : `С острова ${REGIONS[o.parent].name} · ход ${o.turn}`}
                  </p>
                  <label>
                    Название ветви
                    <input
                      maxLength={40}
                      value={names[o.island] ?? ""}
                      placeholder="Дайте колонии имя"
                      onChange={(e) => {
                        const next = { ...names, [o.island]: e.target.value };
                        setNames(next);
                        try {
                          localStorage.setItem(
                            storageKey,
                            JSON.stringify(next),
                          );
                        } catch {
                          /* Names remain editable in memory. */
                        }
                      }}
                    />
                  </label>
                  {difference && (
                    <div className="game-branch-difference">
                      <small>{difference.label}</small>
                      <p>
                        {difference.change.name} ·{" "}
                        {difference.change.value.toLowerCase()}:{" "}
                        <strong>
                          {Math.round(difference.change.before * 100)}% →{" "}
                          {Math.round(difference.change.after * 100)}%
                        </strong>
                      </p>
                      <div
                        className="game-branch-traits"
                        aria-label="Наиболее частые признаки колонии"
                      >
                        {difference.after.map((v, t) => (
                          <span key={t}>
                            {TRAITS[t].name}:{" "}
                            <b>
                              {TRAITS[t].values[
                                v.indexOf(Math.max(...v))
                              ].toLowerCase()}
                            </b>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {isolated > 0 && (
                    <small className="game-branch-isolation">
                      Без морских путей: {isolated} ход.
                    </small>
                  )}
                </div>
                <span>
                  {count(state.regions[o.island]) || "—"}
                  <small>
                    {count(state.regions[o.island])
                      ? "живут сейчас"
                      : "не сохранилась"}
                  </small>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p>
          Для старой сохранённой партии источник первого заселения неизвестен.
          История ветвей записывается в новых экспедициях.
        </p>
      )}
    </>
  );
}
export function AttemptComparison({
  state,
  records,
}: {
  state: GameState;
  records: RunRecord[];
}) {
  const previous = comparisonRun(state, records),
    points = [80, ...state.history.map((r) => r.after)];
  if (!previous?.points)
    return (
      <div className="game-note">
        <h3>Один мир — два решения</h3>
        <p>
          Завершите экспедицию и повторите «Те же условия». Здесь появятся оба
          графика и различия в сыгранных картах. Сравниваются партии с
          одинаковым начальным миром, правилами и настройками.
        </p>
      </div>
    );
  const max = Math.max(100, ...points, ...previous.points);
  const line = (values: number[]) =>
    values
      .map(
        (n, i) =>
          `${i ? "L" : "M"}${24 + (i / 18) * 552},${112 - (n / max) * 95}`,
      )
      .join(" ");
  return (
    <section className="game-attempt-comparison">
      <h3>Повтор того же мира</h3>
      <p>
        <span className="game-comparison-key current" />
        Эта попытка <span className="game-comparison-key previous" />
        Предыдущая
      </p>
      <svg
        viewBox="0 0 600 138"
        role="img"
        aria-label={`Сравнение численности: сейчас ${points.join(", ")}, предыдущая попытка ${previous.points.join(", ")}`}
      >
        <path d="M24 12V112H576" fill="none" stroke="#8d876650" />
        <path
          d={line(previous.points)}
          fill="none"
          stroke="#82b5ad"
          strokeWidth="2"
          strokeDasharray="5 3"
        />
        <path d={line(points)} fill="none" stroke="#e8c675" strokeWidth="3" />
        {[0, 6, 12, 18].map((n) => (
          <text
            key={n}
            x={24 + (n / 18) * 552}
            y="133"
            fill="#aaa592"
            fontSize="11"
          >
            {n}
          </text>
        ))}
      </svg>
      <p>
        Сейчас: {points.at(-1)} существ · предыдущая попытка:{" "}
        {previous.population} к ходу {previous.turns}.
      </p>
      <details>
        <summary>Где решения отличались</summary>
        {state.history
          .filter(
            (r) =>
              JSON.stringify((r.actions ?? []).map(describeAction)) !==
              JSON.stringify(previous.actions?.[r.turn - 1] ?? []),
          )
          .map((r) => (
            <p key={r.turn}>
              <strong>Ход {r.turn}</strong>
              <br />
              Сейчас:{" "}
              {(r.actions ?? []).map(describeAction).join(" + ") ||
                "Наблюдение"}
              <br />
              Раньше:{" "}
              {previous.actions?.[r.turn - 1]?.join(" + ") || "Наблюдение"}
            </p>
          ))}
      </details>
      <p className="game-muted">
        После разных действий ход случайных биологических расчётов тоже может
        разойтись. Графики показывают две попытки целиком, а не точный эффект
        отдельной карты.
      </p>
    </section>
  );
}
export function FieldJournal({
  state,
  records,
  open,
  onClose,
}: {
  state: GameState;
  records: RunRecord[];
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const mission = missionStatus(state),
    link = expeditionLink(state, window.location.origin);
  return (
    <GameDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Дневник натуралиста"
      eyebrow="Галапагосы · Наблюдения и открытия"
      className="game-journal"
    >
      <div className="game-journal-mission">
        <strong>{mission.title}</strong>
        <span>{mission.achieved ? "Цель достигнута" : mission.progress}</span>
        <p>{mission.description}</p>
      </div>
      <Tabs.Root defaultValue="discoveries">
        <Tabs.List
          className="game-finale-tab-list"
          aria-label="Разделы дневника"
        >
          <Tabs.Trigger value="discoveries">Открытия</Tabs.Trigger>
          <Tabs.Trigger value="lineage">Ветви</Tabs.Trigger>
          <Tabs.Trigger value="compare">Попытки</Tabs.Trigger>
          <Tabs.Trigger value="islands">Галапагосы</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="discoveries">
          <DiscoveryCards state={state} />
          <FieldNote kind={state.events[state.turn - 1].kind} />
        </Tabs.Content>
        <Tabs.Content value="lineage">
          <ColonyTree key={state.runId} state={state} />
        </Tabs.Content>
        <Tabs.Content value="compare">
          <AttemptComparison state={state} records={records} />
          {state.version >= 2 && (
            <div className="game-share-expedition">
              <h3>Пригласите друга в тот же мир</h3>
              <p>
                Ссылка содержит настройки и начальный мир; ваши ходы и
                сохранения остаются в браузере.
              </p>
              <input
                aria-label="Ссылка на экспедицию"
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
              />
              <button
                className="game-text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                    setCopyFailed(false);
                  } catch {
                    setCopyFailed(true);
                  }
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
              </button>
              {copyFailed && (
                <p role="status">
                  Выделите ссылку выше и скопируйте её вручную.
                </p>
              )}
            </div>
          )}
        </Tabs.Content>
        <Tabs.Content value="islands">
          <p className="game-darwin-intro">{GALAPAGOS_INTRO}</p>
          <div className="game-island-register">
            {REGIONS.map((r, i) => (
              <article key={r.name}>
                <span>0{i + 1}</span>
                <h3>{r.name}</h3>
                <p>
                  {r.subtitle} · {r.biome}
                </p>
              </article>
            ))}
          </div>
          <p className="game-muted">{MODEL_NOTE}</p>
          <FieldNote kind="raft" />
          <FieldNote kind="garua" />
          <FieldNote kind="elnino" />
          <details>
            <summary>Источники исторических и природных пояснений</summary>
            {FIELD_SOURCES.map((s) => (
              <p key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <ArrowUpRight size={13} />
                </a>
              </p>
            ))}
          </details>
        </Tabs.Content>
      </Tabs.Root>
    </GameDialog>
  );
}
