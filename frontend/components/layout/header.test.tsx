import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { Header } from "./header";
import { getDictionary } from "@/lib/i18n";

const navigation = vi.hoisted(() => ({ pathname: "/", push: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authSession: () => Promise.resolve({ authenticated: false }) }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...props }: any) => <a href={href} {...props} onClick={event => { event.preventDefault(); onClick?.(event); }}>{children}</a>,
}));

vi.mock("lucide-react", () => {
  const Icon = (props: any) => <span data-testid="icon" {...props} />;
  return {
    Menu: Icon,
    Award: Icon,
    Medal: Icon,
    Users: Icon,
    MessagesSquare: Icon,
    Lightbulb: Icon,
    FlaskConical: Icon,
    HandHeart: Icon,
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
  ...getDictionary("uz"),
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
  afterEach(() => { cleanup(); navigation.pathname = "/"; navigation.push.mockClear(); });

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

  it("groups existing destinations and closes after selection", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const trigger = screen.getByRole("button", { name: "Alumni" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "Alumni" });
    const links = within(menu).getAllByRole("menuitem");
    expect(links.map(link => link.getAttribute("href"))).toEqual(["/groups", "/alumni", "/stories", "/impact"]);
    fireEvent.click(links[0]);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports outside dismissal, Escape focus return and only one open group", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const alumni = screen.getByRole("button", { name: "Alumni" });
    const opportunities = screen.getByRole("button", { name: "Imkoniyatlar" });
    fireEvent.click(alumni);
    fireEvent.pointerDown(document.body);
    expect(alumni).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(alumni);
    fireEvent.click(opportunities);
    expect(alumni).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(opportunities).toHaveFocus();
    expect(opportunities).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps unimplemented opportunities disabled without invented URLs", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    fireEvent.click(screen.getByRole("button", { name: "Imkoniyatlar" }));
    const items = within(screen.getByRole("menu", { name: "Imkoniyatlar" })).getAllByRole("menuitem");
    expect(items.map(item => item.getAttribute("href"))).toEqual(["/interviews", "/advice", null, null]);
    items.slice(2).forEach(item => {
      expect(item).toHaveAttribute("aria-disabled", "true");
      expect(item).toHaveTextContent("Tez orada");
    });
  });

  it("opens dropdown on mouse enter and closes on mouse leave", async () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const trigger = screen.getByRole("button", { name: "Alumni" });
    const group = trigger.parentElement!;
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.mouseEnter(group);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.mouseLeave(group);
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders Platforma dropdown without icons and with 3 items", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const trigger = screen.getByRole("button", { name: "Platforma" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "Platforma" });
    const items = within(menu).getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("href", "/");
    expect(items[0]).toHaveTextContent("Bosh sahifa");
    expect(items[0]).toHaveTextContent("ALUMNI platformasining asosiy sahifasi");
    expect(items[1]).toHaveAttribute("href", "/about");
    expect(items[1]).toHaveTextContent("Platforma haqida");
    expect(items[1]).toHaveTextContent("ALUMNI maqsadi, imkoniyatlari va ishlash tamoyillari");
    expect(items[2]).toHaveAttribute("href", "/feedback");
    expect(items[2]).toHaveTextContent("Murojaat");
    expect(items[2]).toHaveTextContent("Savol, taklif yoki murojaat yuborish");

    // Ensure no icons inside Platforma menu items
    items.forEach(item => {
      expect(within(item).queryByTestId("icon")).toBeNull();
    });
  });

  it("renders Yangiliklar dropdown without icons and with 3 items", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const trigger = screen.getByRole("button", { name: "Yangiliklar" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "Yangiliklar" });
    const items = within(menu).getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("href", "/news");
    expect(items[0]).toHaveTextContent("So‘nggi yangiliklar");
    expect(items[0]).toHaveTextContent("ALUMNI va bitiruvchilar hayotidagi so‘nggi xabarlar");
    expect(items[1]).toHaveAttribute("aria-disabled", "true");
    expect(items[1]).toHaveTextContent("Tadbirlar");
    expect(items[1]).toHaveTextContent("Alumni uchrashuvlari, konferensiyalar va universitet tadbirlari");
    expect(items[1]).toHaveTextContent("Tez orada");
    expect(items[2]).toHaveAttribute("aria-disabled", "true");
    expect(items[2]).toHaveTextContent("Yutuqlar");
    expect(items[2]).toHaveTextContent("Talabalar va bitiruvchilarning muhim natijalari");
    expect(items[2]).toHaveTextContent("Tez orada");

    // Ensure no icons inside the Yangiliklar menu items
    items.forEach(item => {
      expect(within(item).queryByTestId("icon")).toBeNull();
    });
  });

  it("ensures all dropdown groups have zero icons", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    ["Platforma", "Alumni", "Imkoniyatlar", "Yangiliklar"].forEach(name => {
      const trigger = screen.getByRole("button", { name });
      fireEvent.click(trigger);
      const menu = screen.getByRole("menu", { name });
      const items = within(menu).getAllByRole("menuitem");
      items.forEach(item => {
        expect(within(item).queryByTestId("icon")).toBeNull();
      });
    });
  });

  it.each([
    ["/", "Platforma", "/"],
    ["/about", "Platforma", "/about"],
    ["/feedback", "Platforma", "/feedback"],
    ["/groups", "Alumni", "/groups"], ["/groups/42", "Alumni", "/groups"],
    ["/alumni/person", "Alumni", "/alumni"], ["/directory/person", "Alumni", "/alumni"],
    ["/impact", "Alumni", "/impact"], ["/interviews/person", "Imkoniyatlar", "/interviews"],
    ["/advice", "Imkoniyatlar", "/advice"],
    ["/stories", "Alumni", "/stories"], ["/stories/sample-story", "Alumni", "/stories"],
    ["/news", "Yangiliklar", "/news"], ["/news/sample-news", "Yangiliklar", "/news"],
  ])("marks parent and child active on %s", (path, parent, href) => {
    navigation.pathname = path;
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const trigger = screen.getByRole("button", { name: parent });
    expect(trigger).toHaveClass("active");
    fireEvent.click(trigger);
    const current = screen.getAllByRole("menuitem").find(item => item.getAttribute("href") === href);
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("supports arrow navigation and closes when focus leaves", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const trigger = screen.getByRole("button", { name: "Alumni" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const items = screen.getAllByRole("menuitem");
    expect(items[0]).toHaveFocus();
    fireEvent.keyDown(items[0], { key: "ArrowDown" });
    expect(items[1]).toHaveFocus();
    fireEvent.keyDown(items[1], { key: "End" });
    expect(items[3]).toHaveFocus();
    fireEvent.blur(items[3], { relatedTarget: document.body });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the mobile menu after navigation and preserves search and controls", () => {
    render(<Header locale="uz" t={getDictionary("uz")} />);
    const menuButton = screen.getByLabelText("Menyuni ochish");
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByRole("button", { name: "Alumni" }));
    fireEvent.click(screen.getAllByRole("menuitem")[0]);
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Platforma" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: getDictionary("uz").navJoin })).toHaveAttribute("href", "/join");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Ali Vali" } });
    fireEvent.submit(screen.getByRole("search"));
    expect(navigation.push).toHaveBeenCalledWith("/alumni?search=Ali%20Vali");
    expect(screen.getAllByRole("button", { name: "Kirish" })).toHaveLength(2);
    expect(screen.getByTestId("lang-switcher")).toBeInTheDocument();
  });
});
