import dayjs from "dayjs";

import {
  calculateDailyCounts,
  calculateGroupDailyCounts,
  calculatePlannedDailyCounts,
} from "../shiftAggregation";

const days = [
  dayjs("2024-01-01"),
  dayjs("2024-01-02"),
  dayjs("2024-01-03"),
];

describe("calculateDailyCounts", () => {
  it("各日の勤務エントリ数を集計すること", () => {
    const displayShifts = new Map([
      ["staff-1", { "2024-01-01": "work", "2024-01-02": "fixedOff", "2024-01-03": "work" }],
      ["staff-2", { "2024-01-01": "work", "2024-01-02": "work",     "2024-01-03": "empty" }],
    ]);

    const result = calculateDailyCounts(days, ["staff-1", "staff-2"], displayShifts as never);

    expect(result.get("2024-01-01")).toBe(2);
    expect(result.get("2024-01-02")).toBe(1);
    expect(result.get("2024-01-03")).toBe(1);
  });

  it("勤務者がいない場合、全日 0 を返すこと", () => {
    const displayShifts = new Map([
      ["staff-1", { "2024-01-01": "fixedOff", "2024-01-02": "empty", "2024-01-03": "auto" }],
    ]);

    const result = calculateDailyCounts(days, ["staff-1"], displayShifts as never);

    expect(result.get("2024-01-01")).toBe(0);
    expect(result.get("2024-01-02")).toBe(0);
    expect(result.get("2024-01-03")).toBe(0);
  });

  it("staffIds が空の場合、全日 0 を返すこと", () => {
    const displayShifts = new Map<string, Record<string, string>>();
    const result = calculateDailyCounts(days, [], displayShifts as never);

    expect(result.get("2024-01-01")).toBe(0);
  });

  it("displayShifts にスタッフ情報がない場合でも処理できること", () => {
    const displayShifts = new Map<string, Record<string, string>>();
    const result = calculateDailyCounts(days, ["staff-999"], displayShifts as never);

    expect(result.get("2024-01-01")).toBe(0);
  });
});

describe("calculateGroupDailyCounts", () => {
  const displayShifts = new Map([
    ["staff-1", { "2024-01-01": "work", "2024-01-02": "fixedOff", "2024-01-03": "work" }],
    ["staff-2", { "2024-01-01": "work", "2024-01-02": "work",     "2024-01-03": "empty" }],
    ["staff-3", { "2024-01-01": "fixedOff", "2024-01-02": "work", "2024-01-03": "work" }],
  ]);

  it("グループごと・日ごとの勤務エントリ数を集計すること", () => {
    const groups = [
      { groupName: "A", members: [{ id: "staff-1" }, { id: "staff-2" }] },
      { groupName: "B", members: [{ id: "staff-3" }] },
    ];

    const result = calculateGroupDailyCounts(days, groups, displayShifts as never);

    expect(result.get("A")?.get("2024-01-01")).toBe(2);
    expect(result.get("A")?.get("2024-01-02")).toBe(1);
    expect(result.get("B")?.get("2024-01-01")).toBe(0);
    expect(result.get("B")?.get("2024-01-03")).toBe(1);
  });

  it("groups が空の場合、空の Map を返すこと", () => {
    const result = calculateGroupDailyCounts(days, [], displayShifts as never);
    expect(result.size).toBe(0);
  });
});

describe("calculatePlannedDailyCounts", () => {
  const monthStart = dayjs("2024-01-01");

  it("shiftPlanPlans が null の場合、全日 null を返すこと", () => {
    const result = calculatePlannedDailyCounts(days, monthStart, null);

    expect(result.get("2024-01-01")).toBeNull();
    expect(result.get("2024-01-02")).toBeNull();
    expect(result.get("2024-01-03")).toBeNull();
  });

  it("一致する月次計画がない場合、全日 null を返すこと", () => {
    const plans = [{ month: 3, dailyCapacities: [5, 5, 5] }];
    const result = calculatePlannedDailyCounts(days, monthStart, plans as never);

    expect(result.get("2024-01-01")).toBeNull();
  });

  it("一致する月次計画がある場合、計画人数を返すこと", () => {
    const plans = [{ month: 1, dailyCapacities: [3, 5, 4] }];
    const result = calculatePlannedDailyCounts(days, monthStart, plans as never);

    expect(result.get("2024-01-01")).toBe(3);
    expect(result.get("2024-01-02")).toBe(5);
    expect(result.get("2024-01-03")).toBe(4);
  });

  it("dailyCapacities の範囲外インデックスは null を返すこと", () => {
    const plans = [{ month: 1, dailyCapacities: [3] }];
    const result = calculatePlannedDailyCounts(days, monthStart, plans as never);

    expect(result.get("2024-01-01")).toBe(3);
    expect(result.get("2024-01-02")).toBeNull();
  });

  it("計画人数が NaN の場合、null を返すこと", () => {
    const plans = [{ month: 1, dailyCapacities: [NaN, 5, 4] }];
    const result = calculatePlannedDailyCounts(days, monthStart, plans as never);

    expect(result.get("2024-01-01")).toBeNull();
    expect(result.get("2024-01-02")).toBe(5);
  });

  it("dailyCapacities が null の場合、全日 null を返すこと", () => {
    const plans = [{ month: 1, dailyCapacities: null }];
    const result = calculatePlannedDailyCounts(days, monthStart, plans as never);

    expect(result.get("2024-01-01")).toBeNull();
  });
});
