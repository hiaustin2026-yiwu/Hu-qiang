export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const chinaLocale: Locale = "zh";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "简体中文"
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}
