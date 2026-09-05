import { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { DEFAULT_SETTINGS } from "../../game/content";
import {
  GALAPAGOS_INTRO,
  MISSIONS,
  MODEL_NOTE,
  sharedExpedition,
} from "../../game/expedition";
import type { ExpeditionSettings } from "../../game/types";
import { GameDialog } from "./GameDialog";
import { GameSelect } from "./GameSelect";

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
  const [code, setCode] = useState(initial?.seed.toString(16) ?? "");
  const [tutorial, setTutorial] = useState(true);
  const validCode = !code || /^[a-f\d]{1,8}$/i.test(code);
  return (
    <GameDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Вслед за вопросами Дарвина"
      eyebrow="Галапагосы · Ваша экспедиция"
      className="game-expedition-setup"
    >
      <p className="game-darwin-intro">{GALAPAGOS_INTRO}</p>
      <div className="game-start-goal">
        <Compass size={30} />
        <div>
          <h3>Ваша задача — сохранить жизнь</h3>
          <p>
            80 существ, 6 островов, 18 ходов. Переживите засуху, похолодание и
            извержение. На каждом ходу — 2 очка для изменения условий и
            расселения.
          </p>
        </div>
      </div>
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
      <p className="game-muted">{MISSIONS[settings.mission].description}</p>
      {settings.mode === "sandbox" && (
        <div className="game-sandbox-controls">
          {(["mutation", "migration"] as const).map((key) => (
            <GameSelect
              key={key}
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
            Мутации случайны относительно потребностей. Увеличение их частоты не
            гарантирует приспособления. Настройки действуют всю партию.
          </p>
        </div>
      )}
      <details className="game-seed-settings">
        <summary>Повторить мир по коду</summary>
        <label>
          Код экспедиции
          <input
            value={code}
            maxLength={8}
            placeholder="Например, 7b"
            onChange={(e) => setCode(e.target.value.trim())}
          />
        </label>
        <p>
          Оставьте поле пустым для нового мира. Код задаёт начальную популяцию и
          события.
        </p>
        {!validCode && <p role="alert">Код: от 1 до 8 символов 0–9 и a–f.</p>}
      </details>
      <label className="game-tutorial-toggle">
        <input
          type="checkbox"
          checked={tutorial}
          onChange={(e) => setTutorial(e.target.checked)}
        />
        Подсказки на первом ходу
      </label>
      <p className="game-muted">{MODEL_NOTE}</p>
      <button
        className="islands-primary"
        disabled={!validCode}
        onClick={() => {
          onStart(settings, code ? parseInt(code, 16) : undefined, tutorial);
        }}
      >
        Отправиться к островам <ArrowRight size={17} />
      </button>
    </GameDialog>
  );
}
