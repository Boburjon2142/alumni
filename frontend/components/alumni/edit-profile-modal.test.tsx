import { authenticatedFetch } from "@/lib/auth";
import { beforeEach, describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { EditProfileModal } from "./edit-profile-modal";
import type { Alumni } from "@/types/alumni";

vi.mock("@/lib/auth", () => ({
  authenticatedFetch: vi.fn(),
  authSession: vi.fn(() => Promise.resolve({ authenticated: true, user: { role: "admin", slug: "sherzod-nematov" } })),
}));
beforeEach(() => { vi.mocked(authenticatedFetch).mockResolvedValue({ ok: true, json: async () => ({ data: {} }) } as Response); });

afterEach(() => {
  cleanup();
});

// Mock icons
vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    Lock: Icon,
    AlertCircle: Icon,
    CheckCircle2: Icon,
    Edit3: Icon,
    X: Icon,
  };
});

const mockAlumniWithYear: Alumni = {
  id: 1,
  slug: "sherzod-nematov",
  full_name: "Sherzod Ne'matov",
  graduation_year: 2005,
  position: "Rektor",
  current_company: "Qarshi davlat texnika universiteti",
  current_activity: "Universitet boshqaruvi",
  bio: "Texnika fanlari doktori",
} as Alumni;

const mockAlumniWithoutYear: Alumni = {
  id: 2,
  slug: "yangi-bitiruvchi",
  full_name: "Yangi Bitiruvchi",
  graduation_year: undefined,
  position: "Mutaxassis",
  current_company: "Tech",
  current_activity: "Dasturlash",
  bio: "",
} as Alumni;

describe("EditProfileModal - One-time Graduation Year Selection", () => {
  it("locks graduation year if already set and disables editing it", () => {
    render(
      <EditProfileModal
        alumnus={mockAlumniWithYear}
        trigger={<button>Edit</button>}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText("Edit"));

    // Check locked badge is present
    expect(
      screen.getByText(/Faqat bir marotaba tanlanadi \(Qulflangan\)/i)
    ).toBeInTheDocument();

    // Check graduation year input is disabled and readOnly
    const yearInput = screen.getByDisplayValue(/2005-yil bitiruvchisi/i);
    expect(yearInput).toBeDisabled();
    expect(yearInput).toHaveAttribute("readonly");
  });

  it("allows selecting graduation year once when not yet set", async () => {
    const onProfileUpdated = vi.fn();
    render(
      <EditProfileModal
        alumnus={mockAlumniWithoutYear}
        trigger={<button>Edit</button>}
        onProfileUpdated={onProfileUpdated}
      />
    );

    // Open modal
    fireEvent.click(screen.getByText("Edit"));

    // Check warning message is shown
    expect(
      screen.getByText(/Bitirgan yilni faqatgina bir marotaba tanlay olasiz/i)
    ).toBeInTheDocument();

    // Select dropdown should be present and enabled
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).not.toBeDisabled();

    // Select a graduation year
    fireEvent.change(select, { target: { value: "2018" } });
    expect(select).toHaveValue("2018");

    // Click save
    fireEvent.click(screen.getByRole("button", { name: "Saqlash" }));

    // Callback should receive the newly chosen year
    await waitFor(() => {
      expect(onProfileUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          graduation_year: 2018,
        })
      );
    });
  });

  it("hides edit button when canEdit is false (unauthenticated or another user)", () => {
    render(
      <EditProfileModal
        alumnus={mockAlumniWithYear}
        canEdit={false}
      />
    );
    expect(screen.queryByText(/Profilni tahrirlash/i)).toBeNull();
  });

  it("shows edit button when canEdit is true (profile owner or admin)", () => {
    render(
      <EditProfileModal
        alumnus={mockAlumniWithYear}
        canEdit={true}
      />
    );
    expect(screen.getByText(/Profilni tahrirlash/i)).toBeInTheDocument();
  });
});

