# Evolution Atlas

Интерактивный образовательный атлас эволюции на русском языке. Проект отвечает на простой крючок: если человек произошел от обезьяны, то от кого произошли обезьяны, приматы и вся линия, которая привела к нам?

## Стек

- Vite SPA
- React + TypeScript
- Tailwind CSS v4
- Radix/shadcn-compatible UI primitives
- Vitest для unit-тестов
- Playwright для e2e

Frontend остается статическим, а два публичных AI endpoint работают в Yandex Cloud Functions через API Gateway:

- `POST /api/ask-darwin` — ответ Дарвина с site/external grounding;
- `POST /api/plan-tour` — маршрут на 8 или 15 остановок с явным `personalizationSource`.

Production: [atlas.aidms.ru](https://atlas.aidms.ru/). Облачная архитектура, Search API, SWS, Lockbox и откат описаны в `docs/ai-guide-yandex-cloud.md`.

## Структура

- `src/data/lineage.ts` - единственный источник истины по этапам, изображениям и источникам.
- `src/data/evidence.ts` - короткий блок о научной теории и доказательствах эволюции.
- `src/data/genetics.ts` - молекулярная генетика, РНК/ДНК, проценты сходства геномов и источники.
- `src/data/bodyTraits.ts` - карта признаков человека: слои тела, пины и связь с предковыми узлами Атласа.
- `src/data/extinctions.ts` - пять глобальных вымираний, их причины, последствия и связь с нашей ветвью.
- `src/lib/timeline.ts` - математика временной шкалы, форматирование дат и доля истории до приматов.
- `src/components/atlas/` - компоненты интерактивного атласа.
- `config/public-routes.json` - единый список SPA-маршрутов для Router, навигации и deploy workflow.
- `src/pages/` - страницы `/`, `/primates`, `/theory`, `/origin-of-life`, `/genetics`, `/cladogram`, `/body-map`, `/extinctions`, `/dinosaurs`, `/materials`, `/sources`, `/about`, `/quiz`.
- `public/assets/` - локальные изображения, доступные в сборке.
- `cloud-functions/` - функции `ask-darwin` и `plan-tour`.
- `infra/` - OpenAPI Gateway и Terraform для Smart Web Security/ARL.
- `legacy/onepager-2026-06-16/` - архив старой one-page версии.
- `deploy/` и `scripts/` - домашний статический деплой.

## Локальный запуск

```bash
pnpm install
pnpm dev
```

Если `pnpm` не установлен глобально, используйте Corepack без установки в `/usr/local/bin`:

```bash
corepack pnpm install
corepack pnpm dev
```

Проверки:

```bash
pnpm lint
pnpm test
pnpm build
pnpm e2e --project=desktop
pnpm e2e --project=mobile
```

Production build создает content-hash имена для локальных JPG/PNG/AVIF. JS, CSS и изображения рассчитаны на `Cache-Control: public, max-age=31536000, immutable`; `index.html`, SPA fallback и служебные нехешированные файлы должны отдаваться с `no-cache, must-revalidate`.

Сборка также создает отдельный SEO HTML для каждого публичного маршрута, `robots.txt`, `sitemap.xml` и JSON-LD. Подключение Яндекс Метрики, Яндекс Вебмастера и Google Search Console описано в [`docs/seo-and-analytics.md`](docs/seo-and-analytics.md).

## Деплой

Идея production-прогона:

```bash
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build
```

Frontend выкладывает `.github/workflows/deploy-yc.yml` после успешных desktop/mobile e2e. Backend выкладывает `.github/workflows/deploy-yc-backend.yml`: ZIP → `candidate` → прямые smoke-тесты → тег `production` → обновление Gateway. Секрет модели хранится только в Lockbox.

## Источники

Базовый визуальный и смысловой референс: [Visual Capitalist: The Path of Human Evolution](https://www.visualcapitalist.com/path-of-human-evolution/). Изображения этапов сохранены локально из открытых источников с кредитами и лицензиями; конкретные ссылки хранятся в `src/data/lineage.ts` и отображаются на странице `/sources`. Объяснение научного смысла слова “теория” и доказательств эволюции вынесено на `/theory`; ветвь приматов и происхождение Homo sapiens - на `/primates`; карта признаков человека - на `/body-map`; глобальные вымирания - на `/extinctions`.
