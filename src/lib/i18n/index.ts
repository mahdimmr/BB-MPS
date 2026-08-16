import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE, type AppLocale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { fa, type Dictionary } from "@/lib/i18n/dictionaries/fa";

const dictionaries: Record<AppLocale, Dictionary> = { fa, en };

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale];
}

function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }

  return undefined;
}

/// Locale precedence: explicit header > cookie > Accept-Language > default (fa).
export function resolveLocale(request: Request): AppLocale {
  const headerLocale = request.headers.get("x-bbpms-locale");
  if (isAppLocale(headerLocale)) return headerLocale;

  const cookieLocale = readCookie(request.headers.get("cookie"), LOCALE_COOKIE);
  if (isAppLocale(cookieLocale)) return cookieLocale;

  const accepted = request.headers.get("accept-language");
  if (accepted?.toLowerCase().startsWith("en")) return "en";

  return DEFAULT_LOCALE;
}

export type { AppLocale, Dictionary };
