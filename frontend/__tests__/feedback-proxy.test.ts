import { afterEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api-proxy/feedback/route";
afterEach(() => vi.unstubAllGlobals());
const request = () => new Request("http://localhost/api-proxy/feedback", { method: "POST", body: JSON.stringify({ message: "A test message" }) });
it("does not claim success when persistence fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Backend offline")));
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect((await response.json()).success).not.toBe(true);
});
it("preserves validation errors without retries or extra notifications", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { fields: { message: ["Too short"] } } }), { status: 400 }));
  vi.stubGlobal("fetch", fetchMock);
  expect((await POST(request())).status).toBe(400);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
