import { en } from "./en";
import { zh } from "./zh";
import type { Locale } from "@/config/i18n";

export const dictionaries = { en, zh };
type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Dictionary = DeepString<typeof en>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
