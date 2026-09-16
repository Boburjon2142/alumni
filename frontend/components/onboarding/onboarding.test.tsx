import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { ConsentStep } from "./consent-step";
import { AlumniForm } from "./alumni-form";
import { getDictionary } from "@/lib/i18n";

const mockSubmitAlumni = vi.fn();
const mockSendVerificationCode = vi.fn();
const mockVerifyEmailCode = vi.fn();
const mockAuthWithGoogle = vi.fn();

vi.mock("@/lib/api", () => ({
  submitAlumni: (...args: any[]) => mockSubmitAlumni(...args),
  sendVerificationCode: (...args: any[]) => mockSendVerificationCode(...args),
  verifyEmailCode: (...args: any[]) => mockVerifyEmailCode(...args),
  authWithGoogle: (...args: any[]) => mockAuthWithGoogle(...args),
}));

// Mock icons
vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    CheckCircle2: Icon,
    ArrowRight: Icon,
    ArrowLeft: Icon,
    ShieldCheck: Icon,
    Lock: Icon,
    FileText: Icon,
    CheckSquare: Icon,
    Square: Icon,
    Camera: Icon,
    Upload: Icon,
    Trash2: Icon,
    AlertCircle: Icon,
    AlertTriangle: Icon,
    KeyRound: Icon,
    Mail: Icon,
    RotateCw: Icon,
    GraduationCap: Icon,
    Users: Icon,
    Send: Icon,
    BadgeCheck: Icon,
    UserCheck: Icon,
    User: Icon,
    UserPlus: Icon,
    ChevronDown: Icon,
    Globe: Icon,
    ExternalLink: Icon,
    Loader2: Icon,
    X: Icon,
  };
});

const t = getDictionary("uz");

