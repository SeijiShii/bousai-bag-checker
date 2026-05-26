# AI_LOG セッション D20260526_009 — /flow:feature _shared/auth

**実行日時**: 2026-05-26 20:39 〜 20:40 (+09:00)
**コマンド**: /flow:feature _shared/auth
**対象**: _shared/auth (横断基盤、cross-cutting)
**実行者**: Claude (Opus 4.7) + seiji
**状態**: 完了 (SPEC/PLAN/UNIT_TEST。E2E cross-cutting スキップ)
**含まれる decision**: D20260526-035 〜 D20260526-037
**起動元**: /flow:auto (D20260526_002, 反復 7, P2)

---

## 主要決定サマリ
- D-035: タグ = cross-cutting, auth-required, stateful (ゲスト→アカウント)
- D-036: userId 信用線 = getAuthUserId が唯一の入口、withOwner に供給 (SEC-001)。リクエスト user_id は信用しない
- D-037: O22 引き継ぎ = Clerk anonymous→permanent 同一 userId 継続に依存 (MVP 主経路)。クロスデバイス merge は論点-S-auth-1 で v2 defer。投げ銭はログイン不要

## 生成・更新したアーティファクト
- 新規: 001/002/003 (_shared/auth)
- 更新: _shared/auth/INDEX.md / docs/INDEX.md (auth=設計済✅)

## Open 論点
- [論点-S-auth-1] クロスデバイスのゲストデータ統合 (担当 seiji、v2 defer)

## 整合性チェック
- SEC-001(所有者強制の userId 供給)・SEC-002(PII 非ログ)・SEC-005(SECRET の VITE_ 禁止) を反映。依存先 db 設計済。

---

## decisions

### D20260526-035
- question: _shared/auth のタグ
- chosen: cross-cutting, auth-required, stateful
- chosen_type: auto-recommended
- context: 認証基盤・ゲスト→アカウントの状態遷移あり

### D20260526-036
- question: userId 解決と SEC-001 の信用線
- chosen: getAuthUserId(req) を唯一の信用入口とし withOwner に供給。リクエストボディ user_id は無視
- chosen_type: auto-recommended
- context: concept §3.1 SEC-001。Neon RLS なし→アプリ層強制の入口を auth に固定。UNIT で 100% カバー
- depends_on: [D20260526-018 (SEC-001), D20260526-031 (withOwner)]

### D20260526-037
- question: O22 ゲスト→アカウントのデータ引き継ぎ方式
- chosen: Clerk anonymous→permanent の同一 userId 継続に依存 (MVP)。クロスデバイス merge は論点-S-auth-1 で v2 defer
- chosen_type: auto-recommended
- context: concept §1.2 段階的認証 / §1.3.2 O22。同一端末/ブラウザのサインアップは Clerk が userId 継続→users 行維持で引き継ぎ。別端末統合は需要次第 v2
- depends_on: [D20260526-035]
