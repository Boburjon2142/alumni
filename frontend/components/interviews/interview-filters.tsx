"use client";

import { Lock, Search, Sparkles, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { authSession } from "@/lib/auth";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { AuthModal } from "@/components/auth/auth-modal";

export function InterviewFilters({
  locale,
  t,
  totalCount,
  translations,
}: {
  locale: Locale;
  t?: Dictionary;
  totalCount: number;
  translations: {
    search: string;
    searchPlaceholder: string;
    allInterviews: string;
    featuredInterviews: string;
    clearFilters: string;
    interviewsFound: string;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dict = t || getDictionary(locale);

  useEffect(() => {
    let mounted = true;
    const sync = () => {
      authSession()
        .then((session) => {
          if (mounted) setIsAuthenticated(Boolean(session?.authenticated));
        })
        .catch(() => {
          if (mounted) setIsAuthenticated(false);
        });
    };
    sync();
    window.addEventListener("auth-changed", sync);
    return () => {
      mounted = false;
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  const currentSearch = searchParams.get("search") || "";
  const currentFeatured = searchParams.get("featured") === "true";

  const [searchVal, setSearchVal] = useState(currentSearch);

  const applyParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === "") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    // Reset to first page upon filter change
    params.delete("page");

    startTransition(() => {
      router.push(`/interviews?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyParams({ search: searchVal.trim() || null });
  };

  const handleClear = () => {
    setSearchVal("");
    startTransition(() => {
      router.push("/interviews");
    });
  };

  const hasActiveFilters = Boolean(currentSearch || currentFeatured);

  return (
    <div className="interview-inline-search-bar">
      {/* Compact Search Form */}
      <form className="interview-search-form" onSubmit={handleSearchSubmit} role="search">
        <Search className="interview-search-icon" size={16} aria-hidden="true" />
        <input
          type="search"
          className="interview-search-input"
          placeholder={translations.searchPlaceholder}
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          aria-label={translations.search}
        />
        {searchVal && (
          <button
            type="button"
            className="interview-search-clear"
            onClick={() => {
              setSearchVal("");
              applyParams({ search: null });
            }}
            aria-label="Tozalash"
          >
            <X size={14} />
          </button>
        )}
        <button type="submit" className="button button-primary interview-search-btn" disabled={isPending}>
          {translations.search}
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="interview-quick-pills">
        <button
          type="button"
          className={`interview-pill ${!currentFeatured ? "active" : ""}`}
          onClick={() => applyParams({ featured: null })}
        >
          {translations.allInterviews}
        </button>

        {isAuthenticated ? (
          <button
            type="button"
            className={`interview-pill ${currentFeatured ? "active" : ""}`}
            onClick={() => applyParams({ featured: currentFeatured ? null : "true" })}
          >
            <Sparkles size={13} aria-hidden="true" />
            <span>{translations.featuredInterviews}</span>
          </button>
        ) : (
          <AuthModal
            locale={locale}
            t={dict}
            trigger={
              <button
                type="button"
                className="interview-pill interview-pill-locked"
                title={
                  locale === "ru"
                    ? "Доступно только для зарегистрированных пользователей"
                    : locale === "en"
                    ? "Available for registered users only"
                    : "Faqat ro‘yxatdan o‘tgan foydalanuvchilar uchun"
                }
              >
                <Lock size={12} className="interview-lock-icon" aria-hidden="true" />
                <span>{translations.featuredInterviews}</span>
              </button>
            }
          />
        )}

        {hasActiveFilters && (
          <button
            type="button"
            className="interview-clear-mini-btn"
            onClick={handleClear}
            title={translations.clearFilters}
            aria-label={translations.clearFilters}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
