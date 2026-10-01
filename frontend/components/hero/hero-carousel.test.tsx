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
    expect(img.getAttribute("src")).toBe("/images/hero/campus-20261001/hero-360x800.png");
    expect(img).toHaveAttribute("width", "841");
    expect(img).toHaveAttribute("height", "1870");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("selects the matching composition for all supplied viewport widths", () => {
    const { container } = render(<HeroCarousel />);
    const sources = Array.from(container.querySelectorAll("source"));
    for (const [viewport, asset] of [
      [360, "360x800"], [375, "390x844"], [390, "390x844"], [430, "430x932"],
      [768, "768x1024"], [820, "820x1180"], [1024, "820x1180"],
      [1366, "1366x768"], [1440, "1440x900"], [1600, "1440x900"],
      [1920, "1920x1080"], [2560, "1920x1080"],
    ] as const) {
      for (const format of ["webp", "png"]) {
        const source = sources.find((s) => {
          const minimum = Number(s.media.match(/min-width: (\d+)px/)?.[1]);
          return s.type === `image/${format}` && viewport >= minimum;
        });
        expect(source?.getAttribute("srcset"))
          .toBe(`/images/hero/campus-20261001/hero-${asset}.${format}`);
      }
    }
  });
});
