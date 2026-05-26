// 利用規約 (§9.1)。免責(防災情報の正確性を保証しない)を明記。公開前に人間レビュー。
export const DISCLAIMER_TEXT =
  '本サービスは備蓄の鮮度管理を補助するもので、防災情報・避難判断の正確性や完全性を保証しません。災害時の判断は公的情報に従ってください。';

export function Terms() {
  return (
    <article className="mx-auto max-w-2xl p-5">
      <h1 className="text-2xl">利用規約</h1>
      <section>
        <h2 className="text-lg">サービス内容</h2>
        <p>防災備蓄の品目登録・期限リマインド・季節点検・買い物 TODO を提供します(全機能無料)。</p>
      </section>
      <section>
        <h2 className="text-lg">免責事項</h2>
        <p>{DISCLAIMER_TEXT}</p>
      </section>
      <section>
        <h2 className="text-lg">禁止事項・準拠法</h2>
        <p>不正利用を禁止します。準拠法は日本法とします。</p>
      </section>
    </article>
  );
}
