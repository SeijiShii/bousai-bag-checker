import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusChip } from "./status-chip";

// 絵文字の混入検出 (UI アイコンは lucide/SVG のみ、design-system §7)
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

describe("StatusChip (鮮度3段階)", () => {
  it("U-N3: fresh は data-status=fresh + ラベル + アイコン(svg)", () => {
    const { container } = render(<StatusChip status="fresh" />);
    const chip = container.querySelector('[data-status="fresh"]');
    expect(chip).toBeInTheDocument();
    expect(screen.getByText("問題なし")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("warn / expired も data-status とラベルが対応", () => {
    const { container: w } = render(<StatusChip status="warn" />);
    expect(w.querySelector('[data-status="warn"]')).toBeInTheDocument();
    expect(w.textContent).toContain("そろそろ点検");

    const { container: e } = render(<StatusChip status="expired" />);
    expect(e.querySelector('[data-status="expired"]')).toBeInTheDocument();
    expect(e.textContent).toContain("交換の時期");
  });

  it("U-B1: 出力に絵文字を含まない (lucide のみ)", () => {
    const { container } = render(<StatusChip status="warn" />);
    expect(EMOJI.test(container.textContent ?? "")).toBe(false);
  });
});
