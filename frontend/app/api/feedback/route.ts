import { NextResponse } from "next/server";

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API}/feedback/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Murojaatni saqlashda xatolik yuz berdi", errors: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Feedback proxy error:", error);
    return NextResponse.json(
      { detail: "Backend xizmati bilan ulanishda xatolik yuz berdi" },
      { status: 502 }
    );
  }
}

