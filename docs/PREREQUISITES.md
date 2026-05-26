# 実装前準備チェックリスト

**最終更新**: 2026-05-26 19:55
**集約元**: §4.3 リソース選定 / §6 外部連携 / §9 法務 / §4.5 ローカル開発 / charter / perspectives O22 / O25
**生成元**: /flow:concept

> 状態列 (`❌ / ✅ / △ / N/A`) は `<!-- user-edit -->` 区間で手動更新可。

<!-- auto-generated-start -->

## 1. 外部 API キー (環境変数 `.env.local`)

| サービス | 環境変数名 | 用途 | 取得 URL | 無料枠 |
|---|---|---|---|---|
| Clerk | `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | 認証 | clerk.com | 10,000 MAU |
| Neon | `DATABASE_URL` | DB 接続 | neon.tech | 0.5GB × 10 DB |
| Cloudflare R2 | `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | 品目写真(任意) | cloudflare.com → R2 | 10GB |
| Resend | `RESEND_API_KEY` | 期限リマインドメール | resend.com | 3,000 通/月 |
| Stripe | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | 100円 one-time 買い切り課金 | dashboard.stripe.com | 従量手数料のみ |
| Sentry | `SENTRY_DSN` | エラー監視 | sentry.io | 5,000 events/月 |

## 2. BaaS / インフラアカウント (charter §0 Neon スタック)

| サービス | 用途 | 取得 URL | プラン | 制限 |
|---|---|---|---|---|
| Neon | DB (この PJ 専用) | neon.tech | Free | 0.5GB、コンピュート月 191.9h |
| Vercel | ホスティング + Functions + Cron | vercel.com | Hobby | 100GB 帯域、12 functions |
| Clerk | Auth | clerk.com | Free | 10,000 MAU |
| Cloudflare R2 | Storage(任意) | cloudflare.com | Free | 10GB、エグレス無料 |

## 3. ドメイン (公開 PJ、§4.7)

### 3.1 既存ドメインの活用 (推奨)
| 項目 | 内容 |
|---|---|
| 既存ドメイン | seiji の既存ドメイン(取得済) |
| 本サービス URL | `bousai.<example.com>` (サブドメ) |
| DNS 設定 | CNAME を Vercel 指示先に追加 |
| 撤退時 | DNS レコード 1 行削除で完結 |

### 3.3 PaaS デフォルト (検証段階)
| サービス | デフォルトドメイン |
|---|---|
| Vercel | `<project>.vercel.app` (検証段階で十分) |

## 4. 認証プロバイダ設定 (O22)

| 項目 | 取得方法 | 備考 |
|---|---|---|
| Clerk App 作成 | clerk.com → New Application | Publishable / Secret Key を .env.local |
| ゲスト認証 (O22) | Clerk Anonymous sign-in 有効化 | 起動 → 即利用、課金/同期時に連携 |
| Google OAuth (任意) | console.cloud.google.com | Clerk の Social Provider で利用 |
| パスキー (任意) | Clerk Passkeys 有効化 | v2 検討 |

## 5. 決済プロバイダ設定 (有償 PJ、charter §1)

| 項目 | 取得方法 | 備考 |
|---|---|---|
| Stripe アカウント本人確認 | dashboard.stripe.com | 国内有償時必須 |
| Stripe API キー (test/live) | dashboard.stripe.com/apikeys | live は本番デプロイ後 |
| Webhook エンドポイント登録 | dashboard.stripe.com/webhooks | 署名検証鍵を .env.local |

## 6. 法務書類準備 (§9)

| 書類 | 必要性 | 配置 URL | 作成方法 |
|---|---|---|---|
| プライバシーポリシー | ✅ 必須 | `/legal/privacy` | テンプレ + 自前ドラフト |
| 利用規約 | ✅ 必須 | `/legal/terms` | 免責(防災情報)明記 |
| 特定商取引法表記 | ✅ 有償時必須 | `/legal/specified-commercial-transactions` | 自前作成 |
| Cookie 同意 | ❌ 不要 | — | トラッキング Cookie 不使用 |

## 7. 監視・アナリティクス (O01)

| サービス | 用途 | 取得 URL | プラン |
|---|---|---|---|
| Sentry | エラー監視 | sentry.io | Free |
| (GA4 等行動分析) | — | — | **入れない**(Cookie バナー回避) |

## 8. メール送信プロバイダ (O07、通知あり)

| サービス | 用途 | プラン | 備考 |
|---|---|---|---|
| Resend | 期限リマインドメール | Free 3,000 通/月 | ドメイン認証必要 |

## 10. ローカル開発環境準備 (§4.5)

| 項目 | コマンド / 手順 |
|---|---|
| Node.js | nvm 等で管理(LTS) |
| Drizzle Kit | `npm i -D drizzle-kit`、`npm run db:migrate` |
| Vercel CLI | `npm i -g vercel`、`vercel dev` |
| `.env.example` 作成 | §1/§4/§5/§7/§8 のキー名をダミー値付きで列挙 |
| `.env.local` 作成 | 実値入力、`.gitignore` 確認 |
| pre-commit hook | gitleaks で秘密情報コミット防止(O25) |

## 11. コスト試算 (§4.4)
- **初期コスト**: $0
- **月額目安**: $0(全サービス無料枠 + 既存ドメインのサブドメ)。Stripe 手数料のみ売上連動
- **無料枠超過アラート**: Resend メール送信数 / Neon コンピュート時間を §4.6.2 で自前監視

## 12. 実装着手前 最終チェックリスト
- [ ] §1-§9 の必須項目すべて取得済み
- [ ] `.env.example` 作成、必須キー定義済み
- [ ] `.gitignore` に `.env*.local` / `.env` 追加 (O25)
- [ ] 法務書類のドラフト作成済み(公開前確認用)
- [ ] preferences.md に採用ベンダー記録済み
- [ ] `/flow:secure` で L1 設計レビュー実施済み
- [ ] CI に `npm audit` / Dependabot 組み込み

<!-- auto-generated-end -->

<!-- user-edit-start -->

## 取得状況 (状態列、手動更新)

| 項目 | 状態 | 取得日 / 備考 |
|---|---|---|
| Clerk アプリ | ❌ | |
| Neon プロジェクト | ❌ | |
| Resend ドメイン認証 | ❌ | |
| Stripe アカウント | ❌ | (有償公開前) |
| 法務書類ドラフト | ❌ | |

<!-- user-edit-end -->
