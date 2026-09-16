"use client";

import type { Interview } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { InterviewCard } from "./interview-card";

export function InterviewGrid({
  interviews,
  locale,
}: {
  interviews: Interview[];
  locale: Locale;
}) {
  return (
    <div className="interview-grid">
      {interviews.map((interview) => (
        <InterviewCard
          key={interview.id || interview.slug}
          interview={interview}
          locale={locale}
        />
      ))}
    </div>
  );
}
