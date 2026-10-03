import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AlumniFormEditor } from "./alumni-form-editor";
import { getAdminAlumniById, getAdminRecognitions, updateAdminAlumni } from "@/lib/api";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh }) }));
vi.mock("@/lib/api", () => ({ getAdminAlumniById: vi.fn(), getAdminRecognitions: vi.fn(), updateAdminAlumni: vi.fn(), deleteAdminAlumni: vi.fn() }));
const profile = { id: 1, slug: "test-member", full_name: "Test Member", is_honorary: false, is_featured: false, is_published: true, approval_status: "approved", recognitions: [] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdminAlumniById).mockResolvedValue(profile as any);
  vi.mocked(getAdminRecognitions).mockResolvedValue({ results: [{ id: 12, name: "Test Award", slug: "test-award", icon: "award" }] } as any);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("saves checked awards and publication state and adopts the persisted response", async () => {
  vi.mocked(updateAdminAlumni).mockResolvedValue({ ...profile, is_published: false, recognitions: [{ id: 12, name: "Test Award", slug: "test-award" }] } as any);
  render(<AlumniFormEditor initialId="test-member" />);
  const award = await screen.findByRole("checkbox", { name: "Test Award" });
  fireEvent.click(award);
  fireEvent.click(screen.getByRole("checkbox", { name: "Saytda e’lon qilish" }));
  fireEvent.click(screen.getByRole("button", { name: "Saqlash" }));
  await waitFor(() => expect(updateAdminAlumni).toHaveBeenCalledWith("test-member", expect.objectContaining({ recognition_ids: [12], is_published: false })));
  await screen.findByRole("status");
  expect(award).toBeChecked();
  expect(refresh).toHaveBeenCalled();
});

it("shows a backend error next to Save and keeps the selection for retry", async () => {
  vi.mocked(updateAdminAlumni).mockRejectedValue(new Error("Unvonni saqlab bo‘lmadi"));
  render(<AlumniFormEditor initialId="test-member" />);
  const award = await screen.findByRole("checkbox", { name: "Test Award" });
  fireEvent.click(award);
  const save = screen.getByRole("button", { name: "Saqlash" });
  fireEvent.click(save);
  await waitFor(() => expect(within(save.parentElement!).getByRole("alert")).toHaveTextContent("Unvonni saqlab bo‘lmadi"));
  expect(award).toBeChecked();
  expect(save).toBeEnabled();
});
