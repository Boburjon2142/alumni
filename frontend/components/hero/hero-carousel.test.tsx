import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { HeroCarousel } from "./hero-carousel";

describe("HeroCarousel", () => {
  afterEach(cleanup);

  it("loads an accessible hero eagerly and reserves its intrinsic dimensions", () => {
    render(<HeroCarousel />);
    const img = screen.getByRole("img", {
      name: /qarshi davlat universiteti faxriy bitiruvchilari/i,
    });
    expect(img.getAttribute("src")).toMatch(/\/images\/hero\/profiles\/hero-360x800\.(webp|png)/);
    expect(img).toHaveAttribute("width", "360");
    expect(img).toHaveAttribute("height", "800");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("selects the matching composition for all supplied viewport widths", () => {
    const { container } = render(<HeroCarousel />);
    const sources = Array.from(container.querySelectorAll("source"));
    for (const [width, height] of [
      [360, 800], [375, 812], [390, 844], [430, 932],
      [768, 1024], [1024, 768], [1366, 768], [1600, 900], [1920, 1080],
    ]) {
      const source = sources.find((s) => {
        const minimum = Number(s.media.match(/min-width: (\d+)px/)?.[1]);
        return width >= minimum;
      });
      const image = source ?? container.querySelector("img")!;
      expect(image.getAttribute(source ? "srcset" : "src"))
        .toMatch(new RegExp(`/images/hero/profiles/hero-${width}x${height}\\.(webp|png)`));
      expect(image).toHaveAttribute("width", String(width));
      expect(image).toHaveAttribute("height", String(height));
    }
  });
});
