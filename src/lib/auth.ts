/**
 * API key must be set in env. For local use: SHOPPER_API_KEY=your-secret-key
 * All API requests must include: x-api-key: <key>
 */
const API_KEY = process.env.SHOPPER_API_KEY ?? "dev-key-local-only";

export function validateApiKey(key: string | null): boolean {
  if (!key) return false;
  return key === API_KEY;
}

export function getApiKey(): string {
  return API_KEY;
}

/** For local run: auth is auto-approved (no real login). */
export const AUTO_APPROVE_AUTH = true;
