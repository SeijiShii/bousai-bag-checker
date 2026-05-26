<!-- auto-generated-start -->
# 設計レベル脆弱性レビュー — プロダクト全体 (concept)

**レビュー日**: 2026-05-26
**レビュー実施者**: Claude (Opus 4.7) + seiji
**対象**: プロダクト全体 (concept.md、feature 未設計のため SPEC は対象外)
**入力**: docs/concept.md (§1.1 / §1.3 / §3 / §4 / §5 / §6 / §9 / §10)
**観点ソース**: ~/.claude/flow-data/perspectives.md (O23-O28)
**phase**: design (L1 のみ。L2 pre-impl / L4 deps は別 phase)
**severity-threshold**: medium

## 1. PJ 性質判定

| 軸 | 判定 | 根拠 |
|---|---|---|
| ユーザー数 | **公開 multi-tenant**（"単一ユーザー設計"=家族共有なし、だが多数の世帯が各自データを持つ） | §1.1 1世帯=1アカウント、§4 Clerk + Neon |
| 公開 / ローカル | **公開** | §4.7 bousai.<domain> で Vercel 公開 |
| 無償 / 有償 | **有償** (100円単発買い切り one-time) | §1.2, _shared/billing, Stripe |
| 個人情報扱い | **あり** (メール・品目・保管場所)。**機微医療は設計上除外** | §3 NFR、§5.1。常備薬は"予備有無"のみ |
| AI 利用 | **なし** | §6 で明示確認 (Q12.5) |
| 地域 | **国内向け** | §2、§9.2 GDPR 当面対象外 |

> **重要技術前提**: データ層は **Neon (素の Postgres) + Drizzle** であり、Supabase のような Row-Level Security (RLS) セーフティネットが**存在しない**。所有者分離は**アプリ層で全クエリに user_id フィルタを強制**する必要がある (O23 の severity を引き上げる主因)。

## 2. 脆弱性パターン照合結果

### 2.1 サマリ
- Critical: 0 件
- High: 2 件 (SEC-001 O23 / SEC-002 O26) → 自動 `accepted-as-requirement`、§3 NFR 追記
- Medium: 2 件 (SEC-003 O24 / SEC-004 O27) → §8 open 論点 (feature 設計時に解消)
- Low / Info: 1 件 (SEC-005 O25、対応済み注記)
- 法令必須 (legal_required): 1 件 (O26、部分対応 → High)

### 2.2 詳細 (severity 降順)

#### [SEC-001] 認可漏れ / 所有者分離 (O23_authorization_check, severity=High)
- **照合結果**: 部分対応 (intent あり / 強制機構 未設計)
- **該当箇所**: §3 NFR「認証で世帯データを保護。備蓄品目・保管場所は本人限定」(意図の宣言)
- **不在根拠**:
  - データ層が Neon + Drizzle のため **RLS が自動で効かない**。Supabase の `auth.uid()` RLS ポリシーに相当する DB レベルの所有者強制が存在しない。
  - 全 CRUD API (品目・通知設定・点検ログ・買替リスト・課金・feedback) で「Clerk セッションの userId と行の user_id 一致」をアプリ層で**毎回**検証する設計が concept に明示されていない。
  - 保管場所 (storage_location) は世帯の防犯情報に近く、cross-tenant 漏洩のインパクトが高い。IDOR (`/api/items/:id` に他人の id を渡す) の典型的露出面。
- **PJ 性質との関連**: 公開 multi-tenant + 個人情報扱い (perspective skip_if=単一ユーザー個人ツール は "ローカル単独ツール" 向けで、本 PJ の公開マルチテナントには非該当)
- **推奨対策** (accepted-as-requirement として §3 NFR へ):
  - 全 API/DB クエリで Clerk 認証由来 `userId` による所有者フィルタを必須化 (Neon は RLS 非対応のためアプリ層で強制)。
  - feature SPEC で「エンドポイント × リソース × 許可操作」の認可マトリクスを設計 (特に inventory / inspection / shopping-list / billing / feedback)。
  - 共通の `withOwner(userId)` 的クエリラッパ or Drizzle の where 句強制パターンを `_shared/db` 設計に組み込む。
- **route**: accepted-as-requirement (concept scope、§3 NFR 追記 + §8 [論点-004] 登録)

#### [SEC-002] 個人情報のログ漏洩 (O26_pii_logging, severity=High, legal_required=true)
- **照合結果**: 部分対応
- **該当箇所**: §3 NFR「フィードバック送信前に PII scrub(O28/O40)」、§4.6 Sentry 採用
- **不在根拠**:
  - feedback 経路の PII scrub は明示されているが、**Sentry エラーイベント全般の PII マスク (beforeSend)** が未明示。エラー context にメールアドレス・Clerk トークン・リクエストボディ (品目・保管場所) が混入すると委託先 (Sentry) への漏洩扱いになり、個人情報保護法の報告義務に触れる可能性。
  - 自前コストログ (§4.6.2) / 一般 logger 出力での PII 混入防止方針が未記載。