describe("Onboarding Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ client_id: "google-test-id" }) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("opens terms in a modal without losing the application or accepting consent", () => {
    render(<AlumniForm locale="uz" t={t} />);
    const name = screen.getByPlaceholderText(t.formFullNamePlaceholder);
    fireEvent.change(name, { target: { value: "Ali Valiyev" } });
    fireEvent.click(screen.getByRole("button", { name: /shartlar/i }));
    expect(screen.getByRole("dialog", { name: t.consentTitle })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yopish" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(name).toHaveValue("Ali Valiyev");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("blocks an otherwise valid application until consent is checked", () => {
    render(<AlumniForm locale="uz" t={t} />);
    fireEvent.change(screen.getByPlaceholderText(t.formFullNamePlaceholder), { target: { value: "Ali Valiyev" } });
    fireEvent.change(screen.getByPlaceholderText(t.formEmailPlaceholder), { target: { value: "ali@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: new RegExp(t.formSubmitBtn, "i") }));
    expect(screen.getByText(t.consentRequiredError)).toBeInTheDocument();
    expect(screen.getByText(/Shartlarga rozilik talab qilinadi/i)).toBeInTheDocument();
    expect(mockSubmitAlumni).not.toHaveBeenCalled();
  });

  it("blocks sending verification code if consent is not checked and shows warning", () => {
    render(<AlumniForm locale="uz" t={t} />);
    fireEvent.change(screen.getByPlaceholderText(t.formEmailPlaceholder), { target: { value: "ali@example.com" } });
    
    // Attempt to request code without consent
    const sendCodeBtn = screen.getByRole("button", { name: /Kodni olish/i });
    fireEvent.click(sendCodeBtn);

    expect(screen.getByText(/Tasdiqlash kodini olishdan oldin shaxsiy ma’lumotlarni qayta ishlash shartlariga rozilik bildirishingiz shart/i)).toBeInTheDocument();
    expect(mockSendVerificationCode).not.toHaveBeenCalled();
  });

  it("blocks Google sign in if consent is not checked and shows warning", () => {
    render(<AlumniForm locale="uz" t={t} />);
    
    // Attempt Google auth without consent
    const googleBtn = screen.getByRole("button", { name: /Google orqali davom etish/i });
    fireEvent.click(googleBtn);

    expect(screen.getByText(/Google orqali davom etishdan oldin shaxsiy ma’lumotlarni qayta ishlash shartlariga rozilik bildirishingiz shart/i)).toBeInTheDocument();
    expect(mockAuthWithGoogle).not.toHaveBeenCalled();
  });

  it("shows unavailable Google configuration instead of fake accounts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ client_id: "" }) }));
    render(<AlumniForm locale="uz" t={t} />);
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(screen.getByText(/Google orqali kirish hali sozlanmagan/)).toBeInTheDocument());
    expect(mockAuthWithGoogle).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });


  it("sends OTP verification code when consent is checked, verifies code and marks email verified", async () => {
    mockSendVerificationCode.mockResolvedValueOnce({
      success: true,
      message: "Tasdiqlash kodi emailingizga yuborildi.",
      cooldown_seconds: 60,
    });
    mockVerifyEmailCode.mockResolvedValueOnce({
      verified: true,
      message: "Email muvaffaqiyatli tasdiqlandi.",
    });

    render(<AlumniForm locale="uz" t={t} />);

    // Fill email and check consent
    fireEvent.change(screen.getByPlaceholderText(t.formEmailPlaceholder), { target: { value: "nodir@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));

    // Click Kodni olish
    const sendCodeBtn = screen.getByRole("button", { name: /Kodni olish/i });
    fireEvent.click(sendCodeBtn);

    await waitFor(() => {
      expect(mockSendVerificationCode).toHaveBeenCalledWith("nodir@example.com", true, "join");
      expect(screen.getByLabelText(/Email tasdiqlash/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tasdiqlash kodi/i)).toBeInTheDocument();
    });

    // Enter 6-digit code
    const codeInput = screen.getByLabelText(/Tasdiqlash kodi/i);
    fireEvent.change(codeInput, { target: { value: "654321" } });

    // Click Kodni tasdiqlash
    const verifyBtn = screen.getByRole("button", { name: /Kodni tasdiqlash/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(mockVerifyEmailCode).toHaveBeenCalledWith("nodir@example.com", "654321", "join");
      expect(screen.getByText(/Email muvaffaqiyatli tasdiqlandi/i)).toBeInTheDocument();
    });
  });

  describe("ConsentStep", () => {
    it("renders unchecked checkbox and disabled continue button initially", () => {
      const onConsentAccepted = vi.fn();
      render(<ConsentStep locale="uz" t={t} onConsentAccepted={onConsentAccepted} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      const button = screen.getByRole("button", { name: new RegExp(t.consentContinueButton, "i") });
      expect(button).toBeDisabled();

      // Ensure terms link is present
      const termsLink = screen.getByRole("link", { name: new RegExp(t.consentPolicyLinkText, "i") });
      expect(termsLink).toHaveAttribute("href", "/terms");
    });

    it("checking checkbox enables continue button and advances wizard", () => {
      const onConsentAccepted = vi.fn();
      render(<ConsentStep locale="uz" t={t} onConsentAccepted={onConsentAccepted} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      const button = screen.getByRole("button", { name: new RegExp(t.consentContinueButton, "i") });
      expect(button).not.toBeDisabled();

      fireEvent.click(button);
      expect(onConsentAccepted).toHaveBeenCalledTimes(1);
    });
  });

  describe("AlumniForm", () => {
    it("validates required fields and shows inline errors", async () => {
      render(<AlumniForm locale="uz" t={t} />);

      const submitBtn = screen.getByRole("button", { name: new RegExp(t.formSubmitBtn, "i") });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/F\.I\.Sh\. kamida 3 ta belgidan iborat/i)).toBeInTheDocument();
        expect(screen.getByText(/to‘g‘ri elektron pochta manzilini kiriting/i)).toBeInTheDocument();
      });

      expect(mockSubmitAlumni).not.toHaveBeenCalled();
    });

    it("submits valid alumni application and displays success state", async () => {
      mockSubmitAlumni.mockResolvedValueOnce({
        success: true,
        data: {
          id: 42,
          full_name: "Sherzod Aliyev",
        },
      });

      render(<AlumniForm locale="uz" t={t} />);

      // Fill in full name
      const nameInput = screen.getByPlaceholderText(t.formFullNamePlaceholder);
      fireEvent.change(nameInput, { target: { value: "Sherzod Aliyev" } });

      // Fill in email
      const emailInput = screen.getByPlaceholderText(t.formEmailPlaceholder);
      fireEvent.change(emailInput, { target: { value: "sherzod@example.com" } });

      fireEvent.click(screen.getByRole("checkbox"));
      mockSendVerificationCode.mockResolvedValueOnce({ success: true });
      mockVerifyEmailCode.mockResolvedValueOnce({ verified: true });
      fireEvent.click(screen.getByRole("button", { name: /Kodni olish/i }));
      await waitFor(() => expect(screen.getByLabelText(/Tasdiqlash kodi/i)).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/Tasdiqlash kodi/i), { target: { value: "123456" } });
      fireEvent.click(screen.getByRole("button", { name: /Kodni tasdiqlash/i }));
      await waitFor(() => expect(screen.getByText(/Email muvaffaqiyatli tasdiqlandi/i)).toBeInTheDocument());

      // Submit
      const submitBtn = screen.getByRole("button", { name: new RegExp(t.formSubmitBtn, "i") });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmitAlumni).toHaveBeenCalledTimes(1);
        const submittedFormData = mockSubmitAlumni.mock.calls[0][0] as FormData;
        expect(submittedFormData.get("full_name")).toBe("Sherzod Aliyev");
        expect(submittedFormData.get("contact_email")).toBe("sherzod@example.com");
        expect(submittedFormData.get("consent_accepted")).toBe("true");
      });

      await waitFor(() => {
        expect(screen.getByText(t.submissionSuccessTitle)).toBeInTheDocument();
        expect(screen.getByText("Sherzod Aliyev")).toBeInTheDocument();
        expect(screen.getByText("sherzod@example.com")).toBeInTheDocument();
      });

      // Directory navigation link
      const directoryLink = screen.getByRole("link", { name: /Bitiruvchilar ro/i });
      expect(directoryLink).toHaveAttribute("href", "/alumni");
    });

    it("displays error banner when submission API rejects", async () => {
      mockSubmitAlumni.mockRejectedValueOnce(new Error("Server rad etdi: Fayl formati noto‘g‘ri"));

      render(<AlumniForm locale="uz" t={t} />);

      // Fill in valid data
      fireEvent.change(screen.getByPlaceholderText(t.formFullNamePlaceholder), {
        target: { value: "Komil Jo‘rayev" },
      });
      fireEvent.change(screen.getByPlaceholderText(t.formEmailPlaceholder), {
        target: { value: "komil@example.com" },
      });

      fireEvent.click(screen.getByRole("checkbox"));
      mockSendVerificationCode.mockResolvedValueOnce({ success: true });
      mockVerifyEmailCode.mockResolvedValueOnce({ verified: true });
      fireEvent.click(screen.getByRole("button", { name: /Kodni olish/i }));
      await waitFor(() => expect(screen.getByLabelText(/Tasdiqlash kodi/i)).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/Tasdiqlash kodi/i), { target: { value: "123456" } });
      fireEvent.click(screen.getByRole("button", { name: /Kodni tasdiqlash/i }));
      await waitFor(() => expect(screen.getByText(/Email muvaffaqiyatli tasdiqlandi/i)).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: new RegExp(t.formSubmitBtn, "i") }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/Server rad etdi: Fayl formati noto‘g‘ri/i)).toBeInTheDocument();
      });
    });
  });
});
