# _shared/service-info 仕様書 (横断基盤)

> **役割**: service-hub 連携 (O48)。アプリ層の運用指標を `GET /api/service-info` で公開し、service-hub が pull する。契約 SoT = service-hub。MVP は最小指標で先行 (論点-003)。
> **タグ**: cross-cutting
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../../concept.md` (§4 / §6 service-hub / §8 論点-003 / §3.1 SEC), `../db/001__shared_db_SPEC.md`, `./README.md`
> **target_type**: cross-cutting (API エンドポイント提供。E2E はスキップ=スモーク/契約テストでカバー)

---

## 1. 提供インターフェース

### 1.1 service-info エンドポイント
- `GET /api/service-info` — service-hub が pull する運用指標 JSON を返す。
- **MVP 最小スキーマ (論点-003 解決: MVP 最小先行)**:
  ```json
  {
    "service": "bousai-bag-checker",
    "status": "ok",            // ok | degraded
    "uptime_pct_24h": 99.9,     // 直近24hの稼働率(概算)
    "error_count_24h": 0,        // Sentry 連動 or 自前ログ
    "user_count": 0,             // users 行数
    "version": "x.y.z",
    "generated_at": "ISO8601"
  }
  ```
- service-hub の契約スキーマが確定したら、それに合わせて拡張/調整 (契約 SoT = service-hub)。
- **認可スコープ (SEC-004 / 論点-007 部分対応)**: 共有シークレット (`SERVICE_INFO_TOKEN`) ヘッダ検証 or service-hub の IP 許可。PII は一切含めない (集計値のみ)。レート制限 (IP/トークン単位)。

---

## 2. 入出力

### 2.1 API
| メソッド | パス | 入力 | 出力 | 認証 |
|---|---|---|---|---|
| GET | /api/service-info | (なし) | 上記 JSON | 共有トークン (HUB 契約) + レート制限 |

### 2.2 副作用
- DB: users 件数集計 (読み取りのみ、PII なし)。
- 外部: なし (HUB が pull する側)。Sentry/コストログから error_count を集計可。

---

## 3. データモデル
新規エンティティなし。users (件数) + 運用指標 (Sentry/自前ログ集計) を読み取り集計するのみ。集計値のみ返却、PII なし。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール |
|---|---|
| 認証トークン | `SERVICE_INFO_TOKEN` 一致 (or 許可 IP) でなければ 401/403 |
| レート制限 | IP/トークン単位 N req/min |

### 4.2 エラーケース
| ID | 条件 | 振る舞い |
|---|---|---|
| SI-E1 | トークン不一致 | 401/403 (集計値も返さない、SEC-004) |
| SI-E2 | レート超過 | 429 |
| SI-E3 | 集計失敗 (DB/Sentry) | status=degraded + 取得可能な指標のみ、PII 非ログ (SEC-002) |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| 応答 | < 300ms (軽量集計) | §3 |
| PII | 集計値のみ、個人情報を絶対に含めない | SEC-002 / O48 |
| 認可 | 公開エンドポイントだが共有トークン + レート制限 | SEC-004 / 論点-007 |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/db | users 件数集計 | 読み取りのみ |
| service-hub (外部) | pull 契約 | 契約スキーマ SoT = service-hub (確定後に合わせる) |
| Sentry / コストログ | error_count 集計 | 任意 |

---

## 6. タグ別追加項目
cross-cutting。認可は共有トークン (ユーザー認証ではない、HUB 間)。

---

## 7. スコープ外
- service-hub 側の pull 実装 (HUB の責務)。
- 詳細メトリクス (MVP は最小、契約確定で拡張)。
- リアルタイム push (HUB が pull する設計、O48)。

## 8. 未決事項 (論点リスト)

### [論点-S-svc-1] service-hub 契約スキーマの確定 (concept §8 論点-003 由来)
- **影響範囲**: _shared/service-info
- **詰めるべき問い**: service-hub の pull 契約スキーマ (O48) が service-hub 側で確定しているか。確定版に最小スキーマを合わせる。
- **推奨**: **MVP は本 SPEC の最小スキーマ (status/uptime/error_count/user_count/version) で先行** (concept §8 論点-003 推奨、D20260527-043 で auto-pick 承認)。service-hub の concept/SPEC 確定後に拡張。契約 SoT = service-hub。
- **判断期限**: service-hub 契約確定時 (公開前後)
- **担当**: seiji

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (MVP 最小スキーマ先行、論点-003 を auto-pick 解決、SEC-004 認可スコープ部分対応) | /flow:feature |
