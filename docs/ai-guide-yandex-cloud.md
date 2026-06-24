# AI-гид “Спросить Дарвина”

Сайт остается статическим React/Vite-приложением. Живой AI-ответ идет через отдельный Yandex Cloud Function endpoint, чтобы `YANDEX_API_KEY` не попадал в браузер.

## Frontend

По умолчанию виджет вызывает `/api/ask-darwin` на том же домене. Если API Gateway живет на другом домене, задайте:

```bash
VITE_AI_API_BASE_URL=https://<api-gateway-domain>
```

Текущий Yandex API Gateway:

```bash
VITE_AI_API_BASE_URL=https://d5dlcp0j3qccddl8n119.628pfjdx.apigw.yandexcloud.net
```

GitHub Actions deploy to Yandex Object Storage and `scripts/deploy-home.sh` already use this value for production builds. Override `VITE_AI_API_BASE_URL` only if the Gateway domain changes or if `/api/ask-darwin` is proxied on the same origin.

Текущий публичный сайт:

```bash
https://evolution-atlas.website.yandexcloud.net/
```

Bucket `evolution-atlas` настроен как static website с `index.html` и `index.html` как error fallback для SPA routes. Raw S3 endpoint `https://evolution-atlas.storage.yandexcloud.net/` не отдает корневой `/`, но отдельные объекты вроде `/index.html` и `/assets/...` доступны.

Frontend отправляет только:

- `message`
- `pagePath`
- `stageId`
- `atlasMode`
- короткую `history`

## Yandex Cloud Function

Исходник endpoint лежит в `cloud-functions/ask-darwin`.

Вызов модели идет через OpenAI Node SDK с `baseURL=https://ai.api.cloud.yandex.net/v1` и Yandex model URI.

Переменные окружения функции:

- `YANDEX_API_KEY`
- `YANDEX_FOLDER_ID`
- `YANDEX_MODEL_URI` (опционально; по умолчанию `gpt://<folder>/yandexgpt-5.1`)

API Gateway должен прокинуть:

- `POST /api/ask-darwin`
- `OPTIONS /api/ask-darwin`

Текущие deployed resources:

- Cloud Function: `ask-darwin` (`d4epsmvb2508gssv0qf0`)
- API Gateway: `evolution-atlas-api` (`d5dlcp0j3qccddl8n119`)
- Service account: `evolution-atlas-functions`
- Lockbox secret: `evolution-atlas-yandex-api`

## Redeploy

```bash
corepack pnpm build:ask-darwin-function
yc serverless function version create \
  --function-name ask-darwin \
  --runtime nodejs22 \
  --entrypoint index.handler \
  --memory 512MB \
  --execution-timeout 30s \
  --service-account-id ajegh6p2vkdgpgnp5v62 \
  --source-path .deploy/ask-darwin.zip \
  --environment YANDEX_FOLDER_ID=b1g3mcoqv3ngbrrpbcno \
  --secret name=evolution-atlas-yandex-api,key=YANDEX_API_KEY,environment-variable=YANDEX_API_KEY
```

## Grounding Rules

Backend собирает контекст из данных сайта и просит модель вернуть строгий JSON: `darwinAnswerRu`, `modernNoteRu`, `citations`, `relatedLinks`, `confidence`, `grounding`.

Ответ без источников отбрасывается. Для вопросов со свежими датами или словами вроде “новое”, “последнее”, “сейчас” handler помечает, что можно подключать внешний поиск.
