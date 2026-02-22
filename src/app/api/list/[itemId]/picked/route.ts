import { NextRequest, NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { setPickedUp, setUnavailable } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  const { itemId } = await params;
  let body: { pickedUp?: boolean; unavailable?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.pickedUp !== "boolean" && typeof body.unavailable !== "boolean") {
    return NextResponse.json(
      { error: "Body must include pickedUp (boolean) and/or unavailable (boolean)" },
      { status: 400 }
    );
  }

  let entry = null;
  if (typeof body.unavailable === "boolean") {
    entry = await setUnavailable(itemId, body.unavailable);
  }
  if (typeof body.pickedUp === "boolean") {
    entry = await setPickedUp(itemId, body.pickedUp);
  }

  if (!entry) return NextResponse.json({ error: "Item not on list" }, { status: 404 });
  return NextResponse.json({ entry });
}
