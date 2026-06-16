# Evolution Atlas

Интерактивный образовательный атлас эволюции на русском языке. Проект отвечает на простой крючок: если человек произошел от обезьяны, то от кого произошли обезьяны, приматы и вся линия, которая привела к нам?

## Стек

- Vite SPA
- React + TypeScript
- Tailwind CSS v4
- Radix/shadcn-compatible UI primitives
- Vitest для unit-тестов
- Playwright для e2e

Сайт не требует серверного runtime. Production-сборка лежит в `dist/` и может отдаваться Caddy, nginx, GitHub Pages или любым static server.

## Структура

- `src/data/lineage.ts` - единственный источник истины по этапам, изображениям и источникам.
- `src/data/evidence.ts` - короткий блок о научной теории и доказательствах эволюции.
- `src/lib/timeline.ts` - математика временной шкалы, форматирование дат и доля истории до приматов.
- `src/components/atlas/` - компоненты интерактивного атласа.
- `src/pages/` - маршруты `/`, `/theory`, `/sources`, `/about`.
- `public/assets/` - локальные изображения, доступные в сборке.
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
pnpm e2e
```

## Домашний сервер

Идея production-прогона:

```bash
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build
```

После этого Caddy/nginx раздает только `dist/`. Пример Caddy-конфига лежит в `deploy/Caddyfile.example`.

## Источники

Базовый визуальный и смысловой референс: [Visual Capitalist: The Path of Human Evolution](https://www.visualcapitalist.com/path-of-human-evolution/). Изображения этапов сохранены локально из открытых источников с кредитами и лицензиями; конкретные ссылки хранятся в `src/data/lineage.ts` и отображаются на странице `/sources`. Объяснение научного смысла слова “теория” и доказательств эволюции вынесено на `/theory`.
