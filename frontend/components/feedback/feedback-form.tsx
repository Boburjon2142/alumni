"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { sendFeedback } from "@/lib/api";
import type { FeedbackPayload, FeedbackType } from "@/types/alumni";
import type { Dictionary, Locale } from "@/lib/i18n";

export function FeedbackForm({
  locale,
  t,
  initialStoryId,
  initialUrl,
}: {
  locale: Locale;
  t: Dictionary;
  initialStoryId?: string;
  initialUrl?: string;
}) {
  const [type, setType] = useState<FeedbackType>("proposal");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isUz = locale === "uz";
  const isRu = locale === "ru";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeOptions: { value: FeedbackType; label: string; desc: string }[] = [
    {
      value: "proposal",
      label: t.feedbackTypeProposal || (isUz ? "Taklif" : isRu ? "Предложение" : "Proposal"),
      desc: isUz
        ? "Platformani rivojlantirish va yangi tashabbuslar bo‘yicha takliflar"
        : isRu
        ? "Предложения по развитию платформы и новым инициативам"
        : "Suggestions and initiatives for platform improvement",
    },
    {
      value: "question",
      label: t.feedbackTypeQuestion || (isUz ? "Savol" : isRu ? "Вопрос" : "Question"),
      desc: isUz
        ? "Platforma, loyihalar yoki bitiruvchilar faoliyati yuzasidan savol"
        : isRu
        ? "Вопросы по работе платформы и сообществу выпускников"
        : "Inquiries regarding the platform or alumni community",
    },
    {
      value: "error_report",
      label: t.feedbackTypeError || (isUz ? "Xato haqida xabar" : isRu ? "Сообщение об ошибке" : "Error report"),
      desc: isUz
        ? "Texnik nosozliklar yoki tizim xatoliklari haqida xabar berish"
        : isRu
        ? "Сообщение о технических сбоях или неполадках"
        : "Report a bug or technical issue",
    },
    {
      value: "other",
      label: t.feedbackTypeOther || (isUz ? "Boshqa" : isRu ? "Другое" : "Other"),
      desc: isUz
        ? "Boshqa turdagi murojaat va xabarlar"
        : isRu
        ? "Другие вопросы и обращения"
        : "Other inquiries and messages",
    },
  ];

  const currentOption = typeOptions.find((opt) => opt.value === type) || typeOptions[0];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!subject.trim()) {
      errors.subject = isUz
        ? "Iltimos, murojaat mavzusini kiriting."
        : isRu
        ? "Пожалуйста, укажите тему обращения."
        : "Please enter the request subject.";
    } else if (subject.trim().length < 3) {
      errors.subject = isUz
        ? "Mavzu kamida 3 ta belgidan iborat bo‘lishi kerak."
        : isRu
        ? "Тема должна содержать не менее 3 символов."
        : "Subject must be at least 3 characters.";
    } else if (subject.trim().length > 160) {
      errors.subject = isUz
        ? "Mavzu 160 belgidan oshmasligi kerak."
        : isRu
        ? "Тема не должна превышать 160 символов."
        : "Subject must not exceed 160 characters.";
    }

    if (!message.trim()) {
      errors.message = isUz
        ? "Iltimos, xabar matnini yozing."
        : isRu
        ? "Пожалуйста, напишите текст обращения."
        : "Please enter your message.";
    } else if (message.trim().length < 10) {
      errors.message = isUz
        ? "Xabar matni kamida 10 ta belgidan iborat bo‘lishi kerak."
        : isRu
        ? "Текст сообщения должен содержать не менее 10 символов."
        : "Message must be at least 10 characters.";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = isUz
        ? "Email formati noto‘g‘ri kiritildi."
        : isRu
        ? "Неверный формат электронной почты."
        : "Invalid email format.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload: FeedbackPayload = {
      type,
      subject: subject.trim(),
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      contact: email.trim() || phone.trim() || undefined,
      message: message.trim(),
      story: initialStoryId ? parseInt(initialStoryId, 10) : undefined,
      page_url: initialUrl || (typeof window !== "undefined" ? window.location.href : undefined),
    };

    try {
      const res: any = await sendFeedback(payload, locale);
      const resId = res?.data?.id || res?.id;
      if (resId) {
        setReferenceId(resId);
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error("Feedback submission error:", err);
      setErrorMsg(err?.message || t.feedbackError);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setType("proposal");
    setSubject("");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSubmitted(false);
    setReferenceId(null);
    setErrorMsg("");
    setValidationErrors({});
  };

  if (submitted) {
    return (
      <div className="feedback-success-card" role="status" aria-live="polite">
        <div className="feedback-success-icon-badge" aria-hidden="true">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="feedback-success-title">{t.feedbackSuccessTitle}</h2>
        <p className="feedback-success-desc">
          {t.feedbackSuccessText ||
            (isUz
              ? "Rahmat. Murojaatingiz universitet ma’muriyatiga yuborildi."
              : isRu
              ? "Спасибо. Ваше обращение отправлено администрации университета."
              : "Thank you. Your request has been sent to the university administration.")}
        </p>

        {(email || phone) && (
          <p className="feedback-success-contact-note">
            {isUz
              ? "Zarur bo‘lsa, siz bilan ko‘rsatilgan aloqa ma’lumotlari orqali bog‘lanamiz."
              : isRu
              ? "При необходимости мы свяжемся с вами по указанным контактным данным."
              : "If needed, we will contact you via your provided contact details."}
          </p>
        )}
        
        {referenceId && (
          <div className="feedback-ref-badge">
            <span className="feedback-ref-lbl">{t.feedbackRefNumber || (isUz ? "Murojaat raqami" : isRu ? "Номер обращения" : "Reference ID")}:</span>
            <strong className="feedback-ref-val">#A{referenceId}</strong>
          </div>
        )}

        <div className="feedback-success-actions">
          <button
            type="button"
            onClick={handleReset}
            className="feedback-btn-primary"
          >
            <RotateCcw size={16} />
            <span>{t.feedbackSendAnother || (isUz ? "Yana murojaat yuborish" : isRu ? "Отправить еще" : "Send Another Request")}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      {errorMsg && (
        <div className="feedback-error-banner" role="alert">
          <AlertCircle size={18} className="feedback-error-icon" />
          <div className="feedback-error-content">
            <p className="feedback-error-title">
              {isUz ? "Murojaat yuborilmadi" : isRu ? "Обращение не отправлено" : "Request failed"}
            </p>
            <p className="feedback-error-desc">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-structured-form" noValidate>
        {/* 1. MUROJAAT HAQIDA */}
        <section className="feedback-section" aria-labelledby="section-about-title">
          <h2 id="section-about-title" className="feedback-section-title">
            {t.feedbackSectionAbout || (isUz ? "Murojaat haqida" : isRu ? "О запросе" : "About the request")}
          </h2>

          <div className="feedback-fields-stack">
            {/* Murojaat turi: Custom Text-First Select */}
            <div className="feedback-form-group">
              <label htmlFor="feedback-type" className="feedback-label">
                <span>{t.feedbackType}</span>
                <span className="required-mark" aria-hidden="true">*</span>
              </label>

              {/* Accessible Native Select (visually syncs with custom trigger) */}
              <div className="feedback-custom-select-container" ref={dropdownRef}>
                <button
                  type="button"
                  id="feedback-type-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-label={currentOption.label}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`feedback-custom-select-trigger ${isDropdownOpen ? "is-open" : ""}`}
                >
                  <div className="feedback-select-text-block">
                    <span className="feedback-select-main-title">{currentOption.label}</span>
                    <span className="feedback-select-desc-text">{currentOption.desc}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`feedback-select-chevron ${isDropdownOpen ? "rotated" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown Options List */}
                {isDropdownOpen && (
                  <div className="feedback-custom-dropdown-menu" role="listbox" tabIndex={-1}>
                    {typeOptions.map((opt) => (
                      <div
                        key={opt.value}
                        role="option"
                        aria-selected={opt.value === type}
                        onClick={() => {
                          setType(opt.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`feedback-dropdown-option ${opt.value === type ? "is-selected" : ""}`}
                      >
                        <div className="feedback-option-title">{opt.label}</div>
                        <div className="feedback-option-desc">{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hidden Select for DOM & automated testing accessibility */}
                <select
                  id="feedback-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackType)}
                  className="feedback-hidden-accessible-select"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mavzu */}
            <div className="feedback-form-group">
              <label htmlFor="feedback-subject" className="feedback-label">
                <span>{t.feedbackSubject || (isUz ? "Mavzu" : isRu ? "Тема" : "Subject")}</span>
                <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <input
                id="feedback-subject"
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (validationErrors.subject) {
                    setValidationErrors((prev) => ({ ...prev, subject: "" }));
                  }
                }}
                placeholder={t.feedbackSubjectPlaceholder || (isUz ? "Murojaat mavzusini qisqacha yozing" : isRu ? "Кратко укажите тему обращения" : "Briefly write the subject")}
                className={`feedback-input ${validationErrors.subject ? "has-error" : ""}`}
                maxLength={160}
                required
                aria-required="true"
                aria-invalid={Boolean(validationErrors.subject)}
                aria-describedby={validationErrors.subject ? "subject-error" : undefined}
              />
              {validationErrors.subject && (
                <span id="subject-error" className="feedback-field-error" role="alert">
                  {validationErrors.subject}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 2. SIZ BILAN BOG‘LANISH */}
        <section className="feedback-section" aria-labelledby="section-contact-title">
          <h2 id="section-contact-title" className="feedback-section-title">
            {t.feedbackSectionContact || (isUz ? "Siz bilan bog‘lanish" : isRu ? "Контактные данные" : "Contact details")}
          </h2>

          <div className="feedback-fields-stack">
            {/* Ism */}
            <div className="feedback-form-group">
              <label htmlFor="feedback-name" className="feedback-label">
                <span>{t.feedbackName || (isUz ? "Ismingiz" : isRu ? "Ваше имя" : "Your name")}</span>
                <span className="optional-tag">({t.feedbackOptional || "ixtiyoriy"})</span>
              </label>
              <input
                id="feedback-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.feedbackNamePlaceholder || (isUz ? "Ism familiyangiz" : isRu ? "Имя и фамилия" : "Full name")}
                className="feedback-input"
                maxLength={160}
                autoComplete="name"
              />
            </div>

            {/* Email & Telefon Grid */}
            <div className="feedback-row-grid">
              <div className="feedback-form-group">
                <label htmlFor="feedback-email" className="feedback-label">
                  <span>{t.feedbackEmail || "Email"}</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder={t.feedbackEmailPlaceholder || "name@example.com"}
                  className={`feedback-input ${validationErrors.email ? "has-error" : ""}`}
                  maxLength={160}
                  autoComplete="email"
                  aria-invalid={Boolean(validationErrors.email)}
                  aria-describedby={validationErrors.email ? "email-error" : "contact-hint"}
                />
                {validationErrors.email && (
                  <span id="email-error" className="feedback-field-error" role="alert">
                    {validationErrors.email}
                  </span>
                )}
              </div>

              <div className="feedback-form-group">
                <label htmlFor="feedback-phone" className="feedback-label">
                  <span>{t.feedbackPhone || (isUz ? "Telefon" : isRu ? "Телефон" : "Phone")}</span>
                </label>
                <input
                  id="feedback-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.feedbackPhonePlaceholder || "+998 90 123 45 67"}
                  className="feedback-input"
                  maxLength={40}
                  autoComplete="tel"
                  aria-describedby="contact-hint"
                />
              </div>
            </div>

            <p id="contact-hint" className="feedback-supporting-text">
              {t.feedbackContactHint ||
                (isUz
                  ? "Javob olishni istasangiz, email yoki telefon raqamingizdan kamida bittasini kiriting."
                  : isRu
                  ? "Если хотите получить ответ, укажите email или номер телефона."
                  : "If you wish to receive a reply, please provide your email or phone number.")}
            </p>
          </div>
        </section>

        {/* 3. XABAR */}
        <section className="feedback-section" aria-labelledby="section-message-title">
          <h2 id="section-message-title" className="feedback-section-title">
            {t.feedbackSectionMessage || (isUz ? "Xabar" : isRu ? "Сообщение" : "Message")}
          </h2>

          <div className="feedback-fields-stack">
            {/* Xabar matni */}
            <div className="feedback-form-group">
              <label htmlFor="feedback-message" className="feedback-label">
                <span>{t.feedbackMessage || (isUz ? "Xabar matni" : isRu ? "Текст сообщения" : "Message text")}</span>
                <span className="required-mark" aria-hidden="true">*</span>
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationErrors.message) {
                    setValidationErrors((prev) => ({ ...prev, message: "" }));
                  }
                }}
                placeholder={t.feedbackMessagePlaceholder || (isUz ? "Savolingiz, taklifingiz yoki tuzatishingizni batafsil yozing..." : isRu ? "Подробно опишите вопрос, предложение или исправление..." : "Write your question, proposal, or correction in detail...")}
                className={`feedback-textarea ${validationErrors.message ? "has-error" : ""}`}
                rows={6}
                maxLength={3000}
                required
                aria-required="true"
                aria-invalid={Boolean(validationErrors.message)}
                aria-describedby="message-counter message-error"
              />
              <div className="feedback-textarea-footer">
                {validationErrors.message ? (
                  <span id="message-error" className="feedback-field-error" role="alert">
                    {validationErrors.message}
                  </span>
                ) : (
                  <span />
                )}
                <span id="message-counter" className="feedback-char-count">
                  {message.length} / 3000
                </span>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="feedback-privacy-note">
              <p>
                {t.feedbackPrivacyNote ||
                  (isUz
                    ? "Murojaatingiz universitet ma’muriyati tomonidan ko‘rib chiqiladi. Aloqa ma’lumotingiz faqat javob berish uchun ishlatiladi."
                    : isRu
                    ? "Ваше обращение будет рассмотрено администрацией университета. Контактные данные используются исключительно для ответа."
                    : "Your request will be reviewed by the university administration. Contact details are used only to respond to your inquiry.")}{" "}
                <Link href="/privacy" className="feedback-privacy-link">
                  {t.feedbackPrivacyLink || (isUz ? "Maxfiylik siyosati" : isRu ? "Политика конфиденциальности" : "Privacy Policy")}
                </Link>
                .
              </p>
            </div>

            {/* Submit Button */}
            <div className="feedback-actions">
              <button
                type="submit"
                disabled={loading}
                className="feedback-submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-icon" aria-hidden="true" />
                    <span>{t.feedbackSending || (isUz ? "Yuborilmoqda..." : isRu ? "Отправка..." : "Sending...")}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} aria-hidden="true" />
                    <span>{t.feedbackSubmit || (isUz ? "Murojaat yuborish" : isRu ? "Отправить обращение" : "Submit Request")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
