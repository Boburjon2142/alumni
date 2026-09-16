import { TermsContent } from "@/components/onboarding/terms-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = {
  title: "Ma’lumotlarni qayta ishlash shartlari — Qarshi davlat universiteti",
  description:
    "Qarshi davlat universiteti bitiruvchilar portali orqali shaxsiy ma’lumotlarni yig‘ish, saqlash va qayta ishlash shartlari.",
};

export default async function TermsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <article className="terms-page section">
      <div className="container">
        <div className="terms-back-nav">
          <Link href="/join" className="back-link">
            <ArrowLeft size={16} /> {locale === "en" ? "Back to Registration" : locale === "ru" ? "Назад к анкете" : "Anketaga qaytish"}
          </Link>
        </div>

        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.consentTitle}</h1>
          <p className="section-sublead">
            {locale === "en"
              ? "Official policy on the collection, verification, and ethical use of alumni data by Karshi State University."
              : locale === "ru"
              ? "Официальные условия сбора, верификации и использования сведений выпускников Каршинского государственного университета."
              : "Qarshi davlat universiteti tomonidan bitiruvchilar ma’lumotlarini yig‘ish, tekshirish va ulardan foydalanishning rasmiy nizomi."}
          </p>
        </div>

        <div className="terms-card-content">
          <TermsContent locale={locale} />

          <div className="terms-actions">
            <Link href="/join" className="button button-primary">
              {t.consentContinueButton}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
