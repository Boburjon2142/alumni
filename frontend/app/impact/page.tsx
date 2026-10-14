import { getRecognitions } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { ImpactView } from "@/components/impact/impact-view";
import type { Recognition } from "@/types/alumni";
import styles from "./impact.module.css";

export const metadata = {
  title: "Faxriy unvonlar — Qarshi davlat universiteti",
  description:
    "Universitet va bitiruvchilar hamjamiyatiga munosib hissa qo‘shgan nufuzli bitiruvchilar e’tirofi.",
};

export default async function ImpactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  let recognitions: Recognition[] = [];

  try {
    recognitions = await getRecognitions();
  } catch (err) {
    console.error("Error loading impact data:", err);
  }

  return (
    <main className={styles.page}>
      <ImpactView
        locale={locale}
        t={t}
        initialRankings={[]}
        recognitions={recognitions}
        initialIndustry={params.industry || ""}
      />
    </main>
  );
}
