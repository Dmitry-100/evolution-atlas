import { createPlanTourCloudFunctionFromEnv } from "../../src/lib/planTourCloudFunction";

const planTourFunction = createPlanTourCloudFunctionFromEnv({
  YANDEX_API_KEY: process.env.YANDEX_API_KEY,
  YANDEX_FOLDER_ID: process.env.YANDEX_FOLDER_ID,
  YANDEX_MODEL_URI: process.env.YANDEX_MODEL_URI,
});

export async function handler(event: unknown) {
  return planTourFunction(event as Parameters<typeof planTourFunction>[0]);
}
