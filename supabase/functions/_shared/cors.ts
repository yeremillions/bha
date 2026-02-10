const ALLOWED_ORIGINS = [
  "https://brooklynhillsapartment.com",
  "https://www.brooklynhillsapartment.com",
];

// Allow localhost origins in development
const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

function getAllowedOrigins(): string[] {
  const env = Deno.env.get("ENVIRONMENT") || "production";
  if (env === "development" || env === "local") {
    return [...ALLOWED_ORIGINS, ...DEV_ORIGINS];
  }
  // Also allow custom origins via env var
  const custom = Deno.env.get("ALLOWED_ORIGINS");
  if (custom) {
    return [...ALLOWED_ORIGINS, ...custom.split(",").map((o) => o.trim())];
  }
  return ALLOWED_ORIGINS;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowed = getAllowedOrigins();
  const isAllowed = allowed.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowed[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    ...(isAllowed ? { "Vary": "Origin" } : {}),
  };
}

export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}
