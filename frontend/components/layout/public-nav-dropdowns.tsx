"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Dictionary } from "@/lib/i18n";
import styles from "./public-nav-dropdowns.module.css";

type Destination = {
  title: string;
  description: string;
  href?: string;
  aliases?: string[];
};

const matches = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function PublicNavDropdowns({ t, pathname, mobileMenuOpen, onNavigate }: {
  t: Dictionary; pathname: string; mobileMenuOpen: boolean; onNavigate: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusOnOpen = useRef<"first" | "last" | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleGroupMouseEnter = (groupId: string) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    if (!mobileMenuOpen) {
      setOpen(groupId);
    }
  };

  const handleGroupMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    if (!mobileMenuOpen) {
      hoverTimeout.current = setTimeout(() => {
        setOpen(null);
      }, 150);
    }
  };

  const groups: { id: string; title: string; items: Destination[] }[] = [
    {
      id: "platform",
      title: t.navPlatform,
      items: [
        { title: t.navHome, description: t.navHomeDesc, href: "/" },
        { title: t.navAbout, description: t.navAboutDesc, href: "/about" },
        { title: t.navFeedbackTitle, description: t.navFeedbackDesc, href: "/feedback" },
      ],
    },
    {
      id: "alumni",
      title: "Alumni",
      items: [
        { title: t.navDirectoryTitle, description: t.navDirectoryDescription, href: "/groups" },
        { title: t.navPrideTitle, description: t.navPrideDescription, href: "/alumni", aliases: ["/directory"] },
        { title: t.navStoriesTitle, description: t.navStoriesDescription, href: "/stories" },
        { title: t.navRecognitionTitle, description: t.navRecognitionDescription, href: "/impact" },
      ],
    },
    {
      id: "opportunities",
      title: t.navOpportunities,
      items: [
        { title: t.navInterviews, description: t.navInterviewsDescription, href: "/interviews" },
        { title: t.navAdvice, description: t.navAdviceDescription, href: "/advice" },
        { title: t.navResearch, description: t.navResearchDescription },
        { title: t.navVolunteering, description: t.navVolunteeringDescription },
      ],
    },
    {
      id: "news",
      title: t.navNews,
      items: [
        { title: t.navLatestNews, description: t.navLatestNewsDesc, href: "/news" },
        { title: t.navEvents, description: t.navEventsDesc },
        { title: t.navAchievements, description: t.navAchievementsDesc },
      ],
    },
  ];

  const isActive = (item: Destination) => Boolean(item.href && [item.href, ...(item.aliases ?? [])].some(href => matches(pathname, href)));

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  useEffect(() => { setOpen(null); }, [pathname, mobileMenuOpen]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(null);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      triggers.current[open]?.focus();
      setOpen(null);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    if (focusOnOpen.current) {
      const links = root.current?.querySelectorAll<HTMLAnchorElement>(`#public-${open}-menu a`);
      links?.[focusOnOpen.current === "last" ? links.length - 1 : 0]?.focus();
      focusOnOpen.current = null;
    }
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open]);

  const navigateKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 :
      (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
    links[next]?.focus();
  };

  return (
    <div ref={root} className={styles.groups} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(null);
    }}>
      {groups.map(group => {
        return (
          <div
            key={group.id}
            className={styles.group}
            onMouseEnter={() => handleGroupMouseEnter(group.id)}
            onMouseLeave={handleGroupMouseLeave}
          >
            <button
              type="button"
              ref={element => { triggers.current[group.id] = element; }}
              id={`public-${group.id}-trigger`}
              className={`nav-item-link ${styles.trigger} ${group.items.some(isActive) ? "active" : ""}`}
              aria-expanded={open === group.id}
              aria-haspopup="menu"
              aria-controls={`public-${group.id}-menu`}
              onClick={() => {
                if (hoverTimeout.current) {
                  clearTimeout(hoverTimeout.current);
                  hoverTimeout.current = null;
                }
                setOpen(open === group.id ? null : group.id);
              }}
              onKeyDown={event => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  focusOnOpen.current = event.key === "ArrowUp" ? "last" : "first";
                  if (open === group.id) {
                    const links = root.current?.querySelectorAll<HTMLAnchorElement>(`#public-${group.id}-menu a`);
                    links?.[event.key === "ArrowUp" ? links.length - 1 : 0]?.focus();
                    focusOnOpen.current = null;
                  } else setOpen(group.id);
                }
              }}
            >
              {group.title}
              <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
            </button>
            <div
              id={`public-${group.id}-menu`}
              role="menu"
              aria-labelledby={`public-${group.id}-trigger`}
              hidden={open !== group.id}
              className={`${styles.panel} ${styles.noIconPanel}`}
              onKeyDown={navigateKeys}
            >
              {group.items.map(item => {
                const active = isActive(item);
                const content = (
                  <>
                    <span className={styles.noIconCopy}>
                      <span className={styles.noIconTitle}>{item.title}</span>
                      <span className={styles.noIconDescription}>{item.description}</span>
                    </span>
                    {!item.href && <span className={styles.badge}>{t.navComingSoon}</span>}
                  </>
                );

                const itemClassName = `${styles.noIconItem} ${active ? styles.noIconSelected : ""}`;

                return item.href ? (
                  <Link
                    key={item.title}
                    href={item.href}
                    role="menuitem"
                    aria-current={active ? "page" : undefined}
                    className={itemClassName}
                    onClick={() => { setOpen(null); onNavigate(); }}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={item.title}
                    role="menuitem"
                    aria-disabled="true"
                    className={`${itemClassName} ${styles.disabled}`}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
