import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { InterviewCard } from "./interview-card";
import type { Interview } from "@/types/alumni";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/remote-image", () => ({
  RemoteImage: ({ alt }: any) => <img alt={alt} />,
}));

const mockInterview: Interview = {
  id: 1,
  slug: "test-interview",
  title_uz: "Test Intervyu Sarlavhasi",
  title_en: "Test Interview Title",
  intro_uz: "Qisqa kirish matni...",
  pull_quote_uz: "Harakat va mehnat muvaffaqiyat garovidir.",
  is_featured: true,
  items_count: 4,
  alumnus: {
    full_name: "Azizbek Rahmonov",
    slug: "azizbek-rahmonov",
    position: "Senior Muhandis",
    faculty: "Axborot texnologiyalari",
  },
};

describe("InterviewCard", () => {
  afterEach(() => cleanup());

  it("renders interview video card and author name properly", () => {
    render(<InterviewCard interview={mockInterview} locale="uz" />);

    expect(screen.getByText("Test Intervyu Sarlavhasi")).toBeInTheDocument();
    expect(screen.getAllByText("Azizbek Rahmonov")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Videoni ko‘rish")[0]).toBeInTheDocument();
  });

  it("opens video modal with iframe when clicking watch button", () => {
    render(
      <InterviewCard
        interview={{ ...mockInterview, video_url: "https://youtu.be/Paq4yBvGxm0" }}
        locale="uz"
      />
    );

    const watchBtn = screen.getAllByText("Videoni ko‘rish")[0];
    fireEvent.click(watchBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTitle("Test Intervyu Sarlavhasi")).toBeInTheDocument();
  });

  it("renders english locale when locale is en", () => {
    render(<InterviewCard interview={mockInterview} locale="en" />);

    expect(screen.getByText("Test Interview Title")).toBeInTheDocument();
    expect(screen.getAllByText("Watch Video")[0]).toBeInTheDocument();
  });
});
