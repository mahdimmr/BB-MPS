export const LOCALES = ["fa", "en"] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "fa";

export const LOCALE_COOKIE = "bbpms_locale";

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function directionOf(locale: AppLocale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

/// Persian UI uses Persian digits; English keeps Latin digits.
export function formatNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);
}

/// Persian dates are rendered on the Jalali calendar via the Intl API.
export function formatDate(value: Date | string, locale: AppLocale): string {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
