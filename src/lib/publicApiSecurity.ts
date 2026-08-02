export const PRODUCTION_PORTAL_ORIGIN = "https://atlas.aidms.ru";

export class PublicApiValidationError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "PublicApiValidationError";
    this.statusCode = statusCode;
  }
}

export function assertBodySize(
  body: string | null | undefined,
  maxBytes: number,
) {
  const byteLength = new TextEncoder().encode(body ?? "").byteLength;
  if (byteLength > maxBytes) {
    throw new PublicApiValidationError(
      413,
      "Запрос слишком большой. Сократите текст и попробуйте снова.",
    );
  }
}

export function allowedOriginsFromEnv(value?: string) {
  const origins = (value ?? PRODUCTION_PORTAL_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : [PRODUCTION_PORTAL_ORIGIN];
}

export function requestOrigin(headers?: Record<string, string | undefined>) {
  if (!headers) return undefined;

  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === "origin") return value;
  }

  return undefined;
}

export function corsHeaders(
  headers: Record<string, string | undefined> | undefined,
  allowedOrigins: string[],
) {
  const origin = requestOrigin(headers);
  const allowOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : (allowedOrigins[0] ?? PRODUCTION_PORTAL_ORIGIN);

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
}

export function logPublicApiEvent(event: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event,
    }),
  );
}
