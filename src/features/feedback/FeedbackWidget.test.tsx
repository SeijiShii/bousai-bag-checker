import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackWidget } from './FeedbackWidget';

describe('FeedbackWidget (O40)', () => {
  it('UC5: 👍 で reaction 送信 → お礼表示', () => {
    const onSubmit = vi.fn();
    render(<FeedbackWidget onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: '良い' }));
    expect(onSubmit).toHaveBeenCalledWith({ type: 'reaction', reaction: 'up' });
    expect(screen.getByText('ありがとうございます。')).toBeInTheDocument();
  });

  it('UC5: バグ報告フォームで bug 送信', () => {
    const onSubmit = vi.fn();
    render(<FeedbackWidget onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: '不具合を報告' }));
    fireEvent.change(screen.getByLabelText('不具合の内容'), { target: { value: '保存できない' } });
    fireEvent.click(screen.getByRole('button', { name: '送信' }));
    expect(onSubmit).toHaveBeenCalledWith({ type: 'bug', payload: '保存できない' });
  });
});
