import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrandPreloader } from "./brand-preloader";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("BrandPreloader", () => {
  beforeEach(() => {
    mockPathname = "/";
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it("renders on initial visit and unmounts cleanly after timer", () => {
    const { container } = render(
      <BrandPreloader minDisplayMs={300} fadeDurationMs={200} />
    );

    // Initial render
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ALUMNI PLATFORMASI" })).toBeInTheDocument();
    expect(screen.getByText("Bitiruvchilar hamjamiyati yuklanmoqda...")).toBeInTheDocument();

    // Advance to fade stage
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole("status")).toHaveAttribute("data-fading", "true");

    // Advance past fade duration
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should be unmounted from DOM completely
    expect(container.querySelector("[data-app-loader]")).toBeNull();
  });

  it("re-triggers preload smoothly on route change", () => {
    const { container, rerender } = render(
      <BrandPreloader minDisplayMs={300} fadeDurationMs={200} />
    );

    // Let initial preloader complete and disappear
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector("[data-app-loader]")).toBeNull();

    // Change route pathname
    mockPathname = "/alumni";
    rerender(<BrandPreloader minDisplayMs={300} fadeDurationMs={200} />);

    // Preloader is active again for the new page
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ALUMNI PLATFORMASI" })).toBeInTheDocument();

    // Complete transition
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector("[data-app-loader]")).toBeNull();
  });
});
