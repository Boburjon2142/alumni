import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ message: "Invalid JSON." }, { status: 400 }); }
  const backend = (process.env.API_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
  try {
    const response = await fetch(`${backend}/feedback/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Murojaatni saqlab bo'lmadi. Keyinroq qayta urinib ko'ring." }, { status: 503 });
  }
}
