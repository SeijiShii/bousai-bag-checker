# AI_LOG セッション D20260526_003 — /flow:secure (--phase=design --scope=concept)

**実行日時**: 2026-05-26 20:20 〜 20:22 (+09:00)
**コマンド**: /flow:secure --phase=design --scope=concept
**対象**: プロダクト全体 (concept、feature 未設計)
**実行者**: Claude (Opus 4.7) + seiji
**状態**: 完了
**含まれる decision**: D20260526-017 〜 D20260526-023
**起動元**: /flow:auto (D20260526_002, 反復 1, P=Phase 1 完了ゲート)

---

## 主要決定サマリ

| ID | テーマ | 採用 | type |
|---|---|---|---|
| D20260526-017 | PJ 性質判定 | 公開 multi-tenant / 有償 / PII あり / AI なし / 国内 | auto-recommended |
| D20260526-018 | SEC-001 O23 認可漏れ | High → accepted-as-requirement (§3.1 NFR 化) | auto-recommended |
| D20260526-019 | SEC-002 O26 PII ログ | High(legal) → accepted-as-requirement (§3.1 NFR 化) | auto-recommended |
| D20260526-020 | SEC-003 O24 入力検証 | Medium → §8 open (feature 設計時) | auto-recommended |
| D20260526-021 | SEC-004 O27 レート制限 | Medium → §8 open (feature 設計時) | auto-recommended |
| D20260526-022 | SEC-005 O25 秘密情報 | 対応済み (注記のみ、§8 登録なし) | auto-recommended |
| D20260526-023 | O28 依存脆弱性 | --phase=design 対象外 + コード未生成で skip | auto-recommended |

## 検出結果 (severity 別)
- Critical: 0 / High: 2 (O23, O26) / Medium: 2 (O24, O27) / Info: 1 (O25)
- 法令必須 (legal_required): 1 (O26、部分対応 → High)
- 適用観点: O23/O24/O25/O26/O27 (O28 は phase 対象外)

## 重要技術前提
- データ層 = Neon (素 Postgres) + Drizzle → **RLS セーフティネット無し**。所有者分離はアプリ層で全クエリ強制が必須 (O23 を High に引き上げた主因)。

## 依存関係
- D20260526-018〜023 → 依存: [D20260526-017 (PJ 性質判定)]
- 外部依存: perspectives.md O23-O28 (SoT)

## 生成・更新したアーティファクト
- 新規: `docs/SECURITY_REVIEW_20260526.md` (L1 レポート)
- 更新: `docs/concept.md` §3.1 NFR (auto-gen ブロック、O23/O26 要件化) + §8 [論点-004〜007] 追加
- 更新: `docs/AI_LOG/INDEX.md`

## 学習・改善
- perspectives O23/O27 の `skip_if: [単一ユーザー個人ツール]` は "ローカル単独ツール" 向け。本 PJ のような "家族共有なし=単一ユーザー設計だが公開 multi-tenant" には非該当と判定。将来 perspectives に「単一世帯設計 ≠ ローカル単独」の注記追加余地あり (今回は未反映、要望時に SoT 更新)。

---

## decisions

### D20260526-017
- question: PJ 性質判定 (7 軸)
- chosen: 公開 multi-tenant / 有償(PWYW) / PII あり(機微医療除外) / AI なし / 国内向け
- chosen_type: auto-recommended
- context: concept §1.1/§1.2/§3/§4/§6 から確定。source=concept

### D20260526-018
- question: SEC-001 O23 認可漏れ・所有者分離の severity と route
- chosen: High → accepted-as-requirement、concept §3.1 NFR 追記 + §8 [論点-004]
- chosen_type: auto-recommended
- context: Neon+Drizzle で RLS なし、multi-tenant 公開、保管場所=防犯情報で IDOR 高インパクト。§3 は意図のみで強制機構未設計のため部分対応 → High
- depends_on: D20260526-017

### D20260526-019
- question: SEC-002 O26 PII ログ漏洩の severity と route
- chosen: High(legal_required) → accepted-as-requirement、§3.1 NFR 追記 + §8 [論点-005]
- chosen_type: auto-recommended
- context: feedback scrub は明示済だが Sentry beforeSend / logger 全般の PII マスク未明示 = 部分対応。legal_required=true で除外不可
- depends_on: D20260526-017

### D20260526-020
- question: SEC-003 O24 入力検証の severity と route
- chosen: Medium → §8 [論点-006] open (feature 設計時 dispatched-to-feature 予定)
- chosen_type: auto-recommended
- context: Drizzle で SQLi 緩和・React で XSS 基本緩和の部分対応。Zod スキーマ / CSV インジェクション(買替リスト出力) 未設計。loop 継続のため Medium は open 登録で feature 設計時に解消 (1問1答せず deferred)
- depends_on: D20260526-017

### D20260526-021
- question: SEC-004 O27 レート制限の severity と route
- chosen: Medium → §8 [論点-007] open (feature 設計時 dispatched-to-feature 予定)
- chosen_type: auto-recommended
- context: feedback 送信が user_id nullable=認証不要公開エンドポイント、service-info の認可スコープ contract 依存。予防的レート制限未設計。loop 継続のため open 登録で deferred
- depends_on: D20260526-017

### D20260526-022
- question: SEC-005 O25 秘密情報管理の照合
- chosen: 対応済み (注記のみ、§8 登録なし)
- chosen_type: auto-recommended
- context: §4.5.3/§10.7 で .env 規約明示、.gitignore に .env/.env.local/.env*.local 設定確認済み。VITE_ プレフィックス漏洩チェックは L2 (pre-impl) 向け注記としてレポートに記載
- depends_on: D20260526-017

### D20260526-023
- question: O28 依存脆弱性スキャンの扱い
- chosen: skip (--phase=design 対象外、かつ package.json 未生成)
- chosen_type: auto-recommended
- context: deps スキャンは --phase=deps の責務。コード/ロックファイル未生成のため実行不可。実装後に /flow:secure --phase=deps で実施
- depends_on: D20260526-017
