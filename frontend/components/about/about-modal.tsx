"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  GraduationCap,
  Users,
  Compass,
  UserPlus,
  ArrowRight,
  X,
  Award,
} from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";

export function AboutModal({
  locale,
  t,
  trigger,
}: {
  locale: Locale;
  t: Dictionary;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const isUz = locale === "uz";
  const isRu = locale === "ru";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button type="button" className="nav-item-link">
            {t.navAbout}
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="about-dialog-overlay" />
        <Dialog.Content className="about-dialog" aria-describedby="about-dialog-desc">
          {/* Header */}
          <div className="about-dialog-heading">
            <div className="about-dialog-heading-content">
              <span className="eyebrow gold">{t.brand}</span>
              <Dialog.Title>{t.aboutTitle}</Dialog.Title>
            </div>
            <Dialog.Close
              className="about-dialog-close"
              aria-label={isUz ? "Yopish" : isRu ? "Закрыть" : "Close"}
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="about-dialog-body" id="about-dialog-desc">
            {/* Qisqacha mazmuni */}
            <div className="about-dialog-summary">
              <p>
                {isRu
                  ? "Портал почётных выпускников Каршинского государственного университета — официальная цифровая платформа, объединяющая академическое наследие, выдающихся выпускников и студенческую молодёжь. Проект призван передать богатый опыт наставников молодому поколению и укрепить связь между университетом и его выпускниками."
                  : isUz
                  ? "Qarshi davlat universiteti faxriy bitiruvchilari portali — universitetning boy akademik merosi, yetuk mutaxassislari va talaba-yoshlar o‘rtasida mustahkam aloqa o‘rnatuvchi rasmiy raqamli platformadir. Ushbu loyiha universitet tarixiga ulkan hissa qo‘shgan shaxslar tajribasini asrab-avaylash hamda yosh avlodga yetkazish maqsadida yaratilgan."
                  : "The Karshi State University Honorary Alumni Portal is an official digital ecosystem bridging academic tradition, distinguished graduates, and current students. Its mission is to preserve institutional legacy, celebrate achievement, and foster continuous mentorship."}
              </p>
            </div>

            {/* Platforma beradigan imkoniyatlar */}
            <div className="about-dialog-features-wrapper">
              <h3 className="about-dialog-section-title">
                <Award size={18} className="gold-text" aria-hidden="true" />
                {isRu
                  ? "Возможности платформы"
                  : isUz
                  ? "Platforma beradigan asosiy imkoniyatlar"
                  : "Platform Capabilities & Opportunities"}
              </h3>

              <div className="about-dialog-features-grid">
                {/* 1. Faxriy bitiruvchilar bazasi */}
                <div className="about-dialog-feature-card">
                  <div className="about-dialog-feature-icon icon-blue">
                    <GraduationCap size={22} aria-hidden="true" />
                  </div>
                  <div className="about-dialog-feature-text">
                    <h4>
                      {isRu
                        ? "Электронный каталог выпускников"
                        : isUz
                        ? "Faxriy bitiruvchilar arxivi"
                        : "Honorary Alumni Directory"}
                    </h4>
                    <p>
                      {isRu
                        ? "Знакомство с выдающимися деятелями науки, образования и экономики, окончившими КарГУ, их достижениями и трудовым путём."
                        : isUz
                        ? "Fan, ta’lim, davlat va jamiyat rivojiga hissa qo‘shgan bitiruvchilar, ularning erishgan yutuqlari va mehnat yo‘li bilan tanishish."
                        : "Explore verified profiles of distinguished alumni across science, education, and industry."}
                    </p>
                  </div>
                </div>

                {/* 2. Yillar bo‘yicha guruhlar */}
                <div className="about-dialog-feature-card">
                  <div className="about-dialog-feature-icon icon-gold">
                    <Users size={22} aria-hidden="true" />
                  </div>
                  <div className="about-dialog-feature-text">
                    <h4>
                      {isRu
                        ? "Сообщества по годам выпуска"
                        : isUz
                        ? "Bitiruv yillari guruhlari"
                        : "Graduation Cohorts"}
                    </h4>
                    <p>
                      {isRu
                        ? "Поиск однокурсников и коллег по годам выпуска, развитие профессионального и дружеского нетворкинга."
                        : isUz
                        ? "O‘z bitirgan yilingizdagi kursdoshlar va hamkasblarni topish, o‘zaro do‘stona va kasbiy aloqalarni yo‘lga qo‘yish."
                        : "Connect with classmates and peers by graduation year, strengthening professional ties."}
                    </p>
                  </div>
                </div>

                {/* 3. Maslahatlar */}
                <div className="about-dialog-feature-card">
                  <div className="about-dialog-feature-icon icon-green">
                    <Compass size={22} aria-hidden="true" />
                  </div>
                  <div className="about-dialog-feature-text">
                    <h4>
                      {isRu
                        ? "Наставничество и советы молодёжи"
                        : isUz
                        ? "Yoshlar uchun hayotiy maslahatlar"
                        : "Actionable Mentorship"}
                    </h4>
                    <p>
                      {isRu
                        ? "Проверенные советы опытных специалистов и наставников для студентов по карьере, лидерству и науке."
                        : isUz
                        ? "Yetakchi mutaxassislar va ustozlarning talabalar uchun kasb tanlash, ilm-fan va yetakchilik bo‘yicha sinalgan tavsiyalari."
                        : "Real-world wisdom and career advice shared by senior alumni for students and rising talents."}
                    </p>
                  </div>
                </div>

                {/* 4. Qo‘shilish */}
                <div className="about-dialog-feature-card">
                  <div className="about-dialog-feature-icon icon-purple">
                    <UserPlus size={22} aria-hidden="true" />
                  </div>
                  <div className="about-dialog-feature-text">
                    <h4>
                      {isRu
                        ? "Быстрое вступление в сообщество"
                        : isUz
                        ? "Hamjamiyatga oson qo‘shilish"
                        : "Community Onboarding"}
                    </h4>
                    <p>
                      {isRu
                        ? "Возможность для каждого выпускника заполнить короткую анкету и занять своё место в официальном сообществе."
                        : isUz
                        ? "Har bir bitiruvchi qisqa anketa orqali o‘z yili guruhidan o‘rin olishi va profilini boyitib borishi imkoniyati."
                        : "Simple registration allowing any graduate to join their cohort and maintain their alumni presence."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pastki amallar */}
            <div className="about-dialog-actions">
              <Link
                href="/alumni"
                className="button button-secondary"
                onClick={() => setOpen(false)}
              >
                {t.navAlumni}
              </Link>
              <Link
                href="/join"
                className="button button-primary"
                onClick={() => setOpen(false)}
              >
                {t.navJoin} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
