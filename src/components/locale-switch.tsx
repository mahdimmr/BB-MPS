import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, type AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/// Direction switching happens on the server: the cookie drives `dir` on <html>,
/// so the layout flips without any client-side hydration.
export function LocaleSwitch({
  locale,
  labels,
}: {
  locale: AppLocale;
  labels: Record<AppLocale, string>;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1"
      role="group"
    >
      {LOCALES.map((option) => (
        <form key={option} action={setLocaleAction.bind(null, option)}>
          <button
            type="submit"
            aria-pressed={option === locale}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              option === locale ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {labels[option]}
          </button>
        </form>
      ))}
    </div>
  );
}
