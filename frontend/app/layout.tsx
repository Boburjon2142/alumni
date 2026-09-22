import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { BrandPreloader } from "@/components/feedback/brand-preloader";
import { getDictionary, getLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alumni.qarshidu.uz"),
  title: {
    default: "Hamjamiyat — Qarshi davlat universiteti",
    template: "%s | Hamjamiyat",
  },
  description: "Qarshi davlat universiteti bitiruvchilari uchun professional hamjamiyat va imkoniyatlar platformasi.",
  openGraph: {
    title: "Hamjamiyat — Qarshi davlat universiteti",
    description: "Qarshi davlat universiteti bitiruvchilari uchun professional hamjamiyat va imkoniyatlar platformasi.",
    url: "https://alumni.qarshidu.uz",
    siteName: "Qarshi davlat universiteti",
    images: [
      {
        url: "https://alumni.qarshidu.uz/brand/Logo.png",
        width: 600,
        height: 600,
        alt: "Qarshi davlat universiteti logotipi",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hamjamiyat — Qarshi davlat universiteti",
    description: "Qarshi davlat universiteti bitiruvchilari uchun professional hamjamiyat va imkoniyatlar platformasi.",
    images: ["https://alumni.qarshidu.uz/brand/Logo.png"],
  },
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <BrandPreloader />
        <a className="skip-link" href="#main">
          Asosiy kontentga o‘tish
        </a>
        <Header locale={locale} t={t} />
        <main id="main">{children}</main>
        <Footer t={t} locale={locale} />
        <BackToTop locale={locale} />
      </body>
    </html>
  );
}
