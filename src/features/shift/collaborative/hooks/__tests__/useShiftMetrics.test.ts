import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";

import { useShiftMetrics } from "../useShiftMetrics";

const makeDay = (dateStr: string) => dayjs(dateStr);

const makeDays = (year: number, month: number) => {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const count = start.daysInMonth();
  return Array.from({ length: count }, (_, i) => start.add(i, "day"));
};

const makeShiftDataMap = (
  entries: Array<{
    staffId: string;
    dayKey: string;
    state: "work" | "fixedOff" | "requestedOff" | "auto" | "empty";
  }>
): Map<string, Map<string, { state: "work" | "fixedOff" | "requestedOff" | "auto" | "empty" }>> => {
  const map = new Map<
    string,
    Map<string, { state: "work" | "fixedOff" | "requestedOff" | "auto" | "empty" }>
  >();
  entries.forEach(({ staffId, dayKey, state }) => {
    if (!map.has(staffId)) {
      map.set(staffId, new Map());
    }
    map.get(staffId)!.set(dayKey, { state });
  });
  return map;
};

describe("useShiftMetrics", () => {
  describe("progress - 確定判定", () => {
    it("計画人数が未設定の場合、全日出勤0人で全日確定", () => {
      const days = [makeDay("2026-04-01"), makeDay("2026-04-02")];
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), [])
      );
      expect(result.current.progress.confirmedCount).toBe(2);
    });

    it("計画人数が未設定（0扱い）かつ出勤ありの日は未確定", () => {
      const days = [makeDay("2026-04-01")];
      const staffIds = ["staff-1"];
      const shiftDataMap = makeShiftDataMap([
        { staffId: "staff-1", dayKey: "01", state: "work" },
      ]);
      const { result } = renderHook(() =>
        useShiftMetrics(days, staffIds, shiftDataMap, [])
      );
      expect(result.current.progress.confirmedCount).toBe(0);
    });

    it("計画人数と出勤人数が一致すれば確定", () => {
      const days = [makeDay("2026-04-01"), makeDay("2026-04-02")];
      const staffIds = ["staff-1", "staff-2"];
      const shiftDataMap = makeShiftDataMap([
        { staffId: "staff-1", dayKey: "01", state: "work" },
        { staffId: "staff-2", dayKey: "01", state: "work" },
        { staffId: "staff-1", dayKey: "02", state: "fixedOff" },
        { staffId: "staff-2", dayKey: "02", state: "fixedOff" },
      ]);
      // 1日: 計画2人 / 出勤2人 → 確定
      // 2日: 計画2人 / 出勤0人 → 未確定（空）
      const capacities = [2, 2];
      const { result } = renderHook(() =>
        useShiftMetrics(days, staffIds, shiftDataMap, capacities)
      );
      expect(result.current.progress.confirmedCount).toBe(1);
    });

    it("計画人数0かつ出勤0で確定", () => {
      const days = [makeDay("2026-04-01")];
      const capacities = [0];
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), capacities)
      );
      expect(result.current.progress.confirmedCount).toBe(1);
    });

    it("計画人数0かつ出勤ありで未確定", () => {
      const days = [makeDay("2026-04-01")];
      const staffIds = ["staff-1"];
      const shiftDataMap = makeShiftDataMap([
        { staffId: "staff-1", dayKey: "01", state: "work" },
      ]);
      const capacities = [0];
      const { result } = renderHook(() =>
        useShiftMetrics(days, staffIds, shiftDataMap, capacities)
      );
      expect(result.current.progress.confirmedCount).toBe(0);
    });

    it("1〜10日であっても出勤人数が計画人数と一致しなければ確定しない", () => {
      const days = Array.from({ length: 10 }, (_, i) =>
        makeDay(`2026-04-${String(i + 1).padStart(2, "0")}`)
      );
      const capacities = Array(10).fill(2);
      // 全員未操作（出勤0）だが計画2人 → 1件も確定しない
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), capacities)
      );
      expect(result.current.progress.confirmedCount).toBe(0);
    });

    it("全日 days.length=0 のとき confirmedPercent が 0", () => {
      const { result } = renderHook(() =>
        useShiftMetrics([], [], new Map(), [])
      );
      expect(result.current.progress.confirmedPercent).toBe(0);
    });
  });

  describe("calculateDailyCount - plannedCapacity を返す", () => {
    it("shiftPlanCapacities が設定されている日は正しい计画人数を返す", () => {
      const days = [makeDay("2026-04-03")];
      const capacities = [0, 0, 5]; // 3日目(インデックス2)
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), capacities)
      );
      const count = result.current.calculateDailyCount("03");
      expect(count.plannedCapacity).toBe(5);
    });

    it("shiftPlanCapacities が未設定の日は plannedCapacity が 0", () => {
      const days = [makeDay("2026-04-01")];
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), [])
      );
      const count = result.current.calculateDailyCount("01");
      expect(count.plannedCapacity).toBe(0);
    });

    it("NaN が含まれる日は plannedCapacity が 0 に正規化される", () => {
      const days = [makeDay("2026-04-02")];
      const capacities = [0, Number.NaN];
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), capacities)
      );
      const count = result.current.calculateDailyCount("02");
      expect(count.plannedCapacity).toBe(0);
    });
  });

  describe("confirmedPercent 計算", () => {
    it("30日中 30日確定で 100%", () => {
      const days = makeDays(2026, 4); // 4月 = 30日
      const capacities = Array(30).fill(0); // 全日計画0人、出勤0人 → 全確定
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), capacities)
      );
      expect(result.current.progress.confirmedPercent).toBe(100);
      expect(result.current.progress.confirmedCount).toBe(30);
    });

    it("30日中 0日確定で 0%（計画あり・未操作）", () => {
      const days = makeDays(2026, 4);
      const capacities = Array(30).fill(3); // 全日計画3人
      // 出勤0人 → 全日未確定
      const { result } = renderHook(() =>
        useShiftMetrics(days, [], new Map(), capacities)
      );
      expect(result.current.progress.confirmedPercent).toBe(0);
      expect(result.current.progress.confirmedCount).toBe(0);
    });
  });
});
