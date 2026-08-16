import { LocaleSwitch } from "@/components/locale-switch";
import { PmsApp } from "@/components/pms/pms-app";
import { getTranslations } from "@/lib/i18n/server";

export default async function HomePage() {
  const { locale, t } = await getTranslations();

  return (
    <PmsApp
      locale={locale}
      t={t}
      localeSwitch={
        <LocaleSwitch locale={locale} labels={{ fa: t.common.persian, en: t.common.english }} />
      }
    />
  );
}
