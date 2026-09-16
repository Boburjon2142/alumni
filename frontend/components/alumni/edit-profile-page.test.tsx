import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import { EditProfilePage } from "./edit-profile-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe("EditProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loaded profile with 2 blocks correctly", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            full_name: "Rustam Karimov",
            faculty_name: "Fizika-matematika",
            graduation_year: 2018,
            bio: "IT mutaxassisi",
            industry: "Axborot texnologiyalari (IT)",
            current_company: "IT Park",
            position: "Dasturchi",
            work_experiences: [],
          },
        }),
      } as Response)
    );

    render(<EditProfilePage locale="uz" />);

    await waitFor(() => {
      expect(screen.getByText("Asosiy ma’lumotlar")).toBeInTheDocument();
      expect(screen.getByText("Faoliyat va Mehnat tarixi")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Rustam Karimov")).toBeInTheDocument();
    });
  });

  it("allows adding work experiences", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            full_name: "Rustam Karimov",
            graduation_year: null,
            work_experiences: [],
          },
        }),
      } as Response)
    );

    render(<EditProfilePage locale="uz" />);

    await waitFor(() => {
      expect(screen.getByText("Asosiy ma’lumotlar")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole("button", { name: /ish joyi qo‘shish/i });
    expect(addButtons.length).toBeGreaterThan(0);

    act(() => {
      fireEvent.click(addButtons[0]);
    });

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("Yangi ish joyi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Masalan: IT Park")).toBeInTheDocument();
  });
});
