import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { FeedbackForm } from "./feedback-form";

const mockSendFeedback = vi.fn();

vi.mock("@/lib/api", () => ({ sendFeedback: (...args: any[]) => mockSendFeedback(...args) }));

const MockIcon = (props: any) => <span data-testid="icon" {...props} />;

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    CheckCircle2: Icon,
    Send: Icon,
    Lightbulb: Icon,
    HelpCircle: Icon,
    AlertTriangle: Icon,
    FilePlus2: Icon,
    MessageSquare: Icon,
    ChevronDown: Icon,
    User: Icon,
    Mail: Icon,
    FileText: Icon,
    Loader2: Icon,
  };
});

const t = {
  feedbackError: "Error occurred",
  feedbackType: "Type",
  feedbackTypeProposal: "Proposal",
  feedbackTypeQuestion: "Question",
  feedbackTypeError: "Error Report",
  feedbackTypeAddInfo: "Add Info",
  feedbackTypeOther: "Other",
  feedbackName: "Name",
  feedbackContact: "Contact",
  feedbackContactHint: "Hint",
  feedbackMessage: "Message",
  feedbackMessagePlaceholder: "Placeholder",
  feedbackSubmit: "Submit",
  feedbackSending: "Sending...",
  feedbackSuccessTitle: "Success!",
  feedbackSuccessText: "Your feedback was received.",
  feedbackSendAnother: "Send Another",
} as any;

describe("FeedbackForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("short message shows inline error", () => {
    render(<FeedbackForm locale="en" t={t} />);

    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;
    fireEvent.change(msgInput, { target: { value: "abc" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    expect(screen.getByText("Error occurred")).toBeInTheDocument();
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it("valid submission calls sendFeedback and shows success", async () => {
    mockSendFeedback.mockResolvedValueOnce({ success: true });
    render(<FeedbackForm locale="en" t={t} />);

    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;
    fireEvent.change(msgInput, { target: { value: "This is a long enough message for testing" } });

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(mockSendFeedback).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("Success!")).toBeInTheDocument();
    });
  });

  it("reset button clears success state", async () => {
    mockSendFeedback.mockResolvedValueOnce({ success: true });
    render(<FeedbackForm locale="en" t={t} />);

    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;
    fireEvent.change(msgInput, { target: { value: "Valid message for testing" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText("Success!")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Another/i }));
    expect(screen.queryByText("Success!")).not.toBeInTheDocument();
  });

  it("backend error shows error banner", async () => {
    mockSendFeedback.mockRejectedValueOnce(new Error("Server error"));
    render(<FeedbackForm locale="en" t={t} />);

    const msgInput = document.getElementById("feedback-message") as HTMLTextAreaElement;
    fireEvent.change(msgInput, { target: { value: "Valid message for backend error test" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
