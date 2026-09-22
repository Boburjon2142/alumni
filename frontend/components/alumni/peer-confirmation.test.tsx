import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { PeerConfirmation } from "./peer-confirmation";
import type { Alumni } from "@/types/alumni";

const mockConfirmAlumnus = vi.fn();

vi.mock("@/lib/api", () => ({
  confirmAlumnus: (...args: any[]) => mockConfirmAlumnus(...args),
}));

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    BadgeCheck: Icon,
    CheckCircle2: Icon,
    ExternalLink: Icon,
    Loader2: Icon,
    Send: Icon,
    ShieldCheck: Icon,
    UserCheck: Icon,
    X: Icon,
    AlertCircle: Icon,
  };
});

const mockApprovedAlumnus: Alumni = {
  id: 1,
  slug: "sherzod-aliev",
  full_name: "Sherzod Aliyev",
  graduation_year: 2018,
  faculty: "Matematika va kompyuter fanlari",
  is_featured: false,
  verified: true,
  approval_status: "approved",
  approved_by_name: "Aziz Rahmonov",
};

const mockPendingAlumnus: Alumni = {
  id: 2,
  slug: "jasur-bekmurodov",
  full_name: "Jasur Bekmurodov",
  graduation_year: 2022,
  faculty: "Filologiya",
  is_featured: false,
  verified: false,
  approval_status: "pending",
};

describe("PeerConfirmation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render banner for already approved alumnus", () => {
    const { container } = render(<PeerConfirmation alumnus={mockApprovedAlumnus} locale="uz" />);
    expect(container.firstChild).toBeNull();
  });


  it("renders pending status and confirm button for unapproved alumnus", async () => {
    mockConfirmAlumnus.mockResolvedValueOnce({
      success: true,
      message: "Bitiruvchi muvaffaqiyatli tasdiqlandi!",
      data: {
        id: 2,
        slug: "jasur-bekmurodov",
        approved_by: "Sherzod Aliyev",
      },
    });

    render(<PeerConfirmation alumnus={mockPendingAlumnus} locale="uz" />);

    expect(screen.getByText(/Tasdiqlash kutilmoqda/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole("button", { name: /Bitiruvchini tasdiqlash/i });
    expect(confirmBtn).toBeInTheDocument();

    // Click confirm button to open dialog
    fireEvent.click(confirmBtn);

    // Dialog opens
    expect(screen.getByText(/Bitiruvchini tasdiqlash \(Peer Confirmation\)/i)).toBeInTheDocument();
    expect(screen.getByText(/E’lon qilish tartibi:/i)).toBeInTheDocument();
    expect(screen.getByText(/«Tasdiqlanganlar»/i)).toBeInTheDocument();

    // Submit confirmation
    const submitBtn = screen.getByRole("button", { name: /Tasdiqlash va xabar yuborish/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockConfirmAlumnus).toHaveBeenCalledWith("jasur-bekmurodov");
      expect(screen.getByText(/Bitiruvchi muvaffaqiyatli tasdiqlandi!/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Botda ko‘rish/i })).toBeInTheDocument();
    });
  });
});

