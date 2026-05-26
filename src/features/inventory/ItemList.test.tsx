import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemList } from './ItemList';
import { ItemForm } from './ItemForm';
import type { ItemWithFreshness } from './inventoryService';

function item(over: Partial<ItemWithFreshness>): ItemWithFreshness {
  return {
    id: 'i1',
    userId: 'u1',
    name: '水',
    category: 'water',
    quantity: 1,
    storageLocation: null,
    photoUrl: null,
    freshnessType: 'expiry',
    expiresAt: '2026-12-31',
    replaceMonths: null,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    freshness: 'fresh',
    ...over,
  };
}

describe('ItemList', () => {
  it('UC1-S1: 品目を StatusChip 付きで表示', () => {
    render(<ItemList items={[item({ name: '非常食', freshness: 'warn' })]} />);
    expect(screen.getByText('非常食')).toBeInTheDocument();
    expect(screen.getByText('そろそろ点検')).toBeInTheDocument(); // warn ラベル
  });

  it('UC1-S2: 0件は EmptyState + 追加 CTA', () => {
    const onAdd = vi.fn();
    render(<ItemList items={[]} onAdd={onAdd} />);
    expect(screen.getByText(/まだ品目が登録されていません/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '品目を追加' }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('UC3: 削除ボタンで onDelete(id)', () => {
    const onDelete = vi.fn();
    render(<ItemList items={[item({ id: 'x', name: '水' })]} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: '水を削除' }));
    expect(onDelete).toHaveBeenCalledWith('x');
  });
});

describe('ItemForm', () => {
  it('UC2-S1: 有効入力で onSubmit', () => {
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('品目名'), { target: { value: 'モバイルバッテリー' } });
    fireEvent.change(screen.getByLabelText('期限'), { target: { value: '2026-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'モバイルバッテリー', expiresAt: '2026-12-31' }));
  });

  it('UC2-S3: name 空で保存 → エラー表示、onSubmit 呼ばれない', () => {
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('期限'), { target: { value: '2026-12-31' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(screen.getByText('品目名を入力してください')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('UC2-S2: freshness=電池(交換目安)で月数入力に切替', () => {
    render(<ItemForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('鮮度種別'), { target: { value: 'replace_guide' } });
    expect(screen.getByLabelText('交換の目安(月)')).toBeInTheDocument();
  });
});
