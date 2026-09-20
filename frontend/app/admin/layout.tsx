import type { Metadata } from "next";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata: Metadata = {
  title: "Admin Boshqaruv Paneli — QarDU ALUMNI",
  description: "Qarshi davlat universiteti ALUMNI platformasi ma’murlari uchun boshqaruv tizimi.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
