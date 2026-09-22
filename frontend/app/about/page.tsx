import Link from "next/link";
import {
  ArrowRight,
  Award,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  Lock,
  UserCheck,
  Share2,
} from "lucide-react";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = {
  title: "Platforma haqida — Qarshi davlat universiteti",
  description:
    "Qarshi davlat universiteti bitiruvchilarini bir makonda birlashtiruvchi, ularning tajribasi, yutuqlari va universitet bilan davom etayotgan aloqasini yangi avlod bilan bog‘lovchi rasmiy raqamli platforma.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const isUz = locale === "uz";
  const isRu = locale === "ru";

  return (
    <div className="about-manifesto-page">
      {/* 1. HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-container">
          <div className="about-hero-grid">
            <div className="about-hero-content">
              <span className="about-eyebrow">
                {isUz
                  ? "QARSHI DAVLAT UNIVERSITETI ALUMNI PLATFORMASI"
                  : isRu
                  ? "ПЛАТФОРМА ВЫПУСКНИКОВ КАРШИНСКОГО ГОСУДАРСТВЕННОГО УНИВЕРСИТЕТА"
                  : "KARSHI STATE UNIVERSITY ALUMNI PLATFORM"}
              </span>
              <h1 className="about-main-title">{t.aboutTitle}</h1>
              <p className="about-hero-lead">
                {isUz
                  ? "Qarshi davlat universiteti bitiruvchilarini bir makonda birlashtiruvchi, ularning tajribasi, yutuqlari va universitet bilan davom etayotgan aloqasini yangi avlod bilan bog‘lovchi rasmiy raqamli platforma."
                  : isRu
                  ? "Официальная цифровая платформа, объединяющая выпускников Каршинского государственного университета, их опыт, достижения и неразрывную связь с университетом во благо нового поколения."
                  : "The official digital platform uniting Karshi State University alumni, celebrating their achievements, and connecting generational wisdom with emerging scholars."}
              </p>
            </div>

            <div className="about-hero-visual" aria-hidden="true">
              <svg
                viewBox="0 0 360 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="about-watermark-svg"
              >
                <circle cx="180" cy="140" r="110" stroke="#1A247E" strokeWidth="1" strokeDasharray="3 4" opacity="0.22" />
                <circle cx="180" cy="140" r="75" stroke="#1A247E" strokeWidth="1" opacity="0.28" />
                <circle cx="180" cy="140" r="40" stroke="#1A247E" strokeWidth="1.2" opacity="0.35" />
                
                <line x1="30" y1="140" x2="330" y2="140" stroke="#1A247E" strokeWidth="1" opacity="0.18" />
                <line x1="180" y1="20" x2="180" y2="260" stroke="#1A247E" strokeWidth="1" opacity="0.18" />
                <line x1="75" y1="55" x2="285" y2="225" stroke="#1A247E" strokeWidth="0.8" opacity="0.15" />
                <line x1="75" y1="225" x2="285" y2="55" stroke="#1A247E" strokeWidth="0.8" opacity="0.15" />

                <circle cx="180" cy="65" r="4" fill="#1A247E" opacity="0.65" />
                <circle cx="180" cy="215" r="4" fill="#1A247E" opacity="0.65" />
                <circle cx="105" cy="140" r="4" fill="#1A247E" opacity="0.65" />
                <circle cx="255" cy="140" r="4" fill="#1A247E" opacity="0.65" />
                <circle cx="180" cy="140" r="6" fill="#1A247E" opacity="0.85" />
                <circle cx="180" cy="140" r="14" stroke="#D38E4F" strokeWidth="1.5" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION 1 — NEGA ALUMNI PLATFORMASI? & 3 PRINCIPLES */}
      <section className="about-section about-section-principles">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">
              {isUz ? "ASOSIY G‘OYA" : isRu ? "ГЛАВНАЯ ИДЕЯ" : "CORE PURPOSE"}
            </span>
            <h2 className="about-section-heading">
              {isUz
                ? "Nega ALUMNI platformasi?"
                : isRu
                ? "Зачем создана платформа ALUMNI?"
                : "Why the ALUMNI Platform?"}
            </h2>
            <p className="about-section-lead">
              {isUz
                ? "Universitet bilan aloqa diplom olingan kun bilan tugamaydi. ALUMNI bitiruvchilar tajribasini saqlash, avlodlar o‘rtasidagi aloqani mustahkamlash va universitet hamjamiyatining davomiyligini ta’minlash uchun yaratilgan."
                : isRu
                ? "Связь с университетом не заканчивается в день вручения диплома. ALUMNI создан для сохранения опыта выпускников, укрепления преемственности поколений и развития университетского сообщества."
                : "The connection to university does not end with graduation. ALUMNI is built to preserve expertise, bridge generations, and sustain a lifelong academic ecosystem."}
            </p>
          </div>

          <div className="about-principles-editorial-grid">
            <div className="about-principle-item">
              <span className="about-principle-num">01</span>
              <h3 className="about-principle-title">
                {isUz ? "Bog‘lash" : isRu ? "Объединение" : "Connect"}
              </h3>
              <p className="about-principle-text">
                {isUz
                  ? "Bitiruvchilar, talabalar va universitet o‘rtasidagi uzoq muddatli aloqani rivojlantirish."
                  : isRu
                  ? "Развитие долгосрочных связей между выпускниками, студентами и университетом."
                  : "Fostering enduring connections across alumni, active students, and the university."}
              </p>
            </div>

            <div className="about-principle-item">
              <span className="about-principle-num">02</span>
              <h3 className="about-principle-title">
                {isUz ? "Ulashish" : isRu ? "Передача опыта" : "Share"}
              </h3>
              <p className="about-principle-text">
                {isUz
                  ? "Hayotiy va kasbiy tajribani yangi avlod bilan bo‘lishish."
                  : isRu
                  ? "Передача жизненного и профессионального опыта новому поколению специалистов."
                  : "Sharing real-world professional insights and life lessons with emerging scholars."}
              </p>
            </div>

            <div className="about-principle-item">
              <span className="about-principle-num">03</span>
              <h3 className="about-principle-title">
                {isUz ? "E’tirof etish" : isRu ? "Признание" : "Recognize"}
              </h3>
              <p className="about-principle-text">
                {isUz
                  ? "Universitet va jamiyat rivojiga hissa qo‘shgan bitiruvchilarni munosib ko‘rsatish."
                  : isRu
                  ? "Достойное признание выпускников, внёсших вклад в развитие университета и общества."
                  : "Honoring alumni who have made lasting contributions to society and academic progress."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATISTICS STRIP */}
      <section className="about-stats-strip-section" aria-label={isUz ? "Platforma statistikasi" : "Statistics"}>
        <div className="about-container">
          <div className="about-stats-strip">
            <div className="about-stat-col">
              <div className="about-stat-val">1956-yildan</div>
              <div className="about-stat-lbl">
                {isUz ? "Universitet an’analari" : isRu ? "Академические традиции" : "Academic Tradition"}
              </div>
            </div>

            <div className="about-stat-col">
              <div className="about-stat-val">50 000+</div>
              <div className="about-stat-lbl">
                {isUz ? "Bitiruvchilar" : isRu ? "Выпускников" : "Alumni Network"}
              </div>
            </div>

            <div className="about-stat-col">
              <div className="about-stat-val">
                {isUz ? "Ochiq hamjamiyat" : isRu ? "Открытое сообщество" : "Open Community"}
              </div>
              <div className="about-stat-lbl">
                {isUz
                  ? "Barcha avlod bitiruvchilari uchun yagona maydon"
                  : isRu
                  ? "Единое пространство для выпускников всех поколений"
                  : "A unified ecosystem for all generations of graduates"}
              </div>
            </div>

            <div className="about-stat-col">
              <div className="about-stat-val">10+</div>
              <div className="about-stat-lbl">
                {isUz ? "Faoliyat yo‘nalishlari" : isRu ? "Сфер деятельности" : "Professional Domains"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION — PLATFORMA KIMLAR UCHUN? */}
      <section className="about-section about-section-audience">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">
              {isUz ? "MAQSADLI AUDITORIYA" : isRu ? "ЦЕЛЕВАЯ АУДИТОРИЯ" : "AUDIENCE"}
            </span>
            <h2 className="about-section-heading">
              {isUz ? "Platforma kimlar uchun?" : isRu ? "Для кого создана платформа?" : "Who is the Platform For?"}
            </h2>
          </div>

          <div className="about-audience-grid">
            <div className="about-audience-card">
              <div className="about-audience-header">
                <span className="about-audience-badge">01</span>
                <h3 className="about-audience-title">
                  {isUz ? "Bitiruvchilar" : isRu ? "Выпускники" : "Alumni"}
                </h3>
              </div>
              <p className="about-audience-desc">
                {isUz
                  ? "O‘z professional yo‘lini namoyish qilish, tajriba ulashish va universitet bilan aloqani davom ettirish."
                  : isRu
                  ? "Демонстрация профессионального пути, обмен опытом и непрерывный контакт с университетом."
                  : "Showcase career milestones, share professional insight, and maintain enduring ties with alma mater."}
              </p>
            </div>

            <div className="about-audience-card">
              <div className="about-audience-header">
                <span className="about-audience-badge">02</span>
                <h3 className="about-audience-title">
                  {isUz ? "Talabalar" : isRu ? "Студенты" : "Students"}
                </h3>
              </div>
              <p className="about-audience-desc">
                {isUz
                  ? "Bitiruvchilar tajribasidan o‘rganish, maslahat va rivojlanish imkoniyatlarini topish."
                  : isRu
                  ? "Обучение на реальном опыте выпускников, получение наставничества и практических ориентиров."
                  : "Learn from real journeys, seek career advice, and discover growth opportunities."}
              </p>
            </div>

            <div className="about-audience-card">
              <div className="about-audience-header">
                <span className="about-audience-badge">03</span>
                <h3 className="about-audience-title">
                  {isUz ? "Universitet" : isRu ? "Университет" : "University"}
                </h3>
              </div>
              <p className="about-audience-desc">
                {isUz
                  ? "Bitiruvchilar bilan tizimli aloqani rivojlantirish va ularning yutuqlarini saqlash."
                  : isRu
                  ? "Развитие системного взаимодействия с выпускниками и сохранение их академических достижений."
                  : "Develop structured engagement with graduates and preserve institutional legacy."}
              </p>
            </div>

            <div className="about-audience-card">
              <div className="about-audience-header">
                <span className="about-audience-badge">04</span>
                <h3 className="about-audience-title">
                  {isUz ? "Hamkorlar" : isRu ? "Партнёры" : "Partners"}
                </h3>
              </div>
              <p className="about-audience-desc">
                {isUz
                  ? "ALUMNI professional hamjamiyati bilan ishonchli aloqa o‘rnatish."
                  : isRu
                  ? "Построение надежных связей с профессиональным сообществом выпускников университета."
                  : "Establish trusted collaborations and scientific initiatives with the alumni network."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION — PLATFORMADA NIMALARNI TOPASIZ? (PRODUCT DIRECTORY) */}
      <section className="about-section about-section-directory">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">
              {isUz ? "PORTAL IMKONIYATLARI" : isRu ? "РАЗДЕЛЫ ПОРТАЛА" : "ECOSYSTEM"}
            </span>
            <h2 className="about-section-heading">
              {isUz ? "ALUMNI platformasida" : isRu ? "На платформе ALUMNI" : "Inside the ALUMNI Ecosystem"}
            </h2>
            <p className="about-section-lead">
              {isUz
                ? "Platforma universitet hamjamiyati uchun muhim bo‘lgan asosiy yo‘nalishlarni qamrab oladi."
                : isRu
                ? "Платформа объединяет ключевые направления для выпускников, студентов и академического сообщества."
                : "A unified suite of digital services designed for our academic community."}
            </p>
          </div>

          <div className="about-directory-grid">
            <Link href="/alumni" className="about-dir-item">
              <div className="about-dir-icon">
                <Search size={20} />
              </div>
              <div className="about-dir-info">
                <h3 className="about-dir-title">
                  {isUz ? "Bitiruvchilar katalogi" : isRu ? "Каталог выпускников" : "Alumni Directory"}
                </h3>
                <p className="about-dir-text">
                  {isUz
                    ? "Qarshi davlat universiteti bitiruvchilari bilan tanishing."
                    : isRu
                    ? "Знакомьтесь с выпускниками Каршинского государственного университета."
                    : "Explore profiles and cohorts across faculties and graduation years."}
                </p>
              </div>
            </Link>

            <Link href="/alumni" className="about-dir-item">
              <div className="about-dir-icon">
                <Award size={20} />
              </div>
              <div className="about-dir-info">
                <h3 className="about-dir-title">
                  {isUz ? "Bizning faxrimiz" : isRu ? "Наша гордость" : "Distinguished Alumni"}
                </h3>
                <p className="about-dir-text">
                  {isUz
                    ? "Universitet faxriga aylangan yetuk bitiruvchilar."
                    : isRu
                    ? "Выдающиеся выпускники, ставшие гордостью университета."
                    : "Honored figures who have shaped society, science, and governance."}
                </p>
              </div>
            </Link>

            <Link href="/interviews" className="about-dir-item">
              <div className="about-dir-icon">
                <BookOpen size={20} />
              </div>
              <div className="about-dir-info">
                <h3 className="about-dir-title">
                  {isUz ? "Intervyular va maslahatlar" : isRu ? "Интервью и советы" : "Interviews & Guidance"}
                </h3>
                <p className="about-dir-text">
                  {isUz
                    ? "Bitiruvchilar hayot yo‘li va kasbiy tajribasi."
                    : isRu
                    ? "Жизненный путь и профессиональный опыт выпускников."
                    : "In-depth conversations, lessons learned, and actionable advice."}
                </p>
              </div>
            </Link>

            <Link href="/about" className="about-dir-item">
              <div className="about-dir-icon">
                <Sparkles size={20} />
              </div>
              <div className="about-dir-info">
                <h3 className="about-dir-title">
                  {isUz ? "E’tirof" : isRu ? "Признание заслуг" : "Recognition"}
                </h3>
                <p className="about-dir-text">
                  {isUz
                    ? "Universitet va hamjamiyatga qo‘shilgan hissani munosib ko‘rsatish."
                    : isRu
                    ? "Достойная оценка вклада в развитие университета и общества."
                    : "Honoring lifelong commitment and institutional service."}
                </p>
              </div>
            </Link>

            <Link href="/news" className="about-dir-item">
              <div className="about-dir-icon">
                <Calendar size={20} />
              </div>
              <div className="about-dir-info">
                <h3 className="about-dir-title">
                  {isUz ? "Tadbirlar va imkoniyatlar" : isRu ? "События и возможности" : "Events & Initiatives"}
                </h3>
                <p className="about-dir-text">
                  {isUz
                    ? "Alumni hayotidagi uchrashuvlar va faol ishtirok yo‘llari."
                    : isRu
                    ? "Встречи выпускников, конференции и пути активного участия."
                    : "Networking meetups, symposiums, and community projects."}
                </p>
              </div>
            </Link>

            <Link href="/stories" className="about-dir-item">
              <div className="about-dir-icon">
                <Layers size={20} />
              </div>
              <div className="about-dir-info">
                <h3 className="about-dir-title">
                  {isUz ? "Yutuqlar" : isRu ? "Достижения" : "Achievements"}
                </h3>
                <p className="about-dir-text">
                  {isUz
                    ? "Talabalar va bitiruvchilarning muhim natijalari."
                    : isRu
                    ? "Значимые результаты студентов и выпускников университета."
                    : "Breakthrough accomplishments of students and graduates."}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SECTION — HAMJAMIYATGA QO‘SHILISH (JOINING THE COMMUNITY) */}
      <section className="about-section about-section-timeline">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">
              {isUz ? "QADAM-BA-QADAM" : isRu ? "ШАГ ЗА ШАГОМ" : "ONBOARDING"}
            </span>
            <h2 className="about-section-heading">
              {isUz ? "Hamjamiyatga qanday qo‘shilasiz?" : isRu ? "Как присоединиться к сообществу?" : "How to Join the Community"}
            </h2>
            <p className="about-section-lead">
              {isUz
                ? "Har bir bitiruvchi platformada mustaqil ro‘yxatdan o‘tib, o‘z avlodi va hamkasblari bilan to‘g‘ridan-to‘g‘ri bog‘lana oladi."
                : isRu
                ? "Каждый выпускник может легко зарегистрироваться и напрямую общаться с однокурсниками и коллегами."
                : "Every graduate can easily register and directly connect with peers and faculty cohorts."}
            </p>
          </div>

          <div className="about-timeline-steps">
            <div className="about-timeline-step">
              <div className="about-timeline-marker">01</div>
              <div className="about-timeline-content">
                <h3 className="about-step-title">
                  {isUz ? "Anketa to‘ldiriladi" : isRu ? "Заполнение анкеты" : "Fill the Form"}
                </h3>
                <p className="about-step-desc">
                  {isUz
                    ? "Bitiruvchi o‘z ismi, bitirgan yili, fakulteti va kasbiy yo‘nalishini kiritadi."
                    : isRu
                    ? "Выпускник указывает имя, год выпуска, факультет и сферу деятельности."
                    : "Enter your name, graduation year, faculty, and professional background."}
                </p>
              </div>
            </div>

            <div className="about-timeline-connector" aria-hidden="true" />

            <div className="about-timeline-step">
              <div className="about-timeline-marker">02</div>
              <div className="about-timeline-content">
                <h3 className="about-step-title">
                  {isUz ? "Profil shakllanadi" : isRu ? "Создание профиля" : "Profile Setup"}
                </h3>
                <p className="about-step-desc">
                  {isUz
                    ? "Kiritilgan ma’lumotlar asosida bitiruvchining shaxsiy sahifasi yaratiladi."
                    : isRu
                    ? "На основе введённых данных автоматически создаётся персональная страница."
                    : "Your personal alumni profile is generated instantly."}
                </p>
              </div>
            </div>

            <div className="about-timeline-connector" aria-hidden="true" />

            <div className="about-timeline-step">
              <div className="about-timeline-marker">03</div>
              <div className="about-timeline-content">
                <h3 className="about-step-title">
                  {isUz ? "Guruhga ulanish" : isRu ? "Подключение к группе" : "Connect Cohort"}
                </h3>
                <p className="about-step-desc">
                  {isUz
                    ? "O‘z bitiruv yili hamkasblari va fakultetdoshlar davrasidan joy olasiz."
                    : isRu
                    ? "Вы подключаетесь к сообществу своего года выпуска и факультета."
                    : "Join peers of your graduation year and faculty network."}
                </p>
              </div>
            </div>

            <div className="about-timeline-connector" aria-hidden="true" />

            <div className="about-timeline-step">
              <div className="about-timeline-marker">04</div>
              <div className="about-timeline-content">
                <h3 className="about-step-title">
                  {isUz ? "Tajriba ulashish" : isRu ? "Обмен опытом" : "Share & Grow"}
                </h3>
                <p className="about-step-desc">
                  {isUz
                    ? "Talabalar va yosh mutaxassislar bilan muloqot va hamkorlik yo‘lga qo‘yiladi."
                    : isRu
                    ? "Открывается прямое общение и обмен опытом со студентами и коллегами."
                    : "Engage in direct networking and mentorship with the university community."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRIVACY & OPEN ECOSYSTEM SECTION */}
      <section className="about-section about-section-trust">
        <div className="about-container">
          <div className="about-trust-box">
            <div className="about-trust-header">
              <span className="about-section-eyebrow">
                {isUz ? "ISHONCH VA MAXFIYLIK" : isRu ? "ДОВЕРИЕ И КОНФИДЕНЦИАЛЬНОСТЬ" : "PRIVACY & AUTONOMY"}
              </span>
              <h2 className="about-section-heading">
                {isUz
                  ? "Xavfsizlik va erkinlik — platformaning asosiy qoidalari"
                  : isRu
                  ? "Безопасность и свобода — ключевые правила платформы"
                  : "Security & Open Access Principles"}
              </h2>
            </div>

            <div className="about-trust-list">
              <div className="about-trust-item">
                <CheckCircle2 size={20} className="about-trust-icon" />
                <div className="about-trust-text">
                  <strong>{isUz ? "Shaxsiy ma’lumotlar himoyasi" : isRu ? "Защита личных данных" : "Privacy by Default"}</strong>
                  <p>
                    {isUz
                      ? "Shaxsiy telefon raqam va elektron pochta manzillari ommaga ko‘rinmaydi, xavfsiz saqlanadi."
                      : isRu
                      ? "Личные контакты и электронная почта защищены и не публикуются в открытом доступе."
                      : "Direct contact details remain strictly confidential."}
                  </p>
                </div>
              </div>

              <div className="about-trust-item">
                <CheckCircle2 size={20} className="about-trust-icon" />
                <div className="about-trust-text">
                  <strong>{isUz ? "Mustaqil profil boshqaruvi" : isRu ? "Свободное управление профилем" : "Self-Managed Profile"}</strong>
                  <p>
                    {isUz
                      ? "Bitiruvchi o‘z ma’lumotlarini istalgan vaqt mustaqil tahrirlashi yoki to‘ldirishi mumkin."
                      : isRu
                      ? "Выпускник может самостоятельно редактировать и обновлять свои данные в любое время."
                      : "Alumni maintain full control to update and expand their profile at any time."}
                  </p>
                </div>
              </div>

              <div className="about-trust-item">
                <CheckCircle2 size={20} className="about-trust-icon" />
                <div className="about-trust-text">
                  <strong>{isUz ? "Ochiq va teng imkoniyat" : isRu ? "Равные возможности" : "Equal Access"}</strong>
                  <p>
                    {isUz
                      ? "Har bir bitiruvchi o‘z faoliyati va yutuqlarini hamjamiyatga erkin taqdim etish huquqiga ega."
                      : isRu
                      ? "Каждый выпускник имеет равное право представить свои достижения в сообществе."
                      : "Every graduate has equal opportunity to share their professional path."}
                  </p>
                </div>
              </div>

              <div className="about-trust-item">
                <CheckCircle2 size={20} className="about-trust-icon" />
                <div className="about-trust-text">
                  <strong>{isUz ? "To‘g‘ridan-to‘g‘ri aloqa" : isRu ? "Прямое взаимодействие" : "Direct Connection"}</strong>
                  <p>
                    {isUz
                      ? "Universitet va bitiruvchilar o‘rtasida ochiq, ortiqcha to‘siqlarsiz muloqot ta’minlanadi."
                      : isRu
                      ? "Обеспечивается прямое общение между университетом и выпускниками без бюрократии."
                      : "Direct, barrier-free communication between graduates and university departments."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RECOGNITION SECTION */}
      <section className="about-section about-section-recognition">
        <div className="about-container">
          <div className="about-recognition-card">
            <div className="about-recognition-content">
              <span className="about-section-eyebrow gold">
                {isUz ? "MUNOSIB E’TIROF" : isRu ? "ПРИЗНАНИЕ ЗАСЛУГ" : "MERIT & HONORS"}
              </span>
              <h2 className="about-section-heading">
                {isUz
                  ? "E’tirof — natijani emas, hissani ko‘rsatadi"
                  : isRu
                  ? "Признание — показатель вклада, а не формальности"
                  : "Recognition Honors Real Contribution"}
              </h2>
              <p className="about-section-lead">
                {isUz
                  ? "ALUMNI e’tirofi bitiruvchilarning universitet, talabalar va jamiyat rivojiga qo‘shgan boy kasbiy va insoniy hissasini ifodalovchi hurmat belgisidir."
                  : isRu
                  ? "Признание ALUMNI — это дань уважения значительному профессиональному и жизненному вкладу выпускников в развитие университета и общества."
                  : "Honorary distinctions celebrate the profound dedication of alumni to academic progress and mentorship."}
              </p>

              <div className="about-recognition-badges">
                <span className="about-rec-badge">
                  <Award size={14} className="about-rec-icon" />
                  {isUz ? "Faxriy ustoz" : isRu ? "Почётный наставник" : "Honorary Mentor"}
                </span>
                <span className="about-rec-badge">
                  <Sparkles size={14} className="about-rec-icon" />
                  {isUz ? "Innovatsiya yetakchisi" : isRu ? "Лидер инноваций" : "Innovation Leader"}
                </span>
                <span className="about-rec-badge">
                  <Building2 size={14} className="about-rec-icon" />
                  {isUz ? "Universitet fidoyisi" : isRu ? "Преданность университету" : "University Devotee"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION — MAS’ULIYATLI YONDASHUV */}
      <section className="about-section about-section-commitments">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-eyebrow">
              {isUz ? "AXLOQIY CHEGARALAR" : isRu ? "ЭТИЧЕСКИЕ ПРИНЦИПЫ" : "ETHICAL COMMITMENTS"}
            </span>
            <h2 className="about-section-heading">
              {isUz ? "Mas’uliyatli yondashuv" : isRu ? "Ответственный подход" : "Responsible Governance"}
            </h2>
          </div>

          <div className="about-commitments-grid">
            <div className="about-commitment-item">
              <div className="about-commitment-bullet" />
              <p className="about-commitment-text">
                {isUz
                  ? "Shaxsiy ma’lumotlarni ruxsatsiz ochiq ko‘rsatmaymiz."
                  : isRu
                  ? "Не раскрываем личные контакты без согласия пользователя."
                  : "We never display private contact details without explicit consent."}
              </p>
            </div>

            <div className="about-commitment-item">
              <div className="about-commitment-bullet" />
              <p className="about-commitment-text">
                {isUz
                  ? "Foydalanuvchi ma’lumotlarini belgilangan maqsaddan tashqari ishlatmaymiz."
                  : isRu
                  ? "Не используем данные пользователей вне заявленных целей."
                  : "We strictly refrain from using alumni data outside educational goals."}
              </p>
            </div>

            <div className="about-commitment-item">
              <div className="about-commitment-bullet" />
              <p className="about-commitment-text">
                {isUz
                  ? "Bitiruvchilarning mustaqil fikri va tajribasini hurmat qilamiz."
                  : isRu
                  ? "Уважаем независимое мнение и личный опыт каждого выпускника."
                  : "We respect the authentic voice and personal experience of every alumnus."}
              </p>
            </div>

            <div className="about-commitment-item">
              <div className="about-commitment-bullet" />
              <p className="about-commitment-text">
                {isUz
                  ? "Platformadan faqat ta’lim, madaniyat va o‘zaro hamkorlik maqsadlarida foydalanamiz."
                  : isRu
                  ? "Используем платформу исключительно в целях образования и сотрудничества."
                  : "The platform operates exclusively for education, networking, and cultural heritage."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
