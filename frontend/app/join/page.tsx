import { getDictionary, getLocale } from "@/lib/i18n";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Bitiruvchi sifatida qo‘shilish — Qarshi davlat universiteti",
  description:
    "Qarshi davlat universiteti bitiruvchilar hamjamiyatiga qo‘shiling va bitirgan yilingizdagi alumni guruhidan o‘rin oling.",
};

export default async function JoinPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <section className="section join-page-section">
      <div className="container join-container">
        <OnboardingWizard locale={locale} t={t} />
      </div>
    </section>
  );
}
