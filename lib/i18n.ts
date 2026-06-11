import { defaultLocale, isLocale, type Locale } from "@/config/i18n";
import type { LocalizedString } from "@/types/models";

export function localized(value: LocalizedString, locale: Locale) {
  return value[locale] ?? value[defaultLocale];
}

export function localePath(locale: Locale, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function getLocaleFromParams(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}
