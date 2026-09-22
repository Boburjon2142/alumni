import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";
import { AlumniForm } from "@/components/onboarding/alumni-form";
import { ShieldCheck, Landmark, Mail } from "lucide-react";

export const metadata = {
  title: "Bitiruvchi sifatida qo‘shilish — Qarshi davlat universiteti ALUMNI",
  description:
    "Qarshi davlat universiteti bitiruvchilar hamjamiyatiga qo‘shiling va bitirgan yilingizdagi alumni tarmog‘idan o‘rin oling.",
};

export default async function JoinPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const isUz = locale === "uz";
  const isRu = locale === "ru";

  return (
    <div className="join-page-wrapper">
      <div className="join-split-container">
        {/* Left Column: Hero + Onboarding Form */}
        <div className="join-left-column">
          <header className="join-hero">
            <span className="join-eyebrow">
              {isUz
                ? "QARSHI DAVLAT UNIVERSITETI FAXRIY BITIRUVCHILARI"
                : isRu
                ? "ВЫДАЮЩИЕСЯ ВЫПУСКНИКИ КАРШИНСКОГО ГОСУДАРСТВЕННОГО УНИВЕРСИТЕТА"
                : "KARSHI STATE UNIVERSITY DISTINGUISHED ALUMNI"}
            </span>
            <h1 className="join-heading">{t.joinPageTitle}</h1>
            <p className="join-intro">{t.joinPageSubtitle}</p>
          </header>

          <main className="join-card-wrap">
            <AlumniForm locale={locale} t={t} />
          </main>

          {/* Subtle Support & Privacy Links */}
          <footer className="join-footer-nav">
            <Link href="/about" className="join-footer-link">
              {t.navAbout}
            </Link>
            <span className="join-footer-sep" aria-hidden="true">•</span>
            <Link href="/privacy" className="join-footer-link">
              {t.feedbackPrivacyLink || "Maxfiylik siyosati"}
            </Link>
            <span className="join-footer-sep" aria-hidden="true">•</span>
            <a href="mailto:alumni@qarshidu.uz" className="join-footer-link">
              alumni@qarshidu.uz
            </a>
          </footer>
        </div>

        {/* Right Column: University Branding & Logo */}
        <aside className="join-right-column">
          <div className="join-brand-panel">
            <div className="join-logo-wrap">
              <img
                src="/brand/Logo.png"
                alt="Qarshi davlat universiteti rasmiy logotipi"
                className="join-university-logo"
                width={180}
                height={180}
              />
            </div>

            <div className="join-brand-info">
              <span className="join-brand-eyebrow">
                {isUz ? "RASMIY ALUMNI PORTALI" : isRu ? "ОФИЦИАЛЬНЫЙ ПОРТАЛ ALUMNI" : "OFFICIAL ALUMNI PORTAL"}
              </span>
              <h2 className="join-brand-title">
                {isUz
                  ? "Qarshi davlat universiteti"
                  : isRu
                  ? "Каршинский государственный университет"
                  : "Karshi State University"}
              </h2>
              <p className="join-brand-desc">
                {isUz
                  ? "1956-yildan buyon ilm-fan, ta’lim va yetuk mutaxassislar tayyorlash maskani. ALUMNI platformasi barcha davrlardagi bitiruvchilarimizni birlashtiradi."
                  : isRu
                  ? "С 1956 года — центр науки, образования и подготовки высококвалифицированных специалистов. Платформа ALUMNI объединяет выпускников всех поколений."
                  : "Since 1956, a center of science, education, and excellence. The ALUMNI platform unites graduates across generations."}
              </p>
            </div>

            <div className="join-brand-features">
              <div className="join-brand-feature-item">
                <ShieldCheck size={18} className="join-feature-icon" />
                <span>
                  {isUz
                    ? "Har bir profil tekshiriladi va xavfsiz saqlanadi"
                    : isRu
                    ? "Каждый профиль проверяется и надежно защищен"
                    : "Every profile is verified and securely protected"}
                </span>
              </div>
              <div className="join-brand-feature-item">
                <Landmark size={18} className="join-feature-icon" />
                <span>
                  {isUz
                    ? "Akademik meros va bitiruvchilar xotirasi"
                    : isRu
                    ? "Академическое наследие и признание выпускников"
                    : "Academic heritage and recognition"}
                </span>
              </div>
              <div className="join-brand-feature-item">
                <Mail size={18} className="join-feature-icon" />
                <a href="mailto:alumni@qarshidu.uz" className="join-feature-link">
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

