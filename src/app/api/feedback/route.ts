import { NextRequest, NextResponse } from "next/server";

const GITHUB_OWNER = "pdtl";
const GITHUB_REPO = "shopper";

export async function POST(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Feedback is not configured" },
      { status: 503 }
    );
  }

  let body: { type: string; message: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { type, message } = body;

  if (!["bug", "feature", "comment"].includes(type)) {
    return NextResponse.json(
      { error: "type must be bug, feature, or comment" },
      { status: 400 }
    );
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { error: "message must be under 5000 characters" },
      { status: 400 }
    );
  }

  const labels = type === "bug" ? ["bug"] : ["enhancement"];
  const prefix =
    type === "bug" ? "Bug Report" : type === "feature" ? "Feature Request" : "Comment";

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `[${prefix}] ${message.slice(0, 80)}`,
        body: message,
        labels,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("GitHub API error:", res.status, err);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 502 }
    );
  }

  const issue = await res.json();
  return NextResponse.json({ url: issue.html_url }, { status: 201 });
}
