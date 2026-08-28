import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="brand brand-logo footer-logo" aria-label={`${t.university} ${t.navHome}`}>
            <img src="/images/logo.png?v=4" alt={`${t.university} logotipi`} width="420" height="120" />
          </Link>
          <p className="footer-description">{t.footerText}</p>
        </div>

        <div className="footer-links-col">
          <h3>{t.brand}</h3>
          <Link href="/alumni">{t.navAlumni}</Link>
          <Link href="/stories">{t.navStories}</Link>
          <Link href="/advice">{t.navAdvice}</Link>
          <Link href="/about">{t.navAbout}</Link>
          <Link href="/feedback">{t.navFeedback}</Link>
        </div>

        <div className="footer-links-col">
          <h3>{t.university}</h3>
          <a href="https://qarshidu.uz" target="_blank" rel="noopener noreferrer">
            qarshidu.uz ↗
          </a>
          <Link href="/privacy">{t.privacyTitle}</Link>
          <a href="mailto:alumni@qarshidu.uz">alumni@qarshidu.uz</a>
        </div>
      </div>

      <div className="container copyright">
        <p>© {new Date().getFullYear()} {t.university}. {t.copyright}</p>
      </div>
    </footer>
  );
}
