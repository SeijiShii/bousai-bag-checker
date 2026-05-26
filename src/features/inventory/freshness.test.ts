import { describe, it, expect } from "vitest";
import { computeFreshness, isDue, type FreshnessInput } from "./freshness";

const NOW = new Date("2026-05-27T00:00:00");
const base: FreshnessInput = {
  freshnessType: "expiry",
  expiresAt: null,
  replaceMonths: null,
  createdAt: NOW,
};

function days(n: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  // local 日付で 'YYYY-MM-DD' (toISOString だと UTC ずれするため)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

describe("computeFreshness (論点-001 案A)", () => {
  it("U-N1: expiry 期限14日後 + lead 14 → warn", () => {
    expect(computeFreshness({ ...base, expiresAt: days(14) }, 14, NOW)).toBe(
      "warn",
    );
  });
  it("U-N2: expiry 期限60日後 → fresh", () => {
    expect(computeFreshness({ ...base, expiresAt: days(60) }, 14, NOW)).toBe(
      "fresh",
    );
  });
  it("U-N3: expiry 期限切れ → expired", () => {
    expect(computeFreshness({ ...base, expiresAt: days(-1) }, 14, NOW)).toBe(
      "expired",
    );
  });
  it("U-N4: replace_guide 交換目安超過 → expired", () => {
    const created = new Date("2020-01-01T00:00:00");
    expect(
      computeFreshness(
        {
          freshnessType: "replace_guide",
          expiresAt: null,
          replaceMonths: 12,
          createdAt: created,
        },
        14,
        NOW,
      ),
    ).toBe("expired");
  });
  it("U-N5: check_only は期限判定なし → fresh", () => {
    expect(
      computeFreshness({ ...base, freshnessType: "check_only" }, 14, NOW),
    ).toBe("fresh");
  });
  it("U-B3: 期限=ちょうど今日(残0日)→ warn(境界含む)", () => {
    expect(computeFreshness({ ...base, expiresAt: days(0) }, 14, NOW)).toBe(
      "warn",
    );
  });
  it("isDue: warn/expired のみ true、check_only は false", () => {
    expect(isDue({ ...base, expiresAt: days(5) }, 14, NOW)).toBe(true);
    expect(isDue({ ...base, expiresAt: days(60) }, 14, NOW)).toBe(false);
    expect(isDue({ ...base, freshnessType: "check_only" }, 14, NOW)).toBe(
      false,
    );
  });
});
