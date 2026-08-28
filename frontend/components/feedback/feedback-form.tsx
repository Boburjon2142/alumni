"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  Send,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  FilePlus2,
  MessageSquare,
  ChevronDown,
  User,
  Mail,
  FileText,
  Loader2,
} from "lucide-react";
import { sendFeedback } from "@/lib/api";
import type { FeedbackPayload } from "@/types/alumni";
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
  const [type, setType] = useState<FeedbackPayload["type"]>("proposal");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const types = [
    {
      value: "proposal" as const,
      label: t.feedbackTypeProposal,
      icon: Lightbulb,
      desc:
        locale === "ru"
          ? "Идеи и предложения по развитию"
          : locale === "en"
          ? "Ideas and platform proposals"
          : "Rivojlantirish bo‘yicha takliflar",
      colorClass: "type-proposal",
    },
    {
      value: "question" as const,
      label: t.feedbackTypeQuestion,
      icon: HelpCircle,
      desc:
        locale === "ru"
          ? "Вопросы администрации университета"
          : locale === "en"
          ? "Inquiries to university admin"
          : "Universitet ma’muriyatiga savol",
      colorClass: "type-question",
    },
    {
      value: "error_report" as const,
      label: t.feedbackTypeError,
      icon: AlertTriangle,
      desc:
        locale === "ru"
          ? "Исправление неточностей в данных"
          : locale === "en"
          ? "Correction of data inaccuracies"
          : "Ma’lumotdagi xatolikni tuzatish",
      colorClass: "type-error",
    },
    {
      value: "additional_info" as const,
      label: t.feedbackTypeAddInfo,
      icon: FilePlus2,
      desc:
        locale === "ru"
          ? "Дополнение к биографии выпускника"
          : locale === "en"
          ? "Supplementary biographical data"
          : "Biografiyaga qo‘shimcha kiritish",
      colorClass: "type-info",
    },
    {
      value: "other" as const,
      label: t.feedbackTypeOther,
      icon: MessageSquare,
      desc:
        locale === "ru"
          ? "Другие обращения и отзывы"
          : locale === "en"
          ? "Other messages and inquiries"
          : "Boshqa turdagi murojaatlar",
      colorClass: "type-other",
    },
  ];

  const selectedType = types.find((item) => item.value === type) || types[0];
  const SelectedIcon = selectedType.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg(t.feedbackError);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await sendFeedback({
        type,
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        message: message.trim(),
        page_url: initialUrl || (typeof window !== "undefined" ? window.location.href : "http://89.39.95.153/feedback"),
        page_type: initialStoryId ? "story_detail" : "feedback_page",
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Feedback form error:", err);
      setErrorMsg(err?.message || t.feedbackError);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setContact("");
    setMessage("");
    setType("proposal");
    setSubmitted(false);
    setErrorMsg("");
  };

  return (
    <div className="feedback-card-wrapper">
      {submitted ? (
        <div className="feedback-success-card" role="alert">
          <div className="feedback-success-icon-badge">
            <CheckCircle2 size={44} />
          </div>
          <h2>{t.feedbackSuccessTitle}</h2>
          <p>{t.feedbackSuccessText}</p>
          <button
            type="button"
            onClick={handleReset}
            className="button button-primary feedback-reset-btn"
          >
            {t.feedbackSendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="feedback-form-styled">
          {errorMsg && (
            <div className="feedback-error-banner" role="alert">
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Custom Modern Dropdown & Type Selector */}
          <div className="feedback-field-group">
            <label className="feedback-field-label">
              <span>{t.feedbackType}</span>
              <span className="required-star">*</span>
            </label>

            <div 
              className="custom-dropdown-container" 
              ref={dropdownRef}
              onKeyDown={(e) => {
                if (!dropdownOpen) {
                  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDropdownOpen(true);
                    setFocusedIndex(types.findIndex(t => t.value === type));
                  }
                  return;
                }
                
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setFocusedIndex((prev) => (prev + 1) % types.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setFocusedIndex((prev) => (prev - 1 + types.length) % types.length);
                } else if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (focusedIndex >= 0) {
                    setType(types[focusedIndex].value);
                    setDropdownOpen(false);
                    triggerRef.current?.focus();
                  }
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setDropdownOpen(false);
                  triggerRef.current?.focus();
                } else if (e.key === "Tab") {
                  setDropdownOpen(false);
                }
              }}
            >
              <button
                type="button"
                ref={triggerRef}
                className={`custom-dropdown-trigger ${dropdownOpen ? "open" : ""}`}
                onClick={() => {
                  if (!dropdownOpen) setFocusedIndex(types.findIndex(t => t.value === type));
                  setDropdownOpen((prev) => !prev);
                }}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
                aria-controls="feedback-type-options"
                aria-activedescendant={dropdownOpen && focusedIndex >= 0 ? `feedback-type-option-${types[focusedIndex].value}` : undefined}
              >
                <div className="trigger-left">
                  <div className={`trigger-icon-badge ${selectedType.colorClass}`}>
                    <SelectedIcon size={18} />
                  </div>
                  <div className="trigger-text">
                    <strong>{selectedType.label}</strong>
                    <span>{selectedType.desc}</span>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`trigger-chevron ${dropdownOpen ? "rotate" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div id="feedback-type-options" className="custom-dropdown-menu" role="listbox">
                  {types.map((item, index) => {
                    const ItemIcon = item.icon;
                    const isSelected = item.value === type;
                    const isFocused = index === focusedIndex;
                    return (
                      <button
                        key={item.value}
                        id={`feedback-type-option-${item.value}`}
                        type="button"
                        className={`custom-dropdown-option ${isSelected ? "selected" : ""} ${isFocused ? "focused" : ""}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setType(item.value);
                          setDropdownOpen(false);
                          triggerRef.current?.focus();
                        }}
                      >
                        <div className={`option-icon-badge ${item.colorClass}`}>
                          <ItemIcon size={17} />
                        </div>
                        <div className="option-text">
                          <strong>{item.label}</strong>
                          <span>{item.desc}</span>
                        </div>
                        {isSelected && (
                          <div className="option-check">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Name and Contact 2-Column Row */}
          <div className="feedback-inputs-row">
            {/* Name */}
            <div className="feedback-field-group">
              <label htmlFor="feedback-name" className="feedback-field-label">
                <span>{t.feedbackName}</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="field-inner-icon" />
                <input
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    locale === "ru"
                      ? "Иван Иванов"
                      : locale === "en"
                      ? "John Doe"
                      : "Ali Valiyev"
                  }
                  className="feedback-input"
                  autoComplete="name"
                  maxLength={160}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="feedback-field-group">
              <label htmlFor="feedback-contact" className="feedback-field-label">
                <span>{t.feedbackContact}</span>
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="field-inner-icon" />
                <input
                  id="feedback-contact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={
                    locale === "ru"
                      ? "+998 90 123 45 67 или email@qarshidu.uz"
                      : locale === "en"
                      ? "+998 90 123 45 67 or email@qarshidu.uz"
                      : "+998 90 123 45 67 yoki email@qarshidu.uz"
                  }
                  className="feedback-input"
                  autoComplete="off"
                  maxLength={160}
                />
              </div>
              <small className="feedback-hint">{t.feedbackContactHint}</small>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="feedback-field-group">
            <label htmlFor="feedback-message" className="feedback-field-label">
              <span>{t.feedbackMessage}</span>
              <span className="required-star">*</span>
            </label>
            <div className="textarea-wrapper">
              <FileText size={18} className="textarea-corner-icon" />
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.feedbackMessagePlaceholder}
                className="feedback-textarea"
                rows={5}
                required
                minLength={5}
                maxLength={3000}
              />
            </div>
            <div className="char-count-row">
              <span>{message.length} / 3000</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="button button-primary modern-feedback-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{t.feedbackSending}</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>{t.feedbackSubmit}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
