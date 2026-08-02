# AI backend Evolution Atlas в Yandex Cloud

Production frontend: `https://atlas.aidms.ru`. Публичный Gateway обслуживает:

- `POST/OPTIONS /api/ask-darwin`;
- `POST/OPTIONS /api/plan-tour`.

Отслеживаемая спецификация: `infra/api-gateway.openapi.yaml`. Обе интеграции обращаются только к версии функции с тегом `production`, не к `$latest`.

## Grounding и Yandex Search API

Обычные вопросы получают `grounding: "site"` и используют источники, уже включенные в контекст портала. Запросы с признаками свежести (`новое`, `последнее`, год 202x и т. п.) сначала вызывают `POST https://searchapi.api.cloud.yandex.net/v2/gen/search`.

Backend:

1. принимает только Search API sources с `used: true`;
2. передает их YandexGPT как закрытый allow-list;
3. удаляет любой URL, которого нет в allow-list;
4. не показывает свежий ответ, если подтвержденных источников нет;
5. ограничивает external confidence значением `likely` при одном независимом домене и допускает `solid` только при двух.

Сервисному аккаунту нужны роли для AI Studio и `search-api.webSearch.user`; API-ключ должен иметь scope `yc.search-api.execute`.

## Валидация и CORS

- вопрос: 3–600 символов;
- history: не более 6 сообщений и 6000 символов;
- ask body: не более 32 КБ;
- `freeText`: не более 300 символов;
- plan-tour body: не более 16 КБ;
- production origin: только `https://atlas.aidms.ru`.

Для локальной development-версии функции можно явно задать `ALLOWED_ORIGINS=https://atlas.aidms.ru,http://localhost:5173`; production workflow передает только canonical origin. Неверные запросы получают `400`, слишком большие — `413` до вызова модели.

## Lockbox

`YANDEX_API_KEY` подключается к каждой новой версии из Lockbox через `--secret`. Значение не хранится в Git, GitHub Actions variables или браузерном bundle. Функции также получают `YANDEX_FOLDER_ID`, необязательный `YANDEX_MODEL_URI` и `ALLOWED_ORIGINS`.

## Smart Web Security

Terraform в `infra/sws` создает API-mode security profile и ARL, а также включает DENY-логи Smart Protection/ARL в Cloud Logging:

- ask-darwin: 20 запросов / 5 минут / IP и 60 / минуту глобально;
- plan-tour: 10 запросов / 5 минут / IP и 30 / минуту глобально.

После `terraform apply` сохраните output `security_profile_id` как GitHub secret `YC_SWS_SECURITY_PROFILE_ID`. Если профиль уже существует, сначала выполните команды импорта из `infra/sws/README.md`. Gateway подключает профиль через `x-yc-apigateway.smartWebSecurity.securityProfileId`; превышение квоты возвращает `429` до вызова функций.

## Backend release и rollback

Workflow `.github/workflows/deploy-yc-backend.yml`:

1. собирает `.deploy/ask-darwin.zip` и `.deploy/plan-tour.zip`;
2. создает версии с тегом `candidate` и секретом из Lockbox;
3. напрямую вызывает обе candidate-версии;
4. проверяет экскурсии на 8 и 15 остановок и `personalizationSource`;
5. переставляет тег `production`;
6. рендерит OpenAPI и обновляет Gateway;
7. повторяет smoke-тесты через публичный Gateway.

Для отката найдите предыдущую версию и переставьте тег; Gateway менять не нужно:

```bash
yc serverless function version list --function-name ask-darwin
yc serverless function version set-tag --id <previous-version-id> --tag production

yc serverless function version list --function-name plan-tour
yc serverless function version set-tag --id <previous-version-id> --tag production
```

## Логи и алерты

Функции пишут JSON без текста вопроса: endpoint, result, `ai/preset`, `site/external`, latency, длина ввода и error code. В Yandex Monitoring должны быть включены уведомления на:

- любые устойчивые 5xx;
- рост 429;
- аномальный рост вызовов;
- превышение месячного бюджета AI Studio/Search API.

Пороговые значения и владелец notification channel задаются в `infra/observability.yaml`. Канал уведомлений намеренно передается отдельно, поскольку адрес получателя не должен храниться в репозитории.

## GitHub secrets

- `YC_SA_JSON_CREDENTIALS`
- `YC_FOLDER_ID`
- `YC_SERVICE_ACCOUNT_ID`
- `YC_LOCKBOX_SECRET_ID`
- `YC_API_GATEWAY_ID`
- `YC_API_GATEWAY_URL`
- `YC_SWS_SECURITY_PROFILE_ID`
- `YC_CDN_RESOURCE_ID`
- `YC_S3_ACCESS_KEY_ID`
- `YC_S3_SECRET_ACCESS_KEY`

## Frontend cache и post-deploy проверки

Frontend workflow берет маршруты из `config/public-routes.json`, выставляет годовой immutable cache для хешированных assets, `no-cache` для HTML, выборочно очищает CDN и проверяет canonical domain, прямые SPA-ссылки, cache headers и оба AI endpoint.
