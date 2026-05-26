import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InspectionChecklist } from './InspectionChecklist';
import type { ItemWithFreshness } from '@/features/inventory';

function item(over: Partial<ItemWithFreshness>): ItemWithFreshness {
  return {
    id: 'i1', userId: 'u1', name: '水', category: 'water', quantity: 1, storageLocation: null,
    photoUrl: null, freshnessType: 'expiry', expiresAt: '2026-12-31', replaceMonths: null, note: null,
    createdAt: new Date(), updatedAt: new Date(), freshness: 'fresh', ...over,
  };
}

describe('InspectionChecklist', () => {
  it('UC3-S1: チェック → 完了で onComplete(summary)、全fresh は全グリーン表示', () => {
    const onComplete = vi.fn();
    render(<InspectionChecklist items={[item({ id: 'a', name: '水' })]} onComplete={onComplete} />);
    fireEvent.click(screen.getByLabelText('水を確認済みにする'));
    fireEvent.click(screen.getByRole('button', { name: '点検を完了する' }));
    expect(onComplete).toHaveBeenCalledWith({ total: 1, checked: 1, needsReplace: 0 });
    expect(screen.getByText(/全部グリーン/)).toBeInTheDocument();
  });

  it('UC3-S3: items 0件は EmptyState', () => {
    render(<InspectionChecklist items={[]} onComplete={vi.fn()} />);
    expect(screen.getByText(/登録された品目がありません/)).toBeInTheDocument();
  });

  it('expired を含むと needsReplace に計上', () => {
    const onComplete = vi.fn();
    render(<InspectionChecklist items={[item({ id: 'a', freshness: 'expired' })]} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: '点検を完了する' }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ needsReplace: 1 }));
  });
});
