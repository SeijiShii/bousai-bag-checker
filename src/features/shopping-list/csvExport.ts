// SEC-003 / 論点-006: CSV エクスポートのインジェクション対策。
// =,+,-,@ 始まりは数式実行され得るため ' を前置。カンマ/引用符/改行はクオート。

export interface CsvRow {
  name: string;
  reason: string;
  isBought: boolean;
}

function escapeCell(value: string): string {
  let s = value ?? '';
  // 数式インジェクション対策 (Excel/Sheets)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  // CSV クオート
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

const REASON_LABEL: Record<string, string> = {
  expired: '期限切れ',
  insufficient: '不足',
  manual: '手動追加',
};

export function toCsv(rows: CsvRow[]): string {
  const header = ['品目', '理由', '購入済'];
  const lines = [
    header.join(','),
    ...rows.map((r) => [escapeCell(r.name), escapeCell(REASON_LABEL[r.reason] ?? r.reason), r.isBought ? '済' : '未'].join(',')),
  ];
  return lines.join('\r\n');
}
