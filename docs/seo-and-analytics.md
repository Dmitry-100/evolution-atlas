# SEO и аналитика Evolution Atlas

## Что делает приложение

`config/public-routes.json` — единый источник метаданных всех публичных страниц. Во время `pnpm build` скрипт `scripts/generate-seo-output.mjs`:

- создает отдельный HTML для каждого публичного маршрута;
- устанавливает уникальные `title`, description, canonical, Open Graph и Twitter Card;
- добавляет JSON-LD `WebSite`, `WebPage`/`LearningResource` и breadcrumbs;
- оставляет в `#root` текстовое превью страницы для роботов и режима без JavaScript;
- создает `robots.txt` и `sitemap.xml`.

React обновляет те же метаданные при переходах внутри SPA. Deploy workflow отправляет на каждый прямой маршрут соответствующий HTML, проверяет canonical и очищает HTML, robots и sitemap в CDN.

## Подключение Яндекс Метрики

1. Создать счетчик для `https://atlas.aidms.ru` в Яндекс Метрике.
2. В GitHub → Settings → Secrets and variables → Actions → Variables добавить:
   - `YANDEX_METRIKA_ID` — числовой ID счетчика;
   - `YANDEX_METRIKA_WEBVISOR` — `false` по умолчанию; поставить `true` только после отдельного решения о Вебвизоре и уведомлении посетителей.
3. Запустить frontend deploy.

Если ID не задан, код Метрики не загружается. Счетчик также не запускается на localhost и preview-доменах, чтобы тесты не загрязняли production-данные. Ручные SPA-просмотры отправляются через `hit`, поэтому переходы React Router учитываются как отдельные страницы. Тексты вопросов Дарвину, свободный текст экскурсии, URL с tour ID и другие пользовательские данные в Метрику не передаются.

События для целей:

- `darwin_opened`, `darwin_answered`;
- `tour_builder_opened`, `tour_started`, `tour_completed`;
- `quiz_started`, `quiz_completed`;
- `material_opened`, `external_link_opened`.

В интерфейсе Метрики для нужных конверсий следует создать цели типа «Целевое событие» (метод `reachGoal`) с теми же идентификаторами. Рекомендуемый первый набор: `tour_started`, `tour_completed`, `darwin_answered`, `quiz_completed`, `material_opened`.

## Подключение поисковых кабинетов

### Яндекс Вебмастер

1. Добавить сайт `https://atlas.aidms.ru`.
2. Выбрать проверку метатегом и скопировать только значение `content`.
3. Добавить его в GitHub Actions Variables как `YANDEX_WEBMASTER_VERIFICATION`.
4. Выполнить deploy, затем нажать «Проверить» в Вебмастере.
5. Отправить `https://atlas.aidms.ru/sitemap.xml` в разделе индексирования.

### Google Search Console

1. Добавить URL-prefix property `https://atlas.aidms.ru/`.
2. Выбрать проверку HTML-тегом и скопировать значение `content`.
3. Добавить его как `GOOGLE_SEARCH_CONSOLE_VERIFICATION`.
4. Выполнить deploy и завершить проверку.
5. Отправить `sitemap.xml` в разделе Sitemaps.

Оба verification-токена используются только во время сборки и добавляются как обычные публичные метатеги. Это GitHub Variables, не Secrets.

## Что смотреть после запуска

Еженедельно: посетители, источники трафика, страницы входа, доля мобильных, ошибки загрузки и основные цели. Ежемесячно: поисковые запросы, показы, CTR, средняя позиция, индексирование sitemap и Core Web Vitals. Первые выводы по редким страницам лучше делать после накопления нескольких недель данных, а не по единичным визитам.

Официальные инструкции: [Метрика для SPA](https://yandex.ru/support/metrica/ru/code/counter-spa-setup), [цели `reachGoal`](https://yandex.ru/support/metrica/ru/general/goal-js-event), [sitemap в Яндекс Вебмастере](https://yandex.ru/support/webmaster/ru/indexing-options/sitemap), [sitemap в Google Search Console](https://support.google.com/webmasters/answer/12817956?hl=ru).
