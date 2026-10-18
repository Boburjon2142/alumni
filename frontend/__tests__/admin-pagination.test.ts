import { expect, it, vi } from "vitest";
import { getAllAdminPages } from "@/lib/admin-pagination";

it("loads every admin page and retains the search query", async () => {
  const fetchPage = vi.fn()
    .mockResolvedValueOnce({ count: 2, next: "/api/v1/admin/interviews/?page=2", previous: null, results: [{ id: 1 }] })
    .mockResolvedValueOnce({ count: 2, next: null, previous: "?page=1", results: [{ id: 2 }] });
  const result = await getAllAdminPages(fetchPage, "search=CMS");
  expect(result.results).toEqual([{ id: 1 }, { id: 2 }]);
  expect(fetchPage.mock.calls.map(([query]) => new URLSearchParams(query).get("page"))).toEqual(["1", "2"]);
  expect(fetchPage.mock.calls.every(([query]) => new URLSearchParams(query).get("search") === "CMS")).toBe(true);
});
