"use client";

import { usePathname } from "next/navigation";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminSidebarProvider, useAdminSidebar } from "@/components/admin/admin-sidebar-context";

function AdminPortalInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useAdminSidebar();

  return (
    <div className="admin-portal-wrapper">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar />
      <div className={`admin-main-column ${isCollapsed ? "collapsed" : ""}`}>
        <AdminTopbar />
        <main className="admin-content-area">{children}</main>
      </div>
    </div>
  );
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="admin-login-layout-wrapper">
        {children}
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <AdminSidebarProvider>
        <AdminPortalInner>{children}</AdminPortalInner>
      </AdminSidebarProvider>
    </AdminAuthGuard>
  );
}
