# AI_LOG セッション D20260527_022 — /flow:tdd _shared/auth

**実行日時**: 2026-05-27 (+09:00)
**コマンド**: /flow:tdd (連続実装、対象=_shared/auth)
**モード**: feature (cross-cutting, core)
**状態**: 完了 (core。実 Clerk 配線は release)
**含まれる decision**: D20260527-066 〜 D20260527-067
**起動元**: /flow:auto (D20260526_002, 反復 19, P4 tdd 連続実装)

---

## 主要決定サマリ
- D-066: injectable core 実装(AuthClient/SessionResolver interface + makeAuth)。実 Clerk SDK は O35 最終/実キー段階(release)へ defer、core は SessionResolver mock で完全テスト
- D-067: getAuthUserId を SEC-001 信用入口に(req user_id 無視)、getOrCreateUser 冪等(O22 継続)、7テスト green

## 生成・更新したアーティファクト
- コード: src/services/auth/{authClient,makeAuth,index}.ts(commit 09987ad)
- レポート: 101/102 (_shared/auth)
- 更新: _shared/auth INDEX / docs/INDEX (auth=実装完了(core)✅)

## 次対象
- 連続実装継続 → 次=_shared/notification (P2 基盤、依存 db 実装済)

---

## decisions

### D20260527-066
- question: 実 Clerk SDK の扱い
- chosen: injectable(SessionResolver 注入)で core を実装・テスト、実 Clerk install/wiring は release(実キー必要)へ defer
- chosen_type: auto-recommended
- context: O35 可逆性優先(interface→mock→実 SDK は最終)。no-key で core を 100% テスト
- depends_on: [D20260527-037 (auth O22 設計)]

### D20260527-067
- question: SEC-001 信用線 + O22 のテスト
- chosen: getAuthUserId=resolver 解決値のみ(req user_id 無視)、getOrCreateUser 冪等で O22 継続。7テスト green
- chosen_type: auto-recommended
- context: SEC-001(IDOR の上流防止)+ O22(同一 clerk_user_id 継続)。UnauthorizedError(401)
- depends_on: [D20260527-066, D20260527-031 (withOwner)]
