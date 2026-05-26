import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoButton } from './info-button';

describe('InfoButton (O41 入口の「これは何？」)', () => {
  it('U-N5: クリックでモーダルが開き concept 由来の説明を表示、閉じられる', () => {
    render(
      <InfoButton title="持ち出し袋チェッカーとは">
        防災備蓄の賞味期限・電池切れを季節ごとに点検できるアプリです。
      </InfoButton>,
    );
    // 開く前はダイアログなし
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // 丸付き「?」をクリック
    fireEvent.click(screen.getByRole('button', { name: 'このサービスについて' }));
    const dialog = screen.getByRole('dialog', { name: '持ち出し袋チェッカーとは' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.textContent).toContain('防災備蓄');
    // 閉じる
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
