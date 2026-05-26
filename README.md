# 持ち出し袋チェッカー

![CI](https://github.com/SeijiShii/bousai-bag-checker/actions/workflows/ci.yml/badge.svg)

防災リュック(持ち出し袋)の中身を登録し、賞味期限・電池切れを季節ごとに点検リマインドする「自宅備蓄の鮮度管理」アプリ。

## 概要

防災備蓄を揃えたものの、その後の鮮度管理が放置になっている個人・世帯向けの PWA。「備えたつもり」の備蓄が期限切れ・電池切れで、いざという時に使えない問題を解決する。災害情報アプリでも防災グッズの物販でもなく、**すでに持っている備蓄を実効性ある状態に保つ**ことだけにフォーカスし、不安を煽らず淡々と点検できる。

MVP は単一ユーザー(1 世帯 = 1 アカウント)設計。家族での共有編集は v2。

## 主要機能

- **品目登録 (inventory)**: 水・非常食・電池・常備薬の予備・書類などを期限/数量/保管場所とともに登録
- **点検リマインド (inspection)**: 期限が近づくとメール/アプリ内通知。防災の日など季節の節目にまとめて点検
- **買い物 TODO リスト (shopping-list)**: 期限切れ・不足分を買い物 TODO リストに起こし、買ったものをチェックして購入管理(無料)
- **投げ銭 (任意)**: 社会善アプリのため全機能無料。気に入ったら 100 円の投げ銭で任意支援(機能アンロックなし)
- **フィードバック (feedback)**: 好き嫌い + バグ報告ウィジェット

## 技術スタック

- フロント: Vite + React + TypeScript + shadcn/ui + Tailwind
- バック: Vercel Functions
- DB: Neon (Postgres) + Drizzle ORM
- 認証: Clerk (ゲスト → 段階的認証)
- Storage: Cloudflare R2 (品目写真、任意)
- メール: Resend / 投げ銭: Stripe (100 円の任意支援)
- 監視: Sentry / スケジューラ: Vercel Cron

## Getting Started (Local Development)

### 前提条件
- Node.js 20 (LTS) + `npm ci`
- **ローカル開発は API キー不要** (keyless): dev は in-memory backend で動く。実 Clerk/Neon/Stripe/Resend はリリース時のみ(`.env.example` 参照、詳細は [docs/PREREQUISITES.md](./docs/PREREQUISITES.md))

### 起動
```bash
./scripts/dev.sh   # keyless dev サーバー起動 + smoke 確認 (http://localhost:5173)
./scripts/stop.sh  # 停止
# api 結合を確認したいとき:
VITE_BACKEND=http npm run dev   # フロント
vercel dev                      # Functions API (要 .env.local)
```

### よく使うコマンド
| 用途 | コマンド |
|---|---|
| dev サーバー起動 | `./scripts/dev.sh` / `npm run dev` |
| 本番ビルド | `npm run build` |
| DB マイグレーション | `npm run db:migrate` |
| 型チェック | `npm run typecheck` |
| ユニットテスト | `npm run test` |

詳細: [docs/concept.md §4.5](./docs/concept.md)

## 開発状態

MVP 実装中。全 11 ターゲット(機能 4 + 横断 7)の unit 実装 + app shell bootstrap 完了(134 テスト green、production build OK、keyless 起動可)。次は E2E / 視覚デザインレビュー / リリース(実キー設定 + デプロイ)。

## 設計ドキュメント

- [全体概念・要件・設計](./docs/concept.md) — プロジェクト中央書類(`/flow:concept` で生成・更新)
- [開発シナリオ](./docs/SCENARIO.md) — next-step 判断用ナラティブ
- [機能フォルダ INDEX](./docs/INDEX.md) — 全機能フォルダ + 横断フォルダのリスト
- [AI 用エントリポイント](./docs/DOC_MAP.md) — 目的別アクセスガイド
- [実装前準備チェックリスト](./docs/PREREQUISITES.md) — API キー / アカウント / 法務書類

## ライセンス

All Rights Reserved (公開サービス、現時点では非 OSS)。
