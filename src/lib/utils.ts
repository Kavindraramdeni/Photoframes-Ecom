import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a price stored in paise (INR minor unit) as a rupee string. */
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** Generate a human-readable order number, e.g. PF-2026-000123 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `PF-${year}-${String(sequence).padStart(6, "0")}`;
}
