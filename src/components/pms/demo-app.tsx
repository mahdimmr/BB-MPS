"use client";

import { useEffect, useState } from "react";

import { LocaleSwitch } from "@/components/locale-switch";
import { PmsApp } from "@/components/pms/pms-app";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  directionOf,
  isAppLocale,
  LOCALE_COOKIE,
  type AppLocale,
} from "@/lib/i18n/config";

function readStoredLocale(): AppLocale {
  try {
    const stored = window.localStorage.getItem(LOCALE_COOKIE);
    if (isAppLocale(stored)) return stored;
  } catch {
    // localStorage can be unavailable in private mode.
  }

  return DEFAULT_LOCALE;
}

export function DemoApp() {
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(readStoredLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionOf(locale);
    window.localStorage.setItem(LOCALE_COOKIE, locale);
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  }, [locale]);

  const t = getDictionary(locale);

  return (
    <PmsApp
      locale={locale}
      t={t}
      localeSwitch={
        <LocaleSwitch
          locale={locale}
          labels={{ fa: t.common.persian, en: t.common.english }}
          onChange={setLocale}
        />
      }
    />
  );
}
