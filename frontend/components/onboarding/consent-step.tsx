"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckSquare, FileText, Lock, ShieldCheck, Square } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";

export function ConsentStep({
  locale,
  t,
  onConsentAccepted,
}: {
  locale: Locale;
  t: Dictionary;
  onConsentAccepted: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checked) {
      setError(true);
      return;
    }
    setError(false);
    onConsentAccepted();
  };

  return (
    <div className="onboarding-card consent-card">
      <div className="onboarding-step-indicator">
        <span className="step-badge active">{t.formStep1}</span>
        <span className="step-divider" aria-hidden="true" />
        <span className="step-badge disabled">{t.formStep2}</span>
      </div>

      <div className="consent-header">
        <div className="consent-icon-badge">
          <ShieldCheck size={28} className="gold" />
        </div>
        <h2>{t.consentTitle}</h2>
        <p className="consent-sublead">{t.consentSubtitle}</p>
      </div>

      <div className="consent-summary-box">
        <div className="summary-item">
          <Lock size={18} className="summary-icon" />
          <p>{t.consentSummaryText}</p>
        </div>
        <div className="summary-link-row">
          <Link href="/terms" target="_blank" className="terms-modal-link">
            <FileText size={16} /> {t.consentPolicyLinkText}
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="consent-form">
        <label className={`consent-checkbox-label ${error ? "has-error" : ""}`}>
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => {
              setChecked(e.target.checked);
              if (e.target.checked) setError(false);
            }}
          />
          <span className="custom-checkbox" aria-hidden="true">
            {checked ? <CheckSquare size={20} className="check-icon checked" /> : <Square size={20} className="check-icon" />}
          </span>
          <span className="checkbox-text">{t.consentCheckboxLabel}</span>
        </label>

        {error && (
          <p className="field-error-message" role="alert">
            {t.consentRequiredError}
          </p>
        )}

        <div className="consent-actions">
          <button
            type="submit"
            className="button button-primary onboarding-next-btn"
            disabled={!checked}
          >
            {t.consentContinueButton} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
