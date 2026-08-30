"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface StaffHeaderGuardProps {
  children: ReactNode;
}

export function StaffHeaderGuard({ children }: StaffHeaderGuardProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/track/")) {
    return null;
  }

  return children;
}
