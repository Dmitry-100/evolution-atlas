import { createYandexCloudFunctionFromEnv } from "../../src/lib/yandexCloudFunction";

const askDarwinFunction = createYandexCloudFunctionFromEnv({
  YANDEX_API_KEY: process.env.YANDEX_API_KEY,
  YANDEX_FOLDER_ID: process.env.YANDEX_FOLDER_ID,
  YANDEX_MODEL_URI: process.env.YANDEX_MODEL_URI,
});

export async function handler(event: unknown) {
  return askDarwinFunction(event as Parameters<typeof askDarwinFunction>[0]);
}
