import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const candidates = [
      process.env.API_URL,
      "http://backend:8000/api/v1",
      "http://127.0.0.1:8000/api/v1",
    ].filter(Boolean) as string[];

    let lastError: any = null;

    for (const base of candidates) {
      try {
        const targetUrl = `${base.replace(/\/$/, "")}/feedback/`;
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
          cache: "no-store",
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          return NextResponse.json(data, { status: 201 });
        } else {
          const detailMsg =
            data?.error?.message ||
            (data?.error?.fields ? Object.entries(data.error.fields).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ") : null) ||
            data?.message ||
            data?.detail ||
            "Murojaat ma'lumotlarini tekshiring";

          return NextResponse.json(
            { detail: detailMsg, errors: data },
            { status: response.status }
          );
        }
      } catch (err: any) {
        lastError = err;
        console.error(`Failed to post feedback to ${base}:`, err);
      }
    }

    return NextResponse.json(
      { detail: `Backend xizmatiga ulanib bo'lmadi: ${lastError?.message || 'aloqa mavjud emas'}` },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("Feedback route error:", error);
    return NextResponse.json(
      { detail: `Xatolik yuz berdi: ${error?.message || 'Server xatosi'}` },
      { status: 500 }
    );
  }
}
