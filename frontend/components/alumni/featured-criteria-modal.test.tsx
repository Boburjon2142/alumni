import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FeaturedCriteriaModal } from "./featured-criteria-modal";

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    Award: Icon,
    BookOpen: Icon,
    Building2: Icon,
    CheckCircle2: Icon,
    FileText: Icon,
    GraduationCap: Icon,
    Printer: Icon,
    Scale: Icon,
    ShieldCheck: Icon,
    Sparkles: Icon,
    Users: Icon,
    X: Icon,
  };
});

describe("FeaturedCriteriaModal", () => {
  afterEach(() => cleanup());

  it("renders trigger button and opens regulation modal on click", () => {
    render(<FeaturedCriteriaModal locale="uz" />);

    const trigger = screen.getByRole("button", {
      name: /Asosiy sahifada chiqarilish mezonlari hujjati/i,
    });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Asosiy sahifa mezonlari")).toBeInTheDocument();
    expect(screen.getByText("Nizom (Demo)")).toBeInTheDocument();

    // Modal is initially not open
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify official university header and regulation title
    expect(screen.getAllByText(/QARSHI DAVLAT UNIVERSITETI/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/qat’iy 12 nafar/i)).toBeInTheDocument();
    expect(screen.getByText(/Faqatgina Universitet Ilmiy Kengashi xulosasi va vakolatli Bosh Administrator/i)).toBeInTheDocument();

    // Tab switching test
    const criteriaTab = screen.getByRole("tab", { name: /5 ta asosiy mezon/i });
    fireEvent.click(criteriaTab);
    expect(screen.getByText(/1. Davlat mukofotlari va unvonlar/i)).toBeInTheDocument();
    expect(screen.getByText(/Qat’iy Kvota: 12 Nafar/i)).toBeInTheDocument();

    // Governance tab test
    const adminTab = screen.getByRole("tab", { name: /Admin vakolati va xavfsizlik/i });
    fireEvent.click(adminTab);
    expect(screen.getByText(/Faqatgina Admin o‘zgartira oladi/i)).toBeInTheDocument();
    expect(screen.getByText(/Ortiqcha profil qo‘shilmaydi va o‘chirilmaydi/i)).toBeInTheDocument();
  });
});
