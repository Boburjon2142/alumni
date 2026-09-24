import { EditProfilePage } from "@/components/alumni/edit-profile-page";
import { getLocale } from "@/lib/i18n";

export const metadata = {
  title: "Profilni tahrirlash — QarshiDU Alumni",
  description: "Qarshi davlat universiteti bitiruvchilar portali profil ma’lumotlarini tahrirlash sahifasi",
};

export default async function Page() {
  const locale = await getLocale();
  return (
    <main className="min-h-screen bg-[#F8F9FC] py-8 md:py-12">
      <div className="profile-edit-wide-container">
        <EditProfilePage locale={locale} />
      </div>
    </main>
  );
}
