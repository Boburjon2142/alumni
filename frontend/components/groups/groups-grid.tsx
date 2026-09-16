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
          >
            <div className="group-card-top">
              <div className="group-year-badge">
                <Calendar size={18} aria-hidden="true" />
                <span>{group.year}-yil</span>
              </div>
              <div className="group-count-badge">
                <Users size={15} aria-hidden="true" />
                <span>{countLabel}</span>
              </div>
            </div>

            <div className="group-card-body">
              <h3>{group.title}</h3>
              <p className="group-subtitle">{group.subtitle}</p>
            </div>

            <div className="group-card-footer">
              <span className="group-cta-text">
                {t.groupCardCta} <ArrowRight size={15} aria-hidden="true" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
