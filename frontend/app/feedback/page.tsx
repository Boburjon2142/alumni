import { getDictionary, getLocale } from "@/lib/i18n";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export const metadata = {
  title: "Taklif va savollar — Qarshi davlat universiteti",
  description: "Qarshi davlat universiteti faxriy bitiruvchilari platformasi bo‘yicha taklif, savol va murojaatlar.",
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;

  return (
    <div className="feedback-page section">
      <div className="container feedback-container">
        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.feedbackTitle}</h1>
          <p>{t.feedbackSubtitle}</p>
        </div>

        <FeedbackForm
          locale={locale}
          t={t}
          initialStoryId={params.story}
          initialUrl={params.url}
        />
      </div>
    </div>
  );
}
