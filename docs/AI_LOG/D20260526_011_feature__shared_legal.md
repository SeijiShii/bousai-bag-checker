# AI_LOG セッション D20260526_011 — /flow:feature _shared/legal

**実行日時**: 2026-05-26 20:43 〜 20:44 (+09:00)
**コマンド**: /flow:feature _shared/legal
**対象**: _shared/legal (横断基盤、cross-cutting)
**実行者**: Claude (Opus 4.7) + seiji
**状態**: 完了 (SPEC/PLAN/UNIT_TEST。E2E cross-cutting スキップ)
**含まれる decision**: D20260526-041 〜 D20260526-042
**起動元**: /flow:auto (D20260526_002, 反復 9, P2)

---

## 主要決定サマリ
- D-041: タグ = cross-cutting (静的法務ページ、公開・auth 不要)
- D-042: privacy/terms/特商法(投げ銭)の 3 ページ + フッタ導線 + 免責。投げ銭は特商法「販売」原則非該当だが表現を公開前に人間確認 (論点-S-legal-1)。法令文言の実テキストは公開前に人間レビュー (§9.3)

## 生成・更新したアーティファクト
- 新規: 001/002/003 (_shared/legal)
- 更新: legal/INDEX.md / docs/INDEX.md (legal=設計済✅)

## Open 論点
- [論点-S-legal-1] 投げ銭の特商法該当性の最終確認 (担当 seiji、公開前)

## 整合性チェック
- §9 法務必須 (privacy+terms 公開前必須)、§9.4 投げ銭表記、O43(価格透明性)/O38(コピー)。依存先 ui 設計済。

---

## decisions

### D20260526-041
- question: _shared/legal のタグ
- chosen: cross-cutting (静的法務ページ)
- chosen_type: auto-recommended
- context: 公開・auth 不要の静的ページ群

### D20260526-042
- question: 法務ページ構成と投げ銭の特商法扱い
- chosen: privacy/terms/特商法(投げ銭) 3 ページ + フッタ導線 + 免責。投げ銭=対価なき任意支援で特商法原則非該当、表現は公開前に人間確認 (論点-S-legal-1)。実テキストは公開前 human レビュー
- chosen_type: auto-recommended
- context: concept §9 + D-028 投げ銭。構造・必須項目・導線は auto-pick、法的文言の最終責任は人間 (§9.3)
- depends_on: [D20260526-028 (投げ銭), D20260526-034 (ui)]
