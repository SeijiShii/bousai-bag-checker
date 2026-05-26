# 持ち出し袋チェッカー

> **一行で言うと**: 防災リュック(持ち出し袋)の中身を登録し、賞味期限・電池切れを季節ごとに点検リマインドする「自宅備蓄の鮮度管理」アプリ。

| 項目 | 内容 |
|---|---|
| ユーザー | 防災備蓄を揃えたが鮮度管理が放置になっている個人・世帯 |
| 解決する課題 | 「備えたつもり」の備蓄が期限切れ・電池切れで、いざという時に使えない |
| 提供価値 | すでにある備えを"使える状態"に保つ。不安を煽らず淡々と点検できる |
| 現フェーズ | 企画 (concept 初版、MVP 設計前) |
| 最終更新 | 2026-05-26 |

`source_wants: ../wants.md` / `source_idea: I20260526-008 (batch 20260526_001, 飛地)`

---

## 1. プロダクト概要

防災リュックの中身を品目単位で登録し、賞味期限・消費期限・電池の推奨交換時期を記録。期限が近づくと淡々とリマインドし、防災の日(9/1)など季節の節目に「まとめて点検」できる。災害"情報"アプリでも防災グッズの物販でもなく、**すでに持っている備蓄を実効性ある状態に保つ**ことだけにフォーカスする。

MVP は **1 人(1 世帯 = 1 アカウント)で価値が完結する単一ユーザー設計**。家族での共有編集は v2 に延期し、1〜2 ヶ月・1 人開発で運用開始する。

### 1.1 主要ユースケース
1. **中身を登録する** — 品目(水・非常食・モバイルバッテリー・乾電池・常備薬の予備・現金・コピー書類等)を写真または手入力で登録。期限・数量・保管場所を記録
2. **鮮度の点検通知を受ける** — 賞味/消費期限・電池の推奨交換時期が近づいたらメール/アプリ内通知(任意 ON)。「そろそろ点検どうぞ」の淡々としたトーン
3. **季節点検をする** — 防災の日や年 2 回など、チェックリスト形式でまとめて確認する点検モード
4. **買い替えリストを作る** — 期限切れ・不足分を買い物リストとして書き出し(印刷/共有)
5. **フィードバックを送る** — 好き嫌い(👍/👎)+ バグ報告ウィジェット(運用品質シグナル、O40)

### 1.2 スコープ
**含むもの (MVP / v1)**:
- 単一ユーザー(1 世帯 = 1 アカウント)の品目管理
- ゲスト開始 → クラウド同期/課金時に Clerk 認証(段階的認証)
- 期限リマインド(メール + アプリ内通知)
- 季節点検モード + 買い替えリスト出力
- PWYW 課金(品目テンプレ拡張・買い替えリスト PDF)
- フィードバックウィジェット

**含まないもの（明示除外）**:
- **家族共有(複数ユーザーが同じリストを共同編集) → v2**(招待フロー・共同編集の競合解決・監査が必要なため)
- 防災"情報"の配信・避難判断(公的情報に委ねる、免責明示)
- 備蓄品の物販・EC 連携
- 位置情報トラッキング(避難所連携は v2 以降の任意検討)
- 自前 AI モデル/Vision(品目写真の自動登録は将来任意)

### 1.3 ドキュメントフォルダ分割設計

> ここで設計するのは `docs/` 配下のドキュメント置き場であり、実装コード(`src/`)構造ではない。

#### 1.3.1 機能フォルダ（業務ドメイン別）

| フォルダ (docs/ 配下) | 含む機能 | 担当する画面 / API | 依存 | 優先度 | 基盤 |
|---|---|---|---|---|---|
| docs/inventory/ | 品目登録・編集・一覧(UC1)。期限/数量/保管場所/写真 | 品目一覧・登録/編集フォーム・品目 CRUD API | _shared/db, _shared/auth, _shared/ui | 3 | ✅ |
| docs/inspection/ | 期限リマインド + 季節点検モード(UC2, UC3) | 点検ダッシュボード・チェックリスト・通知トリガー(cron) | inventory, _shared/notification | 4 | ❌ |
| docs/shopping-list/ | 期限切れ/不足分の買い替えリスト出力(UC4) | 買い替えリスト画面・PDF 出力 | inventory | 4 | ❌ |
| docs/feedback/ | 好き嫌い + バグ報告ウィジェット(UC5, O40) | フィードバックウィジェット・送信 API | _shared/db, _shared/auth | 3 | ❌ |

#### 1.3.2 横断フォルダ（機能をまたぐ技術設計）

