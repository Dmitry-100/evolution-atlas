# План: «Проведи меня через тысячелетия» — персональный гид-Дарвин

**Дата:** 2026-06-28
**Проект:** Evolution Atlas «Достающее звено» (`/10 - coding project/evolution-atlas`)
**Статус:** согласован, готов к реализации

---

## Контекст

Фича превращает реактивный AI-гид «Дарвин» в **персонального экскурсовода**: отдельная
кнопка в меню «Проведи меня через тысячелетия» → Дарвин задаёт 2–3 вопроса (возраст/уровень,
ключевой интерес — multiple choice + свободный текст, бюджет времени) → формирует маршрут по
сайту и **ведёт по нему по шагам**, поясняя логику переходов и задавая наводящие
(сократические) вопросы до раскрытия ответа.

Цель: перевести атлас из режима «энциклопедия, в которой надо самому копаться» в режим
«индивидуальная экскурсия под зрителя» — на уже существующей инфраструктуре (AI-бэкенд,
данные этапов, deep-link состояния), без новых моделей и интеграций.

### Согласованные решения
1. **Генерация маршрута — гибрид:** детерминированный каркас + LLM-персонализация поверх.
2. **Прохождение — гид ведёт по шагам** (плеер навигирует пользователя, реплики Дарвина оверлеем).
3. **Сократические вопросы — в первой версии** (на каждой остановке вопрос до раскрытия).

---

## Ключевой принцип (почему гибрид, а не «чистый LLM»)

Кодовая база уже исповедует дисциплину: **любой ответ LLM валидируется против реального
allow-list, иначе fallback** — см. `normalizeCitations`, `normalizeRelatedLinks`,
`isUsableResponse`, `FALLBACK_RESPONSE` в `src/lib/askDarwinHandler.ts`; системный промпт
запрещает выдумывать ссылки/факты.

Маршрут строим по тому же принципу:
- **Детерминированное ядро** собирает валидный маршрут из каталога реальных остановок —
  работает всегда, даже если AI недоступен (как при отсутствии `YANDEX_API_KEY` в
  `createYandexCloudFunctionFromEnv`).
- **LLM выбирает/упорядочивает остановки строго из переданного allow-list** и пишет связную
  логику переходов + наводящие вопросы. Любой `id` вне списка отбрасывается, недостающее
  добивается из ядра. Фича **не падает никогда**.

---

## Контракт нового эндпоинта `/api/plan-tour`

Отдельный эндпоинт-зеркало `ask-darwin` — чтобы не ломать строго оттестированный Q&A-контракт.

```ts
// запрос
type PlanTourRequest = {
  level: "kid" | "teen" | "adult" | "expert";
  interests: InterestTag[];          // выбранные чипы
  freeText?: string;                 // «опишу сам»
  budgetMin?: 5 | 15 | null;
  allowedStops: { id: string; titleRu: string; hint: string }[]; // allow-list из каркаса
};

// ответ (строгий JSON, как DarwinGuideResponseData)
type TourPlanResponse = {
  introRu: string;
  steps: {
    id: string;            // обязан существовать в allowedStops
    narrationRu: string;   // зачем мы здесь и почему идём дальше
    socraticQuestionRu: string;
    revealRu: string;      // ответ на наводящий вопрос
  }[];
  outroRu: string;
};
```

LLM выбирает/сортирует `steps` **только** из `allowedStops`. Валидация на бэкенде: id вне
allow-list — выкинуть; если шагов меньше порога — добить детерминированным каркасом; нет
ключа/AI лёг → полностью детерминированный план с шаблонной озвучкой.

Системный промпт (суть): «Ты Дарвин-экскурсовод. Выбери и упорядочь остановки ТОЛЬКО из этого
списка id. Для каждой — 1–2 фразы: зачем мы здесь и почему идём дальше, плюс один наводящий
вопрос и краткий ответ на него. Верни строгий JSON. id не выдумывай. Свободный интерес
пользователя сопоставь с известными темами.»

---

## Файлы (в конвенциях проекта)

