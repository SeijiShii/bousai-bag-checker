# 実装レポート: _shared/legal

## 実装日時
2026-05-27 (JST) / **モード**: feature (cross-cutting)

## 関連ドキュメント
- 001/002/003 (_shared/legal) / [AI_LOG](../../AI_LOG/D20260527_024_tdd__shared_legal.md)

## 変更一覧
- `src/features/legal/privacy.tsx`: 必須5セクション(取得情報/利用目的/委託先/保管期間/開示請求)
- `src/features/legal/terms.tsx`: 防災情報免責(`DISCLAIMER_TEXT`「公的情報に従う」)
- `src/features/legal/tokushoho.tsx`: 投げ銭表記(`TIP_NOTICE` 任意/追加機能なし/返金不可、O43)+ 運営者情報
- `src/components/layout/footer.tsx`: 法務3リンク + 控えめメイカー文脈(§4.8.4)

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 公開前 human | 法令本文の最終確認は公開前に人間レビュー(§9.3、論点-S-legal-1)。構造/必須項目は実装で担保 |
| ルーティング | /legal/* ルート配線は app shell bootstrap(後続)。ページ components は単体で render テスト済 |

## PR Description
### 概要
プライバシー/利用規約/特商法(投げ銭)の静的ページ + フッタ導線 + 免責。投げ銭の任意性(O43)を明示。
### テスト
4 テスト green(必須セクション存在 / 免責 / 投げ銭透明性 / フッタリンク)。typecheck clean。