| フォルダ (docs/ 配下) | 責務 | 含む設計 | 依存 | 優先度 | 基盤 |
|---|---|---|---|---|---|
| docs/_shared/db/ | DB スキーマ・マイグレーション | Neon(Postgres) テーブル・Drizzle スキーマ・インデックス | (なし) | 1 | ✅ |
| docs/_shared/ui/ | UI 基盤・デザイントークン | shadcn/ui + Tailwind + design-system トークン(O39) | (なし) | 1 | ✅ |
| docs/_shared/auth/ | 認証基盤(ゲスト/段階的認証) | Clerk Anonymous → アカウント連携、データ引き継ぎ(O22) | _shared/db | 2 | ✅ |
| docs/_shared/notification/ | 通知基盤 | メール(Resend)+ アプリ内通知、購読 ON/OFF、配信履歴 | _shared/db | 2 | ✅ |
| docs/_shared/legal/ | 法務書類 | プライバシーポリシー/利用規約/特商法表記(公開前) | (なし) | 2 | ❌ |
| docs/_shared/service-info/ | service-hub 連携(O48) | service-info エンドポイント(アプリ層指標を HUB が pull) | _shared/db | 2 | ❌ |
| docs/_shared/billing/ | 課金基盤(PWYW/one-time) | Stripe 連携、機能アンロック、特商法導線 | _shared/db, _shared/auth | 3 | ❌ |

#### 1.3.3 依存・優先度・基盤の定義
- **依存**: 先に必要とする他フォルダ。循環なし
- **優先度**: topological sort 順(小さいほど先)。P1=依存なし基盤、P2=P1 のみ依存、…
- **基盤**: 他から多く参照されるもの。横断の db/ui/auth/notification を ✅、機能では inventory が他機能(inspection/shopping-list)から参照されるため ✅

#### 1.3.4 優先度算出結果(topological sort)
```
P1: _shared/db (基盤), _shared/ui (基盤)
P2: _shared/auth (←db, 基盤), _shared/notification (←db, 基盤), _shared/legal, _shared/service-info (←db)
P3: _shared/billing (←db, auth), inventory (←db, auth, ui, 基盤), feedback (←db, auth)
P4: inspection (←inventory, notification), shopping-list (←inventory)
```
循環依存: なし。

#### 1.3.5 命名規約
- 機能フォルダ: ケバブケース業務名(`inventory`, `shopping-list`)
- 横断フォルダ: `_shared/<技術領域>/`

### 1.4 実装コードフォルダ構成（たたき台）

> Q10/Q11 で確定した Vite + React + TS / Vercel Functions / Neon / Drizzle に整合。あくまでたたき台。

```
src/
  features/            # 機能単位（§1.3.1 と命名統一）
    inventory/
    inspection/
    shopping-list/
    feedback/
  components/          # 共通 UI 部品（shadcn/ui ベース）
  hooks/               # 共通フック
  lib/                 # ユーティリティ（期限計算・日付）
  services/            # Neon/Clerk/Resend/Stripe クライアントラッパ
  db/                  # Drizzle スキーマ・マイグレーション（_shared/db に対応）
  types/               # 共通型
  routes/              # ルーティング（or pages/）
api/                   # Vercel Functions（CRUD / cron / webhook / service-info）
```

機能名は §1.3 の機能フォルダと意味を揃える。横断 `_shared/*` は `src/db` `src/lib` `src/services` 等に分散実装される(揃わない場合あり)。

## 2. 前提条件・制約
- **業務前提**: 防災備蓄を持つ(or これから持つ)個人・世帯向け。日本国内。年に数回〜月数回の低頻度利用が前提
- **技術制約**: 初期コスト $0、無料枠厳守。charter §0.2 Neon スタック。1〜2 ヶ月・1 人開発
- **体制・予算・納期**: 1 人開発 / $0 / MVP 1〜2 ヶ月で運用開始

## 3. 非機能要件

| 項目 | 目標値 | 根拠 |
|---|---|---|
| 性能 | 品目 CRUD < 300ms (p95)、点検ダッシュボード初期表示 < 1.5s | 品目数十〜100 件の軽量データ、低頻度利用 |
| 可用性 | 個人ツール水準(SLA なし)。Vercel/Neon 無料枠の可用性に準拠 | 低頻度利用、ミッションクリティカルでない |
| セキュリティ | 認証で世帯データを保護。備蓄品目・保管場所は本人限定。**常備薬は"予備の有無"のみ、病名/処方は扱わない(機微医療情報 C2 回避)**。フィードバック送信前に PII scrub(O28/O40) | 保管場所等は世帯プライバシー。機微医療は扱わない設計境界 |
| 運用・監視 | Sentry(エラー)+ 自前コストログ。無料枠超過アラート(§4.6) | 個人ツール、Cookie バナー回避のため GA4 は入れない |
| スケール上限 | 無料枠内(Neon 0.5GB/DB, Vercel Hobby)。超過時は §4.3 代替へ切替判断 | 商用化想定なし、無料枠厳守 |

