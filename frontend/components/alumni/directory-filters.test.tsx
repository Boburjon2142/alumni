import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DirectoryFilters } from "./directory-filters";
import type { Faculty, Recognition } from "@/types/alumni";

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

const mockRecognitions: Recognition[] = [
  { id: 1, name: "Faxriy ustoz", slug: "faxriy-ustoz", icon: "🎖️" },
  { id: 2, name: "Innovatsiya yetakchisi", slug: "innovatsiya-yetakchisi", icon: "🚀" },
];

const mockTranslations = {
  search: "Qidirish",
  searchPlaceholder: "Ism, lavozim yoki tashkilot bo‘yicha qidiring...",
  filters: "Filtrlar",
  faculty: "Fakultet",
  allFaculties: "Barcha fakultetlar",
  year: "Bitiruv yili",
  clearFilters: "Tozalash",
  allRecognitions: "Barcha unvonlar",
};

describe("DirectoryFilters", () => {
  afterEach(() => {
    cleanup();
    replaceMock.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it("renders 3-element desktop toolbar: search, recognition combobox, and filters toggle", () => {
    render(
      <DirectoryFilters
        faculties={mockFaculties}
        recognitions={mockRecognitions}
        locale="uz"
        translations={mockTranslations}
      />
    );

    expect(
      screen.getByPlaceholderText("Ism, lavozim yoki tashkilot bo‘yicha qidiring...")
    ).toBeInTheDocument();
    expect(screen.getByText("Barcha unvonlar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Qo‘shimcha filtrlarni ko‘rsatish/i })).toBeInTheDocument();
  });

  it("opens recognition dropdown and selects an option", () => {
    render(
      <DirectoryFilters
        faculties={mockFaculties}
        recognitions={mockRecognitions}
        locale="uz"
        translations={mockTranslations}
      />
    );

    const trigger = screen.getByLabelText("Faxriy unvon bo‘yicha filtrlash");
    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Faxriy ustoz")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Faxriy ustoz"));

    expect(replaceMock).toHaveBeenCalledWith("/alumni?recognition=faxriy-ustoz", { scroll: false });
  });

  it("renders active chips when filters are present in query params", () => {
    mockSearchParams = new URLSearchParams("search=Ali&recognition=faxriy-ustoz");

    render(
      <DirectoryFilters
        faculties={mockFaculties}
        recognitions={mockRecognitions}
        locale="uz"
        translations={mockTranslations}
      />
    );

    expect(screen.getByText(/“Ali”/)).toBeInTheDocument();
    expect(screen.getAllByText("Faxriy ustoz").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Unvon filtrini o‘chirish: Faxriy ustoz/i })).toBeInTheDocument();
  });

  it("renders localized recognition titles when locale is ru or en", () => {
    // 1. Russian locale
    mockSearchParams = new URLSearchParams("recognition=faxriy-ustoz");
    const { rerender } = render(
      <DirectoryFilters
        faculties={mockFaculties}
        recognitions={mockRecognitions}
        locale="ru"
        translations={{
          ...mockTranslations,
          allRecognitions: "Все звания",
          filterBy: "Фильтры:",
          clearAll: "Очистить всё",
        }}
      />
    );

    expect(screen.getAllByText("Почётный наставник").length).toBeGreaterThanOrEqual(1);

    // 2. English locale
    cleanup();
    mockSearchParams = new URLSearchParams("recognition=faxriy-ustoz");
    render(
      <DirectoryFilters
        faculties={mockFaculties}
        recognitions={mockRecognitions}
        locale="en"
        translations={{
          ...mockTranslations,
          allRecognitions: "All Titles",
          filterBy: "Filtered by:",
          clearAll: "Clear all",
        }}
      />
    );

    expect(screen.getAllByText("Honorary Mentor").length).toBeGreaterThanOrEqual(1);
  });
});
