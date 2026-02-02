import { NextResponse } from "next/server";
import { apiDocs } from "@/lib/api-docs";

const BASE = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export async function GET() {
  return NextResponse.json({
    ...apiDocs,
    baseUrl: `${BASE}/api`,
  });
}