<!-- auto-generated-start -->
### 3.1 セキュリティ要件 (auto-added by /flow:secure 2026-05-26)

> /flow:secure --phase=design (L1) が検出した High finding を要件化。詳細: `./SECURITY_REVIEW_20260526.md`

- **[SEC-001 / O23 認可漏れ・所有者分離] 必須**: 全 API/DB クエリで Clerk 認証由来の `userId` による所有者フィルタを強制する。**Neon (素の Postgres) は RLS 非対応**のため DB レベルの自動セーフティネットが無く、アプリ層で全クエリに `where user_id = <auth userId>` を強制すること。`_shared/db` 設計で共通クエリラッパ (例: `withOwner(userId)`) を用意し、各 feature SPEC で「エンドポイント × リソース × 許可操作」の認可マトリクスを設計する。保管場所 (storage_location) は世帯防犯情報に近く IDOR の高インパクト露出面。
- **[SEC-002 / O26 PII ログ漏洩] 必須 (法令必須)**: Sentry `beforeSend` で PII (メール / Clerk トークン / リクエストボディ=品目名・保管場所) をマスク or 除去する。logger・自前コストログ (§4.6.2) に PII を出力しない (匿名 ID or user_id のみ)。エラーメッセージに DB 内容を含めない。委託先 (Sentry) への PII 送信は個人情報保護法上の漏洩扱いとなり報告義務が発生し得るため。
<!-- auto-generated-end -->

## 4. 全体アーキテクチャ

```
ユーザー(PWA/ブラウザ)
   │
   ▼
Vercel (Vite+React フロント / Functions API)
   ├─ Clerk (Auth: ゲスト→段階的認証)
   ├─ Neon (Postgres, この PJ 専用 DB) ── Drizzle ORM
   ├─ Cloudflare R2 (品目写真, 任意)
   ├─ Resend (期限リマインドメール)
   ├─ Stripe (PWYW/one-time 課金)
   ├─ Vercel Cron (期限チェック → 通知トリガー)
   └─ /api/service-info (service-hub が pull、O48)
   │
   ▼
Sentry (エラー監視) / 自前コストログ
```

### 4.1 主要コンポーネント
| 名前 | 責務 | 技術領域 (具体名は例示) |
|---|---|---|
| フロント PWA | 品目管理・点検 UI | Vite + React + TS + shadcn/ui |
| API | CRUD / cron / webhook / service-info | Vercel Functions |
| DB | 品目・通知設定・課金状態 | Neon (Postgres) + Drizzle |
| 認証 | ゲスト→段階的認証 | Clerk |
| 通知 | 期限リマインド配信 | Resend (メール) + アプリ内通知 |
| 課金 | PWYW/one-time | Stripe |

### 4.2 技術スタック（方向性）
- フロント: SPA + PWA(例: Vite + React + TypeScript + shadcn/ui + Tailwind)
- バック: サーバーレス関数(例: Vercel Functions)
- データ層: マネージド Postgres(例: Neon)+ 型安全 ORM(例: Drizzle)
- インフラ: PaaS 完結(例: Vercel Hobby)+ オブジェクトストレージ(例: Cloudflare R2)
- 監視・ログ: エラー監視(例: Sentry)+ 自前コストログ

### 4.3 リソース選定たたき台

> 各 pricing は変動。採用時は最新公式 pricing を必ず確認。

| カテゴリ | 推奨具体名 | 代替候補 | 選定根拠 | 想定単価 (USD/月) |
|---|---|---|---|---|
| フロント FW | Vite + React + TS | Next.js | preferences §2.1(2 PJ 採用)、PWA に十分 | $0 ※ 2026-05 時点想定、最新 pricing 要確認 |
| UI | shadcn/ui + Tailwind | MUI | preferences §2.14(2 PJ)、軽量・カスタム容易 | $0 ※ 同上 |
| DB | Neon (Postgres) | Supabase Pro / CF D1 | charter §0.2、サービスごと DB 分離、無料 10 DB | $0(Free) ※ 同上 |
| ORM | Drizzle | Prisma | preferences §2.13、Neon 親和 | $0 ※ 同上 |
| 認証 | Clerk | Supabase Auth / Lucia | charter §0.2、ゲスト/段階的認証(O22)、Free 10k MAU | $0(Free) ※ 同上 |
| ホスティング | Vercel (Hobby) | Cloudflare Pages | preferences §2.5(2 PJ)、Cron 統合 | $0(Hobby) ※ 同上 |
| Storage | Cloudflare R2 | Vercel Blob | charter §0.2、品目写真、無料 10GB | $0(Free) ※ 同上 |
| メール送信 | Resend | SendGrid | トランザクションメール、Free 3,000 通/月 | $0(Free) ※ 同上 |
| 課金 | Stripe | Paddle | PWYW/one-time、従量手数料のみ | 売上の ~3.6% ※ 同上 |
| スケジューラ | Vercel Cron | GitHub Actions cron | preferences §2.17、期限チェック日次 | $0 ※ 同上 |
| 監視 | Sentry (Free) | — | preferences §2.6(2 PJ)、5k events/月 | $0(Free) ※ 同上 |
| CI/CD | GitHub Actions + Vercel Preview | — | preferences §2.8(2 PJ) | $0 ※ 同上 |
| ドメイン | 既存ドメインのサブドメ | 新規取得 | O29 撤退リスク最小、DNS 1 行で完結 | $0(既存) ※ 同上 |

