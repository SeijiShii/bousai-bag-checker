# AI_LOG セッション D20260527_025 — /flow:tdd _shared/service-info

**実行日時**: 2026-05-27 (+09:00)
**コマンド**: /flow:tdd (連続実装、対象=_shared/service-info)
**モード**: feature (cross-cutting)
**状態**: 完了
**含まれる decision**: D20260527-071 〜 D20260527-072
**起動元**: /flow:auto (D20260526_002, 反復 22, P4 tdd 連続実装)

---

## 主要決定サマリ
- D-071: spec-review R1 の共通レート制限を `src/services/ratelimit/`(InMemoryRateLimiter, injectable)で実装。feedback/tip でも再利用 → P2 重複回避
- D-072: /api/service-info を MVP 最小スキーマ(論点-003)で実装。共有トークン認可(401)+ レート制限(429)+ PII 非混入(O48)、7テスト green

## 生成・更新
- コード: src/services/ratelimit/* + src/services/serviceInfo/* + .env.example(commit d2093ed)
- レポート: 101/102、INDEX(service-info=実装完了✅)

## 次対象
- 連続実装継続 → 次=_shared/billing (P2、依存 db 実装済)

---

## decisions

### D20260527-071
- question: 共通レート制限 (spec-review R1)
- chosen: src/services/ratelimit/ に RateLimiter interface + InMemoryRateLimiter。実 Upstash は release(injectable)
- chosen_type: auto-recommended
- context: feedback/tip/service-info の3公開EPで共有 → 重複回避(P2)。service-info が最初の公開EPなので新設
- depends_on: [D20260527-058 (feedback spec-review R1)]

### D20260527-072
- question: service-info 実装 (論点-003 + SEC-004)
- chosen: MVP 最小スキーマ + トークン認可(401)+ レート制限(429)+ PII 非混入(O48)
- chosen_type: auto-recommended
- context: 論点-003 MVP 最小先行、SEC-004 公開EP保護。契約確定後拡張は論点-S-svc-1
- depends_on: [D20260527-071, D20260527-044 (svc-info 設計)]
