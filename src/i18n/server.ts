import { cookies } from "next/headers";
import {
  getMessages,
  LANGUAGE_COOKIE_KEY,
  normalizeLocale,
  type Locale,
} from "@/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value);
}

export async function getRequestI18n() {
  const locale = await getRequestLocale();

  return {
    locale,
    messages: getMessages(locale),
  };
}