### 4.4 想定コストサマリ

| 区分 | 月額目安 (USD) | 内訳の例 |
|---|---|---|
| 個人・無料枠(本 PJ) | $0 | Neon Free + Vercel Hobby + Clerk Free + R2 Free + Resend Free + Sentry Free + 既存ドメインのサブドメ |

**本プロジェクトのレンジ**: 個人・無料枠。商用化想定なし、**無料枠厳守、上限到達時は §4.3 代替候補に切替判断**。Stripe 手数料のみ売上連動(PWYW なので売上＝任意支援額)。

### 4.5 ローカル開発環境計画

#### 4.5.1 開発スタイル
**選定**: サーバーレス emulation + マネージド DB(ハイブリッド)。
**理由**: §4.3 が Vercel Functions + Neon + Clerk(全てマネージド/エミュレート可)。重いコンテナは不要。

#### 4.5.2 必要サービス（ローカル起動対象）
| サービス | 役割 | ローカル起動方式 | ポート | 永続化 |
|---|---|---|---|---|
| Vite dev server | フロント | `npm run dev` | 5173 | (なし) |
| Vercel dev (Functions) | API | `vercel dev` | 3000 | (なし) |
| Neon dev ブランチ | DB | クラウド dev ブランチ(branch per env) | — | volume(クラウド) |
| Clerk development | 認証 | Clerk dev インスタンス(キー切替) | — | クラウド |

#### 4.5.3 環境変数・シークレット管理
- `.env.example`(ダミー値、コミット可) / `.env.local`(実値、`.gitignore` 必須)
- シークレット管理: 平文 `.env.local`(個人開発)。pre-commit で gitleaks 推奨(O25)

#### 4.5.4 起動・停止・リセットコマンド
| 操作 | 抽象表現 | 例 |
|---|---|---|
| 起動 | フロント+API起動 | `./scripts/dev.sh`(or `npm run dev` + `vercel dev`) |
| マイグレーション | スキーマ適用 | `npm run db:migrate`(drizzle-kit) |
| リセット | dev DB リセット | `npm run db:reset` |

#### 4.5.5 開発フロー上の留意点
- 初回: `npm install` + `.env.local` 準備 + Neon dev ブランチ作成
- マイグレーション: drizzle-kit、起動前に手動 or 自動
- スマホ実機確認: Windows/WSL2 のポートフォワード案内(/flow:release 手順)
- ホットリロード: Vite HMR、API は vercel dev

#### 4.5.6 CI/CD との関係
- CI で同じ Neon dev ブランチ + モック Clerk を使用
- 本番との差異: 本番は Neon main ブランチ + Clerk production キー
- E2E: Playwright、dev server 相手に headless 実行(Class A)

### 4.6 コスト・収益追跡と継続判断ループ

#### 4.6.1 PJ 性質別の必要レベル
**本 PJ の該当レベル**: 個人ツール / 無料枠(コスト追跡 + 無料枠超過アラート + 撤退判断は必須、収益指標/BEP は不要)。

#### 4.6.2 コスト集計メカニズム
- 外部呼び出し(Resend メール送信数、R2 容量、Stripe イベント、Neon コンピュート時間)を自前ログに積算
- 単価は `.env` で管理(ハードコード禁止):
  ```
  COST_RESEND_PER_1K_EMAILS=...
  COST_R2_STORAGE_PER_GB_MONTH=0.015
  COST_NEON_COMPUTE_PER_HOUR=...
  ```
- `ログ件数 × 単価 = 概算コスト`を日次集計
- 無料枠 80%/100%/120% でアラート(メール)

