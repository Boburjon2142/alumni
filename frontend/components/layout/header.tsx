"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { AuthModal } from "@/components/auth/auth-modal";
import { authSession } from "@/lib/auth";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/";
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sync = () => {
      authSession()
        .then((session) => setIsAuthenticated(Boolean(session?.authenticated)))
        .catch(() => setIsAuthenticated(false));
    };
    sync();
    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);

  useEffect(() => {
    if (!home) return;
    let frame = 0;
    const update = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / 160));
      headerRef.current?.style.setProperty("--nav-opacity", String(progress));
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [home]);

  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("nav-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("nav-open");
    };
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/alumni?search=${encodeURIComponent(searchQuery.trim())}`);
      close();
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header ref={headerRef} className={`site-header ${home ? "home-header" : ""} ${open ? "menu-open" : ""}`}>
      <div className="container nav">
        {/* Brand Logo */}
        <Link href="/" className="brand brand-logo" aria-label={`${t.university} ${t.navHome}`}>
          <img src="/images/logo.png?v=4" alt={`${t.university} logotipi`} width="420" height="120" />
        </Link>

        {/* Navigation panel */}
        <nav
          id="primary-navigation"
          className={open ? "nav-links open" : "nav-links"}
          aria-label="Asosiy navigatsiya"
        >
          <div className="nav-menu-grid">
            <Link href="/" className={`nav-item-link nav-home-link ${pathname === "/" ? "active" : ""}`} onClick={close}>
              {t.navHome}
            </Link>
            <Link
              href="/alumni"
              className={`nav-item-link ${pathname === "/alumni" || pathname.startsWith("/directory") ? "active" : ""}`}
              onClick={close}
            >
              {t.navAlumni}
            </Link>
            <Link
              href="/groups"
              className={`nav-item-link ${pathname.startsWith("/groups") ? "active" : ""}`}
              onClick={close}
            >
              {t.navGroups}
            </Link>
            <Link
              href="/interviews"
              className={`nav-item-link ${pathname.startsWith("/interviews") ? "active" : ""}`}
              onClick={close}
            >
              {t.navInterviews}
            </Link>
            <Link
              href="/advice"
              className={`nav-item-link ${pathname.startsWith("/advice") ? "active" : ""}`}
              onClick={close}
            >
              {t.navAdvice}
            </Link>
            <Link
              href="/impact"
              className={`nav-item-link ${pathname.startsWith("/impact") ? "active" : ""}`}
              onClick={close}
            >
              {t.navImpact}
            </Link>
            {!isAuthenticated && (
              <Link
                href="/join"
                className={`nav-item-link nav-join-link ${pathname === "/join" ? "active" : ""}`}
                onClick={close}
              >
                {t.navJoin}
              </Link>
            )}
            <Link
              href="/feedback"
              className={`nav-item-link mobile-only-nav ${pathname === "/feedback" ? "active" : ""}`}
              onClick={close}
            >
              {t.navFeedback}
            </Link>
            <div className="mobile-only-auth-item">
              <AuthModal locale={locale} t={t} />
            </div>
          </div>

          {/* Search bar */}
          <form className="nav-search-form" onSubmit={handleSearch} role="search">
            <Search className="nav-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="nav-search-input"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t.search}
            />
            {searchQuery.trim() && (
              <button type="submit" className="nav-search-submit" aria-label={t.search}>
                <Search size={14} />
              </button>
            )}
          </form>
        </nav>

        {/* Right header controls: Auth + Language Switcher + Menu */}
        <div className="header-right-controls">
          <div className="desktop-header-auth">
            <AuthModal locale={locale} t={t} />
          </div>
          <LanguageSwitcher locale={locale} />
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
