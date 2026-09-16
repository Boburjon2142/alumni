import { AccountProfile } from "@/components/auth/account-profile";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata = { title: "Profilim — QarshiDU Alumni" };

export default async function ProfilePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <section className="profile-viewport-section">
      <div className="container">
        <AccountProfile locale={locale} t={t} />
      </div>
    </section>
  );
}