#### 4.6.3 追跡するコスト指標
| 指標 | 集計頻度 | 集計元 |
|---|---|---|
| Resend メール送信数 | 日次 | 自前ログ + Resend ダッシュボード |
| R2 ストレージ使用量 | 日次 | R2 ダッシュボード |
| Neon コンピュート時間 | 日次 | Neon ダッシュボード |
| Vercel 帯域 | 日次 | Vercel ダッシュボード |

#### 4.6.4 収益指標
本 PJ は無料枠 + PWYW のため MRR/ARR/Churn 追跡は不要。PWYW 支援額の累計のみ任意記録(Stripe ダッシュボード)。

#### 4.6.7 継続 / 縮退 / 撤退判断基準
| 判断 | 基準 | 対応 |
|---|---|---|
| 継続 | 無料枠内 | 通常運用 |
| 縮退 | メール送信が Resend 無料枠超過予測 | 通知頻度を下げる / アプリ内通知優先 |
| 撤退 | 無料枠超過の代替もなく、利用も低迷 | §4.7.5 撤退手順 |

#### 4.6.8 判断主体
本人。月次(任意、四半期推奨)でコストログを確認。

### 4.7 公開戦略・ドメイン・リバースプロキシ

#### 4.7.1 ドメイン情報
- **既存ドメイン**: あり想定(seiji の既存ドメイン)。本サービス URL = `bousai.<example.com>`(サブドメ運用)
- 新規ドメイン取得はしない(O29 撤退リスク最小)

#### 4.7.2 公開構成パターン
**採用: (A) PaaS 完結**(Vercel)。リバースプロキシ不要、運用負担ゼロ。
```
ユーザー → DNS(サブドメ CNAME) → Vercel(フロント + Functions) → Neon / Clerk / Resend / Stripe
```

#### 4.7.3 リバースプロキシ設定
なし(PaaS 完結)。

#### 4.7.4 サブドメ命名規約
- `bousai.<domain>`: 本サービス
- `staging-bousai.<domain>` or Vercel preview: ステージング

#### 4.7.5 撤退時の手順
1. ユーザーに事前通知(1〜3 ヶ月前、アプリ内 + メール)
2. データエクスポート機能を提供(CSV/JSON で品目リスト持ち出し)
3. 課金停止(PWYW なので継続課金なし、Stripe one-time のみ)
4. DNS サブドメレコード削除(1 行)
5. Vercel プロジェクト停止
6. データバックアップ 6 ヶ月保管(個人情報保護法対応)
7. Neon DB 削除 / registry の `adopted_pj` を retired に(将来)

### 4.8 サービス公開周知 / マーケティング戦略

#### 4.8.1 チャネル使い分け
- ターゲット: 防災意識のある個人・世帯(一般層)
- 視覚性: 中(点検 UI のスクショ、ビフォーアフター的な"整った備蓄")
- **本 PJ の選定**: note(使い方/防災 Tips 記事)+ X(Build in Public、既存活動継続)+ SEO 必須。一般 SNS の新規開設はしない

#### 4.8.2 製品内グロース設計
- シェアしたくなる成果物: 「点検完了で全部グリーン」の安心スクショ、買い替えリスト。**ただし控えめな導線**(シェアしなくても全機能使える)
- 招待/競争/ガチャは作らない(charter §2.2、単一ユーザー MVP では特に不要)
- アンチパターン回避: 「災害が来る前に!」等の不安煽り・数字煽りは禁止

#### 4.8.3 SEO / ASO
- 狙うキーワード: 「防災 備蓄 管理 アプリ」「非常食 賞味期限 管理」「防災リュック 点検」
- 技術 SEO: OGP/構造化データ、Core Web Vitals 合格、HTTPS(Vercel 自動)
- コンテンツ SEO: 防災備蓄の点検 Tips を note で月 1 記事

#### 4.8.4 Build in Public ストーリー軸
- 「AI 駆動開発で週 1 ペースの新サービス公開」の 1 つとして淡々と紹介(控えめフッター)
- 防災という社会善テーマは押し付けず、淡々と

#### 4.8.5 OGP / Twitter Card
- `og:title`/`og:description`/`og:image`/`twitter:card=summary_large_image` 設定

#### 4.8.7 コンテンツペース
- 最小: 月 1 note 記事 + 週 1 X(無理なく継続)

### 4.9 デザイン方向(Q12.12、UI を持つため)
- **世界観・ムード**: 穏やか・信頼感・淡々(不安を煽らない、災害恐怖を演出しない)
- **主色の方向**: 落ち着いた緑/青系(安心・整頓の連想)。AI が concept から提案、確定は /flow:design
- **タイポ**: 中立サンセリフ(読みやすさ重視)
- **アイコン&イラスト**: OSS アイコンセット + 自作 SVG(no-key)
- 詳細なデザインシステム生成は Phase 1.5 `/flow:design` が担う(本欄はヒアリングのみ)

