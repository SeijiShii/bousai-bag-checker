# AI_LOG セッション D20260527_031 — app-shell bootstrap (Phase 3.5 deferred)

**実行日時**: 2026-05-27 (+09:00)
**コマンド**: /flow:auto loop 内 P4.5/P4.4(b) 解錠のための no-key/Class-A bootstrap (§4.5.1#0)
**モード**: feature (横断 app-shell) / **状態**: 完了
**含まれる decision**: D20260527-079〜082
**起動元**: /flow:auto (D20260526_002)。全11 unit 実装完了後、E2E gate(P4.5) + Design 視覚レビュー(P4.4b) が app shell 不在でブロック → §4.5.1#0 に従い no-key 前提作業として bootstrap を実施

---

## 背景 / なぜ bootstrap か
- 全11ターゲットの unit 実装は完了(102テスト green)だが、index.html / main.tsx / App.tsx / api/ / vite.config が皆無 = **起動する画面が無い**
- P4.5 E2E gate と P4.4(b) Design 視覚レビューは**起動する画面が前提** → 両ゲートが app shell でブロック
- §4.5.1#0: 停止前に gated item の no-key/Class-A 変種を実行する義務。app shell bootstrap(Vite entry + routing + 画面合成 + injectable backend(memory で keyless) + dev script + CI)はすべて no-key Class A で、両ゲートを解錠する最優先作業

## アーキ決定 (auto-pick、可逆性優先 auto-pick-policy §1.5)
- **データ層 = injectable Backend port**: screens は `Backend` interface 経由でデータ取得。memory 実装(keyless、E2E/dev 用)+ HTTP 実装(/api/* 呼び出し、実 SDK は release で wiring)。可逆で E2E を keyless 化できる
- **ルーティング = 最小 path ベース tab 切替**(react-router 未導入を維持、新規 dep 回避、可逆)
- **api/ Vercel Functions = injectable seam**: getAuthUserId(Clerk) + makeOwner + services を配線、実 Clerk/Neon は release(O35)

## Phase 構成
- Phase A: build config(vite.config) + entry(index.html/main.tsx) + App shell(BottomNav tab + 法務 path routing + O41 ヘッダ) + screen 雛形
- Phase B: Backend port + memory 実装 + Provider(keyless データ層)
- Phase C: 各 screen を feature コンポーネント + backend に配線
- Phase D: api/ endpoints(injectable、実 SDK deferred)+ httpBackend
- Phase E: dev tooling(scripts/dev.sh)+ .env.example + CI(ci.yml/dependabot/PR テンプレ)

---

## decisions

### D20260527-079
- question: 全11 unit 完了後の次アクション(E2E/Design gate が app shell でブロック)
- chosen: app shell bootstrap を no-key/Class-A 前提作業として実施(§4.5.1#0)。停止しない
- chosen_type: auto-recommended
- context: index.html/main.tsx/App.tsx/api/vite.config 皆無で画面が起動せず E2E(P4.5)+Design(P4.4b) 両ブロック。bootstrap は no-key Class A で両解錠
- depends_on: [D20260527-078]

### D20260527-080
- question: フロントエンドのデータ層アーキ
- chosen: injectable Backend port(memory 実装で keyless E2E + HTTP 実装で本番)。ルーティングは最小 path ベース(新規 dep 回避)
- chosen_type: auto-recommended
- context: 可逆性優先(auto-pick-policy §1.5)。memory backend で E2E を keyless 化、実 SDK は release(O35)
- depends_on: [D20260527-079]

### D20260527-081
- question: 本番 api 経路の実装(Phase D)
- chosen: src/server/api/apiCore(framework 非依存、PGlite テスト)+ 薄い Vercel adapter(api/*)+ httpBackend。実 Clerk/Stripe/Resend は composition seam 経由で release 注入(O35)
- chosen_type: auto-recommended
- context: apiCore は userId=auth seam 解決(SEC-001 信用入口)で全 CRUD を withOwner 経由。他人id→false/null で IDOR 不可。8+6 テスト green。エラーに PII 含めない(SEC-002)、cron は CRON_SECRET 保護
- depends_on: [D20260527-080]

### D20260527-082
- question: dev tooling + CI(Phase E、O36/O37)
- chosen: scripts/dev.sh(keyless launcher + smoke)/stop.sh + .env.example 拡張 + ci.yml(typecheck/test/build/audit)+ dependabot。PR テンプレは hook ポリシーでスキップ
- chosen_type: auto-recommended
- context: O36 完了条件「bash scripts/dev.sh で smoke green」達成。keyless dev で API キー不要。全 134 テスト green + production build OK
- depends_on: [D20260527-081]

---

## 完了サマリ (Phase A-E)
- **Phase A**: Vite entry + BottomNav tab shell + 法務 path routing + O41 ヘッダ(6テスト)
- **Phase B**: injectable Backend port + keyless memory 実装 + Provider(8テスト)
- **Phase C**: 各 screen を feature コンポーネント + backend に配線(4テスト)
- **Phase D**: api core(SEC-001、PGlite 8テスト)+ Vercel adapters + httpBackend(6テスト)
- **Phase E**: dev launcher(smoke green)+ CI + .env.example + README
- **成果**: 全 134 テスト green、production build OK、`bash scripts/dev.sh` で keyless 起動、本番データ経路配線済(実 SDK は release 注入)
- **両ゲート解錠**: P4.4(b) Design 視覚レビュー + P4.5 E2E が起動する画面を得た → 次反復で評価可能
- **release 残**: 実キー FILL(Clerk/Stripe/Resend/R2/Sentry/Cron)+ Vercel デプロイ(P4.7)
