import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { InterviewFilters } from "./interview-filters";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockTranslations = {
  search: "Qidirish",
  searchPlaceholder: "Intervyu qidiring...",
  allInterviews: "Barchasi",
  featuredInterviews: "Tanlanganlar",
  clearFilters: "Tozalash",
  interviewsFound: "ta intervyu topildi",
};

describe("InterviewFilters", () => {
  afterEach(() => {
    cleanup();
    pushMock.mockClear();
  });

  it("renders search input, filter pills, and count badge", () => {
    render(
      <InterviewFilters
        locale="uz"
        totalCount={6}
        translations={mockTranslations}
      />
    );

    expect(screen.getByPlaceholderText("Intervyu qidiring...")).toBeInTheDocument();
    expect(screen.getByText("Barchasi")).toBeInTheDocument();
    expect(screen.getByText("Tanlanganlar")).toBeInTheDocument();
  });

  it("submits search form and updates params", () => {
    render(
      <InterviewFilters
        locale="uz"
        totalCount={6}
        translations={mockTranslations}
      />
    );

    const input = screen.getByPlaceholderText("Intervyu qidiring...");
    fireEvent.change(input, { target: { value: "rektor" } });

    const form = input.closest("form");
    fireEvent.submit(form!);

    expect(pushMock).toHaveBeenCalledWith("/interviews?search=rektor");
  });
});
