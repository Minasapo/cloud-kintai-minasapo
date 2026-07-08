import { normalizeLockDateKey, toCellKey, toLockId } from "../lockUtils";

describe("lockUtils", () => {
  it("YYYY-MM-DD 形式を DD に正規化する", () => {
    expect(normalizeLockDateKey("2026-07-08")).toBe("08");
  });

  it("DD 形式はそのまま維持する", () => {
    expect(normalizeLockDateKey("01")).toBe("01");
  });

  it("toCellKey は日付形式が混在しても同一キーになる", () => {
    expect(toCellKey("staff-1", "08")).toBe(toCellKey("staff-1", "2026-07-08"));
  });

  it("toLockId は日付形式が混在しても同一IDになる", () => {
    expect(toLockId("2026-07", "staff-1", "08")).toBe(
      toLockId("2026-07", "staff-1", "2026-07-08"),
    );
  });
});
