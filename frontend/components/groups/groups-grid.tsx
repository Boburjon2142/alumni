"use client";

import Link from "next/link";
import { ArrowRight, Calendar, GraduationCap, Users } from "lucide-react";
import type { GraduationGroup } from "@/types/alumni";
import type { Dictionary, Locale } from "@/lib/i18n";

export function GroupsGrid({
  groups,
  locale,
  t,
}: {
  groups: GraduationGroup[];
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <div className="groups-card-grid">
      {groups.map((group) => {
        const countLabel =
          locale === "en"
            ? `${group.members_count} ${t.groupMembersCount}`
            : locale === "ru"
            ? `${group.members_count} ${t.groupMembersCount}`
            : `${group.members_count} ${t.groupMembersCount}`;

        return (
          <Link
            key={group.year}
            href={`/groups/${group.year}`}
            className="group-card-item"
            aria-label={`${group.year}-yil bitiruvchilari guruhi`}
          >
            <div className="group-card-top">
              <div className="group-year-badge">
                <Calendar size={16} aria-hidden="true" />
                <span>{group.year}-yil</span>
              </div>
              <div className="group-count-badge">
                <Users size={14} aria-hidden="true" />
                <span>{countLabel}</span>
              </div>
            </div>

            <div className="group-card-body">
              <h3 className="group-card-title">{group.title}</h3>
              <p className="group-subtitle">
                <GraduationCap size={15} aria-hidden="true" className="group-uni-icon" />
                <span>{group.subtitle || "Qarshi davlat universiteti"}</span>
              </p>
            </div>

            <div className="group-card-footer">
              <span className="group-cta-text">
                {t.groupCardCta || "Guruhni ko'rish"} <ArrowRight size={15} aria-hidden="true" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
