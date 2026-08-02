# plan-tour Cloud Function

Serverless endpoint for personalized 8/15-stop Darwin tours.

Required environment variables: `YANDEX_API_KEY`, `YANDEX_FOLDER_ID`, and `ALLOWED_ORIGINS`. `YANDEX_MODEL_URI` is optional. If the model cannot produce a valid allow-listed route, the function returns a deterministic preset with `personalizationSource: "preset"`; a successful model response returns `"ai"`.

The browser endpoint is `POST /api/plan-tour`; `OPTIONS` handles CORS preflight. Build with `pnpm build:plan-tour-function`.
