import { getAlumni } from "./api";
import { getCardRecognitions } from "./recognition-assets";
import type { Alumni, ImpactRankingEntry } from "@/types/alumni";

export async function getRecognizedAlumni(query = "") {
  const params = new URLSearchParams(query);
  params.set("recognized", "true");
  params.set("ordering", "graduation_year_asc");
  params.set("limit", "100");
  const alumni: Alumni[] = [];
  let page = 1;
  while (true) {
    params.set("page", String(page));
    const result = await getAlumni(params.toString());
    alumni.push(...result.data);
    if (page >= result.pagination.pages) break;
    page += 1;
  }
  return { success: true, data: alumni.map((person, index): ImpactRankingEntry => ({
    rank: index + 1,
    alumni: { ...person, graduation_year: person.graduation_year ?? 0 },
    recognitions: getCardRecognitions(person),
    total_score: 0,
    verified_contributions_count: 0,
    top_category: "general",
  })) };
}
