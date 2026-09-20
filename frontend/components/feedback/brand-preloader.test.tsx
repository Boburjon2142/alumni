import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

  it("renders on initial visit and unmounts cleanly after timer", () => {
    const { container } = render(
      <BrandPreloader minDisplayMs={300} fadeDurationMs={200} />
    );

    // Initial render
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("ALUMNI PLATFORMASI")).toBeInTheDocument();
    expect(screen.getByText("Bir umrlik aloqa")).toBeInTheDocument();

    // Advance to fade stage
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelector(".brand-preloader-fading")).toBeInTheDocument();

    // Advance past fade duration
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should be unmounted from DOM completely
    expect(container.querySelector(".brand-preloader")).toBeNull();
  });

  it("re-triggers preload smoothly on route change", () => {
    const { container, rerender } = render(
      <BrandPreloader minDisplayMs={300} fadeDurationMs={200} />
    );

    // Let initial preloader complete and disappear
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector(".brand-preloader")).toBeNull();

    // Change route pathname
    mockPathname = "/alumni";
    rerender(<BrandPreloader minDisplayMs={300} fadeDurationMs={200} />);

    // Preloader is active again for the new page
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("ALUMNI PLATFORMASI")).toBeInTheDocument();

    // Complete transition
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(container.querySelector(".brand-preloader")).toBeNull();
  });
});
