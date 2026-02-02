import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import {
  getListWithPickedUp,
  addToList,
  removeFromList,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  const entries = await getListWithPickedUp();
  return NextResponse.json({ list: entries });
}

export async function POST(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  let body: { itemId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.itemId) {
    return NextResponse.json(
      { error: "Body must include itemId" },
      { status: 400 }
    );
  }
  const entry = await addToList(body.itemId);
  if (!entry) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ entry });
}

export async function DELETE(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json(
      { error: "Query param itemId required" },
      { status: 400 }
    );
  }
  const ok = await removeFromList(itemId);
  if (!ok) return NextResponse.json({ error: "Not on list or not found" }, { status: 404 });
  return NextResponse.json({ removed: true });
}
