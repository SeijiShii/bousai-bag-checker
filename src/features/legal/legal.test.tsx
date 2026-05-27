import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyPolicy, PRIVACY_SECTIONS } from "./privacy";
import { Terms, DISCLAIMER_TEXT } from "./terms";
import { Tokushoho, TIP_NOTICE } from "./tokushoho";
import { Footer, LEGAL_LINKS } from "@/components/layout/footer";
import i18n from "@/i18n/config";

describe("legal pages", () => {
  it("U-N1: プライバシーは必須セクションを全て含む", () => {
    render(<PrivacyPolicy />);
    for (const s of PRIVACY_SECTIONS) {
      expect(screen.getByRole("heading", { name: s })).toBeInTheDocument();
    }
  });

  it("U-N2: 利用規約は防災情報免責を含む", () => {
    render(<Terms />);
    expect(screen.getByText(DISCLAIMER_TEXT)).toBeInTheDocument();
    expect(DISCLAIMER_TEXT).toContain("公的情報");
  });

  it("U-N3/N6 (O43): 投げ銭表記は任意・追加機能なし・返金不可を明示", () => {
    render(<Tokushoho />);
    expect(screen.getByText(TIP_NOTICE)).toBeInTheDocument();
    expect(TIP_NOTICE).toContain("任意");
    expect(TIP_NOTICE).toContain("追加機能は得られません");
    expect(TIP_NOTICE).toContain("返金は原則できません");
  });

  it("U-N4: フッタは3つの法務ページへのリンクを持つ", () => {
    render(<Footer />);
    for (const l of LEGAL_LINKS) {
      const link = screen.getByRole("link", { name: i18n.t(l.labelKey) });
      expect(link).toHaveAttribute("href", l.href);
    }
  });
});
