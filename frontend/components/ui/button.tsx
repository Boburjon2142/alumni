import Link from "next/link";
import type { ReactNode } from "react";
export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      className={`button button-${variant} ${className}`}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

