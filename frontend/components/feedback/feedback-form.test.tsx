import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { FeedbackForm } from "./feedback-form";

const mockSendFeedback = vi.fn();

vi.mock("@/lib/api", () => ({
  sendFeedback: (...args: any[]) => mockSendFeedback(...args),
}));

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    CheckCircle2: Icon,
    Send: Icon,
    AlertCircle: Icon,
    ChevronDown: Icon,
    RotateCcw: Icon,
    Loader2: Icon,
  };
});

const t = {
  feedbackError: "Murojaat yuborilmadi. Birozdan so‘ng qayta urinib ko‘ring.",
  feedbackSectionAbout: "1. Murojaat haqida",
  feedbackSectionContact: "2. Siz bilan bog‘lanish",
  feedbackSectionMessage: "3. Xabar",
  feedbackType: "Murojaat turi",
  feedbackTypeSelectPlaceholder: "Murojaat turini tanlang",
  feedbackTypeProposal: "Taklif",
  feedbackTypeQuestion: "Savol",
  feedbackTypeError: "Xato haqida xabar",
  feedbackTypeCorrection: "Ma’lumotni tuzatish",
  feedbackTypeNomination: "Bitiruvchi ma’lumotini taklif qilish",
  feedbackTypeAddInfo: "Qo‘shimcha ma’lumot",
  feedbackTypeOther: "Boshqa",
  feedbackSubject: "Mavzu",
  feedbackSubjectPlaceholder: "Murojaat mavzusini qisqacha yozing",
  feedbackName: "Ismingiz",
  feedbackNamePlaceholder: "Ism familiyangiz",
  feedbackEmail: "Email",
  feedbackEmailPlaceholder: "name@example.com",
  feedbackPhone: "Telefon",
  feedbackPhonePlaceholder: "+998 90 123 45 67",
  feedbackContact: "Aloqa ma’lumotingiz",
  feedbackContactHint: "Javob olishni istasangiz, email yoki telefon raqamingizdan kamida bittasini kiriting.",
  feedbackMessage: "Xabar matni",
  feedbackMessagePlaceholder: "Savolingiz, taklifingiz yoki tuzatishingizni batafsil yozing...",
  feedbackPrivacyNote: "Murojaatingiz universitet ma’muriyati tomonidan ko‘rib chiqiladi. Aloqa ma’lumotingiz faqat murojaatingizga javob berish uchun ishlatiladi.",
  feedbackPrivacyLink: "Maxfiylik siyosati",
  feedbackSubmit: "Murojaat yuborish",
  feedbackSending: "Yuborilmoqda...",
  feedbackSuccessTitle: "Murojaatingiz qabul qilindi",
  feedbackSuccessText: "Rahmat. Murojaatingiz universitet ma’muriyatiga yuborildi. Zarur bo‘lsa, siz bilan ko‘rsatilgan aloqa ma’lumotlari orqali bog‘lanamiz.",
  feedbackRefNumber: "Murojaat raqami",
  feedbackSendAnother: "Yana murojaat yuborish",
  feedbackRetry: "Qayta urinish",
  feedbackOptional: "ixtiyoriy",
} as any;

