import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ detail: "Slug required" }, { status: 400 });
  const cleanSlug = slug.trim();

  const baseUrls = Array.from(new Set([
    process.env.API_URL,
    "http://backend:8000/api/v1",
    process.env.NEXT_PUBLIC_API_URL,
    "http://127.0.0.1:8000/api/v1",
  ].filter(Boolean))) as string[];

  for (const base of baseUrls) {
    try {
      const url = `${base.replace(/\/$/, "")}/alumni/${encodeURIComponent(cleanSlug)}/`;
      const response = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // try next base URL
    }
  }

  return NextResponse.json({ detail: "Profile not found" }, { status: 404 });
}
