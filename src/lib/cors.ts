// src/lib/cors.ts
export const PUBLIC_CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: PUBLIC_CORS_HEADERS,
  });
}
