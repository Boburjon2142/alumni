import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ImpactView } from "./impact-view";
import { getRecognizedAlumni } from "@/lib/recognized-alumni";
import { getDictionary } from "@/lib/i18n";

vi.mock("@/lib/recognized-alumni", () => ({
  getRecognizedAlumni: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));
vi.mock("@/lib/auth", () => ({ authSession: vi.fn().mockResolvedValue({ authenticated: false }) }));
vi.mock("./impact-submit-modal", () => ({ ImpactSubmitModal: () => null }));
vi.mock("./impact-explanation", () => ({ ImpactExplanation: () => null }));
vi.mock("./impact-ranking-table", () => ({ ImpactRankingTable: () => null }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("filters the registry by title and clears only the title while retaining industry and year", async () => {
  render(<ImpactView t={getDictionary("uz")} showRegistry initialRankings={[]}
    initialIndustry="Jurnalistika va OAV" initialYear="1982"
    recognitions={[{ id: 1, slug: "qardu-iftixori", name: "QarDU iftixori", icon: "award" }]} />);
  await waitFor(() => expect(getRecognizedAlumni).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: "Barcha unvonlar" }));
  fireEvent.click(screen.getByRole("option", { name: "QarDU iftixori" }));
  await waitFor(() => {
    const query = vi.mocked(getRecognizedAlumni).mock.calls.at(-1)![0];
    const params = new URLSearchParams(query);
    expect(params.get("recognition")).toBe("qardu-iftixori");
    expect(params.get("industry")).toBe("Jurnalistika va OAV");
    expect(params.get("graduation_year")).toBe("1982");
    expect(params.has("category")).toBe(false);
  });
  expect(screen.getByRole("button", { name: "QarDU iftixori" })).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(screen.getByRole("button", { name: "QarDU iftixori" }));
  expect(screen.getByRole("option", { name: "QarDU iftixori" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("option", { name: "Barcha unvonlar" }));
  await waitFor(() => {
    const params = new URLSearchParams(vi.mocked(getRecognizedAlumni).mock.calls.at(-1)![0]);
    expect(params.has("recognition")).toBe(false);
    expect(params.get("industry")).toBe("Jurnalistika va OAV");
    expect(params.get("graduation_year")).toBe("1982");
  });
});
