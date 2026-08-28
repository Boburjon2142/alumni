import type { Advice } from "@/types/alumni";
import type { Locale } from "@/lib/i18n";
import { AdviceCard } from "./advice-card";

export function AdviceGrid({ adviceList, locale }: { adviceList: Advice[]; locale: Locale }) {
  return (
    <div className="cards-grid advice-grid">
      {adviceList.map((item) => (
        <AdviceCard key={item.id} advice={item} locale={locale} />
      ))}
    </div>
  );
}
