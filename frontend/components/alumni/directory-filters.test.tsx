import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DirectoryFilters } from "./directory-filters";
import type { Faculty } from "@/types/alumni";

const replaceMock = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/alumni",
  useSearchParams: () => mockSearchParams,
}));

const mockFaculties: Faculty[] = [
  { id: 1, name: "Matematika va kompyuter ilmlari" },
  { id: 2, name: "Filologiya" },
];

const mockTranslations = {
  search: "Qidirish",
  searchPlaceholder: "Ism, lavozim yoki tashkilot bo‘yicha qidiring...",
  filters: "Filtrlar",
  faculty: "Fakultet",
  allFaculties: "Barcha fakultetlar",
  year: "Bitiruv yili",
  clearFilters: "Tozalash",
  allIndustries: "Barcha sohalar",
};

describe("DirectoryFilters", () => {
  afterEach(() => {
    cleanup();
    replaceMock.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it("renders 3-element desktop toolbar: search, industry combobox, and filters toggle", () => {
    render(
      <DirectoryFilters
        faculties={mockFaculties}
        locale="uz"
        translations={mockTranslations}
      />
    );

    expect(
      screen.getByPlaceholderText("Ism, lavozim yoki tashkilot bo‘yicha qidiring...")
    ).toBeInTheDocument();
    expect(screen.getByText("Barcha sohalar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Qo‘shimcha filtrlarni ko‘rsatish/i })).toBeInTheDocument();
  });

  it("opens industry dropdown and selects an option", () => {
    render(
      <DirectoryFilters
        faculties={mockFaculties}
        locale="uz"
        translations={mockTranslations}
      />
    );

    const trigger = screen.getByLabelText("Soha bo‘yicha filtrlash");
    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Oliy ta’lim va ilm-fan")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Oliy ta’lim va ilm-fan"));

    expect(replaceMock).toHaveBeenCalledWith(
      expect.stringContaining("industry=Oliy+ta%E2%80%99lim+va+ilm-fan"),
      { scroll: false }
    );
  });

  it("renders active chips when filters are present in query params", () => {
    mockSearchParams = new URLSearchParams("search=Ali&industry=Axborot+texnologiyalari+(IT)");

    render(
      <DirectoryFilters
        faculties={mockFaculties}
        locale="uz"
        translations={mockTranslations}
      />
    );

    expect(screen.getByText(/“Ali”/)).toBeInTheDocument();
    expect(screen.getAllByText("Axborot texnologiyalari (IT)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Soha filtrini o‘chirish: Axborot texnologiyalari/i })).toBeInTheDocument();
  });
});

