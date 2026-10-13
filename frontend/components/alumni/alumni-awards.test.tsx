import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { AlumniAwards } from "./alumni-awards";
import { getAlumniAwards } from "@/lib/recognition-assets";
import type { Alumni } from "@/types/alumni";

afterEach(cleanup);
const files = ["01-qardu-iftixori.png", "02-ilm-fan-fidoyisi.png", "03-ziyo-mashali.png", "04-yuksak-parvoz.png", "05-ibrat.png"];
it.each([3, 4, 5])("renders %i original PNGs with accessible names", count => {
  render(<AlumniAwards awards={files.slice(0, count)} locale="uz" />);
  expect(screen.getAllByRole("img")).toHaveLength(count);
  screen.getAllByRole("img").forEach(img => {
    expect(img.getAttribute("src")).toMatch(/^\/recognitions\/\d\d-.+\.png$/);
    expect(img.getAttribute("alt")).toBe(img.getAttribute("title"));
  });
});
it("deduplicates and removes failed and unknown artwork", () => {
  render(<AlumniAwards awards={[files[0], files[0], "unknown.png"]} locale="en" />);
  expect(screen.getAllByRole("img")).toHaveLength(1);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.queryByRole("img")).toBeNull();
});
it("does not invent awards and excludes revoked or inactive assignments", () => {
  expect(getAlumniAwards({} as Alumni)).toEqual([]);
  const alumni = { recognitions: [
    { slug: "qardu-iftixori", status: "approved", is_active: true },
    { slug: "qardu-iftixori", status: "approved", is_active: true },
    { slug: "ilm-fan-fidoyisi", status: "revoked" },
    { slug: "ziyo-mashali", status: "approved", is_active: false },
  ] } as Alumni;
  expect(getAlumniAwards(alumni)).toEqual([files[0]]);
});
