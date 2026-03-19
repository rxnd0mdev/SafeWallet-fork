"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import {
  DEFAULT_LOCALE,
  getMessages,
  isSupportedLocale,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_STORAGE_KEY,
  type Locale,
  type Messages,
} from "@/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
};

const LANGUAGE_EVENT = "safewallet:locale-change";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readPersistedLocale(): Locale | null {
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

function persistLocale(locale: Locale) {
  if (typeof window === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: locale }));
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const syncLocale = () => {
      const nextLocale = readPersistedLocale();

      if (nextLocale && nextLocale !== locale) {
        setLocaleState(nextLocale);
      }
    };

    syncLocale();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === LANGUAGE_STORAGE_KEY) {
        syncLocale();
      }
    };

    const handleLanguageEvent = () => {
      syncLocale();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LANGUAGE_EVENT, handleLanguageEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LANGUAGE_EVENT, handleLanguageEvent);
    };
  }, [locale]);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    startTransition(() => {
      setLocaleState(nextLocale);
    });
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: getMessages(locale),
    }),
    [locale, setLocale]
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
