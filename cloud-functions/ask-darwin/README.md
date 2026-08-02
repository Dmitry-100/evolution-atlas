# ask-darwin Cloud Function

Serverless endpoint for the sitewide AI guide.

Required environment variables:

- `YANDEX_API_KEY` - API key with access to Yandex Cloud AI Studio.
- `YANDEX_FOLDER_ID` - Yandex Cloud folder ID.
- `YANDEX_MODEL_URI` - optional override, defaults to `gpt://<folder>/yandexgpt-5.1`.
- `ALLOWED_ORIGINS` - comma-separated exact origins; production uses only `https://atlas.aidms.ru`.

Recommended API Gateway route:

- `POST /api/ask-darwin`
- `OPTIONS /api/ask-darwin` for CORS preflight

The browser never receives the Yandex API key. The frontend only sends the user question, current page path, optional atlas mode, selected stage id, and short chat history.

Fresh questions use Yandex Search API `/v2/gen/search`. Only sources marked `used: true` are allowed into the YandexGPT prompt and final citations. Build with `pnpm build:ask-darwin-function`.
