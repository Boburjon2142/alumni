import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminInterviewsPage from "@/app/admin/interviews/page";
import { saveAdminInterview } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getAdminAlumni: vi.fn().mockResolvedValue({ results: [
    { id: 1, slug: "first", full_name: "Same name" },
    { id: 2, slug: "second", full_name: "Same name" },
  ], next: null, previous: null, count: 2 }),
  getAdminInterviews: vi.fn().mockResolvedValue({ results: [{
    id: 9, alumni_id: 2, title_uz: "Saved interview", intro_uz: "Introduction",
    is_published: false, published_at: "2026-10-18", is_featured: false,
    alumnus: { slug: "second", full_name: "Same name" },
    items: [{ id: 42, question_uz: "Question", answer_uz: "Answer" }],
  }], next: null, previous: null, count: 1 }),
  saveAdminInterview: vi.fn().mockResolvedValue({}),
  deleteAdminInterview: vi.fn(),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("edits by alumni ID and preserves publication state and question IDs", async () => {
  render(<AdminInterviewsPage />);
  expect(await screen.findByText("Qoralama")).toBeInTheDocument();
  expect(screen.queryByText("Nashr qilingan")).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole("button", { name: "Tahrirlash" }));
  expect(screen.getByRole("combobox")).toHaveValue("2");
  expect(screen.getByRole("checkbox", { name: "Ommaviy nashr qilish" })).not.toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Saqlash" }));
  await waitFor(() => expect(saveAdminInterview).toHaveBeenCalledWith(9, expect.objectContaining({
    alumni_id: 2, is_published: false,
    items: [expect.objectContaining({ id: 42, question_uz: "Question", answer_uz: "Answer" })],
  })));
});
