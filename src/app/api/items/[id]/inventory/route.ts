import { NextRequest, NextResponse } from "next/server";
import { requireApiKeyUser } from "@/lib/api-auth";
import { addInventoryNote } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiKeyUser(request);
  if ("error" in auth) return auth.error;
  const { id: itemId } = await params;
  let body: { note: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.note || typeof body.note !== "string") {
    return NextResponse.json(
      { error: "Body must include note (string)" },
      { status: 400 }
    );
  }
  const note = await addInventoryNote(auth.userId, itemId, body.note);
  if (!note) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ note });
}
