import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { setPickedUp } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  const { itemId } = await params;
  let body: { pickedUp: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.pickedUp !== "boolean") {
    return NextResponse.json(
      { error: "Body must include pickedUp (boolean)" },
      { status: 400 }
    );
  }
  const entry = await setPickedUp(itemId, body.pickedUp);
  if (!entry) return NextResponse.json({ error: "Item not on list" }, { status: 404 });
  return NextResponse.json({ entry });
}
