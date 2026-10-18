import type { AdminPaginatedResponse } from "@/types/admin";

// Editors have no pagination controls: load every page so no record disappears
// from their lists or alumni selectors once the first API page is full.
export async function getAllAdminPages<T>(fetchPage: (query: string) => Promise<AdminPaginatedResponse<T>>, query = "") {
  const params = new URLSearchParams(query);
  params.set("page_size", "100");
  const results: T[] = [];
  let page = 1;
  while (true) {
    params.set("page", String(page));
    const response = await fetchPage(params.toString());
    results.push(...response.results);
    if (!response.next) return { ...response, results, next: null, previous: null };
    page += 1;
  }
}
