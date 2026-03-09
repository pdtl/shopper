import { NextRequest, NextResponse } from "next/server";
import { requireApiKeyUser } from "@/lib/api-auth";
import { getAllItems, createItem } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await requireApiKeyUser(request);
  if ("error" in auth) return auth.error;
  const items = await getAllItems(auth.userId);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiKeyUser(request);
  if ("error" in auth) return auth.error;
  let body: { name: string; category?: string; defaultStore?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json(
      { error: "Body must include name (string)" },
      { status: 400 }
    );
  }
  const item = await createItem(auth.userId, {
    name: body.name,
    category: body.category ?? null,
    defaultStore: body.defaultStore ?? null,
  });
  return NextResponse.json({ item });
}
