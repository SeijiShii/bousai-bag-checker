# _shared/auth 単体テスト計画 (横断基盤)

> **入力**: `./001__shared_auth_SPEC.md`, `./002__shared_auth_PLAN.md`
> **最終更新**: 2026-05-26

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | getOrCreateUser | 新規 clerk_user_id | users 行作成 + 内部 id 返却 |
| U-N2 | getOrCreateUser | 既存 clerk_user_id | 既存 id を返す (重複作成しない) |
| U-N3 | getAuthUserId | 認証済セッション (mock) | 対応する user.id |
| U-N4 | getAuthUserId | ゲスト anonymous (mock) | anonymous の user.id |
| U-N5 | requireUser | 確立済 user | user.id |
| U-N6 | O22 継続 | 同一 clerk_user_id でゲスト→permanent | users 行維持 (clerk_user_id 不変、データ引き継ぎ) |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | requireUser | 未認証 | 401 throw (AU-E1)、PII 非出力 |
| U-E2 | getAuthUserId | セッション期限切れ (mock) | null → 再認証誘導 (AU-E2) |
| U-E3 | getOrCreateUser | clerk_user_id 重複競合 | upsert で吸収、例外を投げない (AU-E3/DB-E5) |
| U-E4 | clerkAuthClient | Clerk 到達不可 (mock 失敗) | 例外送出、機微情報をログに残さない (AU-E4/SEC-002) |
| U-E5 | SEC-001 | リクエストボディの user_id を渡す | **無視** (getAuthUserId 解決値のみ使用) |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-B1 | userId 解決 | 空/不正トークン | null (ゲストでも確立でもない) |
| U-B2 | getOrCreateUser | 同時 upsert (競合) | 1 行に収束 (UNIQUE 制約 + upsert) |

## 2. Mock 方針

| 対象 | 方針 | 理由 |
|---|---|---|
| Clerk SDK | **SessionResolver interface を mock 注入** | 実 Clerk を呼ばず認証/ゲスト/未確立を再現 (no-key, Class A) |
| DB (users) | pglite or mock (db 基盤と共通) | upsert / UNIQUE を実検証 |
| clerkAuthClient (実装) | Phase 3.5 で dev key sandbox or mock | 実 API call を CI で避ける |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行カバレッジ | 80% | concept 継承 |
| 分岐カバレッジ | 70% | concept 継承 |
| **userId 信用線 (SEC-001)** | **100%** | getAuthUserId が唯一の信用入口、リクエスト user_id 無視を必須テスト |

## 4. 既存ユーティリティ依存
- `_shared/db` の users スキーマ + withOwner (userId の受け手)。

## 5. テスト実行環境
- フレームワーク: vitest (+ jsdom for hook/component)
- Clerk: SessionResolver mock (no-key)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (userId 信用線 SEC-001 を 100% カバー、O22 継続検証) | /flow:feature |
