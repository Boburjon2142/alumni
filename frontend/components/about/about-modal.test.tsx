import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AboutModal } from "./about-modal";
import { getDictionary } from "@/lib/i18n";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    GraduationCap: Icon,
    Users: Icon,
    Compass: Icon,
    UserPlus: Icon,
    ArrowRight: Icon,
    X: Icon,
    Award: Icon,
  };
});

const t = getDictionary("uz");

describe("AboutModal", () => {
  afterEach(() => cleanup());

  it("renders trigger button and opens dialog on click", () => {
    render(<AboutModal locale="uz" t={t} />);
    const trigger = screen.getByRole("button", { name: t.navAbout });
    expect(trigger).toBeInTheDocument();

    // Initially modal is closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click trigger to open
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: t.aboutTitle })).toBeInTheDocument();

    // Verify concise summary is present
    expect(screen.getByText(/Qarshi davlat universiteti faxriy bitiruvchilari portali/i)).toBeInTheDocument();

    // Verify platform capabilities are present
    expect(screen.getByText(/Platforma beradigan asosiy imkoniyatlar/i)).toBeInTheDocument();
    expect(screen.getByText(/Faxriy bitiruvchilar arxivi/i)).toBeInTheDocument();
    expect(screen.getByText(/Bitiruv yillari guruhlari/i)).toBeInTheDocument();
    expect(screen.getByText(/Yoshlar uchun hayotiy maslahatlar/i)).toBeInTheDocument();
    expect(screen.getByText(/Hamjamiyatga oson qo‘shilish/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: "Yopish" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
