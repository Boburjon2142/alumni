import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Header } from "./header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    Menu: Icon,
    Search: Icon,
    X: Icon,
    ChevronDown: Icon,
    Check: Icon,
    LogIn: Icon,
    AlertTriangle: Icon,
    UserCheck: Icon,
    KeyRound: Icon,
    Mail: Icon,
    RotateCw: Icon,
    ShieldCheck: Icon,
  };
});

vi.mock("@/components/auth/auth-modal", () => ({
  AuthModal: ({ trigger }: any) => trigger || <button type="button">Kirish</button>,
}));

vi.mock("@/components/about/about-modal", () => ({
  AboutModal: ({ trigger }: any) => trigger || null,
}));

vi.mock("./language-switcher", () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

const mockT = {
  university: "University",
  navHome: "Home",
  navAlumni: "Alumni",
  navGroups: "Groups",
  navStories: "Stories",
  navInterviews: "Interviews",
  navAdvice: "Advice",
  navAbout: "About",
  navFeedback: "Feedback",
  searchPlaceholder: "Search...",
  search: "Search",
} as any;

describe("Header", () => {
  afterEach(() => cleanup());

  it("menu button toggles open state", () => {
    render(<Header locale="en" t={mockT} />);
    const btn = screen.getByLabelText(/Menyuni ochish/i);
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-controls")).toBe("primary-navigation");

    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("escape key closes menu", () => {
    render(<Header locale="en" t={mockT} />);
    const btn = screen.getByLabelText(/Menyuni ochish/i);

    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("nav has correct aria-label", () => {
    render(<Header locale="en" t={mockT} />);
    const nav = screen.getByRole("navigation", { name: /Asosiy navigatsiya/i });
    expect(nav).toBeInTheDocument();
  });
});
