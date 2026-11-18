'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ADMIN_MESSAGES,
  type AdminMessages,
  type AppLocale,
  CHROME_MESSAGES,
  type ChromeMessages,
  COMMERCE_MESSAGES,
  type CommerceMessages,
  DEFAULT_LOCALE,
  DIFFICULTY_BY_LOCALE,
  formatDateByLocale,
  formatMoney,
  HOME_MESSAGES,
  type HomeMessages,
  isValidLocale,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  type LocaleMeta,
  localizeProduct,
  localizeScenario,
  ORDER_STATUS_BY_LOCALE,
  PRODUCT_TYPE_BY_LOCALE,
  SOURCE_TYPE_BY_LOCALE,
  translateIndustry,
} from '@/lib/i18n';
import type {
  OrderStatus,
  ProductSourceType,
  ProductType,
  ScenarioDifficulty,
} from '@/types/api';

interface LocaleContextValue {
  locale: AppLocale;
  meta: LocaleMeta;
  setLocale: (next: AppLocale) => void;
  chrome: ChromeMessages;
  home: HomeMessages;
  commerce: CommerceMessages;
  admin: AdminMessages;
  formatPrice: (amountVnd: number) => string;
  formatDate: (iso: string | null | undefined) => string;
  getProductTypeLabel: (type: ProductType) => string;
  getSourceMeta: (
    source: ProductSourceType
  ) => { label: string; badgeTone: 'success' | 'info' | 'accent'; summary: string };
  getOrderStatusMeta: (
    status: OrderStatus
  ) => { label: string; tone: 'warning' | 'success' | 'danger' | 'info' };
  getDifficultyLabel: (difficulty: ScenarioDifficulty) => string;
  getIndustryLabel: (industry: string) => string;
  getProductCopy: <
    T extends { slug: string; name: string; short_description: string; description?: string },
  >(
    item: T
  ) => T;
  getScenarioCopy: <
    T extends {
      code: string;
      title: string;
      persona?: string;
      channel?: string;
      prompt_text: string;
    },
  >(
    scenario: T
  ) => T;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function applyLocaleToDocument(next: AppLocale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = next;
  document.documentElement.setAttribute('data-locale', next);
  document.title = LOCALE_META[next].siteTitle;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
        if (isValidLocale(stored)) {
          setLocaleState(stored);
          if (stored !== DEFAULT_LOCALE) {
            applyLocaleToDocument(stored);
          }
        }
      } catch {
        // Ignore restricted storage mode
      }
    }, 0);

    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY && isValidLocale(event.newValue)) {
        setLocaleState(event.newValue);
        applyLocaleToDocument(event.newValue);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    applyLocaleToDocument(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const productTypeMap = PRODUCT_TYPE_BY_LOCALE[locale];
    const sourceMap = SOURCE_TYPE_BY_LOCALE[locale];
    const statusMap = ORDER_STATUS_BY_LOCALE[locale];
    const diffMap = DIFFICULTY_BY_LOCALE[locale];

    return {
      locale,
      meta: LOCALE_META[locale],
      setLocale,
      chrome: CHROME_MESSAGES[locale],
      home: HOME_MESSAGES[locale],
      commerce: COMMERCE_MESSAGES[locale],
      admin: ADMIN_MESSAGES[locale],
      formatPrice: (amountVnd: number) => formatMoney(amountVnd, locale),
      formatDate: (iso: string | null | undefined) => formatDateByLocale(iso, locale),
      getProductTypeLabel: (type: ProductType) => productTypeMap[type] ?? type,
      getSourceMeta: (source: ProductSourceType) => sourceMap[source],
      getOrderStatusMeta: (status: OrderStatus) => statusMap[status],
      getDifficultyLabel: (difficulty: ScenarioDifficulty) => diffMap[difficulty] ?? difficulty,
      getIndustryLabel: (industry: string) => translateIndustry(industry, locale),
      getProductCopy: (item) => localizeProduct(item, locale),
      getScenarioCopy: (scenario) => localizeScenario(scenario, locale),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return ctx;
}
