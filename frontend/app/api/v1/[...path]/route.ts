import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const base = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  const url = `${base}/api/v1/${path.map(encodeURIComponent).join("/")}/${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of ["cookie", "content-type", "x-csrftoken", "origin", "referer"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const upstream = await fetch(url, {
      method: request.method, headers, cache: "no-store", redirect: "manual",
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "location"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append("Set-Cookie", cookie);
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: "Serverga ulanib bo'lmadi. Qayta urinib ko'ring." }, { status: 502 });
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH };
