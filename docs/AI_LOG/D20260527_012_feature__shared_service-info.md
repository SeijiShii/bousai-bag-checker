# AI_LOG セッション D20260527_012 — /flow:feature _shared/service-info

**実行日時**: 2026-05-27 (+09:00)
**コマンド**: /flow:feature _shared/service-info
**対象**: _shared/service-info (横断基盤、cross-cutting)
**実行者**: Claude (Opus 4.7) + seiji
**状態**: 完了 (SPEC/PLAN/UNIT_TEST。E2E cross-cutting スキップ)
**含まれる decision**: D20260527-044 〜 D20260527-045
**起動元**: /flow:auto (D20260526_002, 反復 10, P2、D-043 auto-pick 承認下)

---

## 主要決定サマリ
- D-044: タグ = cross-cutting。GET /api/service-info で MVP 最小スキーマ (status/uptime/error_count/user_count/version) 先行 → 論点-003 を MVP 最小先行で解決 (D-043 承認)
- D-045: 公開エンドポイントの認可スコープ = 共有トークン + レート制限 + PII 非混入 (SEC-004/論点-007 の service-info 部分を対応、O48 PII なし)

## 生成・更新したアーティファクト
- 新規: 001/002/003 (_shared/service-info)
- 更新: service-info/INDEX.md / docs/INDEX.md (service-info=設計済✅) / concept §8 論点-003 (dispatched-to-feature) + 論点-007 (service-info 部分 dispatched)

## Open 論点
- [論点-S-svc-1] service-hub 契約スキーマ確定 (担当 seiji、契約確定時に調整)

## 整合性チェック
- 論点-003 を MVP 最小先行で解決 (契約 SoT=service-hub、確定後調整は論点-S-svc-1)。SEC-004(認可スコープ)/SEC-002(PII 非混入)を反映。依存先 db 設計済。

---

## decisions

### D20260527-044
- question: service-info の指標スキーマ (論点-003)
- chosen: MVP 最小スキーマ (status/uptime_pct_24h/error_count_24h/user_count/version) で先行、service-hub 契約確定後に調整
- chosen_type: auto-recommended (D-043 で auto-pick 承認済の concept 推奨)
- context: concept §8 論点-003 推奨「MVP 最小先行、契約 SoT=service-hub」。確定後の調整は論点-S-svc-1
- depends_on: [D20260527-043 (auto-pick 承認), D20260526-030 (db)]

### D20260527-045
- question: 公開エンドポイントの認可スコープ (SEC-004/論点-007)
- chosen: 共有トークン (SERVICE_INFO_TOKEN) + レート制限 + PII 非混入 (集計値のみ)
- chosen_type: auto-recommended
- context: SEC-004(論点-007)の service-info 部分を対応。O48 で PII を返さない。feedback 部分の rate limit は feedback 設計時
- depends_on: [D20260526-021 (SEC-004), D20260527-044]
