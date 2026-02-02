import { NextResponse } from "next/server";
import { validateApiKey } from "./auth";

export function requireApiKey(request: Request): NextResponse | null {
  const key = request.headers.get("x-api-key");
  if (!validateApiKey(key)) {
    return NextResponse.json(
      { error: "Missing or invalid x-api-key header" },
      { status: 401 }
    );
  }
  return null;
}
