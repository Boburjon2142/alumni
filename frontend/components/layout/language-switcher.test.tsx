import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: vi.fn() },
    });
    document.cookie = "";
  });

  it("dropdown opens on click, selecting sets cookie and reloads, escape closes, has correct ARIA", () => {
    render(<LanguageSwitcher locale="en" />);
    
    const trigger = screen.getByRole("button", { expanded: false });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    
    // Open
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    
    // Click outside closes
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    
    // Open again
    fireEvent.click(trigger);
    
    // Escape closes
    fireEvent.keyDown(screen.getByRole("menu").parentElement!, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    
    // Open and select
    fireEvent.click(trigger);
    const uzOption = screen.getByRole("menuitem", { name: /o‘zbek/i });
    fireEvent.click(uzOption);
    
    expect(document.cookie).toContain("NEXT_LOCALE=uz");
    expect(window.location.reload).toHaveBeenCalled();
  });
});