describe("FeedbackForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 3 logical fieldset sections and inputs", () => {
    render(<FeedbackForm locale="uz" t={t} />);

    expect(screen.getByText("1. Murojaat haqida")).toBeInTheDocument();
    expect(screen.getByText("2. Siz bilan bog‘lanish")).toBeInTheDocument();
    expect(screen.getByText("3. Xabar")).toBeInTheDocument();

    expect(screen.getByLabelText(/Murojaat turi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mavzu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Xabar matni/i)).toBeInTheDocument();
  });

  it("short subject shows subject validation error", () => {
    render(<FeedbackForm locale="uz" t={t} />);

    const subjectInput = document.getElementById("feedback-subject") as HTMLInputElement;
    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;

    fireEvent.change(subjectInput, { target: { value: "ab" } });
    fireEvent.change(msgInput, { target: { value: "This is a valid long enough message" } });

    fireEvent.click(screen.getByRole("button", { name: /Murojaat yuborish/i }));

    expect(screen.getByText(/Mavzu kamida 3 ta belgidan iborat bo‘lishi kerak/i)).toBeInTheDocument();
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it("short message shows message validation error", () => {
    render(<FeedbackForm locale="uz" t={t} />);

    const subjectInput = document.getElementById("feedback-subject") as HTMLInputElement;
    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;

    fireEvent.change(subjectInput, { target: { value: "Valid Subject" } });
    fireEvent.change(msgInput, { target: { value: "short" } });

    fireEvent.click(screen.getByRole("button", { name: /Murojaat yuborish/i }));

    expect(screen.getByText(/Xabar matni kamida 10 ta belgidan iborat bo‘lishi kerak/i)).toBeInTheDocument();
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it("invalid email shows email format validation error", () => {
    render(<FeedbackForm locale="uz" t={t} />);

    const subjectInput = document.getElementById("feedback-subject") as HTMLInputElement;
    const emailInput = document.getElementById("feedback-email") as HTMLInputElement;
    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;

    fireEvent.change(subjectInput, { target: { value: "Valid Subject" } });
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.change(msgInput, { target: { value: "This is a valid message for testing." } });

    fireEvent.click(screen.getByRole("button", { name: /Murojaat yuborish/i }));

    expect(screen.getByText(/Email formati noto‘g‘ri kiritildi/i)).toBeInTheDocument();
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it("valid submission calls sendFeedback and renders success state with reference ID", async () => {
    mockSendFeedback.mockResolvedValueOnce({
      data: {
        id: 1042,
        type: "proposal",
        subject: "Test Proposal",
        message: "This is a great suggestion for the platform.",
        name: "Ali Valiyev",
        email: "ali@example.com",
      },
    });

    render(<FeedbackForm locale="uz" t={t} />);

    const subjectInput = document.getElementById("feedback-subject") as HTMLInputElement;
    const emailInput = document.getElementById("feedback-email") as HTMLInputElement;
    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;

    fireEvent.change(subjectInput, { target: { value: "Test Proposal" } });
    fireEvent.change(emailInput, { target: { value: "ali@example.com" } });
    fireEvent.change(msgInput, { target: { value: "This is a great suggestion for the platform." } });

    fireEvent.click(screen.getByRole("button", { name: /Murojaat yuborish/i }));

    await waitFor(() => {
      expect(mockSendFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "proposal",
          subject: "Test Proposal",
          email: "ali@example.com",
          message: "This is a great suggestion for the platform.",
        }),
        "uz"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Murojaatingiz qabul qilindi")).toBeInTheDocument();
      expect(screen.getByText("#A1042")).toBeInTheDocument();
    });
  });

  it("reset button clears success state and allows sending another request", async () => {
    mockSendFeedback.mockResolvedValueOnce({
      data: {
        id: 99,
        type: "proposal",
        subject: "Test Proposal",
        message: "Valid message for testing reset.",
      },
    });

    render(<FeedbackForm locale="uz" t={t} />);

    const subjectInput = document.getElementById("feedback-subject") as HTMLInputElement;
    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;

    fireEvent.change(subjectInput, { target: { value: "Test Proposal" } });
    fireEvent.change(msgInput, { target: { value: "Valid message for testing reset." } });

    fireEvent.click(screen.getByRole("button", { name: /Murojaat yuborish/i }));

    await waitFor(() => {
      expect(screen.getByText("Murojaatingiz qabul qilindi")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Yana murojaat yuborish/i }));
    expect(screen.queryByText("Murojaatingiz qabul qilindi")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Murojaat yuborish/i })).toBeInTheDocument();
  });

  it("backend server error shows error alert", async () => {
    mockSendFeedback.mockRejectedValueOnce(new Error("Server error"));
    render(<FeedbackForm locale="uz" t={t} />);

    const subjectInput = document.getElementById("feedback-subject") as HTMLInputElement;
    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;

    fireEvent.change(subjectInput, { target: { value: "Valid Subject" } });
    fireEvent.change(msgInput, { target: { value: "Valid message for server error test." } });

    fireEvent.click(screen.getByRole("button", { name: /Murojaat yuborish/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