## 5. データ設計（高レベル）

### 5.1 主要エンティティ
- **user**(Clerk 連携、ゲスト→アカウント): id, clerk_user_id, plan(free/unlocked)
- **item**(品目): id, user_id, name, category(水/食料/電池/医薬/書類/その他), quantity, storage_location, photo_url(R2), expires_at(or 電池交換目安), note, created_at, updated_at
- **notification_setting**: user_id, channel(email/in-app), enabled, lead_days(期限何日前に通知), quiet_hours
- **inspection_log**: id, user_id, inspected_at, summary(点検結果)
- **billing**(課金状態): user_id, stripe_customer_id, unlocked_features, last_payment_at
- **feedback**: id, user_id?, type(reaction/bug), payload(PII scrub 済), context(route/version/UA), created_at

### 5.2 データフロー
```
品目登録 → item テーブル
Vercel Cron(日次) → expires_at が lead_days 以内の item を抽出 → notification_setting 確認 → Resend メール / アプリ内通知
季節点検 → inspection_log 記録
買い替えリスト → 期限切れ/不足 item を抽出 → PDF 生成
service-hub → /api/service-info を pull(アプリ層指標)
```

## 6. 外部連携

| 連携先 | 用途 | 方式 | 認証 |
|---|---|---|---|
| Clerk | 認証(ゲスト/段階的) | SDK + REST | API キー(.env.local) |
| Neon | DB | Drizzle / 接続文字列 | DATABASE_URL |
| Cloudflare R2 | 品目写真保存(任意) | S3 互換 API | アクセスキー |
| Resend | 期限リマインドメール | REST API | API キー |
| Stripe | PWYW/one-time 課金 | SDK + Webhook | API キー + Webhook 署名 |
| service-hub | アプリ層指標の提供(O48) | `GET /api/service-info`(HUB が pull) | 契約 SoT=service-hub |

**外部 AI サービス利用: なし**(Q12.5 で明示確認。根拠: MVP の価値=期限管理は AI 不要。品目写真の自動登録(賞味期限 OCR)は v2 以降の任意検討)。

**アナリティクス・計測ツール利用: 最小構成**(Q12.6)。Sentry(エラー監視)+ 自前コストログ(§4.6)のみ。**GA4 等の行動分析は入れない**(個人ツール、Cookie バナー実装コスト回避、hana-memo と同方針)。consent banner はトラッキング Cookie を使わないため不要。

## 7. 決定事項ログ

