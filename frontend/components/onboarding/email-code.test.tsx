import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AlumniForm } from "./alumni-form";
import { getDictionary } from "@/lib/i18n";
import { sendVerificationCode } from "@/lib/api";
vi.mock("@/lib/api", () => ({ sendVerificationCode: vi.fn(), verifyEmailCode: vi.fn(), submitAlumni: vi.fn() }));
vi.mock("@/components/auth/google-sign-in-button", () => ({ GoogleSignInButton: () => null }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe("Email code delivery", () => {
  it("shows delivery failure before the OTP box exists and allows retry", async () => {
    vi.mocked(sendVerificationCode).mockRejectedValueOnce(new Error("Email xizmati sozlanmagan."));
    const t = getDictionary("uz");
    render(<AlumniForm locale="uz" t={t} />);
    fireEvent.change(screen.getByPlaceholderText(t.formEmailPlaceholder), { target: { value: "graduate@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Kodni olish" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Email xizmati sozlanmagan."));
    expect(screen.queryByRole("region", { name: "Email tasdiqlash" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kodni olish" })).toBeEnabled();
    vi.mocked(sendVerificationCode).mockResolvedValueOnce({ success: true, message: "Sent", cooldown_seconds: 60 });
    fireEvent.click(screen.getByRole("button", { name: "Kodni olish" }));
    await waitFor(() => expect(screen.getByRole("region", { name: "Email tasdiqlash" })).toBeInTheDocument());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
