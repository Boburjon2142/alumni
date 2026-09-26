import { afterEach, expect, it, vi } from "vitest";
import { authenticatedFetch } from "@/lib/auth";

afterEach(() => vi.unstubAllGlobals());

it("reads authenticated data in one request without fetching a CSRF token", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  await authenticatedFetch("/api/v1/alumni/me/");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith("/api/v1/alumni/me/", expect.objectContaining({ credentials: "same-origin", cache: "no-store" }));
});

it("still obtains a fresh CSRF token for writes", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ csrf_token: "fresh-token" }) })
    .mockResolvedValueOnce({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  await authenticatedFetch("/api/v1/alumni/me/", { method: "PATCH", body: "{}" });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1][1].headers.get("X-CSRFToken")).toBe("fresh-token");
});
