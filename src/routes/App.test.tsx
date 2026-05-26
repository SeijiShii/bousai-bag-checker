import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from './App';

describe('App shell (Phase A: nav + 法務 routing + O41)', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('初期表示は品目画面 + メインナビ4タブ', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '品目', level: 2 })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'メインナビ' });
    expect(within(nav).getByRole('button', { name: /品目/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /点検/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /買い物/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /設定/ })).toBeInTheDocument();
  });

  it('タブ切替で画面が変わる (点検→買い物→設定)', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'メインナビ' });
    fireEvent.click(within(nav).getByRole('button', { name: /点検/ }));
    expect(screen.getByRole('heading', { name: '点検', level: 2 })).toBeInTheDocument();
    fireEvent.click(within(nav).getByRole('button', { name: /買い物/ }));
    expect(screen.getByRole('heading', { name: '買い物', level: 2 })).toBeInTheDocument();
    fireEvent.click(within(nav).getByRole('button', { name: /設定/ }));
    expect(screen.getByRole('heading', { name: '設定', level: 2 })).toBeInTheDocument();
  });

  it('アクティブタブに aria-current=page が付く', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'メインナビ' });
    const inspectionBtn = within(nav).getByRole('button', { name: /点検/ });
    fireEvent.click(inspectionBtn);
    expect(inspectionBtn).toHaveAttribute('aria-current', 'page');
  });

  it('O41: ヘッダにサービス説明の情報ボタンがある', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '持ち出し袋チェッカー', level: 1 })).toBeInTheDocument();
    // InfoButton (丸付き「?」) でサービスの正体を説明できる
    expect(screen.getByRole('button', { name: /このサービスについて/ })).toBeInTheDocument();
  });

  it('フッタに法務リンク3種 (無料/投げ銭の文脈)', () => {
    render(<App />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'プライバシーポリシー' })).toHaveAttribute('href', '/legal/privacy');
    expect(within(footer).getByRole('link', { name: '利用規約' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /投げ銭・運営者情報/ })).toBeInTheDocument();
  });

  it('/legal/privacy は法務ページを表示 (タブアプリを出さない)', () => {
    window.history.pushState({}, '', '/legal/privacy');
    render(<App />);
    expect(screen.queryByRole('navigation', { name: 'メインナビ' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /トップに戻る/ })).toBeInTheDocument();
  });
});
