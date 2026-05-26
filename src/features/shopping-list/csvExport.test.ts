import { describe, it, expect } from 'vitest';
import { toCsv } from './csvExport';

describe('toCsv (CSV インジェクション対策 SEC-003)', () => {
  it('U-P1: =/+/-/@ 始まりは ' + "' を前置(数式実行防止)", () => {
    const csv = toCsv([{ name: '=cmd()', reason: 'manual', isBought: false }]);
    expect(csv).toContain("'=cmd()");
    expect(csv).not.toMatch(/(^|,)=cmd/); // 生の =cmd で始まるセルがない
  });

  it('U-P2: +/-/@ 始まりも前置', () => {
    expect(toCsv([{ name: '+1', reason: 'manual', isBought: false }])).toContain("'+1");
    expect(toCsv([{ name: '@x', reason: 'manual', isBought: false }])).toContain("'@x");
    expect(toCsv([{ name: '-y', reason: 'manual', isBought: false }])).toContain("'-y");
  });

  it('U-P3: カンマ/引用符/改行はクオート', () => {
    const csv = toCsv([{ name: '水, 2L "備蓄"', reason: 'expired', isBought: true }]);
    expect(csv).toContain('"水, 2L ""備蓄"""');
  });

  it('通常値はヘッダ + 行', () => {
    const csv = toCsv([{ name: '乾電池', reason: 'expired', isBought: false }]);
    expect(csv.split('\r\n')[0]).toBe('品目,理由,購入済');
    expect(csv).toContain('乾電池,期限切れ,未');
  });
});
