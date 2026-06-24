# ask-darwin Cloud Function

Serverless endpoint for the sitewide AI guide.

Required environment variables:

- `YANDEX_API_KEY` - API key with access to Yandex Cloud AI Studio.
- `YANDEX_FOLDER_ID` - Yandex Cloud folder ID.
- `YANDEX_MODEL_URI` - optional override, defaults to `gpt://<folder>/yandexgpt-5.1`.

Recommended API Gateway route:

- `POST /api/ask-darwin`
- `OPTIONS /api/ask-darwin` for CORS preflight

The browser never receives the Yandex API key. The frontend only sends the user question, current page path, optional atlas mode, selected stage id, and short chat history.
