import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLOR_MAP } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeToMinutes = (time: string | null) => {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Schedule Color Logic:
 * - In "All" view (multiple children): Use child's color for quick identification
 * - In "Filtered" view (single child): Use academy's color for variety
 */
export function getScheduleColor(
  childColor: string,
  academyColor: string,
  isFiltered: boolean
) {
  const colorKey = isFiltered ? academyColor : childColor;
  return COLOR_MAP[colorKey as keyof typeof COLOR_MAP] || COLOR_MAP.indigo;
}

export function formatPhone(value: string) {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
}

/**
 * Returns a YYYY-MM-DD string formatted in the LOCAL timezone,
 * avoiding the UTC timezone shift issues of toISOString().
 */
export function formatDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
