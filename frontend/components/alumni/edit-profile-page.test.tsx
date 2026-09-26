import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EditProfilePage } from "./edit-profile-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockAlumniData = {
  id: 1,
  full_name: "Boburjon Abdug‘aniyev",
  graduation_year: 2021,
  faculty_name: "Fizika fakulteti",
  current_company: "Qarshi davlat universiteti",
  position: "Dasturchi-muhandis",
  industry: "Axborot texnologiyalari (IT) va media",
  city: "Qashqadaryo viloyati",
  work_experiences: [
    {
      company: "Qarshi davlat universiteti",
      position: "Dasturchi-muhandis",
      industry: "Axborot texnologiyalari (IT) va media",
      region: "Qarshi shahri",
      start_year: 2023,
      end_year: null,
      is_current: true,
    },
  ],
  educations: [],
};

describe("EditProfilePage 3-block structure", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: mockAlumniData }),
        })
      )
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders exactly 3 main profile blocks and removes redundant current job block", async () => {
    render(<EditProfilePage locale="uz" />);

    // Wait until profile is loaded
    await waitFor(() => {
      expect(screen.queryByText("Profil ma’lumotlari yuklanmoqda...")).not.toBeInTheDocument();
    });

    // Block 1: Asosiy ma'lumotlar
    expect(screen.getByText("Asosiy ma’lumotlar")).toBeInTheDocument();

    // Block 2: Ta'lim bosqichlari
    expect(screen.getByText("Ta’lim bosqichlari")).toBeInTheDocument();

    // Block 3: Mehnat faoliyati tarixi (formerly Block 4)
    expect(screen.getByText("Mehnat faoliyati tarixi")).toBeInTheDocument();

    // Verify 'Hozirgi kasbiy faoliyat' separate block is NOT present
    expect(screen.queryByText("Hozirgi kasbiy faoliyat")).not.toBeInTheDocument();

    // Verify current job badge is shown on the active work experience
    expect(screen.getByText("Hozirgi asosiy faoliyat")).toBeInTheDocument();
  });
});
