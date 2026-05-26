# inventory E2E テスト計画

> **入力**: `./001_inventory_SPEC.md`, `../concept.md` §1.1
> **最終更新**: 2026-05-27
> **実行**: /flow:e2e (unit 完了後に 103_*_E2E_REPORT.md 生成)。ローカル headless = Class A。

---

## 1. ユーザージャーニー

### UC1: 品目一覧（concept §1.1 #1）
| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| UC1-S1 (happy) | ゲスト + 品目3件 | 品目タブを開く | 3件カード + 鮮度 StatusChip 表示 |
| UC1-S2 (empty) | 品目0件 | 品目タブを開く | EmptyState + 「追加」CTA |

### UC2: 品目登録/編集
| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| UC2-S1 (happy) | ログイン/ゲスト | 追加→name/category/freshness=expiry/期限入力→保存 | 一覧に反映、鮮度算出表示 |
| UC2-S2 (replace_guide) | 同上 | freshness=電池(交換目安)選択→月数入力 | フォームが動的に交換目安入力に変化 |
| UC2-S3 (validation) | 同上 | name 空で保存 | Field エラー表示、保存されない |

### UC3: 削除 / 所有者分離
| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| UC3-S1 | 自分の品目 | 削除→確認 | 一覧から消える |
| UC3-S2 (IDOR) | 他ユーザーの item id を直接 API 呼び出し | GET/PATCH/DELETE /api/items/:他人id | 404 (SEC-001) |

## 2. 環境要件
| 項目 | 要件 |
|---|---|
| ブラウザ | Chromium (主)、WebKit (モバイル確認) |
| 画面サイズ | モバイル (主) / デスクトップ |
| オフライン | ❌ (MVP) |
| カメラ/写真 | 写真アップロードは mock or テスト用ファイル |
| 認証 | テストユーザー (ゲスト + アカウント) |

## 3. データセットアップ
### 3.1 Seed
- テストユーザー(ゲスト/アカウント) + items 数件 (各 freshness 種別)
### 3.2 Cleanup
- テスト後に items 削除 (withOwner)、テストユーザー破棄

## 4. タグ別追加シナリオ
- auth-required: 別ユーザーの item への IDOR 試行 (UC3-S2) を必須シナリオに。

## 5. レイアウト・ビジュアル検証 (perspectives O34)
- **Level 1 (snapshot)**: ✅ 採用 — 一覧/フォーム/空状態の baseline (動的時刻/idは mask)
- **Level 2 (意味的)**: ✅ 採用 — StatusChip の鮮度色がトークン通り、フォーム要素の縦並び、CTA の位置、44px タップ領域
- **Level 3 (AI Vision)**: ❌ 非採用 — inventory は LP/決済/オンボードでないため。視覚総合は /flow:design --review-only (headless, no-key) でカバー

採用根拠: 中核 CRUD 画面で regression 防止(L1)+ 新規 layout の意味的妥当性(L2)。AI Vision(L3, Class B-4)は重要 UX 画面に限定。

## 6. 期待 KPI
| 指標 | 目標 |
|---|---|
| シナリオ成功率 | 100% |
| L1 snapshot 差分 | 0 |
| L2 assertion pass | 100% |
| IDOR (UC3-S2) | 全 404 (SEC-001) |

## 7. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (CRUD ジャーニー + IDOR + L1/L2 視覚検証) | /flow:feature |
