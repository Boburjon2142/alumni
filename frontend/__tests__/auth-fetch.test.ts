import { afterEach, expect, it, vi } from "vitest";
import { authenticatedFetch, authSession, authChanged } from "@/lib/auth";

afterEach(() => vi.unstubAllGlobals());

it("shares concurrent session reads but fetches again after completion", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ authenticated: false }) });
  vi.stubGlobal("fetch", fetchMock);
  await Promise.all([authSession(), authSession(), authSession()]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await authSession();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("retries failed session reads", async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ authenticated: true }) });
  vi.stubGlobal("fetch", fetchMock);
  await expect(authSession()).rejects.toThrow("offline");
  await expect(authSession()).resolves.toEqual({ authenticated: true });
});

it("does not reuse an in-flight session across a login/logout change", async () => {
  let complete!: (value: unknown) => void;
  const fetchMock = vi.fn().mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ authenticated: true }) });
  vi.stubGlobal("fetch", fetchMock);
  const oldRead = authSession();
  authChanged();
  await expect(authSession()).resolves.toEqual({ authenticated: true });
  complete({ ok: true, json: async () => ({ authenticated: false }) });
  await oldRead;
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("announces successful admin writes but not rejected writes", async () => {
  const listener = vi.fn();
  window.addEventListener("site-content-changed", listener);
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ csrf_token: "token" }) })
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ csrf_token: "token" }) })
    .mockResolvedValueOnce({ ok: false });
  vi.stubGlobal("fetch", fetchMock);
  try {
    await authenticatedFetch("/api/v1/admin/interviews/1/", { method: "PUT" });
    await authenticatedFetch("/api/v1/admin/interviews/1/", { method: "PUT" });
    expect(listener).toHaveBeenCalledTimes(1);
  } finally {
    window.removeEventListener("site-content-changed", listener);
  }
});

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
