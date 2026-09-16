import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export function TermsContent({ locale }: { locale: Locale }) {
  return <>
          <section className="terms-block">
            <div className="terms-block-header">
              <ShieldCheck size={24} className="gold" />
              <h2>1. {locale === "en" ? "Purpose of Data Processing" : locale === "ru" ? "Цель обработки данных" : "Ma’lumotlarni to‘plash va qayta ishlash maqsadi"}</h2>
            </div>
            <p>
              {locale === "en"
                ? "The KarSU Alumni Portal is designed to maintain an accurate historical registry of university graduates, showcase distinguished alumni achievements, facilitate graduation year connections, and foster academic collaboration."
                : locale === "ru"
                ? "Портал выпускников КарГУ создан для сохранения академического архива университета, демонстрации профессиональных достижений выпускников, организации групп по годам выпуска и укрепления связей между поколениями."
                : "QarshiDU bitiruvchilar portali universitetning bitiruvchilari to‘g‘risidagi akademik xotirani saqlash, ularning professional yutuqlarini keng jamoatchilikka namoyish etish, bitirgan yillar bo‘yicha guruhlarni shakllantirish hamda universitet bilan bitiruvchilar o‘rtasida mustahkam aloqa o‘rnatish maqsadida tashkil etilgan."}
            </p>
          </section>

          <section className="terms-block">
            <div className="terms-block-header">
              <CheckCircle2 size={24} className="gold" />
              <h2>2. {locale === "en" ? "Categories of Collected Data" : locale === "ru" ? "Состав собираемых сведений" : "Yig‘iladigan ma’lumotlar tarkibi"}</h2>
            </div>
            <ul className="terms-list">
              <li>
                <strong>{locale === "en" ? "Public Information:" : locale === "ru" ? "Публичные сведения:" : "Ommaviy e’lon qilinadigan ma’lumotlar:"}</strong>{" "}
                {locale === "en"
                  ? "Full Name, graduation year, current professional activity/position, brief career biography/achievements, and profile photo."
                  : locale === "ru"
                  ? "Ф.И.О., год выпуска, текущее место работы и должность, краткая биография/достижения, фотография профиля."
                  : "F.I.Sh., bitirgan yil, hozirgi ish faoliyati va lavozimi, qisqacha tarjimai hol va yutuqlar hamda profil fotosurati."}
              </li>
              <li>
                <strong>{locale === "en" ? "Confidential Information:" : locale === "ru" ? "Конфиденциальные сведения:" : "Yopiq va maxfiy ma’lumotlar:"}</strong>{" "}
                {locale === "en"
                  ? "Contact email address and submission technical metadata (IP address, timestamp) are solely accessible by authorized university administration for verification and direct institutional outreach. They are NEVER sold, shared with third parties, or displayed publicly."
                  : locale === "ru"
                  ? "Контактный адрес электронной почты и технические метаданные (IP-адрес, время отправки) доступны только уполномоченным сотрудникам университета для верификации и институциональной связи. Они НИКОГДА не публикуются и не передаются третьим лицам."
                  : "Aloqa uchun elektron pochta manzili va yuborishning texnik metama’lumotlari (IP manzil, vaqt) faqat vakolatli universitet ma’muriyati uchun ochiq bo‘lib, tekshirish va rasmiy aloqa maqsadlarida foydalaniladi. Ushbu ma’lumotlar hech qachon ommaga e’lon qilinmaydi va uchinchi shaxslarga berilmaydi."}
              </li>
            </ul>
          </section>

          <section className="terms-block">
            <div className="terms-block-header">
              <Lock size={24} className="gold" />
              <h2>3. {locale === "en" ? "Editorial Moderation & Verification" : locale === "ru" ? "Редакционная модерация" : "Tahririyat moderatsiyasi va tasdiqlash"}</h2>
            </div>
            <p>
              {locale === "en"
                ? "Submitted applications do not appear publicly immediately. Each profile undergoes verification by the university editorial staff. The university reserves the right to reject submissions containing inaccurate, offensive, or fraudulent data."
                : locale === "ru"
                ? "Отправленные анкеты не публикуются автоматически. Каждый профиль проходит проверку редакционной коллегией университета. Администрация оставляет за собой право отклонять некорректные или недостоверные данные."
                : "Yuborilgan anketalar darhol ommaviy ko‘rinishga o‘tmaydi. Har bir profil universitet tahririyati tomonidan ko‘rib chiqiladi. Universitet asossiz, nomaqbul yoki noaniq ma’lumotlar kiritilgan anketalarni rad etish huquqiga ega."}
            </p>
          </section>

  </>;
}
