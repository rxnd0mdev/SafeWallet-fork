"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  detectBrowserLocale,
  isSupportedLocale,
  messages as allMessages,
  type Locale,
  type Messages,
} from "@/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
};

const LANGUAGE_STORAGE_KEY = "safewallet.locale";
const LANGUAGE_COOKIE_KEY = "safewallet-locale";
const DEFAULT_LOCALE: Locale = "id";
const subscribers = new Set<() => void>();

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLocale(stored)) {
    return stored;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LANGUAGE_COOKIE_KEY}=`))
    ?.split("=")[1];

  return isSupportedLocale(cookie) ? cookie : null;
}

function readLocaleSnapshot(): Locale {
  return getStoredLocale() ?? detectBrowserLocale();
}

function subscribe(onStoreChange: () => void) {
  subscribers.add(onStoreChange);

  if (typeof window === "undefined") {
    return () => {
      subscribers.delete(onStoreChange);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LANGUAGE_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    subscribers.delete(onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function persistLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
}

function setLocaleSnapshot(locale: Locale) {
  persistLocale(locale);
  subscribers.forEach((listener) => listener());
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    readLocaleSnapshot,
    () => DEFAULT_LOCALE
  );

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleSnapshot,
      messages: allMessages[locale],
    }),
    [locale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLocale must be used within a LanguageProvider");
  }

  return context;
}
