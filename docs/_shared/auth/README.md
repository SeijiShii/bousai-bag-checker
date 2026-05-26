# auth (横断)

認証基盤(ゲスト/段階的認証)。Clerk Anonymous → アカウント連携、データ引き継ぎ(O22)。

## このフォルダに置くドキュメント
- `001_auth (横断)_SPEC.md` — 仕様書（`/flow:feature` で生成）
- `002_auth (横断)_PLAN.md` — 実装計画書
- `003_auth (横断)_UNIT_TEST.md` — 単体テスト計画
- `004_auth (横断)_E2E_TEST.md` — E2E テスト計画
- `101_auth (横断)_IMPL_REPORT.md` — 実装レポート（`/flow:tdd` で生成）

## 関連
- 概念設計: `../../concept.md` §1.3.2
- 依存: _shared/db (優先度2, 基盤✅)
- 実装コード対応: §1.4 参照
