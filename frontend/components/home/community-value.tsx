import Image from "next/image";
import { BriefcaseBusiness, GraduationCap, Quote, ShieldCheck, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const content = {
  uz: {
    eyebrow: "Nega Hamjamiyat?",
    title: ["Bir universitet.", "Bir hamjamiyat.", "Cheksiz imkoniyatlar."],
    description:
      "QarDU bitiruvchilarini bir platformada birlashtirib, professional aloqalar, tajriba almashish va yangi imkoniyatlar uchun ishonchli muhit yaratamiz.",
    trust: "Ishonchli. Tasdiqlangan. Professional.",
    features: [
      ["Bitiruvchilar bilan bog‘laning", "Fakultet, mutaxassislik, bitiruv yili, soha yoki kompaniya bo‘yicha QarDU bitiruvchilarini toping va professional aloqalarni kengaytiring."],
      ["Tajriba almashing", "Kasbiy bilim, amaliy tajriba va foydali tavsiyalarni hamjamiyat a’zolari bilan baham ko‘ring."],
      ["Imkoniyatlarni kashf eting", "Ish o‘rinlari, mentorlik, hamkorlik va professional tadbirlar orqali yangi yo‘nalishlarga yo‘l oching."],
    ],
    quote: "Birgalikda o‘sish, bir-birimizga tayanish va kelajakni yaratish uchun biz birga bo‘lamiz.",
    alts: ["QarDU universitet kampusi", "QarDU bitiruvchilarining professional uchrashuvi", "Bitiruvchilar o‘rtasidagi mentorlik uchrashuvi", "Universitetdagi professional seminar"],
  },
  ru: {
    eyebrow: "Почему сообщество?",
    title: ["Один университет.", "Одно сообщество.", "Безграничные возможности."],
    description: "Мы объединяем выпускников КарГУ на одной платформе и создаём надёжную среду для профессиональных связей, обмена опытом и новых возможностей.",
    trust: "Надёжно. Подтверждено. Профессионально.",
    features: [
      ["Общайтесь с выпускниками", "Находите выпускников КарГУ по факультету, специальности, году выпуска, отрасли или компании и расширяйте профессиональные связи."],
      ["Обменивайтесь опытом", "Делитесь профессиональными знаниями, практическим опытом и полезными рекомендациями с участниками сообщества."],
      ["Открывайте возможности", "Находите новые направления через вакансии, наставничество, сотрудничество и профессиональные мероприятия."],
    ],
    quote: "Мы вместе, чтобы расти, поддерживать друг друга и создавать будущее.",
    alts: ["Кампус Каршинского государственного университета", "Профессиональная встреча выпускников КарГУ", "Встреча выпускников с наставником", "Профессиональный семинар в университете"],
  },
  en: {
    eyebrow: "Why the Community?",
    title: ["One university.", "One community.", "Endless opportunities."],
    description: "We bring KarSU alumni together on one platform, creating a trusted environment for professional connections, shared experience and new opportunities.",
    trust: "Trusted. Verified. Professional.",
    features: [
      ["Connect with alumni", "Find KarSU alumni by faculty, specialty, graduation year, industry or company and expand your professional network."],
      ["Share experience", "Exchange professional knowledge, practical experience and useful guidance with members of the community."],
      ["Discover opportunities", "Open new paths through jobs, mentorship, collaboration and professional events."],
    ],
    quote: "We come together to grow, support one another and shape the future.",
    alts: ["Karshi State University campus", "KarSU alumni in a professional discussion", "Alumni mentorship meeting", "Professional seminar at the university"],
  },
} as const;

const images = [
  "/images/community-campus.webp",
  "/images/community-networking.webp",
  "/images/community-mentorship.webp",
  "/images/community-event.webp",
] as const;

const icons = [Users, GraduationCap, BriefcaseBusiness] as const;

export function CommunityValue({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <section className="community-value" id="benefits" aria-labelledby="community-value-title">
      <div className="container community-value-inner">
        <div className="community-intro">
          <div className="community-copy">
            <span className="eyebrow">{t.eyebrow}</span>
            <span className="community-heading-rule" aria-hidden="true" />
            <h2 id="community-value-title">
              <span>{t.title[0]}</span>
              <span>{t.title[1]}</span>
              <span className="community-heading-accent">{t.title[2]}</span>
            </h2>
            <p>{t.description}</p>
            <div className="community-trust">
              <ShieldCheck aria-hidden="true" />
              <span>{t.trust}</span>
            </div>
          </div>

          <div className="community-mosaic" aria-label={locale === "uz" ? "QarDU hamjamiyati fotolavhalari" : locale === "ru" ? "Фотографии сообщества КарГУ" : "KarSU community gallery"}>
            {images.map((src, index) => (
              <figure className={`community-frame community-frame-${index + 1}`} key={src}>
                <Image src={src} alt={t.alts[index]} fill sizes={index === 0 ? "(max-width: 767px) 100vw, (max-width: 1024px) 58vw, 42vw" : "(max-width: 767px) 100vw, (max-width: 1024px) 42vw, 22vw"} />
              </figure>
            ))}
          </div>
        </div>

        <div className="community-features">
          {t.features.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <article className="community-feature" key={title}>
                <div className="community-feature-meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="community-feature-icon"><Icon aria-hidden="true" /></span>
                </div>
                <h3>{title}</h3>
                <span className="community-feature-rule" aria-hidden="true" />
                <p>{description}</p>
              </article>
            );
          })}
        </div>

        <blockquote className="community-quote">
          <Quote aria-hidden="true" />
          <p>{t.quote}</p>
          <GraduationCap aria-hidden="true" />
        </blockquote>
      </div>
    </section>
  );
}
