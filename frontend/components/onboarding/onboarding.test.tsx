import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AlumniForm } from "./alumni-form";
import { ConsentStep } from "./consent-step";
import { getDictionary } from "@/lib/i18n";
import { sendVerificationCode, verifyEmailCode, submitAlumni } from "@/lib/api";
vi.mock("@/lib/api", () => ({ sendVerificationCode: vi.fn(), verifyEmailCode: vi.fn(), submitAlumni: vi.fn() }));
vi.mock("@/components/auth/google-sign-in-button", () => ({ GoogleSignInButton: () => null }));
const t = getDictionary("en");
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
function openForm() {
  render(<AlumniForm locale="en" t={t} />);
  fireEvent.change(screen.getByPlaceholderText(t.formFullNamePlaceholder), { target: { value: "Test Graduate" } });
  fireEvent.change(screen.getByPlaceholderText(t.formEmailPlaceholder), { target: { value: "graduate@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Kodni olish" }));
  return screen.getByRole("dialog");
}
async function sendCode() {
  vi.mocked(sendVerificationCode).mockResolvedValue({ success: true, message: "Sent" });
  const dialog = openForm();
  fireEvent.click(within(dialog).getByRole("checkbox"));
  fireEvent.click(within(dialog).getByRole("button", { name: "Kodni olish" }));
  await screen.findByLabelText("Tasdiqlash kodi");
}
it("requires explicit consent in the verification dialog before sending email", () => {
  const dialog = openForm();
  expect(sendVerificationCode).not.toHaveBeenCalled();
  expect(within(dialog).getByRole("checkbox")).not.toBeChecked();
  expect(within(dialog).getByRole("button", { name: "Kodni olish" })).toBeDisabled();
});
it("opens terms without accepting consent or losing form data", () => {
  const dialog = openForm();
  fireEvent.click(within(dialog).getByRole("button", { name: "terms" }));
  expect(screen.getByRole("dialog", { name: t.consentTitle })).toBeInTheDocument();
  expect(submitAlumni).not.toHaveBeenCalled();
});
it("verifies email, creates one profile and displays success", async () => {
  vi.mocked(verifyEmailCode).mockResolvedValue({ success: true, verified: true, message: "Verified" });
  vi.mocked(submitAlumni).mockResolvedValue({ success: true, data: { id: 42, full_name: "Test Graduate" } } as any);
  await sendCode();
  expect(sendVerificationCode).toHaveBeenCalledWith("graduate@example.com", true, "join");
  fireEvent.change(screen.getByLabelText("Tasdiqlash kodi"), { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: "Kodni tasdiqlash" }));
  await screen.findByRole("link", { name: "My profile" });
  expect(submitAlumni).toHaveBeenCalledTimes(1);
  expect(vi.mocked(submitAlumni).mock.calls[0][0].get("contact_email")).toBe("graduate@example.com");
});
it("retries a failed profile submission without consuming the OTP twice", async () => {
  vi.mocked(verifyEmailCode).mockResolvedValue({ success: true, verified: true, message: "Verified" });
  vi.mocked(submitAlumni).mockRejectedValueOnce(new Error("Temporary failure")).mockResolvedValueOnce({ success: true, data: { id: 42, full_name: "Test Graduate" } } as any);
  await sendCode();
  fireEvent.change(screen.getByLabelText("Tasdiqlash kodi"), { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: "Kodni tasdiqlash" }));
  await screen.findByText("Temporary failure");
  fireEvent.click(screen.getByRole("button", { name: "Kodni tasdiqlash" }));
  await screen.findByRole("link", { name: "My profile" });
  expect(verifyEmailCode).toHaveBeenCalledTimes(1);
  expect(submitAlumni).toHaveBeenCalledTimes(2);
});
it("rejects empty form fields before contacting the server", () => {
  render(<AlumniForm locale="en" t={t} />);
  fireEvent.click(screen.getByRole("button", { name: t.formSubmitBtn }));
  expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(2);
  expect(sendVerificationCode).not.toHaveBeenCalled();
});
it("keeps the consent step blocked until explicitly selected", () => {
  const next = vi.fn();
  render(<ConsentStep locale="en" t={t} onConsentAccepted={next} />);
  const button = screen.getByRole("button", { name: t.consentContinueButton });
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(button);
  expect(next).toHaveBeenCalledTimes(1);
});
