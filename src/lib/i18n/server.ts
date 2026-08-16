import { cookies } from "next/headers";

import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  directionOf,
  isAppLocale,
  LOCALE_COOKIE,
  type AppLocale,
} from "@/lib/i18n/config";

export async function getLocale(): Promise<AppLocale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;

  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getTranslations() {
  const locale = await getLocale();

  return { locale, dir: directionOf(locale), t: getDictionary(locale) };
}
