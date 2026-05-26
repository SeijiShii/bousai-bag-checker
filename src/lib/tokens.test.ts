import { describe, it, expect } from 'vitest';
import { colors, FRESHNESS_STATUS } from './tokens';

describe('design-system tokens (ティールグリーン)', () => {
  it('U-N1: primary が design-system の #2E8B74', () => {
    expect(colors.primary).toBe('#2E8B74');
  });

  it('U-N3: 鮮度3段階の状態色がトークン通り', () => {
    expect(colors.fresh).toBe('#4CA085');
    expect(colors.warn).toBe('#C98A3B');
    expect(colors.expired).toBe('#C25B4E');
  });

  it('純赤 (#FF0000 系) を状態色に使わない (不安を煽らない、原則1)', () => {
    const values = Object.values(colors);
    expect(values).not.toContain('#FF0000');
    expect(values).not.toContain('#F00');
    // expired はテラコッタ (赤みはあるが純赤でない)
    expect(colors.expired).not.toBe('#FF0000');
  });

  it('鮮度状態は fresh/warn/expired の3段階', () => {
    expect(FRESHNESS_STATUS).toEqual(['fresh', 'warn', 'expired']);
  });
});
