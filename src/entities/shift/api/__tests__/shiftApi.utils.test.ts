import {
  buildShiftRequestsFilter,
  buildShiftRequestTagId,
  nonNullable,
} from "../shiftApi";

describe("shiftApi utils", () => {
  it("nonNullableはnullとundefinedを除外する", () => {
    const input = ["a", null, "b", undefined];
    expect(input.filter(nonNullable)).toEqual(["a", "b"]);
  });

  it("buildShiftRequestTagIdはidがあればそれを返す", () => {
    expect(buildShiftRequestTagId({ id: "req-1" })).toBe("req-1");
  });

  it("buildShiftRequestTagIdはidがなければunknownを返す", () => {
    expect(buildShiftRequestTagId({ id: null })).toBe("unknown");
  });

  it("buildShiftRequestsFilterはstaffIdsが1件の場合に単一条件を返す", () => {
    expect(
      buildShiftRequestsFilter({
        staffIds: ["staff-1"],
        targetMonth: "2026-02",
      }),
    ).toEqual({
      staffId: { eq: "staff-1" },
      targetMonth: { eq: "2026-02" },
    });
  });

  it("buildShiftRequestsFilterはstaffIdsが複数の場合にor条件を返す", () => {
    expect(
      buildShiftRequestsFilter({
        staffIds: ["staff-1", "staff-2"],
        targetMonth: "2026-02",
      }),
    ).toEqual({
      targetMonth: { eq: "2026-02" },
      or: [{ staffId: { eq: "staff-1" } }, { staffId: { eq: "staff-2" } }],
    });
  });
});
