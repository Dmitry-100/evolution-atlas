import { ArrowRight, ArrowUpRight, Leaf, MapPin, Waves } from "lucide-react";
import { CARDS, EVENTS, REGIONS, cardKind } from "../../game/content";
import { count } from "../../game/engine";
import type { GameState } from "../../game/types";
import { evolutionMoment } from "../../game/observations";
import { CreatureComparison } from "./CreatureComparison";

export function TurnSummary({
  state,
  onContinue,
  onJournal,
  paused = false,
}: {
  state: GameState;
  onContinue: () => void;
  onJournal: () => void;
  paused?: boolean;
}) {
  const report = state.history.at(-1);
  if (!report) return null;
  const before = state.history.at(-2)?.populations ?? [80, 0, 0, 0, 0, 0];
  const settled = report.populations.filter(
    (n, i) => n > 0 && before[i] === 0,
  ).length;
  const lost = report.populations.filter(
    (n, i) => n === 0 && before[i] > 0,
  ).length;
  const difference = report.after - report.before;
  const moment = evolutionMoment(state);
  const change = report.notes
    .find((note) => note.includes("→"))
    ?.split(" Частоты")[0];
  const actions = (report.actions ?? []).map(
    (a) => CARDS[cardKind(a.card)].title,
  );
  return (
    <div className={`game-turn-summary${moment ? " has-evolution" : ""}`}>
      <div className="game-turn-population">
        <span>Численность</span>
        <strong>
          {report.before}
          <ArrowRight size={24} />
          {report.after}
        </strong>
        <small className={difference >= 0 ? "is-growing" : "is-falling"}>
          {difference >= 0 ? "+" : ""}
          {difference} за ход
        </small>
      </div>
      <div className="game-turn-facts">
        <p>
          <MapPin size={16} />
          <strong>
            {state.regions.filter((r) => count(r) > 0).length}
          </strong>{" "}
          живых островов
        </p>
        <p>
          <Waves size={16} />
          <strong>{report.migrations}</strong> успешных переходов
        </p>
      </div>
      <div className="game-turn-takeaway">
        <span className="game-eyebrow">Главное за ход</span>
        <p>
          {settled || lost
            ? `${settled ? `Новых колоний: ${settled}. ` : ""}${lost ? `Исчезло колоний: ${lost}.` : ""}`
            : "Колонии остались на прежних берегах."}
        </p>
        {!moment && change && (
          <p>
            <Leaf size={15} />
            {change}
          </p>
        )}
        {moment && (
          <div className="game-turn-evolution">
            <CreatureComparison
              before={moment.first.traits}
              beforeCounts={moment.first.counts}
              focusTrait={moment.change.trait}
              afterCounts={state.regions[moment.island].counts}
              after={moment.now}
              beforeLabel={
                moment.first.turn ? `Ход ${moment.first.turn}` : "В начале"
              }
              paused={paused}
            />
            <p>
              <Leaf size={13} />
              {REGIONS[moment.island].name} · {moment.change.name.toLowerCase()}
              : {moment.change.value.toLowerCase()} —{" "}
              {Math.round(moment.change.before * 100)}% →{" "}
              {Math.round(moment.change.after * 100)}% за ход.
            </p>
            <small>Фигурки — представители популяции</small>
          </div>
        )}
      </div>
      <p className="game-turn-context">
        <strong>{EVENTS[report.event.kind].title}</strong>
        {[5, 11, 17].includes(report.turn)
          ? " · весь архипелаг"
          : ` · ${REGIONS[report.event.region].name}`}
        <br />
        {actions.length
          ? actions.join(" + ")
          : report.actions
            ? "Вы наблюдали без вмешательства."
            : ""}
      </p>
      <div className="game-turn-summary-actions">
        <button className="game-text-button" onClick={onJournal}>
          В дневник
          <ArrowUpRight size={13} />
        </button>
        <button className="islands-primary" onClick={onContinue}>
          К следующему ходу
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
