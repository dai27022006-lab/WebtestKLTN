export type AppLocale = 'vi' | 'en' | 'ru' | 'zh';

export const APP_LOCALES: readonly AppLocale[] = ['vi', 'en', 'ru', 'zh'] as const;

export const DEFAULT_LOCALE: AppLocale = 'vi';
export const LOCALE_STORAGE_KEY = 'dsa-locale';
export const USD_EXCHANGE_RATE_VND = 25_400;

export interface LocaleMeta {
  code: AppLocale;
  shortLabel: string;
  nativeName: string;
  englishName: string;
  intlLocale: string;
  siteTitle: string;
  siteDescription: string;
}

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  vi: {
    code: 'vi',
    shortLabel: 'VI',
    nativeName: 'Tiếng Việt',
    englishName: 'Vietnamese',
    intlLocale: 'vi-VN',
    siteTitle:
      'DreamTeam — Cửa Hàng Sản Phẩm Số & Trợ Lý Tư Vấn Cho Chủ Shop Nhỏ',
    siteDescription:
      'Cửa hàng Template Website, Prompt Pack AI và Workflow tự động dành cho chủ shop nhỏ 1–3 người trên Shopee, TikTok Shop và Facebook.',
  },
  en: {
    code: 'en',
    shortLabel: 'EN',
    nativeName: 'English',
    englishName: 'English',
    intlLocale: 'en-US',
    siteTitle:
      'DreamTeam — Digital Kits & Smart Advisor for Small Online Shops',
    siteDescription:
      'Ready-to-launch Website Templates, AI Prompt Packs, and Automation Workflows tailored for lean 1–3 person online shops with instant guided package recommendations.',
  },
  ru: {
    code: 'ru',
    shortLabel: 'RU',
    nativeName: 'Русский',
    englishName: 'Russian',
    intlLocale: 'ru-RU',
    siteTitle:
      'DreamTeam — Цифровые шаблоны и AI-помощник для небольших онлайн-магазинов',
    siteDescription:
      'Готовые веб-шаблоны, наборы AI-промптов и сценарии автоматизации для команд из 1–3 человек со встроенным подбором решений по бюджету.',
  },
  zh: {
    code: 'zh',
    shortLabel: 'ZH',
    nativeName: '中文',
    englishName: 'Chinese',
    intlLocale: 'zh-CN',
    siteTitle: 'DreamTeam — 面向微型电商团队的数字套件与智能选品顾问',
    siteDescription:
      '专为 1–3 人小型电商团队打造的落地页模板、AI 提示词包与自动化工作流商店，内置按预算与渠道智能推荐顾问。',
  },
};

export function isValidLocale(value: string | null | undefined): value is AppLocale {
  return value === 'vi' || value === 'en' || value === 'ru' || value === 'zh';
}

const VND_FMT = new Intl.NumberFormat('vi-VN');

export function formatMoney(amountVnd: number, locale: AppLocale = 'vi'): string {
  const safe = Math.max(0, Math.round(amountVnd));
  const vndStr = `${VND_FMT.format(safe)}đ`;
  if (locale === 'vi' || safe === 0) {
    return locale === 'vi' ? vndStr : `${vndStr} (~$0)`;
  }
  const usdApprox = Math.max(1, Math.round(safe / USD_EXCHANGE_RATE_VND));
  return `${vndStr} (~$${usdApprox})`;
}

export function formatShortBudget(amountVnd: number, locale: AppLocale): string {
  return formatMoney(amountVnd, locale);
}

export function formatDateByLocale(
  iso: string | null | undefined,
  locale: AppLocale = 'vi'
): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(LOCALE_META[locale].intlLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
