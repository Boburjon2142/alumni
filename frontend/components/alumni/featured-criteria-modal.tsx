"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface FeaturedCriteriaModalProps {
  locale: Locale;
  trigger?: React.ReactNode;
}

export function FeaturedCriteriaModal({ locale, trigger }: FeaturedCriteriaModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"doc" | "criteria" | "admin">("doc");

  const isUz = locale === "uz";
  const isRu = locale === "ru";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button
            type="button"
            className="featured-criteria-trigger-btn"
            id="featured-criteria-trigger"
            aria-label={
              isUz
                ? "Asosiy sahifada chiqarilish mezonlari hujjati (Demo)"
                : isRu
                ? "Критерии размещения на главной странице (Демо)"
                : "Main page featured criteria document (Demo)"
            }
          >
            <FileText size={16} aria-hidden="true" />
            <span>
              {isUz
                ? "Asosiy sahifa mezonlari"
                : isRu
                ? "Критерии главной страницы"
                : "Main Page Criteria"}
            </span>
            <span className="featured-criteria-badge">
              {isUz ? "Nizom (Demo)" : isRu ? "Положение (Демо)" : "Charter (Demo)"}
            </span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="criteria-dialog-overlay" />
        <Dialog.Content
          className="criteria-dialog"
          aria-describedby="criteria-dialog-desc"
        >
          {/* Modal Header */}
          <div className="criteria-dialog-header">
            <div className="criteria-dialog-header-left">
              <span className="criteria-dialog-eyebrow">
                <ShieldCheck size={14} aria-hidden="true" />
                {isUz
                  ? "QarshiDU Alumni • Rasmiy Reglament (Demo namuna)"
                  : isRu
                  ? "КарГУ Alumni • Официальный регламент (Демо образец)"
                  : "KarSU Alumni • Official Regulation (Demo Sample)"}
              </span>
              <Dialog.Title className="criteria-dialog-title">
                {isUz
                  ? "Asosiy sahifada e’lon qilish mezonlari va tartibi to‘g‘risida NIZOM"
                  : isRu
                  ? "ПОЛОЖЕНИЕ о критериях и порядке публикации на главной странице"
                  : "REGULATION on Criteria and Procedure for Main Page Publication"}
              </Dialog.Title>
            </div>

            <div className="criteria-dialog-header-actions">
              <button
                type="button"
                className="criteria-print-btn"
                onClick={handlePrint}
                title={isUz ? "Chop etish / PDF saqlash" : isRu ? "Печать / Сохранить в PDF" : "Print / Save PDF"}
              >
                <Printer size={16} aria-hidden="true" />
                <span>{isUz ? "Chop etish" : isRu ? "Печать" : "Print"}</span>
              </button>
              <Dialog.Close
                className="criteria-dialog-close"
                aria-label={isUz ? "Yopish" : isRu ? "Закрыть" : "Close"}
              >
                <X size={20} aria-hidden="true" />
              </Dialog.Close>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="criteria-dialog-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "doc"}
              className={`criteria-tab-btn ${activeTab === "doc" ? "active" : ""}`}
              onClick={() => setActiveTab("doc")}
            >
              <FileText size={15} aria-hidden="true" />
              <span>{isUz ? "Nizom matni (Hujjat)" : isRu ? "Текст Положения" : "Charter Text"}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "criteria"}
              className={`criteria-tab-btn ${activeTab === "criteria" ? "active" : ""}`}
              onClick={() => setActiveTab("criteria")}
            >
              <Award size={15} aria-hidden="true" />
              <span>{isUz ? "5 ta asosiy mezon" : isRu ? "5 ключевых критериев" : "5 Key Criteria"}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "admin"}
              className={`criteria-tab-btn ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{isUz ? "Admin vakolati va xavfsizlik" : isRu ? "Полномочия админа" : "Admin Governance"}</span>
            </button>
          </div>

          {/* Modal Body / Printable Document */}
          <div className="criteria-dialog-body" id="criteria-dialog-desc">
            {activeTab === "doc" && (
              <div className="criteria-doc-sheet">
                {/* Official Letterhead */}
                <div className="criteria-doc-letterhead">
                  <div className="criteria-doc-coat">
                    <GraduationCap size={44} className="criteria-doc-emblem" aria-hidden="true" />
                  </div>
                  <div className="criteria-doc-ministry">
                    {isUz ? (
                      <>
                        <p className="ministry-title">O‘ZBEKISTON RESPUBLIKASI OLIY TA’LIM, FAN VA INNOVATSIYALAR VAZIRLIGI</p>
                        <h3 className="university-title">QARSHI DAVLAT UNIVERSITETI</h3>
                        <p className="council-subtitle">UNIVERSITET ILMIY KENGASHI VA ALUMNI MUHARRIRIYATI</p>
                      </>
                    ) : isRu ? (
                      <>
                        <p className="ministry-title">МИНИСТЕРСТВО ВЫСШЕГО ОБРАЗОВАНИЯ, НАУКИ И ИННОВАЦИЙ РЕСПУБЛИКИ УЗБЕКИСТАН</p>
                        <h3 className="university-title">КАРШИНСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ</h3>
                        <p className="council-subtitle">УЧЁНЫЙ СОВЕТ УНИВЕРСИТЕТА И РЕДАКЦИЯ ALUMNI</p>
                      </>
                    ) : (
                      <>
                        <p className="ministry-title">MINISTRY OF HIGHER EDUCATION, SCIENCE AND INNOVATION OF THE REPUBLIC OF UZBEKISTAN</p>
                        <h3 className="university-title">KARSHI STATE UNIVERSITY</h3>
                        <p className="council-subtitle">UNIVERSITY ACADEMIC SENATE & ALUMNI EDITORIAL BOARD</p>
                      </>
                    )}
                  </div>
                  <div className="criteria-doc-meta">
                    <span className="doc-num">Hujjat №: QDU-ALUMNI-2024/01-REG</span>
                    <span className="doc-status-badge">DEMO NAMUNA / REGLAMENT</span>
                  </div>
                </div>

                <div className="criteria-doc-divider" />

                {/* Regulation Title */}
                <div className="criteria-doc-heading">
                  <h4>
                    {isUz
                      ? "Qarshi davlat universiteti ALUMNI portalining «Asosiy sahifa»sida faxriy bitiruvchilar profillarini tanlash, e’lon qilish va boshqarish tartibi to‘g‘risida"
                      : isRu
                      ? "О порядке отбора, публикации и управления профилями почётных выпускников на «Главной странице» портала ALUMNI КарГУ"
                      : "On the Procedure for Selection, Publication, and Management of Honorary Alumni Profiles on the «Main Page» of the KarSU ALUMNI Portal"}
                  </h4>
                  <div className="criteria-doc-namuna-label">
                    {isUz
                      ? "NIZOM (DEMO VERSIYA)"
                      : isRu
                      ? "ПОЛОЖЕНИЕ (ДЕМО ВЕРСИЯ)"
                      : "CHARTER & REGULATION (DEMO VERSION)"}
                  </div>
                </div>

                {/* Articles */}
                <div className="criteria-doc-content">
                  {isUz ? (
                    <>
                      <article className="criteria-article">
                        <h5>1-BOB. UMUMIY QOIDALAR VA ASOSIY SAHIFA KVOTASI</h5>
                        <p>
                          <strong>1.1.</strong> Mazkur Nizom Qarshi davlat universiteti ALUMNI portalining asosiy sahifasidagi
                          «Faxriy bitiruvchilar» ruknida aks etuvchi profillarni shakllantirish, nomzodlarni saralash mezonlari hamda
                          ularni tasdiqlashning qat’iy tartibini belgilaydi.
                        </p>
                        <p>
                          <strong>1.2.</strong> Asosiy sahifada joylashtiriladigan faxriy bitiruvchilar soni <strong>qat’iy 12 nafar</strong> (kvota)
                          etib cheklangan. Ushbu profillar universitetning ilmiy, ma’rifiy va ijtimoiy nufuzini eng yuqori darajada aks ettiradi.
                        </p>
                        <p>
                          <strong>1.3. Qat’iy xavfsizlik va o‘zgarmaslik kafolati:</strong> Asosiy sahifada chiqadigan profillar ro‘yxatiga
                          hech qanday tashqi foydalanuvchi, mustaqil ro‘yxatdan o‘tgan bitiruvchi yoki vakolatsiz xodim tomonidan o‘zboshimchalik
                          bilan o‘zgartirish kiritilishi, profil qo‘shilishi yoki olib tashlanishiga yo‘l qo‘yilmaydi.
                        </p>
                        <p>
                          <strong>1.4.</strong> Asosiy sahifa tarkibini o‘zgartirish, nomzodlarni yangilash yoki rotatsiya qilish
                          <strong> faqatgina Universitet Ilmiy Kengashi xulosasi va vakolatli Bosh Administrator (Portal Admin)</strong> tomonidan
                          amalga oshiriladi.
                        </p>
                      </article>

                      <article className="criteria-article">
                        <h5>2-BOB. NOMZODLARGA QO‘YILADIGAN ASOSIY MEZONLAR VA TALABLAR</h5>
                        <p>
                          Asosiy sahifaga kiritiladigan har bir bitiruvchi quyidagi <strong>5 ta ustuvor mezon</strong>ning kamida 2 tasi
                          (yoki oliy faxriy toifalar uchun kamida 3 tasi) bo‘yicha to‘liq hujjatlashtirilgan dalillarga ega bo‘lishi shart:
                        </p>
                        <ol className="criteria-list">
                          <li>
                            <strong>1-mezon. Davlat mukofotlari va faxriy unvonlar:</strong> O‘zbekiston Respublikasi yoki nufuzli xalqaro
                            miqyosdagi davlat mukofotlari, orden va medallar, «O‘zbekiston Qahramoni», «O‘zbekiston Respublikasida xizmat ko‘rsatgan...»
                            (fan arbobi, xalq maorifi xodimi, yoshlar murabbiysi, madaniyat xodimi) unvonlariga ega bo‘lish.
                          </li>
                          <li>
                            <strong>2-mezon. Yuksak ilmiy nufuz va akademik yutuqlar:</strong> Fan doktori (DSc), professor, O‘zbekiston
                            Fanlar akademiyasi akademigi ilmiy unvonlariga egalik, o‘z sohasida nufuzli ilmiy maktab yaratganlik, fundamental
                            darsliklar muallifligi yoki xalqaro nufuzli ilmiy jurnallarda yuqori iqtiboslik ko‘rsatkichlari.
                          </li>
                          <li>
                            <strong>3-mezon. Universitet va jamiyat taraqqiyotiga qo‘shgan hissasi:</strong> Qarshi davlat universitetida
                            uzoq yillar davomida pedagogik, ilmiy va rahbarlik lavozimlarida fidokorona faoliyat ko‘rsatganlik, minglab malakali
                            kadrlarni tarbiyalaganlik, universitet nufuzini xalqaro miqyosga olib chiqishdagi hissasi.
                          </li>
                          <li>
                            <strong>4-mezon. 15+ yillik benuqson va ibratli kasbiy faoliyat:</strong> O‘z yo‘nalishida (davlat boshqaruvi, ta’lim,
                            sud-huquq, ilm-fan, axborot texnologiyalari, ishlab chiqarish yoki ommaviy axborot vositalari) kamida 15 yil ibratli,
                            halol va yuqori mas’uliyatli faoliyat olib borganlik.
                          </li>
                          <li>
                            <strong>5-mezon. Beg‘ubor jamoatchilik obro‘si va yoshlar murabbiyligi:</strong> Jamiyatda, kasbdoshlari va talabalar
                            orasida yuksak ma’naviy-axloqiy nufuzga ega bo‘lish, yosh avlod uchun vatanparvarlik, halollik va kasbga sadoqat timsoli bo‘lish.
                          </li>
                        </ol>
                      </article>

                      <article className="criteria-article">
                        <h5>3-BOB. KO‘RIB CHIQISH, SARALASH VA TASDIQLASH TARTIBI</h5>
                        <p>
                          <strong>3.1. Tavsiyanoma kiritish:</strong> Nomzodlar fakultet dekanatlari, kafedralar, ilmiy kengashlar yoki
                          QarDU ALUMNI assotsiatsiyasi boshqaruvi tomonidan rasmiy taqdimnoma va arxiv asosnomasi bilan kiritiladi.
                        </p>
                        <p>
                          <strong>3.2. Arxiv va biografiya ekspertizasi:</strong> Universitet kadrlar bo‘limi va arxivi bitiruvchining o‘qigan yillari,
                          mutaxassisligi, davlat mukofotlari va kasbiy ma’lumotlarini hujjatli manbalar orqali tekshirib tasdiqlaydi.
                        </p>
                        <p>
                          <strong>3.3. Texnik ijro va Admin vakolati:</strong> Ilmiy Kengash ijobiy qaror qabul qilgach, Bosh Administrator
                          Django boshqaruv paneli orqali bitiruvchi profiliga <code>is_honorary=True</code> va <code>is_featured=True</code>
                          belgilarini qo‘yadi hamda <code>FeaturedAlumni</code> jadvalida tartib raqamini (1..12) belgilab keshni yangilaydi.
                        </p>
                        <p>
                          <strong>3.4.</strong> Tizimda yangi bitiruvchilar o‘z profillarini to‘ldirganda yoki umumiy ma’lumotlar bazasiga
                          qo‘shilganda, ular hech qanday holatda asosiy sahifadagi 12 nafar faxriy bitiruvchi o‘rniga avtomatik chiqmaydi.
                        </p>
                      </article>

                      <article className="criteria-article">
                        <h5>4-BOB. ROTATSIYA VA MA’LUMOTLAR XAVFSIZLIGI</h5>
                        <p>
                          <strong>4.1.</strong> Asosiy sahifadagi 12 nafar faxriy bitiruvchi profillari uzluksiz, barqaror va xavfsiz keshlash
                          rejimida taqdim etiladi.
                        </p>
                        <p>
                          <strong>4.2.</strong> Kengash qarorisiz hech bir profil asosiy sahifadan olib tashlanmaydi yoki almashtirilmaydi.
                        </p>
                      </article>
                    </>
                  ) : isRu ? (
                    <>
                      <article className="criteria-article">
                        <h5>ГЛАВА 1. ОБЩИЕ ПОЛОЖЕНИЯ И КВОТА ГЛАВНОЙ СТРАНИЦЫ</h5>
                        <p>
                          <strong>1.1.</strong> Настоящее Положение определяет критерии отбора, порядок утверждения и правила публикации
                          профилей почётных выпускников в разделе «Почётные выпускники» на главной странице ALUMNI КарГУ.
                        </p>
                        <p>
                          <strong>1.2.</strong> Количество профилей на главной странице строго ограничено квотой в <strong>12 персоналий</strong>,
                          олицетворяющих высшие достижения университета и общественное признание.
                        </p>
                        <p>
                          <strong>1.3. Гарантия неизменности и безопасности:</strong> Профили на главной странице не могут быть добавлены,
                          удалены или изменены обычными пользователями, выпускниками или сторонними лицами.
                        </p>
                        <p>
                          <strong>1.4.</strong> Любые изменения осуществляются <strong>исключительно Главным Администратором портала</strong>
                          на основании решения Учёного совета КарГУ.
                        </p>
                      </article>

                      <article className="criteria-article">
                        <h5>ГЛАВА 2. КЛЮЧЕВЫЕ КРИТЕРИИ ОТБОРА</h5>
                        <p>
                          Каждый кандидат должен соответствовать как минимум 2 из 5 ключевых критериев:
                        </p>
                        <ol className="criteria-list">
                          <li><strong>Критерий 1: Государственные награды и почётные звания:</strong> Наличие орденов, медалей, званий «Герой Узбекистана», заслуженный деятель науки, образования, культуры.</li>
                          <li><strong>Критерий 2: Академический авторитет:</strong> Учёная степень доктора наук (DSc), звание профессора или академика АН, создание признанной научной школы.</li>
                          <li><strong>Критерий 3: Вклад в развитие университета:</strong> Многолетний безупречный труд в КарГУ, подготовка высококвалифицированных кадров, укрепление научного потенциала.</li>
                          <li><strong>Критерий 4: 15+ лет образцовой деятельности:</strong> Не менее 15 лет ответственной и плодотворной работы в государственной, научной или общественной сфере.</li>
                          <li><strong>Критерий 5: Высокая репутация и наставничество:</strong> Безупречная репутация, активная наставническая поддержка студентов и молодёжи.</li>
                        </ol>
                      </article>

                      <article className="criteria-article">
                        <h5>ГЛАВА 3. ПОРЯДОК УТВЕРЖДЕНИЯ АДМИНИСТРАТОРОМ</h5>
                        <p>
                          <strong>3.1.</strong> Представление кандидатов осуществляется деканатами и Учёным советом на основе архивных данных.
                        </p>
                        <p>
                          <strong>3.2.</strong> Только после утверждения Главный администратор активирует статус <code>is_featured=True</code> и закрепляет порядковый номер (1..12) в панели управления Django.
                        </p>
                      </article>
                    </>
                  ) : (
                    <>
                      <article className="criteria-article">
                        <h5>CHAPTER 1. GENERAL PROVISIONS & MAIN PAGE QUOTA</h5>
                        <p>
                          <strong>1.1.</strong> This Charter defines the standardized criteria, selection procedures, and governance rules
                          for featuring honorary alumni profiles on the KarSU ALUMNI Portal main page.
                        </p>
                        <p>
                          <strong>1.2.</strong> The main page roster is strictly limited to an official quota of <strong>12 alumni</strong>,
                          representing distinguished leadership, academic excellence, and societal impact.
                        </p>
                        <p>
                          <strong>1.3. Strict Immutability & Security:</strong> No regular user, newly registered alumnus, or unauthorized staff
                          can add, replace, or delete profiles from the main page.
                        </p>
                        <p>
                          <strong>1.4.</strong> Changes can only be executed by the <strong>System Chief Administrator</strong> upon formal approval
                          by the University Academic Senate.
                        </p>
                      </article>

                      <article className="criteria-article">
                        <h5>CHAPTER 2. 5 KEY SELECTION CRITERIA</h5>
                        <p>
                          Candidates must fulfill at least 2 out of the following 5 criteria with verified documentation:
                        </p>
                        <ol className="criteria-list">
                          <li><strong>Criterion 1: State Honors & Titles:</strong> National orders, medals, Hero of Uzbekistan, or Honored Scientist/Educator distinctions.</li>
                          <li><strong>Criterion 2: Academic Eminence:</strong> Doctor of Sciences (DSc), Full Professor, or Academy of Sciences fellowship with high scholarly citation impact.</li>
                          <li><strong>Criterion 3: University Service & Legacy:</strong> Longstanding dedication to KarSU educational quality, faculty development, or major philanthropic mentorship.</li>
                          <li><strong>Criterion 4: 15+ Years Exemplary Career:</strong> A minimum of 15 years of distinguished and integral service in public administration, academia, judiciary, or industry.</li>
                          <li><strong>Criterion 5: Public Standing & Youth Mentorship:</strong> Impeccable reputation serving as an inspiring role model for current students and young graduates.</li>
                        </ol>
                      </article>

                      <article className="criteria-article">
                        <h5>CHAPTER 3. VERIFICATION & ADMIN PROTOCOL</h5>
                        <p>
                          <strong>3.1.</strong> Proposals originate from faculty councils and are verified against university archives.
                        </p>
                        <p>
                          <strong>3.2.</strong> Only authorized administrators can configure the <code>FeaturedAlumni</code> records (positions 1..12) in Django Admin.
                        </p>
                      </article>
                    </>
                  )}
                </div>

                {/* Signatures & Seal Box */}
                <div className="criteria-doc-signatures">
                  <div className="criteria-doc-signer">
                    <span className="signer-role">
                      {isUz
                        ? "Universitet Kengashi Raisi, Rektor"
                        : isRu
                        ? "Председатель Совета, Ректор"
                        : "Senate Chairman, Rector"}
                    </span>
                    <span className="signer-name">Qarshi davlat universiteti</span>
                    <span className="signer-note">
                      {isUz ? "(Demo imzo o‘rni)" : isRu ? "(Место для подписи)" : "(Signature placeholder)"}
                    </span>
                  </div>

                  <div className="criteria-doc-seal">
                    <div className="criteria-seal-badge">
                      <Scale size={24} aria-hidden="true" />
                      <span>{isUz ? "TASDIQLANDI" : isRu ? "УТВЕРЖДЕНО" : "APPROVED"}</span>
                      <small>QARSHI DU • 2024</small>
                    </div>
                  </div>

                  <div className="criteria-doc-signer">
                    <span className="signer-role">
                      {isUz
                        ? "Bosh Portal Administratori"
                        : isRu
                        ? "Главный администратор портала"
                        : "Chief Portal Administrator"}
                    </span>
                    <span className="signer-name">ALUMNI Tahririyati</span>
                    <span className="signer-note">
                      {isUz ? "Qat’iy nazorat ta’minlandi" : isRu ? "Строгий контроль обеспечен" : "Strict governance ensured"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "criteria" && (
              <div className="criteria-cards-grid">
                <div className="criteria-card-item">
                  <div className="criteria-card-icon icon-gold">
                    <Award size={24} aria-hidden="true" />
                  </div>
                  <div className="criteria-card-content">
                    <h4>{isUz ? "1. Davlat mukofotlari va unvonlar" : isRu ? "1. Государственные награды" : "1. State Honors & Awards"}</h4>
                    <p>
                      {isUz
                        ? "O‘zbekiston Qahramoni, xizmat ko‘rsatgan fan arbobi, xalq maorifi a’lochisi, davlat orden va medallari sohibi."
                        : isRu
                        ? "Герой Узбекистана, заслуженный деятель науки, отличник образования, кавалер государственных орденов."
                        : "Hero of Uzbekistan, Honored Scientist, state orders, and highest government distinctions."}
                    </p>
                  </div>
                </div>

                <div className="criteria-card-item">
                  <div className="criteria-card-icon icon-blue">
                    <GraduationCap size={24} aria-hidden="true" />
                  </div>
                  <div className="criteria-card-content">
                    <h4>{isUz ? "2. Akademik va ilmiy nufuz" : isRu ? "2. Академический авторитет" : "2. Academic Eminence"}</h4>
                    <p>
                      {isUz
                        ? "Fan doktori (DSc), professor, akademik ilmiy darajalari, o‘z sohasida nufuzli ilmiy maktab va fundamental darsliklar yaratganlik."
                        : isRu
                        ? "Учёная степень доктора наук (DSc), профессор, академик, основатель признанной научной школы и фундаментальных трудов."
                        : "Doctor of Sciences (DSc), Full Professor, Academy fellow, author of foundational textbooks."}
                    </p>
                  </div>
                </div>

                <div className="criteria-card-item">
                  <div className="criteria-card-icon icon-green">
                    <Building2 size={24} aria-hidden="true" />
                  </div>
                  <div className="criteria-card-content">
                    <h4>{isUz ? "3. QarshiDU taraqqiyotiga hissa" : isRu ? "3. Вклад в развитие КарГУ" : "3. University Contribution"}</h4>
                    <p>
                      {isUz
                        ? "Universitetda uzoq yillik fidokorona rahbarlik, ilmiy-pedagogik faoliyat, minglab iqtidorli kadrlarni tarbiyalash."
                        : isRu
                        ? "Многолетний самоотверженный труд, научная и преподавательская деятельность, воспитание поколений специалистов."
                        : "Decades of dedicated pedagogical service, leadership, and educating thousands of successful graduates."}
                    </p>
                  </div>
                </div>

                <div className="criteria-card-item">
                  <div className="criteria-card-icon icon-purple">
                    <BookOpen size={24} aria-hidden="true" />
                  </div>
                  <div className="criteria-card-content">
                    <h4>{isUz ? "4. 15+ yillik benuqson faoliyat" : isRu ? "4. 15+ лет образцовой работы" : "4. 15+ Years Track Record"}</h4>
                    <p>
                      {isUz
                        ? "Davlat boshqaruvi, fan, ta’lim, adliya, ommaviy axborot vositalari yoki ijtimoiy sohada kamida 15 yil benuqson xizmat."
                        : isRu
                        ? "Не менее 15 лет безупречной деятельности в сфере госуправления, науки, юриспруденции, медиа или образования."
                        : "Minimum 15 years of exemplary, transparent leadership in governance, academia, law, or media."}
                    </p>
                  </div>
                </div>

                <div className="criteria-card-item">
                  <div className="criteria-card-icon icon-amber">
                    <Users size={24} aria-hidden="true" />
                  </div>
                  <div className="criteria-card-content">
                    <h4>{isUz ? "5. Jamiyatdagi yuksak obro‘ va ibrat" : isRu ? "5. Высокий авторитет и наставничество" : "5. Societal Impact & Role Model"}</h4>
                    <p>
                      {isUz
                        ? "Yoshlar uchun ma’naviy-kasbiy ibrat, yuksak axloqiy obro‘, bitiruvchilar hamjamiyatida faol murabbiylik."
                        : isRu
                        ? "Образец этики и профессионализма для молодёжи, безупречная репутация и менторская поддержка студентов."
                        : "High ethical reputation, inspiring mentor for younger generations, and champion of university values."}
                    </p>
                  </div>
                </div>

                <div className="criteria-card-item quota-card">
                  <div className="criteria-card-icon icon-navy">
                    <Sparkles size={24} aria-hidden="true" />
                  </div>
                  <div className="criteria-card-content">
                    <h4>{isUz ? "Qat’iy Kvota: 12 Nafar" : isRu ? "Строгая квота: 12 персоналий" : "Strict Quota: 12 Places"}</h4>
                    <p>
                      {isUz
                        ? "Asosiy sahifada faqatgina 12 ta profil o‘rni mavjud bo‘lib, yangi nomzodlar faqat Kengash qaroriga asosan kiritiladi."
                        : isRu
                        ? "На главной странице предусмотрено ровно 12 мест. Новые персоналии могут быть включены только по решению Совета."
                        : "The main page displays precisely 12 featured slots. New nominees may only be admitted by Academic Senate resolution."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admin" && (
              <div className="criteria-admin-governance">
                <div className="admin-governance-banner">
                  <ShieldCheck size={32} className="admin-banner-icon" aria-hidden="true" />
                  <div>
                    <h4>
                      {isUz
                        ? "Asosiy sahifa daxlsizligi va Admin kafolati"
                        : isRu
                        ? "Неприкосновенность главной страницы и гарантия администратора"
                        : "Main Page Integrity & Administrative Guarantee"}
                    </h4>
                    <p>
                      {isUz
                        ? "Asosiy sahifada chiqadigan profillar tasodifiy o‘zgarmaydi. Yangi ro‘yxatdan o‘tgan foydalanuvchilar yoki ma’lumotlar bazasidagi o‘zgarishlar asosiy sahifaga ta’sir ko‘rsatmaydi."
                        : isRu
                        ? "Профили на главной странице защищены от случайных изменений. Регистрация новых пользователей не влияет на состав главной страницы."
                        : "Profiles on the home page are strictly guarded. Registration of new users or edits will never automatically affect the home page."}
                    </p>
                  </div>
                </div>

                <div className="governance-rules-list">
                  <div className="governance-rule">
                    <div className="rule-badge">1</div>
                    <div className="rule-text">
                      <h5>{isUz ? "Faqatgina Admin o‘zgartira oladi" : isRu ? "Изменения только администратором" : "Admin-Only Control"}</h5>
                      <p>
                        {isUz
                          ? "Faqat tizim administratori Django Admin (yoki xavfsiz admin API) orqali `FeaturedAlumni` jadvaliga yozuv qo‘shish yoki olib tashlash huquqiga ega."
                          : isRu
                          ? "Только системный администратор через Django Admin имеет право добавлять или исключать записи из таблицы `FeaturedAlumni`."
                          : "Only authorized system administrators through Django Admin can add, update, or remove entries in the `FeaturedAlumni` table."}
                      </p>
                    </div>
                  </div>

                  <div className="governance-rule">
                    <div className="rule-badge">2</div>
                    <div className="rule-text">
                      <h5>{isUz ? "Ortiqcha profil qo‘shilmaydi va o‘chirilmaydi" : isRu ? "Без лишних добавлений и удалений" : "Zero Leaks or Removals"}</h5>
                      <p>
                        {isUz
                          ? "Asosiy sahifada `featured=true` filtri bilan faqat `is_honorary=True` yoki `is_featured=True` profillar chaqiriladi. Har qanday yangi a’zo bu toifaga kirmaydi."
                          : isRu
                          ? "Главная страница использует строгий фильтр `featured=true`. Новые пользователи не получают данный статус автоматически."
                          : "The main page strictly queries `featured=true`. Newly joined alumni are never given this status automatically."}
                      </p>
                    </div>
                  </div>

                  <div className="governance-rule">
                    <div className="rule-badge">3</div>
                    <div className="rule-text">
                      <h5>{isUz ? "Tartib raqami (Display Order) kafolati" : isRu ? "Гарантированный порядок отображения" : "Guaranteed Display Order"}</h5>
                      <p>
                        {isUz
                          ? "Har bir faxriy bitiruvchi uchun 1 dan 12 gacha bo‘lgan qat’iy tartib raqami belgilanadi va kesh avtomatik ravishda boshqariladi."
                          : isRu
                          ? "Каждому выпускнику присваивается строгий порядковый номер от 1 до 12, кэш очищается автоматически при сохранении."
                          : "Each honorary alumnus is assigned an explicit order from 1 to 12, with automatic cache invalidation on update."}
                      </p>
                    </div>
                  </div>

                  <div className="governance-rule">
                    <div className="rule-badge">4</div>
                    <div className="rule-text">
                      <h5>{isUz ? "Statik zaxira (Fallback Resilience)" : isRu ? "Статический резерв (Fallback)" : "Static Fallback Resilience"}</h5>
                      <p>
                        {isUz
                          ? "Server yoki tarmoq uzilishlari yuz berganda ham asosiy sahifada tasdiqlangan 12 nafar faxriy bitiruvchining rasmiy ma’lumotlari buzilmasdan chiqadi."
                          : isRu
                          ? "Даже при сетевых сбоях на главной странице отображаются проверенные 12 почётных выпускников из встроенного резерва."
                          : "Even during network or server disruptions, the verified 12 honorary alumni are reliably served via the embedded fallback."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="admin-status-summary">
                  <div className="status-item">
                    <span className="status-label">{isUz ? "Joriy kvota holati:" : isRu ? "Текущая квота:" : "Current Quota:"}</span>
                    <span className="status-val success">12 / 12 {isUz ? "to‘ldirilgan" : isRu ? "заполнено" : "filled"}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">{isUz ? "Boshqaruv usuli:" : isRu ? "Метод управления:" : "Management Method:"}</span>
                    <span className="status-val">Django Admin &middot; FeaturedAlumni</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">{isUz ? "Himoya holati:" : isRu ? "Статус защиты:" : "Protection Status:"}</span>
                    <span className="status-val locked">
                      <ShieldCheck size={14} aria-hidden="true" /> {isUz ? "Qat’iy bloklangan" : isRu ? "Строго заблокировано" : "Strictly Locked"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="criteria-dialog-footer">
            <div className="criteria-footer-notice">
              <span className="notice-dot" />
              <span>
                {isUz
                  ? "Ushbu hujjat QarshiDU ALUMNI portali talablari uchun rasmiy demo namuna hisoblanadi."
                  : isRu
                  ? "Данный документ является официальным демо-образцом требований портала ALUMNI КарГУ."
                  : "This document serves as an official demo sample of requirements for the KarSU ALUMNI portal."}
              </span>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="criteria-close-btn">
                {isUz ? "Yopish" : isRu ? "Закрыть" : "Close"}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Building2(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const size = props.size || 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
