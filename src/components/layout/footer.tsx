// フッタ: 法務リンク + 控えめなメイカー文脈 (§4.8.4、煽らない)。
export const LEGAL_LINKS = [
  { href: '/legal/privacy', label: 'プライバシーポリシー' },
  { href: '/legal/terms', label: '利用規約' },
  { href: '/legal/specified-commercial-transactions', label: '投げ銭・運営者情報' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border p-4 text-sm text-text-muted">
      <nav aria-label="法務" className="flex flex-wrap gap-4">
        {LEGAL_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="hover:text-text">
            {l.label}
          </a>
        ))}
      </nav>
      <p className="mt-2 text-xs">AI 駆動開発で公開している個人プロジェクトです。</p>
    </footer>
  );
}
