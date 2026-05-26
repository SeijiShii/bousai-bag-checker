# _shared/service-info 実装計画書 (横断基盤)

> **入力**: `./001__shared_service-info_SPEC.md`, `../../concept.md` §4 / §6
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `api/service-info.ts` | Vercel Function: GET /api/service-info (トークン検証 + レート制限 + 集計返却) | db | 90 |
| `src/services/serviceInfo/collectMetrics.ts` | 指標集計 (users 件数 / uptime / error_count) | db | 70 |
| `src/services/serviceInfo/index.ts` | 公開エクスポート | 上記 | 10 |

## 2. 実装 Phase 分割 (/flow:tdd 連携)

### Phase 1 (RED→GREEN→IMPROVE): collectMetrics (mock db)
- 対象: `collectMetrics.ts` — 最小スキーマの集計 (PII を含めない)
- テスト対象: users 件数集計、error_count 集計、PII 非混入
- ゴール: 集計値が最小スキーマ通り (PII なし)

### Phase 2: エンドポイント (トークン検証 + レート制限)
- 対象: `api/service-info.ts` — トークン不一致 401/403、レート超過 429、正常時 JSON
- テスト対象: 認可スコープ (SEC-004)、レート制限、status=degraded フォールバック
- ゴール: 公開エンドポイントが共有トークン + レート制限で保護され、集計値のみ返す

### Phase 3.5: bootstrap
- `.env.example` に `SERVICE_INFO_TOKEN` 追記。Vercel Function として配線。
- service-hub 契約確定後にスキーマ拡張 (論点-S-svc-1)。

## 3. 依存関係順序
```
db (users 集計) → collectMetrics → api/service-info (トークン+レート制限)
```
依存先: _shared/db (設計済)。

## 4. 既存ファイルへの影響
- なし (新規エンドポイント)。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/db | users 件数集計 (読み取りのみ) |

## 6. リスク・注意点
- **PII 非混入** (SEC-002 / O48): 集計値のみ。個人情報を絶対に返さない (テスト必須)。
- **認可スコープ** (SEC-004 / 論点-007): 共有トークン + レート制限。公開エンドポイントの乱用防止。
- **契約 SoT = service-hub** (論点-S-svc-1): MVP 最小先行、確定後に合わせる (可逆)。
- SERVICE_INFO_TOKEN の VITE_ 露出禁止 (SEC-005、サーバー専用)。

## 7. 完了の定義 (DoD)
- [ ] collectMetrics が最小スキーマを PII なしで集計
- [ ] /api/service-info がトークン検証 + レート制限 + 集計返却
- [ ] PII 非混入をテストで担保
- [ ] 単体テストカバレッジ 80%/70%
- [ ] 統合はスモーク/契約テストでカバー (cross-cutting)

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (集計 + 認可エンドポイントの 2 Phase、MVP 最小先行) | /flow:feature |
