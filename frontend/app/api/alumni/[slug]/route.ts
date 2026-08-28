import { NextResponse } from "next/server";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ detail: "Slug required" }, { status: 400 });
  try {
    const cleanSlug = slug.trim();
    const response = await fetch(`${API}/alumni/${encodeURIComponent(cleanSlug)}/`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return NextResponse.json({ detail: response.status === 404 ? "Not found" : "Profile request failed" }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching alumni preview:", err);
    return NextResponse.json({ detail: "Profile service unavailable" }, { status: 502 });
  }
}
