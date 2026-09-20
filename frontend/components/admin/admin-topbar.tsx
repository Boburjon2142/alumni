"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authSession } from "@/lib/auth";
import { Menu, ShieldCheck } from "lucide-react";
import { useAdminSidebar } from "@/components/admin/admin-sidebar-context";

const pageTitles: Record<string, string> = {
  "/admin": "Boshqaruv Paneli Umumiy Ko‘rinishi",
  "/admin/alumni": "Bitiruvchilar Ma’lumotlar Bazasi va Moderatsiya",
  "/admin/alumni/new": "Yangi Bitiruvchi Profilini Yaratish",
  "/admin/recognitions": "Tavsiyaviy Faxriy Unvonlar Tizimi",
  "/admin/stories": "Muvaffaqiyat Hikoyalari Muharriri",
  "/admin/interviews": "Eksklyuziv Intervyular Muharriri",
  "/admin/advice": "Karyera va Hayotiy Maslahatlar",
  "/admin/feedback": "Foydalanuvchilar Murojaatlari va Takliflar",
  "/admin/requests": "Bitiruv Yilini O‘zgartirish So‘rovlari",
  "/admin/impact": "Bitiruvchilar Hissasi va Ballar Verifikatsiyasi",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const { isCollapsed, toggleSidebar } = useAdminSidebar();

  useEffect(() => {
    let cancelled = false;
    authSession().then((session) => {
      if (!cancelled && session?.user) {
        setAdminUser(session.user);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith("/admin/alumni/") && pathname.endsWith("/edit")) {
      return "Bitiruvchi Profilini Tahrirlash";
    }
    if (pathname.startsWith("/admin/stories/")) return "Hikoyani Tahrirlash";
    if (pathname.startsWith("/admin/interviews/")) return "Intervyuni Tahrirlash";
    return "QarDU Alumni Administrator";
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          onClick={toggleSidebar}
          className="admin-topbar-sidebar-btn"
          title={isCollapsed ? "Sidebarni ochish" : "Sidebarni yig‘ish"}
          aria-label="Toggle sidebar"
        >
          <Menu style={{ width: 16, height: 16 }} />
          <span>Sidebar</span>
        </button>

        <div>
          <h1 className="admin-topbar-title">{getTitle()}</h1>
          <p className="admin-topbar-subtitle">Qarshi davlat universiteti ALUMNI Platformasi</p>
        </div>
      </div>

      <div className="admin-topbar-user">
        <div className="admin-user-pill">
          <div className="admin-user-icon">
            <ShieldCheck style={{ width: 16, height: 16 }} />
          </div>
          <div className="admin-user-info">
            <div className="admin-user-name">
              {adminUser?.email?.split("@")[0] || "Administrator"}
            </div>
            <div className="admin-user-role">
              {adminUser?.role || "Admin"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