- **PJ 性質との関連**: 公開 + 個人情報扱い、legal_required=true (severity-threshold で除外不可)
- **推奨対策** (accepted-as-requirement として §3 NFR へ):
  - Sentry `beforeSend` で PII (email / 認証トークン / リクエストボディ) をマスク or 除去。
  - logger / コストログに PII を出力しない (匿名 ID or user_id のみ)。
  - エラーメッセージに DB 内容 (品目名・保管場所) を含めない。
- **route**: accepted-as-requirement (concept scope、§3 NFR 追記 + §8 [論点-005] 登録)

#### [SEC-003] 入力検証 (O24_input_validation, severity=Medium)
- **照合結果**: 部分対応
- **該当箇所**: §4.2 Drizzle ORM (SQLi 緩和)、React デフォルトエスケープ (XSS 基本緩和)
- **不在根拠**:
  - API 入力スキーマ (Zod 等) の一元バリデーション方針が concept に未記載。
  - **CSV インジェクション**: §1.1 UC4 買い物 TODO リストの共有/エクスポート (CSV) で、品目名が `=`/`+`/`-`/`@` で始まる場合のエスケープが未設計。
  - `dangerouslySetInnerHTML` 使用時の XSS、photo_url の取り扱い (R2、外部 URL fetch があれば SSRF 検討)。
- **PJ 性質との関連**: 公開 PJ (require=公開)
- **推奨方針**: feature 設計時 (inventory / shopping-list) で Zod 入力スキーマ + エクスポート時の CSV インジェクションエスケープを SPEC 化。
- **route**: open (§8 [論点-006] 登録、判断期限=inventory / shopping-list feature 設計時)

#### [SEC-004] レート制限 / 公開エンドポイント (O27_rate_limit_scope, severity=Medium)
- **照合結果**: 未対応
- **不在根拠**:
  - feedback 送信 API は §5.1 で `user_id?` (nullable) = ゲスト送信可 = **認証不要の公開エンドポイント**。レート制限 / bot 対策 (Turnstile / honeypot) が未設計 → スパム・DB 肥大リスク。
  - `/api/service-info` (O48、HUB が pull) の認可スコープ・レート制限が contract 依存で未確定 (§8 [論点-003] と関連)。
  - 期限リマインドメール (Resend) はコスト連動。乱用経路があればコスト爆発 (§4.6 は事後アラートで予防的レート制限ではない)。
- **PJ 性質との関連**: 公開 PJ (skip_if=単一ユーザー個人ツール だが公開エンドポイントが存在するため適用)
- **推奨方針**: feature 設計時 (feedback / _shared/service-info) で公開エンドポイントにレート制限 (IP/ユーザー単位) + bot 対策を SPEC 化。
- **route**: open (§8 [論点-007] 登録、判断期限=feedback / _shared/service-info feature 設計時)

#### [SEC-005] 秘密情報の管理 (O25_secrets_management, severity=Info, 対応済み)
- **照合結果**: 対応済み
- **該当箇所**: §4.5.3 (`.env.local`/`.env.example`/gitleaks)、§10.7 (`.env*.local` を `.gitignore`)。`.gitignore` に `.env` / `.env.local` / `.env*.local` の設定を確認済み。
- **実装時の注意 (L2 / pre-impl へ)**: Vite の `VITE_` プレフィックスはクライアントバンドルに含まれる。Stripe SECRET KEY / Clerk SECRET / DATABASE_URL / Resend API キー / R2 アクセスキーを `VITE_` で公開しない (サーバー専用 env として Vercel Functions 側でのみ参照)。ビルド成果物の grep チェックを L2 で実施。
- **route**: 注記のみ (§8 登録なし)

## 3. §8 未決事項に登録した論点

| 論点 ID | SEC | severity | title | status | 期限 |
|---|---|---|---|---|---|
| [論点-004] | SEC-001 | High | O23 認可漏れ / 所有者分離 | accepted-as-requirement | 実装着手前 (§3 NFR 化済) |
| [論点-005] | SEC-002 | High (legal) | O26 PII ログ漏洩 | accepted-as-requirement | 実装着手前 (§3 NFR 化済) |
| [論点-006] | SEC-003 | Medium | O24 入力検証 | open | inventory/shopping-list 設計時 |
| [論点-007] | SEC-004 | Medium | O27 レート制限 | open | feedback/service-info 設計時 |

## 4. 次のステップ
- High 2 件は §3 NFR にセキュリティ要件として組み込み済み (accepted-as-requirement)。feature 設計時に認可マトリクス + Sentry beforeSend を具体化。
- Medium 2 件は §8 open。各 feature 設計 (`/flow:feature`) で SPEC に反映 → status=dispatched-to-feature へ遷移。
- L2 実装前チェックリスト: TDD 着手前に `/flow:secure --phase=pre-impl` (VITE_ プレフィックス漏洩チェック含む)。
- L4 依存スキャン: package.json 生成後に `/flow:secure --phase=deps` (npm audit + Dependabot 設定)。
- L3 コードレビュー: 実装後に Anthropic `security-review` スキル。
<!-- auto-generated-end -->
