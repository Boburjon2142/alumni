import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  History,
  ShieldCheck,
  ArrowRight,
  Search,
  Award,
  Users,
  Compass,
  Building2,
  Lock,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = {
  title: "Platforma haqida — Qarshi davlat universiteti",
  description:
    "Qarshi davlat universitetining faxriy bitiruvchilarini tanishtiruvchi rasmiy raqamli platforma, uning missiyasi va tahririyat mezonlari.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="about-page section">
      <div className="container">
        {/* Page Header */}
        <div className="page-heading about-page-heading">
          <span className="eyebrow gold">
            {locale === "en"
              ? "QARSU HONORARY ALUMNI PORTAL"
              : locale === "ru"
              ? "ПОРТАЛ ПОЧЁТНЫХ ВЫПУСКНИКОВ КАРГУ"
              : "QARSHI DAVLAT UNIVERSITETI FAXRIY BITIRUVCHILARI MARKAZI"}
          </span>
          <h1>{t.aboutTitle}</h1>
          <p className="about-lead">
            {locale === "en"
              ? "Official digital archive and networking ecosystem celebrating distinguished graduates of Karshi State University, bridging generational experience and academic excellence."
              : locale === "ru"
              ? "Официальный цифровой архив и экосистема, объединяющая выдающихся выпускников Каршинского государственного университета, сохраняющая академическое наследие и передающая опыт молодому поколению."
              : "Qarshi davlat universiteti bitiruvchilarining ilmiy, davlat va jamiyat taraqqiyotidagi o‘rni, ularning boy hayotiy tajribasini yosh avlodga yetkazish hamda universitetning akademik an’analarini mustahkamlashga qaratilgan rasmiy raqamli portal."}
          </p>
        </div>

        {/* Impact Numbers Banner */}
        <div className="about-stats-banner">
          <div className="about-stat-item">
            <div className="about-stat-icon">
              <History size={24} />
            </div>
            <div className="about-stat-text">
              <strong>1956-yildan</strong>
              <span>
                {locale === "en"
                  ? "Academic Tradition"
                  : locale === "ru"
                  ? "Академическая традиция"
                  : "Boy ilmiy an’analar"}
              </span>
            </div>
          </div>

          <div className="about-stat-item">
            <div className="about-stat-icon">
              <Users size={24} />
            </div>
            <div className="about-stat-text">
              <strong>50 000+</strong>
              <span>
                {locale === "en"
                  ? "Successful Graduates"
                  : locale === "ru"
                  ? "Успешных выпускников"
                  : "Muvaffaqiyatli bitiruvchilar"}
              </span>
            </div>
          </div>

          <div className="about-stat-item">
            <div className="about-stat-icon">
              <ShieldCheck size={24} />
            </div>
            <div className="about-stat-text">
              <strong>100%</strong>
              <span>
                {locale === "en"
                  ? "Verified Profiles"
                  : locale === "ru"
                  ? "Проверенные профили"
                  : "Tasdiqlangan ma’lumotlar"}
              </span>
            </div>
          </div>

          <div className="about-stat-item">
            <div className="about-stat-icon">
              <Award size={24} />
            </div>
            <div className="about-stat-text">
              <strong>10+</strong>
              <span>
                {locale === "en"
                  ? "Key Industries"
                  : locale === "ru"
                  ? "Сфер деятельности"
                  : "Asosiy soha yo‘nalishlari"}
              </span>
            </div>
          </div>
        </div>

        {/* Three Core Pillars Cards */}
        <div className="about-grid">
          <section className="about-card">
            <div className="about-card-icon gold-badge">
              <GraduationCap size={28} />
            </div>
            <h2>{t.aboutMissionTitle}</h2>
            <p>{t.aboutMissionText}</p>
          </section>

          <section className="about-card">
            <div className="about-card-icon blue-badge">
              <ShieldCheck size={28} />
            </div>
            <h2>{t.aboutEditorialTitle}</h2>
            <p>{t.aboutEditorialText}</p>
          </section>

          <section className="about-card">
            <div className="about-card-icon green-badge">
              <CheckCircle2 size={28} />
            </div>
            <h2>{t.aboutTrustTitle}</h2>
            <p>{t.aboutTrustText}</p>
          </section>
        </div>

        {/* Ecosystem Capabilities Section */}
        <div className="about-features-section">
          <div className="section-title-wrapper">
            <span className="eyebrow gold">
              {locale === "en"
                ? "PORTAL CAPABILITIES"
                : locale === "ru"
                ? "ВОЗМОЖНОСТИ ПОРТАЛА"
                : "PLATFORMA IMKONIYATLARI"}
            </span>
            <h2>
              {locale === "en"
                ? "What You Can Explore on the Platform"
                : locale === "ru"
                ? "Что вы найдёте на платформе"
                : "Platformada qanday imkoniyatlar mavjud?"}
            </h2>
          </div>

          <div className="about-features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <Search size={22} />
              </div>
              <h3>
                {locale === "en"
                  ? "Smart Catalogue & Filtering"
                  : locale === "ru"
                  ? "Умный каталог и поиск"
                  : "Raqamli qidiruv va filtrlar"}
              </h3>
              <p>
                {locale === "en"
                  ? "Filter alumni by faculty, graduation year, position, and accomplishments with instant results."
                  : locale === "ru"
                  ? "Быстрый поиск выпускников по факультету, году окончания, должности и профессиональным достижениям."
                  : "Fakultetlar, bitiruv yillari, lavozim va yutuqlar bo‘yicha faxriy bitiruvchilarni tezkor qidirish va saralash."}
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <History size={22} />
              </div>
              <h3>
                {locale === "en"
                  ? "Career Milestones (Timeline)"
                  : locale === "ru"
                  ? "Хронология карьеры (Timeline)"
                  : "Faoliyat xronologiyasi (Timeline)"}
              </h3>
              <p>
                {locale === "en"
                  ? "Chronological step-by-step career path of each distinguished alumnus from university days to top achievements."
                  : locale === "ru"
                  ? "Поэтапный жизненный и карьерный путь каждого выпускника со студенческих лет до руководящих должностей."
                  : "Talabalik davridan boshlab hozirgi yuksak maqomgacha bo‘lgan bosqichma-bosqich martaba va ilmiy yo‘l."}
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Compass size={22} />
              </div>
              <h3>
                {locale === "en"
                  ? "Actionable Advice for Youth"
                  : locale === "ru"
                  ? "Практические советы молодёжи"
                  : "Yoshlar uchun hayotiy maslahatlar"}
              </h3>
              <p>
                {locale === "en"
                  ? "Real-world experience, lessons learned, and valuable recommendations for students and aspiring specialists."
                  : locale === "ru"
                  ? "Проверенные советы, жизненные выводы и наставления для студентов и начинающих специалистов."
                  : "Katta hayot va kasbiy faoliyatda sinalgan tavsiyalar, talabalar uchun yo‘l-yo‘riq va ilhom manbai."}
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <BookOpen size={22} />
              </div>
              <h3>
                {locale === "en"
                  ? "Inspiring Success Stories"
                  : locale === "ru"
                  ? "Вдохновляющие истории успеха"
                  : "Muvaffaqiyat hikoyalari"}
              </h3>
              <p>
                {locale === "en"
                  ? "In-depth editorial articles highlighting perseverance, dedication, and monumental contributions to society."
                  : locale === "ru"
                  ? "Подробные статьи о трудолюбии, преодолении вызовов и значительном вкладе в развитие общества."
                  : "Faxriy bitiruvchilarning ibratli faoliyati va jamiyatga qo‘shgan hissasi haqidagi maxsus tahliliy maqolalar."}
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Principles Card */}
        <div className="about-principles-card">
          <div className="principles-header">
            <div className="principles-badge">
              <ShieldCheck size={20} />
            </div>
            <h2>
              {locale === "en"
                ? "Core Editorial & Governance Principles"
                : locale === "ru"
                ? "Ключевые редакционные принципы"
                : "Asosiy tahririyat va axborot tamoyillari"}
            </h2>
          </div>

          <div className="about-principles-grid">
            <div className="principle-box">
              <div className="principle-num">01</div>
              <h4>
                {locale === "en"
                  ? "Academic Integrity"
                  : locale === "ru"
                  ? "Академическая честность"
                  : "Akademik halollik"}
              </h4>
              <p>
                {locale === "en"
                  ? "Every profile is curated through verified institutional records, state honors, and confirmed milestones."
                  : locale === "ru"
                  ? "Каждый профиль формируется на основе архивных данных, государственных наград и подтверждённых этапов."
                  : "Har bir bitiruvchi profili rasmiy hujjatlar, arxiv ma’lumotlari va tasdiqlangan yutuqlar asosida tuziladi."}
              </p>
            </div>

            <div className="principle-box">
              <div className="principle-num">02</div>
              <h4>
                {locale === "en"
                  ? "Generational Mentorship"
                  : locale === "ru"
                  ? "Преемственность поколений"
                  : "Avlodlar vorisiyligi"}
              </h4>
              <p>
                {locale === "en"
                  ? "Insights and advice are structured to inspire and guide current students into meaningful careers."
                  : locale === "ru"
                  ? "Советы и опыт направлены на профессиональную ориентацию и мотивацию современных студентов."
                  : "Tajribali ustozlarning xulosalari talaba-yoshlarga to‘g‘ri yo‘nalish va kuchli motivatsiya berishga xizmat qiladi."}
              </p>
            </div>

            <div className="principle-box">
              <div className="principle-num">03</div>
              <h4>
                {locale === "en"
                  ? "Strict Privacy & Trust"
                  : locale === "ru"
                  ? "Строгая конфиденциальность"
                  : "Qat’iy maxfiylik va ishonch"}
              </h4>
              <p>
                {locale === "en"
                  ? "Personal contact details remain protected and confidential, ensuring absolute security and respect."
                  : locale === "ru"
                  ? "Личные контакты защищены и никогда не публикуются, гарантируя безопасность и уважение."
                  : "Shaxsiy aloqa vositalari qat’iy himoyalangan bo‘lib, ommaviy tarmoqlarga chiqarilmaydi."}
              </p>
            </div>
          </div>

          <div className="about-cta-row">
            <Link href="/alumni" className="button button-primary about-primary-btn">
              {t.heroCtaPrimary} <ArrowRight size={18} />
            </Link>
            <Link href="/advice" className="button button-secondary about-secondary-btn">
              {t.heroCtaSecondary}
            </Link>
            <Link href="/feedback" className="button button-outline about-feedback-btn">
              <MessageSquare size={17} />
              {t.navFeedback}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
