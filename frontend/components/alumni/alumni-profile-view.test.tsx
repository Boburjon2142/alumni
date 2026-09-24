import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { AlumniProfileView } from "./alumni-profile-view";
import { getDictionary } from "@/lib/i18n";
import type { Alumni } from "@/types/alumni";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockProfile: Alumni = {
  id: 1,
  slug: "boburjon-abduganiyev",
  full_name: "Abdug‘aniyev Boburjon Akramjon o‘g‘li",
  graduation_year: 2021,
  faculty: "Axborot texnologiyalari fakulteti",
  faculty_name: "Axborot texnologiyalari fakulteti",
  position: "Python Developer",
  current_company: "Uzum Technologies",
  city: "Toshkent shahri",
  academic_degree: "Bakalavr",
  bio: "Texnologiyalar orqali odamlar hayotini yaxshilashga intilgan dasturchiman.",
  work_experiences: [
    {
      id: 1,
      company: "Uzum Technologies",
      position: "Python Developer",
      region: "Toshkent",
      start_year: 2023,
      end_year: null,
      is_current: true,
    },
    {
      id: 2,
      company: "IT Park",
      position: "Junior Python Developer",
      region: "Qarshi",
      start_year: 2021,
      end_year: 2023,
      is_current: false,
    },
  ],
  is_featured: true,
};

describe("AlumniProfileView", () => {
  const t = getDictionary("uz");

  it("renders profile hero with person identity, role, trust badge and university info", () => {
    render(<AlumniProfileView profile={mockProfile} locale="uz" t={t} />);

    expect(screen.getByText("Abdug‘aniyev Boburjon Akramjon o‘g‘li")).toBeInTheDocument();
    expect(screen.getAllByText("Python Developer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Uzum Technologies").length).toBeGreaterThan(0);
    expect(screen.getByText("Universitet tomonidan tasdiqlangan")).toBeInTheDocument();
    expect(screen.getAllByText(/2021-yil bitiruvchisi/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Axborot texnologiyalari fakulteti/).length).toBeGreaterThan(0);
    expect(screen.getByText("Profil to‘liqligi")).toBeInTheDocument();
  });

  it("renders only real fillable sections (about, education, experience)", () => {
    render(<AlumniProfileView profile={mockProfile} locale="uz" t={t} />);

    expect(screen.getAllByText("Men haqimda").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ta[’']lim/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ish tajribasi/).length).toBeGreaterThan(0);

    // Unfillable sections should NOT be in the document
    expect(screen.queryByText(/ko‘nikmalar/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Yutuqlar va e’tiroflar")).not.toBeInTheDocument();
    expect(screen.queryByText("Sertifikatlar va Portfolio")).not.toBeInTheDocument();
    expect(screen.queryByText("Professional havolalar")).not.toBeInTheDocument();

    // Experience timeline
    expect(screen.getByText("Hozirda ishlaydi")).toBeInTheDocument();

    // Sidebar items
    expect(screen.queryByText("Maxfiylik va ko‘rinish")).not.toBeInTheDocument();
    expect(screen.queryByText(/Bog‘lanish \(Email\)/)).not.toBeInTheDocument();
    expect(screen.queryByText(t.impactTitle)).not.toBeInTheDocument();
    expect(screen.getByText("Profil to‘ldirilish darajasi")).toBeInTheDocument();
  });

  it("allows switching tabs to filter sections", () => {
    render(<AlumniProfileView profile={mockProfile} locale="uz" t={t} />);

    const tabButtons = screen.getAllByRole("button", { name: /Ish tajribasi/i });
    fireEvent.click(tabButtons[0]);

    expect(screen.getAllByText(/Ish tajribasi/).length).toBeGreaterThan(0);
    // In experience tab, about section heading is filtered out
    expect(screen.queryByRole("heading", { name: "Men haqimda" })).not.toBeInTheDocument();
  });

  it("renders about, education, and experience side-by-side inside tri-cards-grid", () => {
    const { container } = render(<AlumniProfileView profile={mockProfile} locale="uz" t={t} />);

    const grid = container.querySelector(".profile-sections-wrapper.tri-cards-grid");
    expect(grid).toBeInTheDocument();

    const about = container.querySelector("#about-section");
    const edu = container.querySelector("#education-section");
    const exp = container.querySelector("#experience-section");

    expect(about).toBeInTheDocument();
    expect(edu).toBeInTheDocument();
    expect(exp).toBeInTheDocument();

    expect(grid).toContainElement(about);
    expect(grid).toContainElement(edu);
    expect(grid).toContainElement(exp);
  });
});
