"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE } from "@/lib/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(requested: string) {
  const locale = isAppLocale(requested) ? requested : DEFAULT_LOCALE;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
