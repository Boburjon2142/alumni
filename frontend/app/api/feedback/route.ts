import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const baseUrls = Array.from(new Set([
      process.env.API_URL,
      "http://backend:8000/api/v1",
      process.env.NEXT_PUBLIC_API_URL,
      "http://127.0.0.1:8000/api/v1",
    ].filter(Boolean))) as string[];

    for (const base of baseUrls) {
      try {
        const url = `${base.replace(/\/$/, "")}/feedback/`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data, { status: 201 });
        } else {
          const errData = await response.json().catch(() => ({}));
          const detailMsg =
            errData?.message ||
            errData?.detail ||
            (typeof errData === "object" ? Object.values(errData).flat().join(" ") : "") ||
            "Murojaatni saqlashda xatolik yuz berdi";
          return NextResponse.json(
            { detail: detailMsg, errors: errData },
            { status: response.status }
          );
        }
      } catch (err) {
        console.error(`Failed to post feedback to ${base}:`, err);
      }
    }

    return NextResponse.json(
      { detail: "Backend xizmati bilan ulanishda xatolik yuz berdi" },
      { status: 502 }
    );
  } catch (error) {
    console.error("Feedback proxy error:", error);
    return NextResponse.json(
      { detail: "Murojaatni qayta ishlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
