"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarCheck,
  ExternalLink,
  Flame,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Mic,
  Users,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useAdminSidebar } from "@/components/admin/admin-sidebar-context";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/alumni", label: "Bitiruvchilar", icon: Users },
  { href: "/admin/recognitions", label: "Faxriy unvonlar", icon: Award },
  { href: "/admin/stories", label: "Muvaffaqiyat hikoyalari", icon: BookOpen },
  { href: "/admin/interviews", label: "Intervyular", icon: Mic },
  { href: "/admin/advice", label: "Maslahatlar", icon: Lightbulb },
  { href: "/admin/feedback", label: "Murojaatlar qutisi", icon: Inbox },
  { href: "/admin/requests", label: "Bitiruv yili so‘rovlari", icon: CalendarCheck },
  { href: "/admin/impact", label: "Hissalar verifikatsiyasi", icon: Flame },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useAdminSidebar();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/admin/login");
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const handleNavClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand-group">
          <div className="admin-sidebar-logo" title="QarDU ALUMNI">
            <GraduationCap style={{ width: 22, height: 22 }} />
          </div>
          
          {!isCollapsed && (
            <div className="admin-sidebar-brand-text">
              <div className="admin-sidebar-title">
                QarDU ALUMNI
              </div>
              <div className="admin-sidebar-subtitle">
                Boshqaruv Paneli
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`admin-nav-item ${isActive ? "active" : ""}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              {!isCollapsed && (
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="admin-sidebar-footer">
        <Link
          href="/"
          target="_blank"
          className="admin-footer-link"
          title={isCollapsed ? "Asosiy portalni ko‘rish" : undefined}
        >
          <ExternalLink style={{ width: 16, height: 16, flexShrink: 0 }} />
          {!isCollapsed && <span>Asosiy portalni ko‘rish</span>}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="admin-logout-btn"
          title={isCollapsed ? "Tizimdan chiqish" : undefined}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
          {!isCollapsed && <span>Tizimdan chiqish</span>}
        </button>
      </div>
    </aside>
  );
}
