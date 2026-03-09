import { NextResponse } from "next/server";
import { getUserByApiKey } from "./auth";

export async function requireApiKeyUser(
  request: Request
): Promise<{ error: NextResponse } | { userId: string }> {
  const key = request.headers.get("x-api-key");
  if (!key) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid x-api-key header" },
        { status: 401 }
      ),
    };
  }
  const user = await getUserByApiKey(key);
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid x-api-key header" },
        { status: 401 }
      ),
    };
  }
  return { userId: user.id };
}
