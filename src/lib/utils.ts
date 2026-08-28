import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatTimeOnly(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    timeStyle: "short",
  }).format(d);
}

export function calculateAge(birthDateString: string): number {
  const birth = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function maskName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part.slice(0, 2) + "*".repeat(part.length - 2);
    })
    .join(" ");
}
