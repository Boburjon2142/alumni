import { getFaculties, getImpactRankings } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { ImpactView } from "@/components/impact/impact-view";
import type { Faculty, ImpactRankingEntry } from "@/types/alumni";

export const metadata = {
  title: "Hissa va E’tirof (Alumni Impact) — Qarshi davlat universiteti",
  description:
    "Universitet va bitiruvchilar hamjamiyatiga qo‘shilgan tasdiqlangan hissalar reytingi va nufuzli e’tirofi.",
};

export default async function ImpactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  let initialRankings: ImpactRankingEntry[] = [];
  let faculties: Faculty[] = [];

  try {
    const query = new URLSearchParams();
    query.set("period", params.period || "year");
    if (params.category) query.set("category", params.category);
    if (params.faculty) query.set("faculty", params.faculty);
    if (params.graduation_year) query.set("graduation_year", params.graduation_year);

    const [rankingsRes, facultiesRes] = await Promise.allSettled([
      getImpactRankings(query.toString()),
      getFaculties(),
    ]);

    if (rankingsRes.status === "fulfilled" && rankingsRes.value.success) {
      initialRankings = rankingsRes.value.data || [];
    }
    if (facultiesRes.status === "fulfilled") {
      faculties = Array.isArray(facultiesRes.value) ? facultiesRes.value : [];
    }
  } catch (err) {
    console.error("Error loading impact data:", err);
  }

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <ImpactView
        t={t}
        initialRankings={initialRankings}
        faculties={faculties}
      />
    </main>
  );
}
