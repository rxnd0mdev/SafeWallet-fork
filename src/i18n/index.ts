import { en } from "@/i18n/locales/en";
import { id } from "@/i18n/locales/id";

export const messages = {
  id,
  en,
} as const;

export type Locale = keyof typeof messages;
export type Messages = (typeof messages)[Locale];
export const DEFAULT_LOCALE: Locale = "id";
export const LANGUAGE_STORAGE_KEY = "safewallet.locale";
export const LANGUAGE_COOKIE_KEY = "safewallet-locale";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === "id" || value === "en";
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
