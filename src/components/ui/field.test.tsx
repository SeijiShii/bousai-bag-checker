import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field } from './field';

describe('Field', () => {
  it('U-N4: label が常時表示され input に関連付く', () => {
    render(<Field label="数量" defaultValue={1} type="number" />);
    const input = screen.getByLabelText('数量');
    expect(input).toBeInTheDocument();
  });

  it('U-E1: error 指定で expired 色 + 補足文 + aria-invalid', () => {
    render(<Field label="品目名" error="品目名を入力してください" />);
    const input = screen.getByLabelText('品目名');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.className).toContain('border-expired');
    expect(screen.getByText('品目名を入力してください')).toBeInTheDocument();
  });
});
