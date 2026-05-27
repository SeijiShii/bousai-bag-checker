import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocale } from './useLocale';
import i18n, { LOCALE_STORAGE_KEY } from './config';

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage('ja');
  document.documentElement.lang = '';
});

describe('useLocale', () => {
  it('U-N5: setLocale で i18n 切替 + localStorage 永続 + html lang 同期', () => {
    const { result } = renderHook(() => useLocale());
    act(() => result.current.setLocale('en'));
    expect(i18n.language).toBe('en');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('U-E2: 未対応ロケールは無視', () => {
    const { result } = renderHook(() => useLocale());
    act(() => result.current.setLocale('fr' as never));
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it('locales に 4 言語', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.locales).toEqual(['ja', 'en', 'zh-Hans', 'ko']);
  });
});
