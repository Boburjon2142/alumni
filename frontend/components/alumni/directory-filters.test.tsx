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
    vi.useRealTimers();
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

  it("selects an honorary title, preserves other filters and resets pagination", () => {
    mockSearchParams = new URLSearchParams("faculty=Filologiya&page=3");
    render(<DirectoryFilters faculties={mockFaculties} locale="uz" translations={mockTranslations}
      recognitions={[{ id: 1, slug: "ilm-fan-fidoyisi", name: "Ilm-fan fidoyisi", icon: "compass" } as Recognition]} />);
    expect(screen.getByLabelText("Fakultet")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Faxriy unvon bo‘yicha filtrlash"));
    fireEvent.click(screen.getByRole("option", { name: "Ilm-fan fidoyisi" }));
    expect(replaceMock).toHaveBeenCalledWith("/alumni?faculty=Filologiya&recognition=ilm-fan-fidoyisi", { scroll: false });
  });

  it("keeps the filter fields mounted and shows them together when the panel opens", () => {
    render(<DirectoryFilters faculties={mockFaculties} locale="uz" translations={mockTranslations}
      recognitions={[{ id: 1, slug: "ilm-fan-fidoyisi", name: "Ilm-fan fidoyisi", icon: "compass" } as Recognition]} />);
    const panel = document.getElementById("directory-advanced-filters")!;
    const toggle = screen.getByRole("button", { name: /Qo‘shimcha filtrlarni ko‘rsatish/i });
    const faculty = screen.getByLabelText("Fakultet");
    const year = screen.getByLabelText("Bitiruv yili");
    expect(panel).not.toBeVisible();
    expect(panel).toContainElement(faculty);
    expect(panel).toContainElement(year);

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(faculty).toBeVisible();
    expect(year).toBeVisible();
    expect(screen.getByRole("button", { name: "Soha bo‘yicha filtrlash" })).toBeVisible();

    fireEvent.change(year, { target: { value: "1979" } });
    fireEvent.click(toggle);
    expect(panel).not.toBeVisible();
    fireEvent.click(toggle);
    expect(screen.getByLabelText("Bitiruv yili")).toBe(year);
    expect(year).toHaveValue(1979);
    expect(faculty).toBeVisible();
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

