import { describe, it, expect, beforeAll } from 'vitest';
import i18n, { normalizeLocale } from './config';
import { formatDate, formatNumber } from './format';
import { categoryLabel, freshnessLabel } from './labels';
import ja from './locales/ja.json';
import en from './locales/en.json';
import zhHans from './locales/zh-Hans.json';
import ko from './locales/ko.json';

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? flatten(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

describe('normalizeLocale (検出/正規化)', () => {
  it('U-N1/N2/N3: 対応言語へ正規化、未対応は ja', () => {
    expect(normalizeLocale('ja')).toBe('ja');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('zh-CN')).toBe('zh-Hans');
    expect(normalizeLocale('zh')).toBe('zh-Hans');
    expect(normalizeLocale('ko-KR')).toBe('ko');
    expect(normalizeLocale('fr')).toBe('ja');
    expect(normalizeLocale(null)).toBe('ja');
    expect(normalizeLocale(undefined)).toBe('ja');
  });
});

describe('catalog key parity (U-B1 i18n 品質ゲート)', () => {
  const jaKeys = [...new Set(flatten(ja as Record<string, unknown>))].sort();
  it.each([
    ['en', en],
    ['zh-Hans', zhHans],
    ['ko', ko],
  ])('%s が ja と完全に同一のキー集合 (欠落・余剰ゼロ)', (_name, cat) => {
    const keys = [...new Set(flatten(cat as Record<string, unknown>))].sort();
    expect(keys).toEqual(jaKeys);
  });
});

describe('format (ロケール整形)', () => {
  it('U-N6: formatDate / formatNumber', () => {
    const d = new Date('2026-09-01T00:00:00Z');
    expect(formatDate(d, 'ja')).not.toBe('');
    expect(formatDate('invalid-date', 'ja')).toBe('');
    expect(formatNumber(1000, 'en')).toBe('1,000');
  });
});

describe('labels + 承認済み wording 校正反映', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('ja');
  });
  it('U-N7: enum 生値でなくロケールラベル', () => {
    expect(categoryLabel('water', i18n.t)).toBe('水');
    expect(freshnessLabel('expiry', i18n.t)).toBe('期限で管理');
  });
  it('U-N8: 承認済み校正が ja カタログに反映', () => {
    expect(i18n.t('inventory.form.category')).toBe('種類');
    expect(i18n.t('inventory.form.freshnessType')).toBe('管理のしかた');
    expect(i18n.t('shopping.generate')).toBe('買い物リストを作る');
    expect(i18n.t('status.fresh')).toBe('問題なし');
  });
  it('U-B2: interpolation (aria 完全文)', () => {
    expect(i18n.t('inventory.deleteAria', { name: '水' })).toBe('水を削除');
  });
});
