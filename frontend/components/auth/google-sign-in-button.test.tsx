import { StrictMode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, waitFor, act, screen } from "@testing-library/react";
import { GoogleSignInButton } from "./google-sign-in-button";
import { authWithGoogle } from "@/lib/api";

vi.mock("@/lib/api", () => ({ authWithGoogle: vi.fn() }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); delete window.google; vi.resetAllMocks(); });

it("shares configuration during StrictMode mounting and signs in through the active callback", async () => {
  const initialize = vi.fn();
  window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ client_id: "client", nonce: "nonce" }) });
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(authWithGoogle).mockResolvedValue({ success: true, authenticated: true, message: "", user: { id: 1, email: "user@gmail.com" }, profile: { full_name: "Test User" } });
  const success = vi.fn();
  render(<StrictMode><GoogleSignInButton onSuccess={success} locale="en" /></StrictMode>);
  await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => initialize.mock.calls[0][0].callback({ credential: "signed-token" }));
  expect(success).toHaveBeenCalledWith({ id: 1, email: "user@gmail.com", fullName: "Test User" });
});

it("shows the complete authentication failure", async () => {
  const initialize = vi.fn();
  window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ client_id: "client", nonce: "nonce" }) }));
  vi.mocked(authWithGoogle).mockRejectedValue(new Error("Google session expired. Reopen the dialog."));
  render(<GoogleSignInButton onSuccess={vi.fn()} locale="en" />);
  await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
  await act(async () => initialize.mock.calls[0][0].callback({ credential: "expired-token" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Google session expired. Reopen the dialog.");
});
