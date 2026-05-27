import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import i18n from '@/i18n/config';

// テストは ja (ソース/正本) ロケールを既定にする。
// jsdom の navigator.language は en-US のため、明示しないと UI が英語化して JP テキスト assert が壊れる。
beforeEach(async () => {
  await i18n.changeLanguage('ja');
});
