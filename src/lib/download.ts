/** テキストをファイルとしてダウンロード (ブラウザのみ。非対応環境は no-op)。 */
export function downloadTextFile(filename: string, content: string, mime = 'text/csv'): void {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  // BOM 付きで Excel の文字化けを回避
  const blob = new Blob(['﻿', content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