| 日付 | 決定内容 | 根拠 | 影響セクション | decision_id |
|---|---|---|---|---|
| 2026-05-26 | wants 由来の Q1-Q10 を確認採用(名称/ユーザー/課題/UC/規模/NFR/技術=Neon) | wants.md | §1, §2, §3, §4 | [D20260526-002](./AI_LOG/D20260526_001_concept_initial.md#decisions) |
| 2026-05-26 | MVP = 単一ユーザー、家族共有は v2 | 1〜2 ヶ月・1 人開発、招待/共同編集/競合解決/監査の複雑性回避 | §1.2 スコープ | [D20260526-003](./AI_LOG/D20260526_001_concept_initial.md#decisions) |
| 2026-05-26 | アナリティクスは Sentry + 自前コストログのみ(GA4 不採用) | 個人ツール、Cookie バナー回避 | §4.6, §6 | [D20260526-004](./AI_LOG/D20260526_001_concept_initial.md#decisions) |
| 2026-05-26 | 通知=メール(Resend)+ アプリ内、Web Push 不採用 | iOS Safari Push 不安定、charter §2.2 中毒性回避 | §1.1, _shared/notification | [D20260526-005](./AI_LOG/D20260526_001_concept_initial.md#decisions) |
| 2026-05-26 | Git=GitHub private / trunk-based + protected main / Conventional Commits | preferences §2.8 | §10 | [D20260526-006](./AI_LOG/D20260526_001_concept_initial.md#decisions) |
| 2026-05-26 | 公開=既存ドメインのサブドメ + Vercel 完結(PaaS) | O29 撤退リスク最小 | §4.7 | [D20260526-007](./AI_LOG/D20260526_001_concept_initial.md#decisions) |
| 2026-05-26 | 課金=PWYW(品目テンプレ拡張・買い替えリスト PDF) | charter §1.2 第一推奨 | _shared/billing | [D20260526-003](./AI_LOG/D20260526_001_concept_initial.md#decisions) |

## 8. 未決事項（論点リスト）

### [論点-001] 期限のないアイテムの「鮮度」をどう扱うか
- **影響範囲**: inventory, inspection
- **詰めるべき問い**:
  1. 電池/モバイルバッテリーは賞味期限でなく「推奨交換時期」。手入力 or カテゴリ別デフォルト目安?
  2. 現金/コピー書類など期限のないものは点検対象に含めるか(「内容確認」チェックのみ?)
- **候補案**:
  - 案 A: カテゴリ別に「期限あり/交換目安あり/内容確認のみ」の 3 種を用意 ／ 利点: 全品目を統一的に点検 ／ 欠点: カテゴリ設計がやや複雑
  - 案 B: 期限ありのみ通知、それ以外は季節点検チェックリストでまとめて ／ 利点: シンプル ／ 欠点: 期限なし品目の管理が薄い
- **推奨**: 案 A。理由: 防災備蓄は期限なし品目(書類/現金/装備)も点検価値が高く、季節点検の網羅性が増す
- **判断期限**: inventory feature 設計時(/flow:feature inventory)
- **担当**: seiji

### [論点-002] feedback-hub が未構築
- **影響範囲**: feedback
- **詰めるべき問い**: O40 の中央 feedback-hub がまだ無い。本サービスを最初の連携先にするか、MVP は即時通知(運用チャンネル)のみにするか
- **候補案**:
  - 案 A: MVP は自前 DB + 運用チャンネル通知のみ、hub 連携は hub 構築後 ／ 利点: MVP 軽量 ／ 欠点: 横断トリアージは後回し
  - 案 B: 共有 feedback-hub を別 PJ で先に立ち上げ ／ 利点: 全サービス横断 ／ 欠点: 本 PJ の MVP が遅れる
- **推奨**: 案 A。理由: 1〜2 ヶ月 MVP を優先、hub は別途 /flow:ideate→concept で独立 PJ 化
- **判断期限**: feedback feature 設計時
- **担当**: seiji

### [論点-003] service-info エンドポイントのスキーマ
- **影響範囲**: _shared/service-info
- **詰めるべき問い**: service-hub の pull 契約スキーマ(O48)が service-hub 側で確定しているか。確定版に合わせる
- **推奨**: service-hub の concept/SPEC を参照して契約確定後に実装(契約 SoT=service-hub)。MVP では最小(uptime/エラー数/ユーザー数程度)で先行可
- **判断期限**: _shared/service-info 設計時
- **担当**: seiji

### [論点-004] [SEC-001] 認可漏れ・所有者分離: High
- **status**: `accepted-as-requirement`
- **status 履歴**: 2026-05-26 20:20 open → 2026-05-26 20:20 accepted-as-requirement (理由: concept §3.1 NFR に要件化、/flow:secure --phase=design 自動 dispatch)
- **影響範囲**: §3 NFR, §5, §6, 全 feature (特に inventory/inspection/shopping-list/billing/feedback), _shared/db
- **観点 ID**: O23_authorization_check
- **severity**: High
- **検出根拠**: Neon (素の Postgres) + Drizzle = RLS セーフティネット無し。§3 は「本人限定」の意図のみで全クエリ所有者強制機構が未設計。multi-tenant 公開 + 保管場所等の防犯情報で IDOR 高インパクト
- **詰めるべき問い**: 認可マトリクス (エンドポイント × リソース × 操作) の具体設計、共通クエリラッパの実装方式
- **推奨**: §3.1 NFR の要件に従い feature SPEC で認可マトリクスを設計。`_shared/db` に `withOwner(userId)` 共通ラッパ
- **判断期限**: 実装着手前 (各 feature 設計時)
- **担当**: seiji
- **L1 レポート**: `./SECURITY_REVIEW_20260526.md#sec-001`

### [論点-005] [SEC-002] PII ログ漏洩: High (法令必須)
- **status**: `accepted-as-requirement`
- **status 履歴**: 2026-05-26 20:20 open → 2026-05-26 20:20 accepted-as-requirement (理由: concept §3.1 NFR に要件化、legal_required=true)
- **影響範囲**: §3 NFR, §4.6, §9.1, §9.2, _shared/notification, feedback
- **観点 ID**: O26_pii_logging
- **severity**: High (legal_required=true、除外不可)
- **検出根拠**: feedback PII scrub は明示済だが Sentry beforeSend / logger / コストログ全般の PII マスクが未明示。委託先送信は個人情報保護法上の漏洩扱い
- **推奨**: §3.1 NFR の要件に従い Sentry beforeSend マスク + logger PII 非出力を実装
- **判断期限**: 実装着手前 (_shared/notification + Sentry 設定時)
- **担当**: seiji
- **L1 レポート**: `./SECURITY_REVIEW_20260526.md#sec-002`

### [論点-006] [SEC-003] 入力検証 (Zod / CSV インジェクション / XSS): Medium
- **status**: `open`
- **status 履歴**: 2026-05-26 20:20 open
- **影響範囲**: inventory, shopping-list, feedback
- **観点 ID**: O24_input_validation
- **severity**: Medium (Drizzle で SQLi 緩和・React で XSS 基本緩和の部分対応)
- **検出根拠**: API 入力スキーマ (Zod) 一元化方針が未記載。買い替えリスト出力 (UC4 CSV/PDF) の CSV インジェクションエスケープ未設計。photo_url 取り扱い時の SSRF 検討
- **推奨**: feature 設計時に Zod 入力スキーマ + エクスポート時 CSV インジェクションエスケープを SPEC 化 → status=dispatched-to-feature
- **判断期限**: inventory / shopping-list feature 設計時
- **担当**: seiji
- **L1 レポート**: `./SECURITY_REVIEW_20260526.md#sec-003`

### [論点-007] [SEC-004] レート制限 / 公開エンドポイント: Medium
- **status**: `open`
- **status 履歴**: 2026-05-26 20:20 open
- **影響範囲**: feedback, _shared/service-info
- **観点 ID**: O27_rate_limit_scope
- **severity**: Medium
- **検出根拠**: feedback 送信 API が user_id nullable=ゲスト送信可=認証不要公開エンドポイント、レート制限/bot 対策未設計。/api/service-info の認可スコープ・レート制限が contract 依存で未確定 (論点-003 関連)
- **推奨**: feature 設計時に公開エンドポイントへレート制限 (IP/ユーザー単位) + bot 対策 (Turnstile/honeypot) を SPEC 化 → status=dispatched-to-feature
- **判断期限**: feedback / _shared/service-info feature 設計時
- **担当**: seiji
- **L1 レポート**: `./SECURITY_REVIEW_20260526.md#sec-004`

## 9. 法務・コンプライアンス書類

> 公開 + 有償(PWYW)PJ。最低 §9.1 プライバシーポリシー必須、有償時 §9.4 特商法表記必須。

### 9.1 必須書類チェックリスト
| 書類 | 必要性 | 状態 | 配置パス / URL | 備考 |
|---|---|---|---|---|
| プライバシーポリシー | ✅ | 未作成 | `/legal/privacy` | Clerk 経由メール等を扱う公開 PJ で必須 |
| 利用規約 | ✅ | 未作成 | `/legal/terms` | 公開サービス。免責(防災情報の正確性を保証しない)明記 |
| 特定商取引法に基づく表記 | ✅ | 未作成 | `/legal/specified-commercial-transactions` | PWYW/one-time 課金公開前に必須 |
| Cookie ポリシー | ❌ | — | — | トラッキング Cookie 不使用のため不要 |

### 9.2 対応地域法規
| 法規 | 対象ユーザー有無 | 対応方針 |
|---|---|---|
| 個人情報保護法 (日本) | ✅ | 取得目的明示 / 開示請求窓口 / 保管期間 |
| GDPR (EU) | ❌(国内向け) | 当面対象外、海外ユーザー増時に再評価 |

### 9.3 書類作成方針
- 作成手段: テンプレ採用(Termly 等)+ 自前ドラフト。配置: `_shared/legal/` に原稿、公開時 `/legal/*`
- 公開導線: フッタリンク + 課金前の同意 + 免責(防災情報)表示

### 9.4 特定商取引法(日本国内 + 有償)
- 販売事業者/代表者/所在地(個人事業主は「請求あれば遅滞なく開示」記載で省略可)/連絡先/価格/支払・引渡・返品条件を有料公開前に整備

## 10. Git リポジトリ・運用

### 10.1 リポジトリ情報
| 項目 | 値 |
|---|---|
| リポジトリ URL | (未作成、GitHub に bousai-bag-checker を private で作成予定) |
| 可視性 | private |
| ホスティング | GitHub |
| デフォルトブランチ | main |

### 10.2 ブランチ戦略
- Trunk-based + Protected main(推奨デフォルト)
- protected_branches: `[main]`、auto_branch_prefix: `flow/`

### 10.3 コミット規約
- Conventional Commits。flow コマンドは `docs(flow:<command>): ...`

### 10.5 CI / CD
- `.github/workflows/`: lint/typecheck/test(PR)、Vercel preview deploy、Dependabot

### 10.6 flow コマンド自動コミット方針
```yaml
auto_commit: true
branch_strategy: trunk-based
commit_message_lang: ja
protected_branches: [main]
auto_branch_prefix: "flow/"
```

### 10.7 セキュリティ
- `.env*.local` を `.gitignore`、pre-commit で gitleaks(O25)

## 11. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成(wants.md I20260526-008 由来、/flow:ideate から連鎖)。MVP=単一ユーザー、家族共有 v2 | /flow:concept |
