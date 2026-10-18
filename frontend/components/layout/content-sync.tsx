"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ContentSync() {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => router.refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "site-content-changed") refresh();
    };
    window.addEventListener("site-content-changed", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("site-content-changed", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [router]);
  return null;
}
