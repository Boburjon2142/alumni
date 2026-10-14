import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlumniCardGrid } from "./alumni-card-grid";
import type { Alumni } from "@/types/alumni";
import type { Recognition } from "@/types/alumni";
import { AlumniCardSkeleton } from "./alumni-card";

vi.mock("next/image", () => ({
  default: ({ fill, priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => <img {...props} />,
}));

const summary = { id: 1, slug: "aziz", full_name: "Aziz Rahmonov", image_url: "https://images.unsplash.com/photo-demo" } as Alumni;
afterEach(cleanup);

describe("AlumniCardGrid", () => {
  it("shows horizontal profile details and preserves only assigned honor badges on the portrait", () => {
    const honor = { id: 5, assignment_id: 12, slug: "assigned-honor", name: "Assigned Honor", icon: "medal" } as Recognition;
    const { container } = render(<AlumniCardGrid horizontal fullWidth alumni={[
      { ...summary, card_honors: [honor], graduation_year: 2000, current_activity: "Professional activity", faculty: "Mathematics" },
      { ...summary, id: 2, slug: "without-honor", full_name: "Without Honor", is_honorary: true, card_honors: [] },
    ]} locale="uz" />);
    const cards = container.querySelectorAll("article");
    expect(cards[0].querySelectorAll('[tabindex="0"]')).toHaveLength(1);
    expect(cards[1].querySelector('[tabindex="0"]')).toBeNull();
    expect(screen.getByText("2000-yil")).toBeInTheDocument();
    expect(screen.getByText("Professional activity")).toBeInTheDocument();
    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(container.querySelector('a [tabindex], a button, a a')).toBeNull();
    const badge = cards[0].querySelector('[tabindex="0"]')!;
    expect(badge).toHaveAttribute("href", "/impact");
    fireEvent.mouseEnter(badge);
    expect(document.getElementById(badge.getAttribute("aria-describedby")!)).toHaveAttribute("data-open", "true");
    fireEvent.mouseLeave(badge);
    expect(document.getElementById(badge.getAttribute("aria-describedby")!)).toHaveAttribute("data-open", "false");
    fireEvent.focus(badge);
    expect(document.getElementById(badge.getAttribute("aria-describedby")!)).toHaveAttribute("data-open", "true");
    fireEvent.keyDown(badge, { key: "Escape" });
    expect(document.getElementById(badge.getAttribute("aria-describedby")!)).toHaveAttribute("data-open", "false");
  });
  it.each([0, 1, 2, 3])("renders only the latest of %i honors, without card metadata or nested controls", count => {
    const honors = Array.from({ length: count }, (_, i) => ({ id: i + 1, slug: `test-${i}`, name: `Honor ${i}`, icon: "medal" } as Recognition));
    const { container } = render(<AlumniCardGrid alumni={[{ ...summary, recognitions: honors, position: "Hidden job", faculty: "Hidden faculty", graduation_year: 2020 }]} locale="uz" />);
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(Math.min(count, 1));
    expect(container.querySelector('a [tabindex], a button, a a')).toBeNull();
    expect(screen.queryByText("Hidden job")).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden faculty")).not.toBeInTheDocument();
    expect(screen.queryByText("2020")).not.toBeInTheDocument();
    container.querySelectorAll('[tabindex="0"]').forEach(badge => {
      expect(badge).toHaveAttribute("aria-label");
      expect(document.getElementById(badge.getAttribute("aria-describedby")!)).toHaveAttribute("role", "tooltip");
    });
  });
  it("uses server-selected honors and an empty server selection overrides legacy honors", () => {
    const honor = { id: 1, slug: "test", name: "Honor", icon: "star" } as Recognition;
    const { container } = render(<AlumniCardGrid alumni={[{ ...summary, recognitions: [honor], card_honors: [] }]} locale="uz" />);
    expect(container.querySelector('[tabindex="0"]')).toBeNull();
  });
  it("uses the latest award date for legacy data and ignores revoked honors", () => {
    const honors = [
      { id: 10, slug: "older", name: "Older Award", icon: "medal", awarded_at: "2024-06-01" },
      { id: 2, slug: "latest", name: "Latest Award", icon: "star", awarded_at: "2025-06-01" },
      { id: 20, slug: "revoked", name: "Revoked Award", icon: "medal", awarded_at: "2026-06-01", status: "revoked" },
    ] as Recognition[];
    render(<AlumniCardGrid horizontal alumni={[{ ...summary, recognitions: honors }]} locale="uz" />);
    expect(screen.getAllByLabelText("Latest Award")).toHaveLength(2);
    expect(screen.getAllByLabelText("Older Award")).toHaveLength(1);
    expect(screen.queryByLabelText("Revoked Award")).not.toBeInTheDocument();
  });
  it("matches the portrait honor to the leftmost award and uses the server selection", () => {
    const older = { id: 1, slug: "ilm-fan-fidoyisi", name: "Ilm-fan fidoyisi", icon: "compass", awarded_at: "2024-01-01" } as Recognition;
    const latest = { id: 2, slug: "qardu-elchisi", name: "QarDU elchisi", icon: "globe", awarded_at: "2025-01-01" } as Recognition;
    const { container } = render(<AlumniCardGrid horizontal alumni={[{ ...summary, recognitions: [older, latest], card_honors: [latest], awards: ["02-ilm-fan-fidoyisi.png"] }]} locale="uz" />);
    const links = container.querySelectorAll('a[href="/impact"]');
    expect([...links].map(link => link.getAttribute("aria-label"))).toEqual(["QarDU elchisi", "QarDU elchisi", "Ilm-fan fidoyisi"]);
  });
  it("replaces failed image candidates with an initials fallback", () => {
    const { container } = render(<AlumniCardGrid alumni={[summary]} locale="uz" />);
    for (let i = 0; i < 3; i++) fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("AR")).toBeInTheDocument();
  });
  it("provides a noninteractive loading skeleton", () => {
    const { container } = render(<AlumniCardSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("a")).toBeNull();
  });
  it("renders an alumni card linking directly to the full profile page", () => {
    render(<AlumniCardGrid alumni={[summary]} locale="uz" />);
    const card = screen.getByRole("link", { name: /Aziz Rahmonov profilini/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("href", "/alumni/aziz");
  });
});
