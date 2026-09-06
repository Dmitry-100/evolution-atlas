import { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { DEFAULT_SETTINGS } from "../../game/content";
import { MISSIONS, MODEL_NOTE, sharedExpedition } from "../../game/expedition";
import type { ExpeditionSettings } from "../../game/types";
import { GameDialog } from "./GameDialog";
import { GameSelect } from "./GameSelect";
import { OptimizedImage } from "../ui/optimized-image";

export function ExpeditionSetup({
  open,
  onClose,
  onStart,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onStart: (
    settings: ExpeditionSettings,
    seed?: number,
    tutorial?: boolean,
  ) => void;
  initial?: ReturnType<typeof sharedExpedition>;
}) {
  const [settings, setSettings] = useState<ExpeditionSettings>(
    initial?.settings ?? DEFAULT_SETTINGS,
  );
  const [tutorial, setTutorial] = useState(true);
  return (
    <GameDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Галапагосы. Начало экспедиции"
      eyebrow="Галапагосы · Ваша экспедиция"
      className="game-expedition-setup"
    >
      <figure className="game-expedition-hero">
        <OptimizedImage
          src="/assets/images/game/darwin-beagle-v4.jpg"
          alt="Молодой Дарвин с полевым дневником на вулканическом берегу; «Бигль» стоит в бухте Галапагосов."
          width={960}
          height={1200}
        />
        <figcaption>
          <span>ТИХИЙ ОКЕАН · 1835</span>
          <strong>
            Острова, которые
            <br />
            изменили взгляд на жизнь.
          </strong>
          <small>Художественная иллюстрация экспедиции</small>
        </figcaption>
      </figure>
      <div className="game-expedition-brief">
        <p className="game-expedition-history">
          В 1835 году Дарвин прибыл сюда на «Бигле». Различия между обитателями
          островов стали подсказкой к его теории. Естественный отбор он
          сформулировал позже — в 1838 году.
        </p>
        <div className="game-start-goal">
          <Compass size={24} />
          <div>
            <h3>Помогите жизни продолжиться</h3>
            <p>
              Расселяйте животных, меняйте условия и переживите три кризиса.
            </p>
          </div>
        </div>
        <div className="game-expedition-numbers">
          <span>
            <strong>80</strong>существ
          </span>
          <span>
            <strong>6</strong>островов
          </span>
          <span>
            <strong>18</strong>ходов
          </span>
        </div>
        <p className="game-expedition-loop">
          Выберите остров → сыграйте карты на 2 очка → посмотрите, как
          изменились потомки.
        </p>
        <div className="game-setup-fields">
          <GameSelect
            label="Цель экспедиции"
            value={settings.mission}
            onChange={(v) =>
              setSettings({
                ...settings,
                mission: v as ExpeditionSettings["mission"],
              })
            }
            options={Object.entries(MISSIONS).map(([value, mission]) => ({
              value,
              label: mission.title,
              detail: mission.description,
            }))}
          />
          <GameSelect
            label="Режим"
            value={settings.mode}
            onChange={(v) =>
              setSettings({
                ...settings,
                mode: v as ExpeditionSettings["mode"],
                mutation: "normal",
                migration: "normal",
              })
            }
            options={[
              {
                value: "expedition",
                label: "Экспедиция",
                detail: "Обычные правила и выбранная цель",
              },
              {
                value: "sandbox",
                label: "Исследователь",
                detail: "Эксперимент с мутациями и расселением",
              },
            ]}
          />
        </div>
        <p className="game-mission-description">
          {MISSIONS[settings.mission].description}
        </p>
        <div className="game-sandbox-controls">
          {(["mutation", "migration"] as const).map((key) => (
            <GameSelect
              key={key}
              disabled={settings.mode !== "sandbox"}
              label={
                key === "mutation"
                  ? "Частота мутаций"
                  : "Естественное расселение"
              }
              value={settings[key]}
              onChange={(v) => setSettings({ ...settings, [key]: v })}
              options={[
                {
                  value: "low",
                  label: "Реже",
                  detail:
                    key === "mutation"
                      ? "0,2% на потомка"
                      : "0,4 от обычной частоты",
                },
                {
                  value: "normal",
                  label: "Обычно",
                  detail:
                    key === "mutation" ? "0,7% на потомка" : "Базовая частота",
                },
                {
                  value: "high",
                  label: "Чаще",
                  detail: key === "mutation" ? "2,1% на потомка" : "Вдвое чаще",
                },
              ]}
            />
          ))}
          <p>
            Изменяется в режиме «Исследователь». Мутации возникают случайно.
          </p>
        </div>
        <label className="game-tutorial-toggle">
          <input
            type="checkbox"
            checked={tutorial}
            onChange={(e) => setTutorial(e.target.checked)}
          />
          Подсказки на первом ходу
        </label>

        <button
          className="islands-primary"
          onClick={() => {
            onStart(settings, initial?.seed, tutorial);
          }}
        >
          Отправиться к островам <ArrowRight size={17} />
        </button>
        <p className="game-expedition-model" title={MODEL_NOTE}>
          Реальные острова, вымышленные животные. Условия и кризисы — игровая
          модель.
        </p>
      </div>
    </GameDialog>
  );
}
