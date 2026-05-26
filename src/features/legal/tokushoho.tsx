// 特商法/投げ銭表記 (§9.4)。投げ銭=対価なき任意支援で特商法「販売」原則非該当。
// 運営者情報 + 「支援は任意・追加機能なし・返金原則不可」を明示 (O43)。公開前に人間確認 (論点-S-legal-1)。
export const TIP_NOTICE =
  '100円の投げ銭は任意の支援です。支払っても追加機能は得られません(全機能無料)。デジタルの性質上、返金は原則できません。';

export function Tokushoho() {
  return (
    <article className="mx-auto max-w-2xl p-5">
      <h1 className="text-2xl">投げ銭・運営者情報</h1>
      <section>
        <h2 className="text-lg">運営者</h2>
        <p>運営者名・連絡先(請求があれば遅滞なく開示)。</p>
      </section>
      <section>
        <h2 className="text-lg">投げ銭について</h2>
        <p>{TIP_NOTICE}</p>
        <p>支払方法: クレジットカード等(Stripe)。継続課金はありません(単発)。</p>
      </section>
    </article>
  );
}
