import Link from "next/link";
import { MessageSquareQuote, Quote, X } from "lucide-react";
import { AdviceGrid } from "@/components/advice/advice-grid";
import { getAdvice } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Advice, Page } from "@/types/alumni";

export const metadata = {
  title: "Talabalarga maslahatlar — Qarshi davlat universiteti",
  description: "Qarshi davlat universiteti faxriy bitiruvchilarining talabalar va yosh mutaxassislar uchun bergan amaliy maslahatlari.",
};

const categories = [
  { id: "academic", key: "catAcademic" },
  { id: "leadership", key: "catLeadership" },
  { id: "career", key: "catCareer" },
  { id: "engineering", key: "catEngineering" },
  { id: "media", key: "catMedia" },
  { id: "business", key: "catBusiness" },
  { id: "culture", key: "catCulture" },
  { id: "society", key: "catSociety" },
  { id: "discipline", key: "catDiscipline" },
] as const;

export default async function AdvicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const activeCategory = params.category || "";
  const query = new URLSearchParams();
  if (activeCategory) query.set("category", activeCategory);

  let result: Page<Advice> | null = null;
  let error = false;

  try {
    result = await getAdvice(query.toString());
  } catch {
    error = true;
  }

  const adviceList = result?.data || [];

  return (
    <section className="section advice-page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">{t.adviceTitle}</span>
          <h1>{t.adviceSubtitle}</h1>
          <p>
            {locale === "en"
              ? "Practical wisdom, life lessons, and career insights shared by distinguished KarSU alumni."
              : locale === "ru"
              ? "Практические рекомендации, жизненный опыт и карьерные советы от почётных выпускников КарГУ."
              : "QarDU faxriy bitiruvchilarining hayotiy tajribasi, kasbiy saboqlari va talabalarga bergan amaliy tavsiyalari."}
          </p>
        </div>

        {/* Categories Bar */}
        <div className="advice-categories-nav">
          <Link
            href="/advice"
            className={`category-pill ${!activeCategory ? "active" : ""}`}
          >
            {t.allCategories}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/advice?category=${cat.id}`}
              className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
            >
              {t[cat.key as keyof typeof t] as string}
            </Link>
          ))}
        </div>

        {error ? (
          <div className="empty-state error-state">
            <h2>{t.loadError}</h2>
            <p>{t.retryText}</p>
          </div>
        ) : adviceList.length > 0 ? (
          <AdviceGrid adviceList={adviceList} locale={locale} />
        ) : (
          <div className="empty-state">
            <Quote aria-hidden="true" />
            <h2>{t.adviceEmptyTitle}</h2>
            <p>{t.adviceEmptyText}</p>
            {activeCategory && (
              <Link href="/advice" className="button button-secondary">
                <X size={16} /> {t.clearFilters}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
