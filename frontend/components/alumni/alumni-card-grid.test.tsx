import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlumniCardGrid } from "./alumni-card-grid";
import type { Alumni } from "@/types/alumni";

vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => <img {...props} />,
}));

const summary = { id: 1, slug: "aziz", full_name: "Aziz Rahmonov", image_url: "https://images.unsplash.com/photo-demo" } as Alumni;

describe("AlumniCardGrid", () => {
  it("renders an alumni card linking directly to the full profile page", () => {
    render(<AlumniCardGrid alumni={[summary]} locale="uz" />);
    const card = screen.getByRole("link", { name: /Aziz Rahmonov profilini/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("href", "/alumni/aziz");
  });
});
