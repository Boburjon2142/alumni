import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ImpactHeader } from "./impact-header";
import { ImpactExplanation } from "./impact-explanation";
import { ImpactFilters } from "./impact-filters";
import { ImpactRankingTable } from "./impact-ranking-table";
import { ImpactTopContributors } from "./impact-top-contributors";
import type { ImpactRankingEntry } from "@/types/alumni";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const mockT = {
  impactTitle: "E’tirof",
  impactSubtitle: "Universitet va bitiruvchilar hamjamiyatiga qo‘shilgan tasdiqlangan hissalar",
  impactSubmitCta: "Tashabbus haqida xabar bering",
  impactHowItWorksTitle: "E’tirof qanday beriladi?",
  impactHowItWorksDesc: "ALUMNI reytingi tasdiqlangan foydali ishlarga asoslanadi.",
  impactPillar1Title: "Karyera va amaliyot",
  impactPillar1Desc: "Talabalarni ishga qabul qilish",
  impactPillar2Title: "Mentorlik va yo‘l-yo‘riq",
  impactPillar2Desc: "Talabalarga mentorlik qilish",
  impactPillar3Title: "Universitetga moddiy/ilmiy ko‘mak",
  impactPillar3Desc: "Laboratoriya va stipendiya",
  impactPillar4Title: "Hamjamiyat va tadbirlar",
  impactPillar4Desc: "Mahorat darslari o‘tkazish",
  impactPeriodAnnual: "Joriy yil",
  impactPeriodLifetime: "Butun davr",
  impactAllCategories: "Barcha yo‘nalishlar",
  impactCareer: "Karyera ko‘magi",
  impactMentorship: "Mentorlik",
  impactUniversity: "Universitet rivoji",
  impactCommunity: "Hamjamiyat tadbirlari",
  impactFilterFaculty: "Barcha fakultetlar",
  impactFilterYear: "Barcha yillar",
  impactTopContributors: "Yetakchi bitiruvchilar",
  impactFullList: "E’tirof etilgan bitiruvchilar ro‘yxati",
  impactVerifiedCount: "ta tasdiqlangan hissa",
  impactBadgesCount: "ta nishon",
  impactRank: "O‘rni",
  impactScore: "Faoliyat",
  impactEmptyRankings: "Hozircha tanlangan parametrlar bo‘yicha ma’lumotlar mavjud emas",
  impactEmptyRankingsSub: "Moderatsiya yangi tasdiqlangan hissalarni kiritmoqda",
} as any;

const mockEntries: ImpactRankingEntry[] = [
  {
    rank: 1,
    alumni: {
      id: 10,
      slug: "alim-qodirov",
      full_name: "Alim Qodirov",
      avatar: "",
      image_url: "",
      graduation_year: 2012,
      faculty: "Fizika-matematika",
      position: "Bosh muhandis",
      current_company: "EPAM Systems",
    },
    total_score: 350,
    annual_score: 350,
    lifetime_score: 350,
    top_category: "career",
    category_breakdown: {
      career: 200,
      mentorship: 100,
      university: 50,
      community: 0,
    },
    badges_count: 2,
    verified_contributions_count: 5,
    top_badge: {
      title_uz: "Yetakchi ish beruvchi",
      icon: "💼",
      category: "career",
    },
  },
];

describe("Impact & Recognition Module", () => {
  afterEach(() => cleanup());

  it("renders ImpactHeader with title and triggers submit modal callback", () => {
    const handleOpen = vi.fn();
    render(<ImpactHeader t={mockT} onOpenSubmitModal={handleOpen} />);

    expect(screen.getByRole("heading", { name: /E’tirof/i })).toBeInTheDocument();
    const btn = screen.getByText(/Tashabbus haqida xabar bering/i);
    fireEvent.click(btn);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it("renders ImpactExplanation with all 4 pillars", () => {
    render(<ImpactExplanation t={mockT} />);

    expect(screen.getByText(/Karyera va amaliyot/i)).toBeInTheDocument();
    expect(screen.getByText(/Mentorlik va yo‘l-yo‘riq/i)).toBeInTheDocument();
    expect(screen.getByText(/Universitetga moddiy\/ilmiy ko‘mak/i)).toBeInTheDocument();
    expect(screen.getByText(/Hamjamiyat va tadbirlar/i)).toBeInTheDocument();
  });

  it("renders ImpactTopContributors when entries exist", () => {
    render(<ImpactTopContributors t={mockT} topContributors={mockEntries} />);

    expect(screen.getByText(/Alim Qodirov/i)).toBeInTheDocument();
    expect(screen.getByText(/350 ball/i)).toBeInTheDocument();
    expect(screen.getByText(/Yetakchi ish beruvchi/i)).toBeInTheDocument();
  });

  it("renders ImpactRankingTable with ranking rows", () => {
    render(<ImpactRankingTable t={mockT} entries={mockEntries} />);

    expect(screen.getByText(/E’tirof etilgan bitiruvchilar ro‘yxati/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Alim Qodirov/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Fizika-matematika/i)).toBeInTheDocument();
  });

  it("renders empty state in ImpactRankingTable when no entries", () => {
    render(<ImpactRankingTable t={mockT} entries={[]} />);

    expect(screen.getByText(/Hozircha tanlangan parametrlar bo‘yicha ma’lumotlar mavjud emas/i)).toBeInTheDocument();
  });

  it("triggers filter callbacks in ImpactFilters", () => {
    const handleCategory = vi.fn();
    const handleFaculty = vi.fn();
    const handleYear = vi.fn();
    const handleSearch = vi.fn();

    render(
      <ImpactFilters
        t={mockT}
        category=""
        faculty=""
        year=""
        search=""
        faculties={[{ id: 1, name: "Fizika-matematika" }]}
        onCategoryChange={handleCategory}
        onFacultyChange={handleFaculty}
        onYearChange={handleYear}
        onSearchChange={handleSearch}
      />
    );

    const careerBtn = screen.getByText(/Karyera ko‘magi/i);
    fireEvent.click(careerBtn);
    expect(handleCategory).toHaveBeenCalledWith("career");
  });
});
