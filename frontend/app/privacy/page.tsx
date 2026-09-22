import { getDictionary, getLocale } from "@/lib/i18n";
import {
  ShieldCheck,
  Scale,
  FileCheck2,
  Lock,
  UserCheck,
  Server,
} from "lucide-react";

export const metadata = {
  title: "Maxfiylik va ishonchlilik siyosati — Qarshi davlat universiteti",
  description:
    "Qarshi davlat universiteti faxriy bitiruvchilar platformasining shaxsga doir ma’lumotlarni himoya qilish va ochiqlik bo‘yicha rasmiy maxfiylik siyosati.",
};

export default async function Privacy() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <article className="privacy-page section">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{t.privacyTitle}</h1>
          <p className="privacy-lead">{t.privacyText}</p>
          <div className="privacy-meta-badge">
            <Scale size={16} />
            <span>
              {locale === "en"
                ? "In compliance with the Law of the Republic of Uzbekistan 'On Personal Data' (No. ZRU-547)"
                : locale === "ru"
                ? "В соответствии с Законом Республики Узбекистан «О персональных данных» (№ ЗРУ-547)"
                : "O‘zbekiston Respublikasining «Shaxsga doir ma’lumotlar to‘g‘risida»gi O‘RQ-547-son Qonuni asosida"}
            </span>
          </div>
        </div>

        <div className="privacy-grid">
          {/* 1. Umumiy qoidalar va Qonuniy asos */}
          <section className="privacy-card">
            <div className="privacy-card-header">
              <div className="privacy-icon-badge">
                <Scale size={22} />
              </div>
              <div>
                <span className="privacy-section-num">01</span>
                <h2>
                  {locale === "en"
                    ? "1. General Provisions & Legal Basis"
                    : locale === "ru"
                    ? "1. Общие положения и правовые основания"
                    : "1. Umumiy qoidalar va qonuniy asoslar"}
                </h2>
              </div>
            </div>
            <div className="privacy-card-body">
              <p>
                {locale === "en"
                  ? "This Privacy and Reliability Policy regulates the relations concerning the processing, storage, and public presentation of information about honorary alumni on the official digital platform of Karshi State University. The policy is developed in strict accordance with the Constitution of the Republic of Uzbekistan, the Law 'On Personal Data' (No. ZRU-547 dated July 2, 2019), the Law 'On Guarantees and Freedom of Access to Information', and university internal editorial regulations."
                  : locale === "ru"
                  ? "Настоящая Политика конфиденциальности и достоверности регулирует отношения, связанные с обработкой, хранением и публичным представлением информации о почетных выпускниках на официальной цифровой платформе Каршинского государственного университета. Политика разработана в строгом соответствии с Конституцией Республики Узбекистан, Законом «О персональных данных» (№ ЗРУ-547 от 2 июля 2019 г.), Законом «О гарантиях и свободе доступа к информации» и внутренними регламентами университета."
                  : "Ushbu Maxfiylik va ishonchlilik siyosati Qarshi davlat universitetining rasmiy raqamli platformasida faxriy bitiruvchilar to‘g‘risidagi ma’lumotlarni shakllantirish, qayta ishlash, saqlash va ommaviy namoyish etish tartibini belgilaydi. Mazkur hujjat O‘zbekiston Respublikasi Konstitutsiyasi, 2019-yil 2-iyuldagi «Shaxsga doir ma’lumotlar to‘g‘risida»gi O‘RQ-547-son Qonuni, «Axborot erkinligi prinsiplari va kafolatlari to‘g‘risida»gi Qonun hamda universitetning ichki tahririyat reglamentiga muvofiq ishlab chiqilgan."}
              </p>
            </div>
          </section>

          {/* 2. Ommaviy ma'lumotlar tarkibi */}
          <section className="privacy-card">
            <div className="privacy-card-header">
              <div className="privacy-icon-badge">
                <FileCheck2 size={22} />
              </div>
              <div>
                <span className="privacy-section-num">02</span>
                <h2>
                  {locale === "en"
                    ? "2. Scope of Publicly Displayed Data"
                    : locale === "ru"
                    ? "2. Состав общедоступных сведений"
                    : "2. Ommaviy e’lon qilinadigan ma’lumotlar tarkibi"}
                </h2>
              </div>
            </div>
            <div className="privacy-card-body">
              <p>
                {locale === "en"
                  ? "The platform serves as an open socio-educational archive aimed at popularizing high achievements, motivating students, and preserving university history. Only verified professional data is published:"
                  : locale === "ru"
                  ? "Платформа является открытым социально-образовательным архивом, направленным на популяризацию высоких достижений, мотивацию молодежи и сохранение истории университета. В открытом доступе публикуются исключительно подтвержденные профессиональные сведения:"
                  : "Platforma universitet tarixi, ilm-fan va jamiyat rivojiga hissa qo‘shgan bitiruvchilar muvaffaqiyatini yoshlar o‘rtasida ommalashtirishga qaratilgan ochiq ma’rifiy resurs hisoblanadi. Shu maqsadda faqat rasmiy tasdiqlangan professional ma’lumotlar e’lon qilinadi:"}
              </p>
              <ul className="privacy-list">
                <li>
                  <strong>
                    {locale === "en"
                      ? "Biographical baseline:"
                      : locale === "ru"
                      ? "Базовые биографические данные:"
                      : "Asosiy biografik ma’lumotlar:"}
                  </strong>{" "}
                  {locale === "en"
                    ? "Full name, photograph/portrait, faculty, field of study, and year of graduation."
                    : locale === "ru"
                    ? "Ф.И.О., фотография/портрет, факультет, направление обучения и год выпуска."
                    : "F.I.Sh., fotosurat/portret, tamomlagan fakulteti, mutaxassisligi va bitiruv yili."}
                </li>
                <li>
                  <strong>
                    {locale === "en"
                      ? "Academic & state recognition:"
                      : locale === "ru"
                      ? "Академические и государственные заслуги:"
                      : "Ilmiy va davlat mukofotlari:"}
                  </strong>{" "}
                  {locale === "en"
                    ? "Academic degrees (PhD, DSc), titles, state awards, and verified honorary badges."
                    : locale === "ru"
                    ? "Ученые степени (PhD, DSc), звания, государственные награды и почетные звания."
                    : "Ilmiy daraja (PhD, DSc), ilmiy unvonlar, davlat mukofotlari va faxriy unvonlar."}
                </li>
                <li>
                  <strong>
                    {locale === "en"
                      ? "Career milestones:"
                      : locale === "ru"
                      ? "Профессиональная деятельность:"
                      : "Kasbiy faoliyat bosqichlari:"}
                  </strong>{" "}
                  {locale === "en"
                    ? "Current and past positions, organizations, career timeline, and published guidance for students."
                    : locale === "ru"
                    ? "Текущая и предыдущие должности, организации, этапы карьерного пути и напутствия студентам."
                    : "Egallab turgan va avvalgi lavozimlari, tashkilotlar, faoliyat yo‘li va talabalar uchun maslahatlar."}
                </li>
              </ul>
            </div>
          </section>

          {/* 3. Himoyalangan yopiq ma'lumotlar */}
          <section className="privacy-card alert-border">
            <div className="privacy-card-header">
              <div className="privacy-icon-badge danger">
                <Lock size={22} />
              </div>
              <div>
                <span className="privacy-section-num">03</span>
                <h2>
                  {locale === "en"
                    ? "3. Strictly Protected Non-Public Information"
                    : locale === "ru"
                    ? "3. Строго защищенная непубличная информация"
                    : "3. Himoyalangan yopiq ma’lumotlar daxlsizligi"}
                </h2>
              </div>
            </div>
            <div className="privacy-card-body">
              <p>
                {locale === "en"
                  ? "The University guarantees that private sensitive personal data will never be published on open web interfaces or exposed via public REST APIs under any circumstances:"
                  : locale === "ru"
                  ? "Университет гарантирует, что конфиденциальные персональные данные ни при каких обстоятельствах не публикуются в открытом интерфейсе и не передаются через публичные API:"
                  : "Universitet bitiruvchilarning daxlsiz shaxsiy ma’lumotlari ommaviy sahifalarda yoki ochiq REST API tizimlarida mutlaqo e’lon qilinmasligini va uchinchi shaxslarga berilmasligini kafolatlaydi:"}
              </p>
              <ul className="privacy-list-danger">
                <li>
                  {locale === "en"
                    ? "Personal phone numbers, private mobile lines, and home residential addresses;"
                    : locale === "ru"
                    ? "Личные номера телефонов, мобильные контакты и адреса проживания;"
                    : "Shaxsiy telefon raqamlari, mobil aloqa vositalari va yashash manzillari;"}
                </li>
                <li>
                  {locale === "en"
                    ? "Personal email accounts (unless designated for public press inquiries);"
                    : locale === "ru"
                    ? "Личные адреса электронной почты (кроме официальных публичных контактов);"
                    : "Shaxsiy elektron pochta manzillari (rasmiy ochiq aloqa rekvizitlaridan tashqari);"}
                </li>
                <li>
                  {locale === "en"
                    ? "Identity documents (Passport/ID series and numbers, PINFL, financial accounts)."
                    : locale === "ru"
                    ? "Документы, удостоверяющие личность (серия/номер паспорта/ID, ПИНФЛ, финансовые данные)."
                    : "Pasport yoki ID-karta ma’lumotlari, JShShIR (PINFL) va shaxsiy moliyaviy hisoblar."}
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Ma'lumotlarni yig'ish va verifikatsiya qilish */}
          <section className="privacy-card">
            <div className="privacy-card-header">
              <div className="privacy-icon-badge">
                <ShieldCheck size={22} />
              </div>
              <div>
                <span className="privacy-section-num">04</span>
                <h2>
                  {locale === "en"
                    ? "4. Verification & Source Transparency"
                    : locale === "ru"
                    ? "4. Сбор данных и верификация источников"
                    : "4. Ma’lumotlarni shakllantirish va verifikatsiya qilish"}
                </h2>
              </div>
            </div>
            <div className="privacy-card-body">
              <p>
                {locale === "en"
                  ? "All data presented on the platform undergoes strict fact-checking by the editorial board. Information is derived from university archives, HEMIS information system, state registries, verified media publications, or directly provided by the alumni with documented confirmation."
                  : locale === "ru"
                  ? "Все материалы перед публикацией проходят проверку редакционной коллегией. Источниками служат архивные документы университета, база информационной системы HEMIS, официальные государственные реестры, подтвержденные публикации в СМИ или материалы, предоставленные самими выпускниками."
                  : "Platformada taqdim etilgan barcha ma’lumotlar tahririyat guruhi tomonidan qat’iy tekshiruvdan o‘tkaziladi. Ma’lumotlar manbai sifatida universitet arxivi, HEMIS axborot tizimi, rasmiy davlat reyestrlari, ommaviy axborot vositalaridagi tasdiqlangan manbalar hamda bitiruvchilarning o‘zlari taqdim etgan hujjatli dalillar xizmat qiladi."}
              </p>
            </div>
          </section>

          {/* 5. Bitiruvchining huquqlari */}
          <section className="privacy-card">
            <div className="privacy-card-header">
              <div className="privacy-icon-badge">
                <UserCheck size={22} />
              </div>
              <div>
                <span className="privacy-section-num">05</span>
                <h2>
                  {locale === "en"
                    ? "5. Alumni Rights: Updating & Removal of Data"
                    : locale === "ru"
                    ? "5. Права выпускника: уточнение и удаление данных"
                    : "5. Bitiruvchining huquqlari: ma’lumotlarni tahrirlash va o‘chirish"}
                </h2>
              </div>
            </div>
            <div className="privacy-card-body">
              <p>
                {locale === "en"
                  ? "In accordance with Article 9 of the Law 'On Personal Data', every alumnus has full rights to:"
                  : locale === "ru"
                  ? "В соответствии со статьей 9 Закона «О персональных данных» каждый выпускник имеет право:"
                  : "«Shaxsga doir ma’lumotlar to‘g‘risida»gi Qonunning 9-moddasiga muvofiq, har bir bitiruvchi quyidagi huquqlarga ega:"}
              </p>
              <ul className="privacy-list">
                <li>
                  {locale === "en"
                    ? "Request information regarding the storage and presentation of their profile;"
                    : locale === "ru"
                    ? "Ознакомиться с составом и источниками опубликованных данных о себе;"
                    : "O‘zi haqidagi e’lon qilingan ma’lumotlar tarkibi va manbalari bilan to‘liq tanishish;"}
                </li>
                <li>
                  {locale === "en"
                    ? "Request corrections, updates, or additions to their career and biographical information;"
                    : locale === "ru"
                    ? "Требовать внесения уточнений, обновлений или дополнений в карьерную информацию;"
                    : "Lavozim, yutuqlar yoki ilmiy faoliyatiga oid yangi ma’lumotlarni kiritish yoki yangilashni talab qilish;"}
                </li>
                <li>
                  {locale === "en"
                    ? "Request withdrawal or deletion of their profile from the public directory by submitting an official application."
                    : locale === "ru"
                    ? "Запросить отзыв или полное удаление профиля из публичного каталога через официальное обращение."
                    : "Rasmiy murojaat yoki «Taklif va savollar» bo‘limi orqali o‘z profilini platformadan vaqtincha yoki to‘liq olib tashlashni (o‘chirishni) talab qilish."}
                </li>
              </ul>
            </div>
          </section>

          {/* 6. Texnik xavfsizlik */}
          <section className="privacy-card">
            <div className="privacy-card-header">
              <div className="privacy-icon-badge">
                <Server size={22} />
              </div>
              <div>
                <span className="privacy-section-num">06</span>
                <h2>
                  {locale === "en"
                    ? "6. Information Security & Technical Safeguards"
                    : locale === "ru"
                    ? "6. Информационная безопасность и техническая защита"
                    : "6. Axborot xavfsizligi va texnik himoya choralari"}
                </h2>
              </div>
            </div>
            <div className="privacy-card-body">
              <p>
                {locale === "en"
                  ? "The platform employs modern technical and organizational measures to prevent unauthorized access, tampering, or loss of information: encrypted data transmission via SSL/TLS protocols, role-based database access, distributed server backups, and continuous audit logging."
                  : locale === "ru"
                  ? "Для предотвращения несанкционированного доступа, искажения или утери данных применяются современные технические стандарты: шифрование сетевого трафика по протоколу SSL/TLS, многоуровневое разграничение прав доступа, регулярное резервное копирование и мониторинг безопасности."
                  : "Ma’lumotlarning butunligi va xavfsizligini ta’minlash maqsadida xalqaro standartlarga mos himoya choralari qo‘llaniladi: SSL/TLS protokoli orqali shifrlangan tarmoq aloqasi, ma’lumotlar bazasiga darajali kirish huquqlari (RBAC), serverlarning muntazam zaxira nusxalash tizimi hamda xavfsizlik monitoringi."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
