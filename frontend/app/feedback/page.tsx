import Link from "next/link";
import Image from "next/image";
import { getDictionary, getLocale } from "@/lib/i18n";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { Mail, ShieldCheck, Landmark } from "lucide-react";

export const metadata = {
  title: "Taklif va murojaatlar — Qarshi davlat universiteti ALUMNI",
  description:
    "Platforma, bitiruvchilar haqidagi ma’lumotlar yoki yangi tashabbuslar bo‘yicha savol, taklif va murojaatingizni yuboring.",
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;

  const isUz = locale === "uz";
  const isRu = locale === "ru";

  return (
    <div className="feedback-page-wrapper">
      <div className="feedback-split-container">
        {/* Left Column: Hero + Request Form */}
        <div className="feedback-left-column">
          <header className="feedback-hero">
            <span className="feedback-eyebrow">
              {isUz
                ? "QARSHI DAVLAT UNIVERSITETI FAXRIY BITIRUVCHILARI"
                : isRu
                ? "ВЫДАЮЩИЕСЯ ВЫПУСКНИКИ КАРШИНСКОГО ГОСУДАРСТВЕННОГО УНИВЕРСИТЕТА"
                : "KARSHI STATE UNIVERSITY DISTINGUISHED ALUMNI"}
            </span>
            <h1 className="feedback-heading">{t.feedbackTitle}</h1>
            <p className="feedback-intro">{t.feedbackSubtitle}</p>
          </header>

          <main className="feedback-card-wrap">
            <FeedbackForm
              locale={locale}
              t={t}
              initialStoryId={params.story}
              initialUrl={params.url}
            />
          </main>

          {/* Subtle Support & Privacy Links */}
          <footer className="feedback-footer-nav">
            <Link href="/about" className="feedback-footer-link">
              {t.navAbout}
            </Link>
            <span className="feedback-footer-sep" aria-hidden="true">•</span>
            <Link href="/privacy" className="feedback-footer-link">
              {t.feedbackPrivacyLink || "Maxfiylik siyosati"}
            </Link>
            <span className="feedback-footer-sep" aria-hidden="true">•</span>
            <a href="mailto:alumni@qarshidu.uz" className="feedback-footer-link">
              alumni@qarshidu.uz
            </a>
          </footer>
        </div>

        {/* Right Column: University Branding & Logo */}
        <aside className="feedback-right-column">
          <div className="feedback-brand-panel">
            <div className="feedback-logo-wrap">
              <img
                src="/brand/Logo.png"
                alt="Qarshi davlat universiteti rasmiy logotipi"
                className="feedback-university-logo"
                width={180}
                height={180}
              />
            </div>

            <div className="feedback-brand-info">
              <span className="feedback-brand-eyebrow">
                {isUz ? "RASMIY ALUMNI PORTALI" : isRu ? "ОФИЦИАЛЬНЫЙ ПОРТАЛ ALUMNI" : "OFFICIAL ALUMNI PORTAL"}
              </span>
              <h2 className="feedback-brand-title">
                {isUz
                  ? "Qarshi davlat universiteti"
                  : isRu
                  ? "Каршинский государственный университет"
                  : "Karshi State University"}
              </h2>
              <p className="feedback-brand-desc">
                {isUz
                  ? "1956-yildan buyon ilm-fan, ta’lim va yetuk mutaxassislar tayyorlash maskani. ALUMNI platformasi barcha davrlardagi bitiruvchilarimizni birlashtiradi."
                  : isRu
                  ? "С 1956 года — центр науки, образования и подготовки высококвалифицированных специалистов. Платформа ALUMNI объединяет выпускников всех поколений."
                  : "Since 1956, a center of science, education, and excellence. The ALUMNI platform unites graduates across generations."}
              </p>
            </div>

            <div className="feedback-brand-features">
              <div className="feedback-brand-feature-item">
                <ShieldCheck size={18} className="feedback-feature-icon" />
                <span>
                  {isUz
                    ? "Har bir murojaat ma’muriyat tomonidan ko‘rib chiqiladi"
                    : isRu
                    ? "Каждое обращение рассматривается администрацией"
                    : "Every request is reviewed by administration"}
                </span>
              </div>
              <div className="feedback-brand-feature-item">
                <Landmark size={18} className="feedback-feature-icon" />
                <span>
                  {isUz
                    ? "Akademik meros va bitiruvchilar xotirasi"
                    : isRu
                    ? "Академическое наследие и признание выпускников"
                    : "Academic heritage and recognition"}
                </span>
              </div>
              <div className="feedback-brand-feature-item">
                <Mail size={18} className="feedback-feature-icon" />
                <a href="mailto:alumni@qarshidu.uz" className="feedback-feature-link">
                  alumni@qarshidu.uz
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
