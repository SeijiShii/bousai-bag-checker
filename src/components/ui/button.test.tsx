import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("U-N2: role=button + アクセシブル名 + variant クラス", () => {
    render(<Button variant="primary">追加</Button>);
    const btn = screen.getByRole("button", { name: "追加" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain("bg-primary");
  });

  it("U-E2: disabled はクリック無効", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        送信
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "送信" });
    expect(btn).toBeDisabled();
    btn.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("U-B2: 最小タップ領域 44px のクラスを持つ", () => {
    render(<Button>tap</Button>);
    expect(screen.getByRole("button").className).toContain("min-h-[44px]");
  });
});