| Файл | Назначение |
|---|---|
| `src/data/guidedTour.ts` (+`.test.ts`) | Типы `InterestTag`, `TourLevel`, `TourStop`; каталог остановок. Stage-остановки генерим из `STAGES` (используем `slug`/`eraId`/`lineageRole`/`isPrimateFocus`), page-остановки (`/genetics`, `/dinosaurs`, `/extinctions`, `/theory`, `/origin-of-life`, `/cladogram`) — вручную. Ссылки собираем `stageLink`/`toAtlasSearchParams` — нулевой риск битых URL |
| `src/lib/buildTourRoute.ts` (+`.test.ts`) | Чистая функция `answers → TourPlan`: фильтр каталога по интересу+уровню, сортировка по `ageMa` (глубокое время → настоящее), обрезка по бюджету. Всегда валидна — основа fallback |
| `src/lib/planTourHandler.ts` (+`.test.ts`) | Зеркало `askDarwinHandler.ts`: системный промпт, `response_format: json_object`, `normalize*` против allow-list, `isUsableResponse`, fallback на `buildTourRoute`. Тесты с моком `generate` (как `askDarwinHandler.test.ts`) |
| `src/lib/planTourCloudFunction.ts` (+`.test.ts`) | Зеркало `yandexCloudFunction.ts` + `createFromEnv` с мягкой деградацией при отсутствии ключей |
| `scripts/build-plan-tour-function.mjs` | Зеркало `scripts/build-ask-darwin-function.mjs`; добавить скрипт `build:plan-tour-function` в `package.json` |
| `src/pages/GuidedTourPage.tsx` | Онбординг: возраст/уровень + чипы интереса + поле «опишу сам» + бюджет времени. Lazy-роут как все страницы |
| `src/components/tour/TourPlayer.tsx` (+`.css`, переиспользовать `DarwinGuide.css`) | Рельс остановок с прогрессом, «Дальше →» → `navigate(href)`, пузырь Дарвина с логикой перехода, сократический вопрос с раскрытием «Показать ответ» |
| `src/lib/tourUrlState.ts` (+`.test.ts`) | `?tour=<planId>&step=n` — по образцу `atlasUrlState.ts`, чтобы refresh не терял прогресс |
| `src/App.tsx` | lazy-роут `/tour` + выделенная CTA-кнопка «Проведи меня через тысячелетия» (не рядовой пункт — навигация уже на 10 пунктов) |

---

## Поток

```
Онбординг (GuidedTourPage)
   → buildTourRoute собирает каркас (валидные остановки + allow-list)
   → POST /api/plan-tour с allow-list
   → TourPlayer ведёт по шагам:
        на каждом шаге navigate() на реальный deep-link (этап атласа или страница),
        поверх — реплика Дарвина «мы здесь, потому что… → дальше посмотрим…»,
        + наводящий вопрос → пользователь думает → «Показать ответ» → «Дальше →»
   → outro Дарвина
```

Состояние тура — в URL (`?tour=…&step=n`), как уже сделано с состоянием атласа
(`atlasUrlState.ts`).

---

## Порядок работ (сначала тестируемое ядро — под тест-культуру репозитория)

1. **Ядро без AI:** `guidedTour.ts` + `buildTourRoute.ts` с тестами. Даёт рабочий валидный
   маршрут уже без всякого LLM.
2. **Бэкенд:** `planTourHandler` + `planTourCloudFunction` + `build-plan-tour-function.mjs`
   с тестами (мок `generate`).
3. **UI:** `GuidedTourPage` + `TourPlayer` + `tourUrlState` + роут и CTA в `App.tsx`.
4. **e2e (playwright):** онбординг → 3 шага → сократический reveal; отдельный сценарий —
   fallback при выключенном AI.

---

## Проверка (end-to-end)

- `pnpm test` — юниты ядра (`buildTourRoute`, каталог), хендлера (мок `generate`),
  `tourUrlState`.
- `pnpm e2e` — сценарий прохождения тура + сценарий fallback.
- Вручную с пустым `YANDEX_API_KEY` — тур обязан пройти на детерминированном плане
  (шаблонная озвучка, валидные ссылки).
- Заодно: починить `server.host` в `vite.config` (`server: { host: true }`), чтобы dev
  открывался на `localhost`, а не только `127.0.0.1` — текущий 5174 слушает лишь IPv4, из-за
  чего Chrome (`localhost` → IPv6 `::1`) получает «страницу ошибки».

---

## Связанные заметки

- Существующий AI-гид: `src/components/ai/DarwinGuide.tsx`, `src/lib/askDarwinHandler.ts`,
  `src/lib/aiGuideContext.ts`, `src/lib/yandexCloudFunction.ts`.
- Модель этапа `EvolutionStage` и `STAGES`/`ERAS`: `src/data/lineage.ts`.
- Deep-link состояния атласа: `src/lib/atlasUrlState.ts` (`toAtlasSearchParams`, `stageLink`).
- Накопитель признаков (родственная механика): `src/components/atlas/TraitAccumulator.tsx`,
  `src/lib/accumulatedTraits.ts`.
