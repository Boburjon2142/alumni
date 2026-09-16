import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, GraduationCap, Users } from "lucide-react";
import { getAlumniGroup } from "@/lib/api";
import { getDictionary, getLocale } from "@/lib/i18n";
import { AlumniCardGrid } from "@/components/alumni/alumni-card-grid";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  const yearNum = Number(year);
  if (isNaN(yearNum) || yearNum < 1956) {
    return { title: "Guruh topilmadi — Qarshi davlat universiteti" };
  }
  return {
    title: `${year}-yil bitiruvchilari — Qarshi davlat universiteti`,
    description: `${year}-yilda Qarshi davlat universitetini tamomlagan bitiruvchilar ro‘yxati va ma’lumotlari.`,
  };
}

export default async function GroupDetailPage({ params }: Props) {
  const { year } = await params;
  const yearNum = Number(year);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum) || yearNum < 1956 || yearNum > currentYear + 1) {
    return notFound();
  }

  const locale = await getLocale();
  const t = getDictionary(locale);

  let members: import("@/types/alumni").Alumni[] = [];
  let totalCount = 0;
  let groupTitle = `${yearNum}-yil bitiruvchilari`;
  let groupDesc = `${yearNum}-yilda Qarshi davlat universitetini tamomlagan bitiruvchilar.`;

  try {
    const res = await getAlumniGroup(yearNum);
    members = res.data ?? [];
    if (res.group) {
      groupTitle = res.group.title || groupTitle;
      groupDesc = res.group.description || groupDesc;
      totalCount = res.group.members_count ?? members.length;
    } else {
      totalCount = members.length;
    }
  } catch (err) {
    console.error(`Failed to load group for year ${yearNum}:`, err);
  }

  return (
    <section className="section group-detail-page">
      <div className="container">
        {/* Back navigation */}
        <div className="group-detail-back-nav">
          <Link href="/groups" className="back-link">
            <ArrowLeft size={16} /> {t.groupDetailBack}
          </Link>
        </div>

        {/* Group Header Hero */}
        <header className="group-detail-header">
          <span className="eyebrow gold">{t.brand}</span>
          <h1>{groupTitle}</h1>
          <p className="group-detail-lead">{groupDesc}</p>

          <div className="group-detail-meta-row">
            <span className="group-meta-pill">
              <Calendar size={15} /> {yearNum}-yil
            </span>
            <span className="group-meta-pill">
              <Users size={15} /> {totalCount} {t.groupMembersCount}
            </span>
          </div>
        </header>

        {/* Member list or Empty State */}
        {members.length > 0 ? (
          <div className="group-members-container">
            <AlumniCardGrid alumni={members} locale={locale} />
          </div>
        ) : (
          <div className="empty-state group-empty-state">
            <GraduationCap size={48} className="empty-icon" />
            <h3>{t.groupDetailEmptyTitle}</h3>
            <p>{t.groupDetailEmptyText}</p>
            <Button href="/join">
              {t.groupDetailJoinCta} <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Floating / Bottom Community Banner */}
        <div className="group-cta-banner">
          <div className="banner-content">
            <h3>Siz ham {yearNum}-yil bitiruvchisimisiz?</h3>
            <p>O‘zingiz haqingizda qisqacha ma’lumot qoldiring va ushbu guruh a’zolari safidan joy oling.</p>
          </div>
          <Button href="/join">
            {t.landingCtaButton} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
