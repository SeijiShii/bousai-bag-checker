# AI_LOG セッション D20260527_037 — /flow:revise _shared/service-info (audit-p001)

**実行日時**: 2026-05-27 16:00 (+09:00)
**コマンド**: /flow:revise _shared/service-info (--auto, AUDIT-perspective-001 起点)
**状態**: 完了 (設計 + 実装 + テスト green)
**含まれる decision**: D20260527-093 〜 D20260527-095
**起動元**: /flow:auto (D20260527_035) §3.0c drift シューティング (audit High 撃ち落とし、CF-011)
**depends_on**: D20260527-044/045 (元 feature service-info), D20260527-091 (audit O48 判定)
**Resume Contract 準拠**

---

## 主要決定サマリ
- AUDIT High [AUDIT-perspective-001] = O48 service-info エンドポイント未配線を撃ち落とし
- `api/service-info.ts` (Vercel Function) を新設、既存 `handleServiceInfo` を無変更で配線
- 9 スモーク green + 既存 7 core 維持 + 全体 145 green、typecheck clean
- no-key Class A (実 Clerk/Stripe/Resend 不要)

## 生成・更新ファイル
- `docs/_shared/service-info/revise_audit-p001_20260527_wire-endpoint/` (README/INDEX/001/002/003/101)
- `api/service-info.ts` (新規) + `api/service-info.test.ts` (新規)
- `vitest.config.ts` (include に api/**/*.test.ts 追加)
- `docs/_shared/service-info/INDEX.md` (サブフォルダ行追加)
- `docs/AI_LOG/INDEX.md` (再生成)

## 監査 finding 解消
- [AUDIT-perspective-001] High → **解消**。`GET /api/service-info` runtime 公開 (404→200/401/429/405/503)。残: SERVICE_INFO_TOKEN 実値 + デプロイ疎通は release (P4.7)。

---

## decisions

### D20260527-093
- question: Read スコープ + 改修方針 (endpoint 配線)
- chosen: 既存 handler/collectMetrics/ratelimit/db client/handler.ts を Read。core は無変更で再利用し api/service-info.ts の wiring のみ追加 (後方互換、DB 変更なし)
- chosen_type: auto-recommended
- context: 監査で core 実装済 + 7 unit green を確認済。endpoint 配線のみが欠落。影響は api/ 1 ファイル新規
- depends_on: [D20260527-044, D20260527-091]

### D20260527-094
- question: token 受け渡しと fail-closed 設計
- chosen: Authorization: Bearer / X-Service-Info-Token の両対応 + SERVICE_INFO_TOKEN 未設定時 503 (fail-closed) + error metrics は Sentry 未配線で null→degraded
- chosen_type: auto-recommended
- context: 公開 EP の安全側デフォルト。誤って集計値を全開放しない。Sentry は release で配線 (O35、SPEC §7.4 明記)

### D20260527-095
- question: api エンドポイントテストの実行配線
- chosen: vitest include に `api/**/*.test.ts` を追加し、配線スモーク 9 ケースを実行対象化
- chosen_type: auto-recommended
- context: api/ は tsconfig には含まれるが vitest include 外だった。endpoint テストの正当な home。環境は node (.ts) で既存と同一。145 green で回帰なし
- depends_on: [D20260527-093]
