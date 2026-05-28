# _shared/auth E2E テスト計画 (Clerk SDK 実 wiring)

> **入力**: `./001_REVISE_SPEC.md`, `../004__shared_auth_E2E_TEST.md` (もし存在)、`../../concept.md` §1.1
> **最終更新**: 2026-05-28

---

## 1. 変更 UC シナリオ

### UC: API 認証 (Clerk session 経由)
| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| E-001 | Clerk dev instance キー設定済、ユーザー sign-in 済 | `/api/items` を Clerk session cookie 付きで GET | 200、user 固有 items 返却 |
| E-002 | Clerk session 無し | `/api/items` を素の curl で GET (auth-required EP の場合) | 401 (UnauthorizedError) |
| E-003 | Clerk anonymous user (O22) | sign-in 前の anon token を持つ request | userId 解決成功、users.clerkUserId に anon_* で記録 |

## 2. リグレッションシナリオ

| UC | シナリオ ID | 確認観点 |
|---|---|---|
| 既存 i18n / inventory / inspection 等の主要 UC | 既存 E2E (18 ジャーニー) | Clerk wiring 後も既存 E2E が全 GREEN を維持 (ローカル headless dev server 相手) |
| memory backend mode | 既存 keyless E2E | `VITE_BACKEND=memory` モードでは Clerk 経由しないので影響なし、引き続き green |

## 3. 移行検証シナリオ

(なし、DB 移行なし)

## 4. 環境要件差分

| 項目 | 前回 | 今回 | 理由 |
|---|---|---|---|
| Clerk dev instance | 未必須 | **必須** (E2E http backend mode) | seam が実 Clerk 呼ぶようになるため |
| `CLERK_SECRET_KEY` env | 未設定可 | **dev/test キー必須** | factory が env チェックで fail-fast |
| memory mode (`VITE_BACKEND=memory`) | OK | OK (Clerk 呼ばない) | keyless E2E は引き続き green |

## 5. 期待 KPI

| 指標 | 目標 |
|---|---|
| 既存 18 E2E green | 維持 (memory mode 経路、ローカル headless) |
| 新規 E-001/002/003 | http backend mode + 実 Clerk dev instance で 100% pass (release Phase 2 動作確認時) |
| 401 応答時間 | < 200ms (Clerk verify レイテンシ含む) |

## 6. 実行タイミング

- **ローカル headless (Class A)**: `npm run test:e2e` で memory mode 既存 18 ジャーニーが green を維持 (Clerk wiring の影響なし) を実装直後に確認
- **実キー E2E (Class A、release Phase 2)**: dev/test キー FILL 後、http backend mode で `/api/items` 等を実機スマホで叩く軽めスモーク (release.md Phase 2 範囲)
- **preview / prod E2E**: release Phase 3 後 (Class B)

## 7. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 | /flow:revise |
