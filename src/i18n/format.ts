import type { Locale } from './config';

// ロケール → Intl 用 BCP47 タグ。zh-Hans はそのまま Intl が解釈可能。
const INTL_LOCALE: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  'zh-Hans': 'zh-Hans',
  ko: 'ko-KR',
};

/** ロケール整形した日付文字列 (期限表示等)。無効日付は空文字。 */
export function formatDate(date: Date | string | number, locale: Locale): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'medium' }).format(d);
}

/** ロケール整形した数値文字列。 */
export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(n);
}
