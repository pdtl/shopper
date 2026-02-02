import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { getItemById, updateItem, deleteItem } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const request = new Request(_request.url, _request);
  const auth = requireApiKey(request);
  if (auth) return auth;
  const { id } = await params;
  const item = await getItemById(id);
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  const { id } = await params;
  let body: { name?: string; category?: string; defaultStore?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const item = await updateItem(id, {
    name: body.name,
    category: body.category,
    defaultStore: body.defaultStore,
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  const { id } = await params;
  const ok = await deleteItem(id);
  if (!ok) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
