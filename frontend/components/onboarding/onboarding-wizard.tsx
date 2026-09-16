import type { Dictionary, Locale } from "@/lib/i18n";
import { AlumniForm } from "./alumni-form";

export function OnboardingWizard({ locale, t }: { locale: Locale; t: Dictionary }) {
  return <div className="onboarding-wizard-container"><AlumniForm locale={locale} t={t} /></div>;
}
