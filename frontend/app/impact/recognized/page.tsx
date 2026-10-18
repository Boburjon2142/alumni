import { getRecognizedAlumni } from "@/lib/recognized-alumni";
import { getRecognitions } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { ImpactView } from "@/components/impact/impact-view";
import type { ImpactRankingEntry, Recognition } from "@/types/alumni";
import styles from "../impact.module.css";

export const metadata = { title: "E’tirof etilgan bitiruvchilar ro‘yxati" };

export default async function RecognizedPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const locale = await getLocale();
  let rankings: ImpactRankingEntry[] = [];
  const recognitions: Recognition[] = await getRecognitions().catch(() => []);
  try {
    const query = new URLSearchParams();
    for (const key of ["industry", "recognition", "graduation_year"]) if (params[key]) query.set(key, params[key]!);
    const result = await getRecognizedAlumni(query.toString());
    if (result.success) rankings = result.data || [];
  } catch (error) { console.error("Failed to load recognition registry", error); }
  return <main className={styles.page}><ImpactView t={getDictionary(locale)} locale={locale}
    initialRankings={rankings} recognitions={recognitions} initialRecognition={params.recognition || ""}
    initialYear={params.graduation_year || ""} initialIndustry={params.industry || ""} showRegistry /></main>;
}
