"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authSession } from "@/lib/auth";
import { ShieldAlert, Loader2 } from "lucide-react";
import { BrandPreloader } from "@/components/feedback/brand-preloader";

interface AdminUser {
  id: number;
  email: string;
  role: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const session = await authSession();
        if (cancelled) return;

        if (!session?.authenticated || !session?.user) {
          if (!isLoginPage) {
            router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
          }
          setUser(null);
          setLoading(false);
          return;
        }

        const currentUser = session.user as AdminUser;
        const hasAdminAccess =
          currentUser.is_staff ||
          currentUser.is_superuser ||
          ["admin", "staff"].includes(currentUser.role);

        if (!hasAdminAccess) {
          if (!isLoginPage) {
            setUnauthorized(true);
          }
          setUser(currentUser);
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setUnauthorized(false);
        if (isLoginPage) {
          router.replace("/admin");
        }
      } catch (err) {
        if (!cancelled) {
          if (!isLoginPage) {
            router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return null;
  }

  if (unauthorized) {
    return (
      <div className="admin-unauthorized-screen flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 shadow-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ruxsat cheklangan</h2>
          <p className="text-sm text-slate-600 mb-6">
            Ushbu bo‘limga faqat universitet administratorlari va mas’ul xodimlar kira oladi. Sizning hisobingiz:{" "}
            <span className="font-semibold">{user?.email}</span> ({user?.role || "bitiruvchi"}).
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Asosiy sahifaga qaytish
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0D1667] hover:bg-[#1a2580] rounded-lg transition"
            >
              Boshqa hisob bilan kirish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

