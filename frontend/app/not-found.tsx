import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function NotFound() {
  const t = getDictionary(await getLocale());
  return (
    <section className="section">
      <div className="container">
        <div className="empty-state">
          <h1>{t.notFound}</h1>
          <p>{t.notFoundText}</p>
          <Button href="/alumni">{t.backToDirectory}</Button>
        </div>
      </div>
    </section>
  );
}
